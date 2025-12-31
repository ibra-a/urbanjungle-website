#!/usr/bin/env node
/**
 * Urban Jungle ERPNext → Supabase Sync Script
 * Syncs data from UJ-GFH warehouse to Supabase
 * Uses the same ERPNext API as Tommy CK but filters for UJ-GFH warehouse
 * 
 * Run: node sync-urban-jungle-to-supabase.js
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Load environment variables (same as Tommy CK)
const envContent = fs.readFileSync('.env', 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  line = line.trim()
  if (!line || line.startsWith('#')) return
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    let key = match[1].trim()
    let value = match[2].trim()
    
    // Support `export KEY=value` lines
    if (key.toLowerCase().startsWith('export ')) {
      key = key.slice('export '.length).trim()
    }
    
    // Strip wrapping quotes to match common dotenv behavior:
    // KEY="value" -> value
    // KEY='value' -> value
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    
    env[key] = value
  }
})

// Configuration (same as Tommy CK)
const ERP_BASE_URL = env.VITE_ERP_BASE_URL.replace(/\/$/, '')
const ERP_API_KEY = env.VITE_ERP_API_KEY
const ERP_SECRET_KEY = env.VITE_ERP_SECRET_KEY
const SUPABASE_URL = env.VITE_SUPABASE_URL
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY
const CURRENCY = 'DJF'

// Urban Jungle specific configuration
const UJ_WAREHOUSE = 'UJ - GFH'  // Urban Jungle warehouse (with spaces)
const UJ_BRAND = 'URBAN'         // Urban Jungle brand

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Stats
let stats = {
  itemsFetched: 0,
  stockFetched: 0,
  uploaded: 0,
  withImages: 0,
  withStock: 0,
  withPrice: 0,
  errors: 0
}

async function fetchERP(endpoint, params = {}) {
  const url = new URL(`${ERP_BASE_URL}${endpoint}`)
  Object.entries(params).forEach(([key, val]) => {
    url.searchParams.set(key, typeof val === 'object' ? JSON.stringify(val) : val)
  })
  
  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `token ${ERP_API_KEY}:${ERP_SECRET_KEY}`
    }
  })
  
  if (!response.ok) {
    throw new Error(`ERP API error: ${response.status}`)
  }
  
  return response.json()
}

function absolutizeUrl(url) {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed === '') return null
  if (trimmed.match(/^https?:\/\//i)) return trimmed
  if (trimmed.startsWith('/')) return `${ERP_BASE_URL}${trimmed}`
  // If it's a relative path without leading slash, add it
  if (trimmed.includes('/') && !trimmed.startsWith('/')) {
    return `${ERP_BASE_URL}/${trimmed}`
  }
  return trimmed
}

async function syncUrbanJungleProducts() {
  console.log('\n🚀 Urban Jungle ERPNext → Supabase Sync Starting...\n')
  console.log('Configuration:')
  console.log('  ERP:', ERP_BASE_URL)
  console.log('  Warehouse:', UJ_WAREHOUSE)
  console.log('  Brand:', UJ_BRAND)
  console.log('  Supabase:', SUPABASE_URL)
  console.log('  Currency:', CURRENCY)
  console.log('\n' + '='.repeat(60) + '\n')

  // Step 1: Fetch all items from ERPNext (same as Tommy CK)
  console.log('📦 Step 1: Fetching items from ERPNext...')
  const allItems = []
  let page = 0
  const pageSize = 200

  while (true) {
    process.stdout.write(`  Fetching page ${page + 1}... `)
    
    const data = await fetchERP('/api/resource/Item', {
      fields: ['item_code', 'item_name', 'item_group', 'brand', 'description', 'image', 'custom_ecommerce_selling_price', 'standard_rate', 'valuation_rate', 'custom_size', 'custom_product_id', 'custom_gender', 'custom_color_description', 'custom_alternate_code'],
      limit_start: page * pageSize,
      limit_page_length: pageSize
    })
    
    const items = data?.data || []
    allItems.push(...items)
    stats.itemsFetched += items.length
    
    console.log(`${items.length} items (total: ${stats.itemsFetched})`)
    
    if (items.length < pageSize) break
    page++
  }

  console.log(`\n✅ Fetched ${allItems.length} total items from ERPNext\n`)

  // Step 2: Fetch stock from UJ-GFH warehouse (DIFFERENT from Tommy CK)
  console.log('📊 Step 2: Fetching stock quantities from UJ-GFH warehouse...')
  const itemCodes = allItems.map(i => i.item_code).filter(Boolean)
  const stockMap = {}
  const stockBatchSize = 100
  
  for (let i = 0; i < itemCodes.length; i += stockBatchSize) {
    const batch = itemCodes.slice(i, i + stockBatchSize)
    const batchNum = Math.floor(i / stockBatchSize) + 1
    const totalBatches = Math.ceil(itemCodes.length / stockBatchSize)
    
    process.stdout.write(`  Stock batch ${batchNum}/${totalBatches}... `)
    
    try {
      const binData = await fetchERP('/api/resource/Bin', {
        fields: ['item_code', 'actual_qty', 'warehouse'],
        filters: [
          ['item_code', 'in', batch],
          ['warehouse', '=', UJ_WAREHOUSE]  // UJ-GFH warehouse instead of TH & CK - GFH
        ],
        limit_page_length: 99999
      })
      
      const bins = binData?.data || []
      stats.stockFetched += bins.length
      
      bins.forEach(bin => {
        const code = bin.item_code
        const qty = parseFloat(bin.actual_qty || 0)
        if (qty > 0) {
          stockMap[code] = (stockMap[code] || 0) + qty
        }
      })
      
      console.log(`${bins.length} bins`)
    } catch (err) {
      console.log(`⚠️ Error (skipping)`)
    }
  }

  console.log(`\n✅ Stock data: ${Object.keys(stockMap).length} items have stock in UJ-GFH warehouse\n`)

  // Step 3: Prepare data for Supabase (same logic as Tommy CK)
  console.log('🔄 Step 3: Preparing data for Supabase with size aggregation...')
  
  // Helper functions (same as Tommy CK)
  function parseProductId(productId) {
    if (!productId) return null
    const parts = productId.split('-')
    if (parts.length < 2) return null
    return {
      styleNumber: parts[0],
      colorCode: parts[1],
      size: parts[2] || null
    }
  }
  
  // Helper function to extract color from item name
  // Format: "Product Name — Color Name — Size" or "Product Name — Color Name"
  function extractColor(itemName) {
    if (!itemName) return null
    
    const parts = itemName.split('—').map(p => p.trim())
    
    // If we have 3 parts: [Product, Color, Size]
    if (parts.length === 3) {
      return parts[1] // Return color (middle part)
    }
    
    // If we have 2 parts: [Product, Color] or [Product, Size]
    if (parts.length === 2) {
      const lastPart = parts[1]
      // Check if it's a size
      const sizePattern = /^(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|OS|\d{2}(\.\d)?|\d{2,3}|[\d\/]+)$/i
      if (!sizePattern.test(lastPart)) {
        return lastPart // It's a color
      }
    }
    
    return null
  }
  
  function extractSize(itemName) {
    if (!itemName) return { baseName: itemName, size: null }
    
    // First, handle the format: "Product — Color — Size" (most common)
    // Split by em dash to get parts
    const parts = itemName.split('—').map(p => p.trim())
    
    // If we have 3 parts: [Product, Color, Size]
    if (parts.length === 3) {
      const size = parts[2]
      const baseName = `${parts[0]} — ${parts[1]}` // "Product — Color" (keep color in base name)
      return { baseName, size: size.toUpperCase() }
    }
    
    // If we have 2 parts: [Product, Color] or [Product, Size]
    if (parts.length === 2) {
      const lastPart = parts[1]
      // Check if it's a size (more comprehensive pattern including M10W12, W10, etc.)
      const sizePattern = /^(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|OS|M\d+W\d+|\d{1,2}(\.\d)?|W\d+)$/i
      if (sizePattern.test(lastPart)) {
        return { baseName: parts[0], size: lastPart.toUpperCase() }
      }
      // It's a color, return as base name (no size)
      return { baseName: itemName, size: null }
    }
    
    // Fallback: try to extract size from end of string (for edge cases)
    let cleanName = itemName.replace(/\s*—\s*$/, '').trim()
    const sizeMatch = cleanName.match(/\s*—\s+(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|OS|M\d+W\d+|\d{1,2}(\.\d)?|W\d+)$/i)
    if (sizeMatch) {
      cleanName = cleanName.replace(/\s*—\s+(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|OS|M\d+W\d+|\d{1,2}(\.\d)?|W\d+)$/i, '')
      return { baseName: cleanName.trim(), size: sizeMatch[1].toUpperCase() }
    }
    
    const words = cleanName.trim().split(/\s+/)
    const lastWord = words[words.length - 1]
    
    const sizePattern = /^(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|OS|M\d+W\d+|\d{1,2}(\.\d)?|W\d+)$/i
    
    if (sizePattern.test(lastWord)) {
      const baseName = words.slice(0, -1).join(' ')
      return { baseName, size: lastWord.toUpperCase() }
    }
    
    return { baseName: cleanName, size: null }
  }
  
  // Filter items for Urban Jungle brands only
  const urbanItems = allItems.filter(item => {
    const itemGroup = (item.item_group || '').toLowerCase()
    const brand = (item.brand || '').toLowerCase()
    
    // Include Urban Jungle items
    return itemGroup.includes('urban') || 
           itemGroup.includes('uj') ||
           brand.includes('urban')
  })
  
  console.log(`  Filtered ${urbanItems.length} Urban Jungle items from ${allItems.length} total items\n`)
  
  // Group items by base name to aggregate sizes
  const productGroups = new Map()
  
  urbanItems.forEach(item => {
    const stock = Math.floor(stockMap[item.item_code] || 0)
    const image = absolutizeUrl(item.image)
    // ✅ PRIORITY: Use E-Commerce Selling Price only (as requested)
    // If not available, use 0 (don't fall back to standard_rate or valuation_rate)
    const price = parseFloat(item.custom_ecommerce_selling_price || 0)
    
    if (image) stats.withImages++
    if (stock > 0) stats.withStock++
    if (price > 0) stats.withPrice++
    
    // Size detection (same as Tommy CK)
    let detectedSize = null
    const productIdData = parseProductId(item.custom_product_id)
    
    if (productIdData && productIdData.size) {
      detectedSize = productIdData.size
    } else if (item.custom_size) {
      detectedSize = item.custom_size.toString().trim()
    } else {
      const { size: sizeFromName } = extractSize(item.item_name)
      detectedSize = sizeFromName
    }
    
    // ============================================================================
    // NEW: Group by TRUE base name (removes BOTH color AND size) - Like TommyCK
    // ============================================================================
    // This ensures "Product — White" and "Product — Black" group into ONE product
    // with variants[] containing all color+size combinations
    function extractTrueBaseName(itemName) {
      if (!itemName) return itemName
      
      let cleanName = itemName
      
      // Step 1: Remove size (if at the end, after "— ")
      cleanName = cleanName.replace(/\s*—\s+(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|OS|\d{2}(\.\d)?|\d{2,3})\s*$/i, '')
      
      // Step 2: Remove color (last part after "— ")
      const parts = cleanName.split('—').map(p => p.trim())
      
      if (parts.length > 1) {
        const lastPart = parts[parts.length - 1]
        const sizePattern = /^(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|OS|\d{2}(\.\d)?|\d{2,3})$/i
        const isSize = sizePattern.test(lastPart)
        
        // If last part looks like a color (not a size, reasonable length)
        if (!isSize && lastPart.length > 0 && lastPart.length < 50 && !/^\d+$/.test(lastPart)) {
          cleanName = parts.slice(0, -1).join(' — ').trim()
        }
      }
      
      // Step 3: Clean up any remaining "— " at the end
      cleanName = cleanName.replace(/\s*—\s*$/, '').trim()
      
      return cleanName
    }
    
    const trueBaseName = extractTrueBaseName(item.item_name)
    const key = trueBaseName || item.item_name || item.item_code
    
    if (!productGroups.has(key)) {
      productGroups.set(key, {
        item_name: key,  // ✅ TRUE base name (no color, no size) - like TommyCK
        item_code: item.item_code,  // Keep first item_code for reference
        item_group: item.item_group || null,
        brand: item.brand || UJ_BRAND, // Use actual brand from ERPNext, fallback to URBAN
        description: item.description || null,
        image: image,
        image_url: image,
        images: image ? [image] : [],
        ecom_price: price,
        currency: CURRENCY,
        gender: item.custom_gender,  // Capture from ERPNext (don't default to null)
        stock_quantity: stock,
        sizes: [],      // For UI reference (available sizes)
        colors: [],     // For UI reference (available colors)
        variants: [],   // NEW: Color+Size combinations with individual stock (like TommyCK)
        total_stock: 0,
        last_synced_at: new Date().toISOString()
      })
    }
    
    const product = productGroups.get(key)
    
    // Extract color - URBAN JUNGLE SPECIFIC: Uses Color Description field (different from Tommy CK)
    // Tommy CK: Product ID = "Style-Color-Size" (e.g., "J30J322471-BEH-XL")
    // Urban Jungle: Product ID = "Style-Size" (e.g., "A00881C-7.5"), Color in separate field
    let colorCode = null
    let colorName = null
    
    // PRIORITY 1: Color Description field (Urban Jungle specific)
    if (item.custom_color_description) {
      colorName = item.custom_color_description.trim()
      // Use Alternate Code as color code if available, otherwise use color name
      colorCode = item.custom_alternate_code || colorName
    }
    // PRIORITY 2: Extract from Product ID (if it has color code like Tommy CK format)
    else if (productIdData && productIdData.colorCode) {
      colorCode = productIdData.colorCode
      // Try to get friendly name from item name
      const extractedName = extractColor(item.item_name)
      if (extractedName) {
        colorName = extractedName
      } else {
        colorName = colorCode
      }
    }
    // PRIORITY 3: Extract from item name (fallback)
    else {
      const extractedColor = extractColor(item.item_name)
      if (extractedColor) {
        colorName = extractedColor
        colorCode = item.custom_alternate_code || extractedColor
      }
    }
    
    // Add color entry if we found a color
    if (colorName && colorCode) {
      const colorEntry = {
        code: colorCode,
        color: colorName,
        stock: stock,  // ✅ Stock for this specific color
        available: stock > 0,
        image_url: image || null
      }
      
      // Only add if not already exists (deduplicate by color name - Urban Jungle specific)
      // Use color name as primary key since Color Description is the source of truth
      const existingColor = product.colors.find(c => 
        c.color === colorEntry.color || 
        c.color?.toLowerCase() === colorEntry.color?.toLowerCase()
      )
      if (!existingColor) {
        product.colors.push(colorEntry)
      } else {
        // Update stock if color already exists (same color name)
        existingColor.stock += stock
        existingColor.available = existingColor.stock > 0
        // Update code if we have a better one (Alternate Code)
        if (colorEntry.code && !existingColor.code) {
          existingColor.code = colorEntry.code
        }
        if (image && !existingColor.image_url) {
          existingColor.image_url = image
        }
      }
    }
    
    // ============================================================================
    // NEW: Create Color+Size Variant (like TommyCK)
    // ============================================================================
    // Each ERPNext item = one color+size combination
    // Store this as a variant with exact stock for that combination
    if (!product.variants) {
      product.variants = []
    }
    
    if (detectedSize && colorCode) {
      // Case 1: Has both size and color - create variant: color+size combination
      const variant = {
        color_code: colorCode,
        color: colorName || colorCode,
        size: detectedSize,
        stock: stock,
        available: stock > 0,
        item_code: item.item_code,
        image_url: image || null
      }
      
      // Check if variant already exists (shouldn't happen, but safety check)
      const existingVariant = product.variants.find(
        v => v.color_code === colorCode && v.size === detectedSize
      )
      
      if (!existingVariant) {
        product.variants.push(variant)
      } else {
        // Update stock if variant exists (shouldn't happen in normal flow)
        existingVariant.stock += stock
        existingVariant.available = existingVariant.stock > 0
      }
    } else if (detectedSize && !colorCode) {
      // Case 2: Has size but no color - create variant with null color (for products without colors)
      const variant = {
        color_code: null,
        color: null,
        size: detectedSize,
        stock: stock,
        available: stock > 0,
        item_code: item.item_code,
        image_url: image || null
      }
      
      const existingVariant = product.variants.find(
        v => v.color_code === null && v.size === detectedSize
      )
      
      if (!existingVariant) {
        product.variants.push(variant)
      } else {
        existingVariant.stock += stock
        existingVariant.available = existingVariant.stock > 0
      }
    } else if (!detectedSize && colorCode) {
      // Case 3: Has color but no size - create variant with null size (for single-size items, accessories)
      const variant = {
        color_code: colorCode,
        color: colorName || colorCode,
        size: null,
        stock: stock,
        available: stock > 0,
        item_code: item.item_code,
        image_url: image || null
      }
      
      const existingVariant = product.variants.find(
        v => v.color_code === colorCode && v.size === null
      )
      
      if (!existingVariant) {
        product.variants.push(variant)
      } else {
        existingVariant.stock += stock
        existingVariant.available = existingVariant.stock > 0
      }
    } else if (!detectedSize && !colorCode && stock > 0) {
      // Case 4: No size, no color, but has stock - create single variant (for items without size/color info)
      // This handles accessories, single-item products, or items where extraction failed
      const variant = {
        color_code: null,
        color: null,
        size: null,
        stock: stock,
        available: stock > 0,
        item_code: item.item_code,
        image_url: image || null
      }
      
      // Check if a null/null variant already exists
      const existingVariant = product.variants.find(
        v => v.color_code === null && v.size === null
      )
      
      if (!existingVariant) {
        product.variants.push(variant)
      } else {
        // Update stock if variant exists
        existingVariant.stock += stock
        existingVariant.available = existingVariant.stock > 0
      }
    }
    
    // ============================================================================
    // LEGACY: Keep sizes array for backward compatibility (UI reference only)
    // ============================================================================
    // Add size to sizes array (for UI dropdown)
    if (detectedSize) {
      // Check if this size already exists (across all colors)
      const existingSize = product.sizes.find(s => s.size === detectedSize)
      
      if (!existingSize) {
        product.sizes.push({
          size: detectedSize,
          stock: stock,  // This will be overwritten - kept for backward compat
          available: stock > 0,
          item_code: item.item_code,
          color_code: colorCode || null  // Link size to color
        })
      } else {
        // Update size stock (sum across all colors - for backward compat)
        existingSize.stock += stock
        existingSize.available = existingSize.stock > 0
      }
      
      product.total_stock += stock
    } else {
      // No size detected - still add to total stock
      // If we created a variant above, the stock is already tracked there
      product.total_stock += stock
    }
    
    // ✅ Keep the best image and price (check all items in group, not just first)
    // Update image if we find a better one (non-null, non-empty)
    if (image && image.trim() !== '') {
      // If product has no image, use this one
      if (!product.image || !product.image_url) {
        product.image = image
        product.image_url = image
        product.images = [image]
      }
      // If product already has image, add to images array if not duplicate
      else if (product.images && !product.images.includes(image)) {
        product.images.push(image)
      }
      // If no images array yet, create it
      else if (!product.images) {
        product.images = [product.image_url, image].filter(Boolean)
      }
    }
    // Update price if we find a better one (higher price or current is 0)
    if (price > 0 && (price > product.ecom_price || product.ecom_price === 0)) {
      product.ecom_price = price
    }
    // Update gender if we find a non-null value
    if (item.custom_gender && !product.gender) {
      product.gender = item.custom_gender
    }
  })
  
  // Finalize products and set stock_quantity to total_stock (like TommyCK)
  const mapped = Array.from(productGroups.values()).map(product => {
    // ============================================================================
    // NEW: Process Variants Array (like TommyCK)
    // ============================================================================
    if (product.variants && product.variants.length > 0) {
      // Sort variants by color, then size
      product.variants.sort((a, b) => {
        // First sort by color code
        if (a.color_code !== b.color_code) {
          const aCode = a.color_code || ''
          const bCode = b.color_code || ''
          return aCode.localeCompare(bCode)
        }
        // Then sort by size
        const aNum = parseFloat(a.size)
        const bNum = parseFloat(b.size)
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum
        }
        const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
        return sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size)
      })
      
      // Calculate total stock from variants
      product.total_stock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
      product.stock_quantity = product.total_stock
      
      // Extract unique sizes from variants (for UI dropdown - backward compat)
      const uniqueSizes = [...new Set(product.variants.map(v => v.size))].sort((a, b) => {
        const aNum = parseFloat(a)
        const bNum = parseFloat(b)
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum
        }
        const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
        return sizeOrder.indexOf(a) - sizeOrder.indexOf(b)
      })
      
      // Update sizes array with unique sizes (for backward compatibility)
      if (product.sizes.length === 0) {
        product.sizes = uniqueSizes.map(size => ({
          size,
          stock: product.variants
            .filter(v => v.size === size)
            .reduce((sum, v) => sum + (v.stock || 0), 0),
          available: product.variants.some(v => v.size === size && v.available),
          item_code: product.variants.find(v => v.size === size)?.item_code || null,
          color_code: null  // Sizes array doesn't track color (variants do)
        }))
      }
    }
    
    // ✅ DEDUPLICATE COLORS - Prevent same color showing multiple times
    if (product.colors.length > 0) {
      const uniqueColorsMap = new Map()
      product.colors.forEach(colorObj => {
        const colorKey = colorObj.color?.toLowerCase() || colorObj.code?.toLowerCase()
        const existing = uniqueColorsMap.get(colorKey)
        if (!existing) {
          uniqueColorsMap.set(colorKey, colorObj)
        } else {
          // Merge stock if duplicate color found
          existing.stock += colorObj.stock
          existing.available = existing.stock > 0
          if (colorObj.image_url && !existing.image_url) {
            existing.image_url = colorObj.image_url
          }
        }
      })
      product.colors = Array.from(uniqueColorsMap.values())
    }
    
    return {
      item_code: product.item_code,
      item_name: product.item_name,  // TRUE base name (no color, no size)
      item_group: product.item_group,
      brand: product.brand,
      description: product.description,
      image_url: product.image_url,
      images: product.images,
      ecom_price: product.ecom_price,
      currency: product.currency,
      stock_quantity: product.stock_quantity,
      sizes: product.sizes,      // For backward compatibility
      colors: product.colors,     // For backward compatibility
      variants: product.variants, // NEW: All color+size combinations (like TommyCK)
      gender: product.gender,
      warehouse: 'UJ - GFH',
      synced_at: product.last_synced_at
    }
  })
  
  console.log(`  Prepared ${mapped.length} unique Urban Jungle products (grouped by TRUE base name)`)
  console.log(`  Found ${mapped.filter(p => p.variants && p.variants.length > 0).length} products with variants`)
  console.log(`  Found ${mapped.filter(p => p.sizes.length > 0).length} products with size variants`)
  console.log(`  Found ${mapped.filter(p => p.colors.length > 0).length} products with color variants\n`)
  
  // Step 5: Upload to products (master table)
  // ✅ IMPORTANT: Delete existing Urban Jungle products first, then insert grouped products
  console.log('📤 Step 5: Cleaning existing Urban Jungle products...')
  
  // Delete all existing Urban Jungle products to prevent conflicts
  const { error: deleteProductsError } = await supabase
    .from('products')
    .delete()
    .or('warehouse.eq.UJ - GFH,item_group.ilike.%Urban Jungle%')
  
  if (deleteProductsError) {
    console.log(`⚠️  Warning: Could not delete existing products: ${deleteProductsError.message}`)
    console.log('  Continuing with upsert (may have conflicts)...')
  } else {
    console.log('✅ Deleted existing Urban Jungle products')
  }
  
  console.log('📤 Step 6: Uploading grouped products...')
  console.log(`  ⚠️  Uploading ${mapped.length} unique grouped products (down from ${urbanItems.length} raw items)`)
  
  const uploadBatchSize = 500
  
  for (let i = 0; i < mapped.length; i += uploadBatchSize) {
    const batch = mapped.slice(i, i + uploadBatchSize)
    const batchNum = Math.floor(i / uploadBatchSize) + 1
    const totalBatches = Math.ceil(mapped.length / uploadBatchSize)
    
    process.stdout.write(`  Batch ${batchNum}/${totalBatches} (${batch.length} items)... `)
    
    // Map to urban_products format (like tommy_products structure)
    const urbanProductsBatch = batch.map((item) => {
      return {
        item_code: item.item_code, // Use first item_code from group
        product_name: item.item_name, // TRUE base name (no color, no size) - like TommyCK
        brand: item.brand,
        category: item.item_group,
        subcategory: null,
        gender: item.gender,
        price: item.ecom_price,
        currency: item.currency,
        image_url: item.image_url,
        images: item.images,
        sizes: item.sizes,      // For backward compatibility
        colors: item.colors,    // For backward compatibility
        variants: item.variants || [], // NEW: All color+size combinations (like TommyCK)
        stock_quantity: item.stock_quantity,
        description: item.description,
        is_active: true,
        ready_to_sell: (item.stock_quantity > 0) && (item.ecom_price > 0) && !!item.image_url,
        featured: false,
        item_group: item.item_group
      };
    })
    
    // ✅ Insert new products (no conflict since we deleted old ones)
    const { error } = await supabase
      .from('products')
      .insert(urbanProductsBatch)
    
    if (error) {
      console.log(`❌ Error: ${error.message}`)
      stats.errors++
    } else {
      console.log('✅')
      stats.uploaded += batch.length
    }
  }
  
  console.log(`\n✅ Uploaded ${stats.uploaded} unique grouped products to products (master table)`)
  console.log(`   Reduced from ${urbanItems.length} raw items to ${stats.uploaded} unique products\n`)
  
  // Step 7: Sync to urban_products table (Urban Jungle website only)
  console.log('🔄 Step 7: Cleaning and syncing to urban_products...')
  
  // ✅ IMPORTANT: Delete ALL existing urban_products first (this table is ONLY for Urban Jungle)
  console.log('  🗑️  Deleting all existing urban_products...')
  const { error: deleteUrbanProductsError } = await supabase
    .from('urban_products')
    .delete()
    .neq('item_code', '') // Delete all (this will delete everything)
  
  if (deleteUrbanProductsError) {
    console.log(`⚠️  Warning: Could not delete existing urban_products: ${deleteUrbanProductsError.message}`)
    console.log('  Continuing with upsert (may have duplicates)...')
  } else {
    console.log('✅ Deleted all existing urban_products')
  }
  
  // ✅ Use the mapped products we just created (already filtered to UJ - GFH)
  console.log(`  📤 Syncing ${mapped.length} Urban Jungle products to urban_products...`)
  
  // Map to urban_products format (use the grouped products we just created)
  const urbanProductsBatch = mapped.map(item => ({
    item_code: item.item_code,
    product_name: item.item_name,  // TRUE base name (no color, no size) - like TommyCK
    brand: item.brand,
    category: item.item_group,
    subcategory: null,
    gender: item.gender,
    price: item.ecom_price,  // ✅ Use ecom_price (not price)
    currency: item.currency,
    image_url: item.image_url,
    images: item.images,
    sizes: item.sizes,      // For backward compatibility
    colors: item.colors,     // For backward compatibility
    variants: item.variants || [], // NEW: All color+size combinations (like TommyCK)
    stock_quantity: item.stock_quantity,
    description: item.description,
    is_active: true,  // All synced products are active
    ready_to_sell: (item.stock_quantity > 0) && (item.ecom_price > 0) && !!item.image_url,
    featured: false,
    item_group: item.item_group
  }))
  
  // Insert new products (no conflict since we deleted old ones)
  const { error: syncError } = await supabase
    .from('urban_products')
    .insert(urbanProductsBatch)
  
  if (syncError) {
    console.log(`❌ Error syncing: ${syncError.message}`)
  } else {
    console.log(`✅ Synced ${urbanProductsBatch.length} items to urban_products`)
    console.log(`   Ready to sell: ${urbanProductsBatch.filter(p => p.ready_to_sell).length} products`)
  }
  
  console.log('\n============================================================')
  console.log('🎉 URBAN JUNGLE SYNC COMPLETE!')
  console.log('\n📊 Statistics:')
  console.log(`  Items fetched from ERP: ${allItems.length}`)
  console.log(`  Stock records fetched: ${urbanItems.length}`)
  console.log(`  Items with images: ${stats.withImages} (${Math.round(stats.withImages / urbanItems.length * 100)}%)`)
  console.log(`  Items with stock: ${stats.withStock} (${Math.round(stats.withStock / urbanItems.length * 100)}%)`)
  console.log(`  Items uploaded: ${stats.uploaded}`)
  console.log('\n============================================================')
  console.log('✅ Urban Jungle sync complete!')
  console.log('   Data synced to: products → urban_products')
  console.log('   Gender data captured from ERPNext ✅')
  console.log('   Color Description field used for color extraction ✅')
  console.log('   Sizes linked to colors for proper stock tracking ✅\n')
  
  process.exit(0)
}

async function main() {
  await syncUrbanJungleProducts()
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err)
  process.exit(1)
})
