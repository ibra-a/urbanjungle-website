import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CartItem {
  id: string
  item_code: string
  quantity: number
}

interface StockCheckResult {
  item_code: string
  requested: number
  available: number
  is_available: boolean
  display_stock: number
  source?: 'erpnext' | 'supabase_cache' // Track data source
}

// ERPNext Configuration
const ERP_BASE_URL = (Deno.env.get('ERP_BASE_URL') || '').trim().replace(/\/$/, '')
const ERP_API_KEY = Deno.env.get('ERP_API_KEY') || ''
const ERP_SECRET_KEY = Deno.env.get('ERP_SECRET_KEY') || ''
const UJ_WAREHOUSE = 'UJ - GFH' // Urban Jungle warehouse

// Configuration
const REQUEST_TIMEOUT = 10000 // 10 seconds for checkout (faster than sync)
const STOCK_BUFFER = 2 // Reserve 2 units for safety

/**
 * Fetch stock from ERPNext directly (source of truth)
 */
async function fetchStockFromERPNext(
  headers: HeadersInit,
  itemCodes: string[],
  warehouse: string
): Promise<Map<string, number>> {
  const stockMap = new Map<string, number>()
  itemCodes.forEach((c) => stockMap.set(c, 0))

  const binUrl = new URL(`${ERP_BASE_URL}/api/resource/Bin`)
  binUrl.searchParams.set(
    "fields",
    JSON.stringify(["item_code", "actual_qty", "warehouse"])
  )
  binUrl.searchParams.set(
    "filters",
    JSON.stringify([
      ["item_code", "in", itemCodes],
      ["warehouse", "=", warehouse],
    ])
  )
  binUrl.searchParams.set("limit_page_length", "99999")

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const response = await fetch(binUrl.toString(), {
      headers,
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`ERPNext API error: ${response.status}`)
    }

    const payload: any = await response.json()
    const bins: any[] = payload?.data || []

    const qtyByCode: Record<string, number> = {}
    for (const b of bins) {
      const code = String(b.item_code || "")
      if (!code) continue
      const qty = Number(b.actual_qty || 0)
      if (!Number.isFinite(qty) || qty <= 0) continue
      qtyByCode[code] = (qtyByCode[code] || 0) + qty
    }

    for (const code of itemCodes) {
      stockMap.set(code, Math.floor(qtyByCode[code] || 0))
    }

    return stockMap
  } catch (error: any) {
    clearTimeout(timeout)
    if (error.name === 'AbortError') {
      throw new Error('ERPNext request timeout')
    }
    throw error
  }
}

/**
 * Fetch stock from Supabase cache (fallback)
 */
async function fetchStockFromSupabase(
  supabaseClient: any,
  itemCodes: string[]
): Promise<Map<string, number>> {
  const stockMap = new Map<string, number>()

  // Try urban_products first (more accurate)
  const { data: urbanProducts, error: urbanError } = await supabaseClient
    .from('urban_products')
    .select('item_code, stock_quantity, reserved_quantity')
    .in('item_code', itemCodes)

  if (!urbanError && urbanProducts) {
    urbanProducts.forEach((p: any) => {
      const available = Math.max(0, (p.stock_quantity || 0) - (p.reserved_quantity || 0))
      stockMap.set(p.item_code, available)
    })
    return stockMap
  }

  // Fallback to products table if urban_products fails
  const { data: products, error: productsError } = await supabaseClient
    .from('products')
    .select('item_code, stock_quantity, reserved_quantity')
    .in('item_code', itemCodes)
    .eq('store_name', 'Urban Jungle')

  if (productsError) {
    throw new Error(`Supabase error: ${productsError.message}`)
  }

  products?.forEach((p: any) => {
    const available = Math.max(0, (p.stock_quantity || 0) - (p.reserved_quantity || 0))
    stockMap.set(p.item_code, available)
  })

  return stockMap
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { items } = await req.json() as { items: CartItem[] }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid items array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const itemCodes = items.map(item => item.item_code).filter(Boolean)
    if (itemCodes.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid item codes provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    let stockMap = new Map<string, number>()
    let dataSource: 'erpnext' | 'supabase_cache' = 'supabase_cache'
    let warning: string | null = null

    // Try ERPNext first (source of truth)
    if (ERP_BASE_URL && ERP_API_KEY && ERP_SECRET_KEY) {
      try {
        const erpHeaders = {
          Authorization: `token ${ERP_API_KEY}:${ERP_SECRET_KEY}`
        } as HeadersInit

        console.log(`🔍 Checking stock from ERPNext for ${itemCodes.length} items (warehouse: ${UJ_WAREHOUSE})`)
        stockMap = await fetchStockFromERPNext(erpHeaders, itemCodes, UJ_WAREHOUSE)
        dataSource = 'erpnext'
        console.log(`✅ Stock verified from ERPNext (source of truth)`)
      } catch (erpError: any) {
        // ERPNext failed - use Supabase cache as fallback
        console.warn(`⚠️ ERPNext unavailable (${erpError.message}), using Supabase cache`)
        warning = `Stock data may be slightly outdated. ERPNext is temporarily unavailable.`
        
        try {
          stockMap = await fetchStockFromSupabase(supabaseClient, itemCodes)
          dataSource = 'supabase_cache'
          console.log(`✅ Using Supabase cache as fallback`)
        } catch (supabaseError: any) {
          throw new Error(`Both ERPNext and Supabase failed: ${supabaseError.message}`)
        }
      }
    } else {
      // ERPNext credentials not configured - use Supabase only
      console.log(`⚠️ ERPNext credentials not configured, using Supabase cache`)
      stockMap = await fetchStockFromSupabase(supabaseClient, itemCodes)
      dataSource = 'supabase_cache'
    }

    // Verify each item
    const results: StockCheckResult[] = items.map(item => {
      const actualStock = stockMap.get(item.item_code) || 0
      const availableStock = Math.max(0, actualStock - STOCK_BUFFER)
      const isAvailable = item.quantity <= availableStock

      return {
        item_code: item.item_code,
        requested: item.quantity,
        available: availableStock,
        is_available: isAvailable,
        display_stock: availableStock,
        source: dataSource
      }
    })

    const allAvailable = results.every(r => r.is_available)

    return new Response(
      JSON.stringify({
        all_available: allAvailable,
        items: results,
        checked_at: new Date().toISOString(),
        source: dataSource,
        warning: warning || undefined
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error: any) {
    console.error('❌ Stock verification error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to verify stock',
        all_available: false,
        checked_at: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

