/**
 * Product Name Utilities
 * Centralized functions for extracting base product names
 * Used across sync script, frontend grouping, and product display
 */

/**
 * Extract base product name (removes colorway and size)
 * Format: "Product Name — Color — Size" -> "Product Name"
 * This is used for frontend grouping where we want to show one card per base product
 * 
 * @param {string} productName - Full product name
 * @returns {string} Base product name (before first "—")
 */
export const extractBaseName = (productName) => {
  if (!productName) return productName;
  
  const raw = (productName || '').toString().trim();
  if (!raw) return '';
  const parts = raw.split('—').map(p => p.trim()).filter(Boolean);
  return (parts[0] || raw).trim();
};

/**
 * Extract TRUE base product name (removes BOTH color AND size)
 * Format: "Product Name — Color — Size" -> "Product Name"
 * This is used in sync script to group all colorways into one product row
 * 
 * @param {string} itemName - Full item name
 * @returns {string} True base name (no color, no size)
 */
export const extractTrueBaseName = (itemName) => {
  if (!itemName) return itemName;
  
  let cleanName = itemName;
  
  // Step 1: Remove size (if at the end, after "— ")
  cleanName = cleanName.replace(/\s*—\s+(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|OS|M\d+W\d+|\d{2}(\.\d)?|\d{2,3})\s*$/i, '');
  
  // Step 2: Remove color (last part after "— ")
  const parts = cleanName.split('—').map(p => p.trim());
  
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1];
    const sizePattern = /^(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|OS|M\d+W\d+|\d{2}(\.\d)?|\d{2,3})$/i;
    const isSize = sizePattern.test(lastPart);
    
    // If last part looks like a color (not a size, reasonable length)
    if (!isSize && lastPart.length > 0 && lastPart.length < 50 && !/^\d+$/.test(lastPart)) {
      cleanName = parts.slice(0, -1).join(' — ').trim();
    }
  }
  
  // Step 3: Clean up any remaining "— " at the end
  cleanName = cleanName.replace(/\s*—\s*$/, '').trim();
  
  return cleanName;
};




