/**
 * Gender parsing utility for Nike product categorization
 * Based on item name patterns from API data
 */

/**
 * Parse gender/category from item name
 * @param {string} itemName - Product name from API
 * @returns {string} - 'men', 'women', 'kids', or 'unisex'
 */
export const getGender = (itemName) => {
  if (!itemName || typeof itemName !== 'string') return 'unisex';
  
  const name = itemName.toLowerCase();
  
  // Kids first (most specific)
  if (name.includes('kids') || 
      name.includes('kid') || 
      name.includes('youth') || 
      name.includes('jr') || 
      name.includes('junior') ||
      name.includes('child')) {
    return 'kids';
  }
      
  // Men's products
  if (name.includes('mens') || 
      name.includes('men') || 
      name.startsWith('m ') ||
      name.includes('male')) {
    return 'men';
  }
      
  // Women's products
  if (name.includes('womens') || 
      name.includes('women') || 
      name.startsWith('w ') ||
      name.includes('female') ||
      name.includes('ladies')) {
    return 'women';
  }
      
  // Default to unisex for accessories, bags, etc.
  return 'unisex';
};

/**
 * Filter products by gender category
 * @param {Array} products - Array of products from API
 * @param {string} targetGender - 'men', 'women', 'kids', or 'all'
 * @returns {Array} - Filtered products
 */
export const filterByGender = (products, targetGender) => {
  if (!Array.isArray(products)) return [];
  
  if (targetGender === 'all') return products;
  
  return products.filter(product => {
    const itemGender = getGender(product.itemName || product.name || '');
    
    // Include unisex items in men's and women's categories
    if (targetGender === 'men' || targetGender === 'women') {
      return itemGender === targetGender || itemGender === 'unisex';
    }
    
    // Kids category only shows kids items
    if (targetGender === 'kids') {
      return itemGender === 'kids';
    }
    
    return itemGender === targetGender;
  });
};

/**
 * Get product count by category
 * @param {Array} products - Array of products from API
 * @returns {Object} - Count object with men, women, kids, unisex counts
 */
export const getGenderCounts = (products) => {
  if (!Array.isArray(products)) return { men: 0, women: 0, kids: 0, unisex: 0 };
  
  const counts = { men: 0, women: 0, kids: 0, unisex: 0 };
  
  products.forEach(product => {
    const gender = getGender(product.itemName || product.name || '');
    counts[gender]++;
  });
  
  return counts;
}; 