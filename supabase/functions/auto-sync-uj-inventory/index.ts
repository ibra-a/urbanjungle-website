// Auto-sync Urban Jungle inventory from ERPNext to Supabase
// This function is designed to be called by pg_cron every 10 minutes
// Or can be called manually from admin panel

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = (Deno.env.get("SUPABASE_URL") || "").trim()
const SERVICE_ROLE = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "").trim()
const ERP_BASE_URL = ((Deno.env.get("ERP_BASE_URL") || "").trim()).replace(/\/$/, "")
const ERP_API_KEY = (Deno.env.get("ERP_API_KEY") || "").trim()
const ERP_SECRET_KEY = (Deno.env.get("ERP_SECRET_KEY") || "").trim()
const UJ_WAREHOUSE = "UJ - GFH"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-key',
}

// Helper functions (copied from sync-uj-inventory)
function safeInt(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? Math.floor(n) : 0
}

async function fetchJson(url: string, headers: HeadersInit) {
  const res = await fetch(url, { headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text.substring(0, 300)}`)
  }
  return res.json()
}

async function fetchStockBatch(
  headers: HeadersInit,
  itemCodes: string[],
  warehouse: string,
): Promise<Map<string, number>> {
  const stockMap = new Map<string, number>()
  itemCodes.forEach((c) => stockMap.set(c, 0))

  const binUrl = new URL(`${ERP_BASE_URL}/api/resource/Bin`)
  binUrl.searchParams.set(
    "fields",
    JSON.stringify(["item_code", "actual_qty", "warehouse"]),
  )
  binUrl.searchParams.set(
    "filters",
    JSON.stringify([
      ["item_code", "in", itemCodes],
      ["warehouse", "=", warehouse],
    ]),
  )
  binUrl.searchParams.set("limit_page_length", "99999")

  const payload: any = await fetchJson(binUrl.toString(), headers)
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
}

async function fetchStockBatchWithRetry(
  headers: HeadersInit,
  itemCodes: string[],
  warehouse: string,
  attempts = 3,
) {
  let lastErr: unknown = null
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetchStockBatch(headers, itemCodes, warehouse)
    } catch (e) {
      lastErr = e
      await new Promise((r) => setTimeout(r, 250 * (i + 1)))
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr))
}

async function fetchPricesBatch(
  headers: HeadersInit,
  itemCodes: string[],
): Promise<Map<string, number>> {
  const priceMap = new Map<string, number>()
  itemCodes.forEach((c) => priceMap.set(c, 0))

  const itemUrl = new URL(`${ERP_BASE_URL}/api/resource/Item`)
  itemUrl.searchParams.set(
    "fields",
    JSON.stringify(["item_code", "custom_ecommerce_selling_price", "standard_rate", "valuation_rate"]),
  )
  itemUrl.searchParams.set(
    "filters",
    JSON.stringify([["item_code", "in", itemCodes]]),
  )
  itemUrl.searchParams.set("limit_page_length", "99999")

  const payload: any = await fetchJson(itemUrl.toString(), headers)
  const items: any[] = payload?.data || []

  for (const item of items) {
    const code = String(item.item_code || "")
    if (!code) continue
    const price = parseFloat(
      item.custom_ecommerce_selling_price ||
        item.standard_rate ||
        item.valuation_rate ||
        "0"
    )
    if (Number.isFinite(price) && price > 0) {
      priceMap.set(code, price)
    }
  }

  return priceMap
}

async function fetchPricesBatchWithRetry(
  headers: HeadersInit,
  itemCodes: string[],
  attempts = 3,
) {
  let lastErr: unknown = null
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetchPricesBatch(headers, itemCodes)
    } catch (e) {
      lastErr = e
      await new Promise((r) => setTimeout(r, 250 * (i + 1)))
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr))
}

type UjSize = {
  size?: string
  stock?: number
  available?: boolean
  item_code?: string
  color_code?: string
  [k: string]: unknown
}

type UjColor = {
  code?: string
  color?: string
  stock?: number
  available?: boolean
  image_url?: string
  [k: string]: unknown
}

// Main sync function for Urban Jungle
async function performSync() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)
  const erpHeaders = { Authorization: `token ${ERP_API_KEY}:${ERP_SECRET_KEY}` } as HeadersInit

  // Load current Urban Jungle products
  const { data: products, error: fetchErr } = await supabase
    .from("urban_products")
    .select("id, item_code, product_name, sizes, colors, price")
    .eq("is_active", true)
    .limit(10000)

  if (fetchErr) throw new Error(`Supabase read error: ${fetchErr.message}`)
  const list: any[] = Array.isArray(products) ? products : []

  const allCodes: string[] = []
  for (const p of list) {
    // Include product's base item_code
    const baseCode = (p.item_code || "").toString().trim()
    if (baseCode) allCodes.push(baseCode)
    
    // Include all size item_codes
    const sizes: UjSize[] = Array.isArray(p.sizes) ? p.sizes : []
    for (const s of sizes) {
      const code = (s?.item_code || "").toString().trim()
      if (code) allCodes.push(code)
    }
  }

  const uniqueCodes = Array.from(new Set(allCodes))
  const BATCH = 50

  console.log(
    `🔄 UJ stock sync: ${list.length} products, ${uniqueCodes.length} item_codes (including base + sizes)`,
  )

  // Fetch stock from ERP in safe batches
  const stockByCode = new Map<string, number>()
  for (let i = 0; i < uniqueCodes.length; i += BATCH) {
    const batch = uniqueCodes.slice(i, i + BATCH)
    const map = await fetchStockBatchWithRetry(erpHeaders, batch, UJ_WAREHOUSE, 3)
    for (const [k, v] of map.entries()) stockByCode.set(k, v)
  }

  // Fetch prices from ERP in safe batches
  const priceByCode = new Map<string, number>()
  for (let i = 0; i < uniqueCodes.length; i += BATCH) {
    const batch = uniqueCodes.slice(i, i + BATCH)
    const map = await fetchPricesBatchWithRetry(erpHeaders, batch, 3)
    for (const [k, v] of map.entries()) {
      if (v > 0) priceByCode.set(k, v)
    }
  }

  const nowIso = new Date().toISOString()
  const updates: any[] = []

  for (const p of list) {
    const sizes: UjSize[] = Array.isArray(p.sizes) ? p.sizes : []
    if (!p.id || sizes.length === 0) continue

    // Update each size stock from ERP
    const updatedSizes = sizes.map((s) => {
      const code = (s?.item_code || "").toString().trim()
      const stock = code ? (stockByCode.get(code) ?? 0) : 0
      return { ...s, stock, available: stock > 0 }
    })

    // Recompute color stock totals from sizes (color_code link)
    const colorTotals: Record<string, number> = {}
    let totalStock = 0
    for (const s of updatedSizes) {
      const cc = (s.color_code || "").toString().trim()
      const st = Number(s.stock || 0)
      if (Number.isFinite(st) && st > 0) {
        totalStock += Math.floor(st)
        if (cc) colorTotals[cc] = (colorTotals[cc] || 0) + Math.floor(st)
      }
    }

    const colors: UjColor[] = Array.isArray(p.colors) ? p.colors : []
    const updatedColors = colors.length
      ? colors.map((c) => {
        const key = (c.code || "").toString().trim()
        const stock = key ? Math.floor(colorTotals[key] || 0) : 0
        return { ...c, stock, available: stock > 0 }
      })
      : colors

    // Get price from ERP (check product's base item_code first, then sizes)
    let productPrice = p.price || 0
    const baseCode = (p.item_code || "").toString().trim()
    
    if (baseCode) {
      const basePrice = priceByCode.get(baseCode) || 0
      if (basePrice > 0) {
        productPrice = basePrice
      }
    }
    
    const sizePrices: number[] = []
    for (const s of updatedSizes) {
      const code = (s?.item_code || "").toString().trim()
      if (code) {
        const price = priceByCode.get(code) || 0
        if (price > 0) sizePrices.push(price)
      }
    }
    
    if (sizePrices.length > 0) {
      const maxSizePrice = Math.max(...sizePrices)
      if (maxSizePrice > productPrice) {
        productPrice = maxSizePrice
      }
    }

    updates.push({
      id: p.id,
      item_code: p.item_code,
      product_name: p.product_name ?? null,
      sizes: updatedSizes,
      colors: updatedColors,
      stock_quantity: totalStock,
      price: productPrice,
      updated_at: nowIso,
      synced_at: nowIso,
    })
  }

  // Write updates in batches
  let updated = 0
  const WRITE_BATCH = 25
  for (let i = 0; i < updates.length; i += WRITE_BATCH) {
    const chunk = updates.slice(i, i + WRITE_BATCH)
    const { error: upErr } = await supabase
      .from("urban_products")
      .upsert(chunk, { onConflict: "id" })
    if (upErr) throw new Error(`Supabase upsert error: ${upErr.message}`)
    updated += chunk.length
  }

  return {
    success: true,
    warehouse: UJ_WAREHOUSE,
    products_updated: updated,
    size_variants_tracked: uniqueCodes.length,
    prices_synced: priceByCode.size,
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Security: Accept internal calls via custom header (X-Internal-Key) OR Authorization header
  const internalKey = req.headers.get('x-internal-key')
  const authHeader = req.headers.get('authorization')
  
  let isAuthenticated = false
  
  if (internalKey && internalKey === SERVICE_ROLE) {
    isAuthenticated = true // Authenticated via internal key (cron job)
  } else if (authHeader) {
    // If no internal key, assume it's a frontend call. Supabase's Edge Function runtime
    // already validates the JWT in the Authorization header. If it reaches here, it's valid.
    isAuthenticated = true
  }

  if (!isAuthenticated) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized - Authentication required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)
    
    // Update sync status - starting
    await supabase
      .from('sync_status')
      .upsert({
        sync_type: 'uj_inventory',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'sync_type'
      })

    // Perform sync directly (no HTTP call needed)
    const syncResult = await performSync()

    // Update sync status - success
    await supabase
      .from('sync_status')
      .upsert({
        sync_type: 'uj_inventory',
        last_success_at: new Date().toISOString(),
        last_error_at: null,
        last_error_message: null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'sync_type'
      })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Urban Jungle inventory sync completed',
        result: syncResult,
        synced_at: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: any) {
    console.error('❌ Auto-sync UJ error:', error)

    // Update sync status - error
    try {
      const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)
      await supabase
        .from('sync_status')
        .upsert({
          sync_type: 'uj_inventory',
          last_error_at: new Date().toISOString(),
          last_error_message: error.message || 'Unknown error',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'sync_type'
        })
    } catch (statusError) {
      console.error('Failed to update sync status:', statusError)
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Auto-sync failed',
        synced_at: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

