/**
 * Products Service
 * Handles all product operations with Supabase
 */
export class ProductsService {
  constructor(supabaseClient, tablePrefix = '') {
    this.supabase = supabaseClient
    this.table = `${tablePrefix}brand_products`
  }

  /**
   * Get all products
   * @param {Object} options - Query options
   * @param {boolean} options.includeNotReady - Include products not ready to sell
   * @param {number} options.limit - Maximum number of products to return
   * @returns {Promise<Object>} Products data
   */
  async getAll(options = {}) {
    const { includeNotReady = false, limit = 500 } = options
    
    let query = this.supabase
      .from(this.table)
      .select('*')
      .eq('is_active', true)
    
    // For category pages, we want to show all products with stock, even if missing images
    if (!includeNotReady) {
      query = query.eq('ready_to_sell', true)  // Only items ready to sell (stock + price + image)!
    } else {
      // Show products with stock, even if missing images (for category browsing)
      query = query.gt('stock_quantity', 0)
    }
    
    const { data, error } = await query
      .order('stock_quantity', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)
    
    return { data, error }
  }

  /**
   * Get products by brand
   * @param {string} brand - Brand name
   * @param {number} limit - Maximum number of products
   * @returns {Promise<Object>} Products data
   */
  async getByBrand(brand, limit = 100) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select('*')
      .eq('brand', brand.toUpperCase())
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    return { data, error }
  }

  /**
   * Get single product by ID
   * @param {string|number} id - Product ID
   * @returns {Promise<Object>} Product data
   */
  async getById(id) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()
    
    return { data, error }
  }

  /**
   * Get product by item code
   * @param {string} itemCode - Product item code
   * @returns {Promise<Object>} Product data
   */
  async getByItemCode(itemCode) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select('*')
      .eq('item_code', itemCode)
      .eq('is_active', true)
      .single()
    
    return { data, error }
  }

  /**
   * Search products using full-text search
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Object>} Search results
   */
  async search(query, limit = 100) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select('*')
      .or(`product_name.ilike.%${query}%,description.ilike.%${query}%,item_name.ilike.%${query}%,item_code.ilike.%${query}%`)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    return { data, error }
  }

  /**
   * Get products with pagination
   * @param {number} page - Page number (0-based)
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated products
   */
  async getPage(page = 0, limit = 24) {
    const start = page * limit
    const end = start + limit - 1
    
    const { data, error, count } = await this.supabase
      .from(this.table)
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(start, end)
    
    return { data, error, count }
  }

  /**
   * Get products by specific brand with pagination
   * @param {string} brandName - Brand name
   * @param {number} page - Page number (0-based)
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated products
   */
  async getBySpecificBrand(brandName, page = 0, limit = 24) {
    const start = page * limit
    const end = start + limit - 1
    
    const { data, error, count } = await this.supabase
      .from(this.table)
      .select('*', { count: 'exact' })
      .eq('brand', brandName.toUpperCase())
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(start, end)
    
    return { data, error, count }
  }

  /**
   * Get products by brand and category
   * @param {string} brandName - Brand name
   * @param {string} category - Category name
   * @param {number} page - Page number (0-based)
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated products
   */
  async getBrandByCategory(brandName, category, page = 0, limit = 24) {
    const start = page * limit
    const end = start + limit - 1
    
    const { data, error, count } = await this.supabase
      .from(this.table)
      .select('*', { count: 'exact' })
      .eq('brand', brandName.toUpperCase())
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(start, end)
    
    return { data, error, count }
  }

  /**
   * Get products by brand, category, and gender
   * @param {string} brandName - Brand name
   * @param {string} category - Category name
   * @param {string} gender - Gender filter
   * @param {number} page - Page number (0-based)
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated products
   */
  async getBrandByCategoryAndGender(brandName, category, gender, page = 0, limit = 24) {
    const start = page * limit
    const end = start + limit - 1
    
    let query = this.supabase
      .from(this.table)
      .select('*', { count: 'exact' })
      .eq('brand', brandName.toUpperCase())
      .eq('category', category)
      .eq('is_active', true)
    
    if (gender && gender !== 'all') {
      query = query.eq('gender', gender.toUpperCase())
    }
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(start, end)
    
    return { data, error, count }
  }

  /**
   * Get products by category
   * @param {string} category - Category name
   * @param {number} page - Page number (0-based)
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated products
   */
  async getByCategory(category, page = 0, limit = 24) {
    const start = page * limit
    const end = start + limit - 1
    
    const { data, error, count } = await this.supabase
      .from(this.table)
      .select('*', { count: 'exact' })
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(start, end)
    
    return { data, error, count }
  }

  /**
   * Get products by gender
   * @param {string} gender - Gender filter
   * @param {number} page - Page number (0-based)
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated products
   */
  async getByGender(gender, page = 0, limit = 24) {
    const start = page * limit
    const end = start + limit - 1
    
    const { data, error, count } = await this.supabase
      .from(this.table)
      .select('*', { count: 'exact' })
      .eq('gender', gender.toUpperCase())
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(start, end)
    
    return { data, error, count }
  }

  /**
   * Get featured products (products with high stock or special flags)
   * @param {number} limit - Maximum number of products
   * @returns {Promise<Object>} Featured products
   */
  async getFeatured(limit = 12) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select('*')
      .eq('is_active', true)
      .eq('ready_to_sell', true)
      .gt('stock_quantity', 0)
      .order('stock_quantity', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)
    
    return { data, error }
  }

  /**
   * Get new arrivals (recently added products)
   * @param {number} limit - Maximum number of products
   * @returns {Promise<Object>} New arrivals
   */
  async getNewArrivals(limit = 12) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select('*')
      .eq('is_active', true)
      .eq('ready_to_sell', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    return { data, error }
  }
}

