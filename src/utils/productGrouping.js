// Import centralized utility
import { extractBaseName } from './productNameUtils';

// Extract color name from product_name if colors array is empty
const extractColorFromName = (productName) => {
  if (!productName) return null;
  
  const parts = productName.split('—').map(p => p.trim());
  if (parts.length < 2) return null;
  
  const lastPart = parts[parts.length - 1];
  const sizePattern = /^(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|OS|\d{2}(\.\d)?|\d{2,3})$/i;
  const isSize = sizePattern.test(lastPart);
  
  // If last part is not a size, it might be a color
  if (!isSize && lastPart.length > 0 && lastPart.length < 50 && !/^\d+$/.test(lastPart)) {
    return lastPart;
  }
  
  return null;
};

// Group products by base name to merge color variants (like Tommy CK)
export const groupProductsByName = (productList) => {
  const grouped = new Map();
  
  if (!productList || productList.length === 0) {
    return [];
  }
  
  productList.forEach(product => {
    // Extract base name from product_name (removes color/size) for grouping
    const baseName = extractBaseName(product.product_name || product.item_name);
    const groupKey = baseName || product.product_name || product.item_name || product.item_code;
    
    // Get colors from product - either from colors array or extract from name
    let productColors = [];
    if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
      productColors = [...product.colors];
    } else {
      // Try to extract color from product_name if colors array is empty
      const colorName = extractColorFromName(product.product_name || product.item_name);
      if (colorName && product.stock_quantity > 0) {
        // Create a color object from the name
        productColors = [{
          color: colorName,
          code: colorName.toUpperCase().replace(/\s+/g, '_'),
          stock: product.stock_quantity || 0,
          available: (product.stock_quantity || 0) > 0,
          image_url: product.image_url || null
        }];
      }
    }
    
    // Check if this is already a properly grouped product (has multiple colors or variants)
    const isAlreadyGrouped = (product.colors && product.colors.length > 1) || 
                             (product.variants && product.variants.length > 1);
    
    // Include gender in group key to prevent mixing MEN and WOMEN products
    const genderKey = product.gender ? `_${product.gender.toUpperCase().trim()}` : '_NO_GENDER';
    const groupKeyWithGender = `${groupKey}${genderKey}`;
    
    if (!grouped.has(groupKeyWithGender)) {
      // First occurrence - create grouped product
      // If product already has colors array, use it (preserve properly grouped products)
      const finalColors = (product.colors && product.colors.length > 0) ? product.colors : productColors;
      
      grouped.set(groupKeyWithGender, {
        ...product,
        // Use existing colors if available (from properly grouped product), otherwise use extracted
        colors: finalColors,
        // Ensure variants array exists - preserve if already populated
        variants: product.variants && Array.isArray(product.variants) && product.variants.length > 0
          ? [...product.variants]
          : [],
        // Ensure sizes array exists - preserve if already populated
        sizes: product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0
          ? [...product.sizes]
          : [],
        // Use first item_code as primary
        item_code: product.item_code,
        // Store base name for display
        product_name: baseName,
        item_name: baseName,
      });
    } else {
      // Merge with existing product (same base name AND same gender)
      const existing = grouped.get(groupKeyWithGender);
      
      // PRIORITY: If existing product already has multiple colors (properly grouped), preserve it
      // Only merge if the new product has colors that don't exist
      if (existing.colors && existing.colors.length > 1) {
        // Existing product is already properly grouped - just merge any missing colors
        if (productColors.length > 0) {
          productColors.forEach(colorObj => {
            const existingColor = existing.colors.find(c => 
              (c.code && colorObj.code && c.code === colorObj.code) ||
              (c.color && colorObj.color && c.color.toLowerCase() === colorObj.color.toLowerCase())
            );
            if (!existingColor) {
              // Add new color that doesn't exist yet
              existing.colors.push(colorObj);
            } else {
              // Update stock if color already exists (sum the stock)
              existingColor.stock = (existingColor.stock || 0) + (colorObj.stock || 0);
              existingColor.available = existingColor.stock > 0;
              if (colorObj.image_url && !existingColor.image_url) {
                existingColor.image_url = colorObj.image_url;
              }
            }
          });
        }
      } else {
        // Existing product doesn't have proper grouping - merge colors normally
        if (productColors.length > 0) {
          productColors.forEach(colorObj => {
            const existingColor = existing.colors.find(c => 
              (c.code && colorObj.code && c.code === colorObj.code) ||
              (c.color && colorObj.color && c.color.toLowerCase() === colorObj.color.toLowerCase())
            );
            if (!existingColor) {
              // Add new color
              existing.colors.push(colorObj);
            } else {
              // Update stock if color already exists (sum the stock)
              existingColor.stock = (existingColor.stock || 0) + (colorObj.stock || 0);
              existingColor.available = existingColor.stock > 0;
              if (colorObj.image_url && !existingColor.image_url) {
                existingColor.image_url = colorObj.image_url;
              }
            }
          });
        }
      }
      
      // Merge variants (avoid duplicates by item_code)
      if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
        // If existing has variants, merge; otherwise use the new product's variants if it's properly grouped
        if (existing.variants && existing.variants.length > 0) {
          product.variants.forEach(variant => {
            const existingVariant = existing.variants.find(v => v.item_code === variant.item_code);
            if (!existingVariant) {
              existing.variants.push(variant);
            }
          });
        } else if (isAlreadyGrouped) {
          // New product is properly grouped with variants - use its variants
          existing.variants = [...product.variants];
        }
      }
      
      // Merge sizes if variants not available
      if ((!existing.variants || existing.variants.length === 0) && product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
        if (existing.sizes && existing.sizes.length > 0) {
          product.sizes.forEach(sizeObj => {
            const existingSize = existing.sizes.find(s => s.size === sizeObj.size);
            if (!existingSize) {
              existing.sizes.push(sizeObj);
            } else {
              // Update stock for size
              existingSize.stock = (existingSize.stock || 0) + (sizeObj.stock || 0);
              existingSize.available = existingSize.stock > 0;
            }
          });
        } else {
          existing.sizes = [...product.sizes];
        }
      }
      
      // Update total stock (use the higher value if one product is properly grouped)
      if (isAlreadyGrouped && product.stock_quantity > existing.stock_quantity) {
        existing.stock_quantity = product.stock_quantity;
      } else {
        existing.stock_quantity = (existing.stock_quantity || 0) + (product.stock_quantity || 0);
      }
      
      // Use best image if available
      if (product.image_url && !existing.image_url) {
        existing.image_url = product.image_url;
      }
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        if (!existing.images || !Array.isArray(existing.images)) {
          existing.images = [];
        }
        product.images.forEach(img => {
          if (!existing.images.includes(img)) {
            existing.images.push(img);
          }
        });
      }
      
      // Use highest price
      if ((product.price || 0) > (existing.price || 0)) {
        existing.price = product.price;
      }
    }
  });
  
  return Array.from(grouped.values());
};

// Group products by base name to show one card per base product (not per colorway)
// Returns array of grouped products, each with:
// - base product name (for display)
// - representative item_code (for "View Details" link - picks best stock/available)
// - merged colors array (all colorways combined)
// - total stock across all colorways
export const groupProductsByBaseName = (productList) => {
  try {
    if (!productList || productList.length === 0) {
      return [];
    }
    
    // Step 1: Build map of baseName -> variants (O(n))
    const variantsByBase = new Map();
    
    productList.forEach(product => {
      try {
        const fullName = product.product_name || product.item_name || '';
        const baseName = extractBaseName(fullName);
        const groupKey = baseName || fullName || product.item_code || String(Math.random());
        
        if (!variantsByBase.has(groupKey)) {
          variantsByBase.set(groupKey, []);
        }
        variantsByBase.get(groupKey).push(product);
      } catch (err) {
        console.warn('⚠️ Error processing product in grouping:', product?.item_code, err);
        // Skip this product but continue processing others
      }
    });
  
    // Step 2: Process each group once (O(n) total)
    const grouped = [];
    
    variantsByBase.forEach((variants, baseName) => {
      try {
        if (!variants || variants.length === 0) return;
        
        // Pick representative: prefer one with stock > 0, sorted by stock desc, then created_at desc
        const representative = [...variants].sort((a, b) => {
          const stockA = Number(a.stock_quantity) || 0;
          const stockB = Number(b.stock_quantity) || 0;
          if (stockB !== stockA) return stockB - stockA;
          return (b.created_at || '').localeCompare(a.created_at || '');
        })[0] || variants[0];
        
        if (!representative) return;
        
        // Collect all colors from all variants (dedupe by color code)
        const colorMap = new Map();
        variants.forEach(variant => {
          try {
            if (variant.colors && Array.isArray(variant.colors)) {
              variant.colors.forEach(colorObj => {
                try {
                  const code = colorObj.code || colorObj.color || '';
                  const key = code.toString().trim().toLowerCase();
                  if (key && !colorMap.has(key)) {
                    colorMap.set(key, {
                      ...colorObj,
                      code: code,
                      color: colorObj.color || code,
                      stock: Number(colorObj.stock) || 0,
                      available: (Number(colorObj.stock) || 0) > 0,
                    });
                  }
                } catch (err) {
                  console.warn('⚠️ Error processing color:', colorObj, err);
                }
              });
            }
          } catch (err) {
            console.warn('⚠️ Error processing variant colors:', variant?.item_code, err);
          }
        });
        
        // Sum total stock across all variants
        const totalStock = variants.reduce((sum, p) => {
          try {
            return sum + (Number(p.stock_quantity) || 0);
          } catch {
            return sum;
          }
        }, 0);
        
        grouped.push({
          ...representative,
          // Display as base product name
          product_name: baseName,
          item_name: baseName,
          // Use representative's item_code for "View Details" link
          item_code: representative.item_code,
          // Merged colors from all variants
          colors: Array.from(colorMap.values()),
          // Total stock across all colorways
          stock_quantity: totalStock,
          // Keep reference to all variants (for debugging/future use)
          _variants: variants,
        });
      } catch (err) {
        console.error('❌ Error grouping product base:', baseName, err);
        // If grouping fails for a base, just use the first variant as-is
        if (variants && variants.length > 0) {
          grouped.push(variants[0]);
        }
      }
    });
    
    return grouped;
  } catch (err) {
    console.error('❌ Critical error in groupProductsByBaseName:', err);
    // Fallback: return original list if grouping completely fails
    return Array.isArray(productList) ? productList : [];
  }
};

