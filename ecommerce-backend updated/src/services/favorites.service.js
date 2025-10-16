/**
 * Favorites Service
 * Handles all favorite product operations with Supabase
 */
export class FavoritesService {
  constructor(supabaseClient, tablePrefix = '') {
    this.supabase = supabaseClient
    this.table = `${tablePrefix}user_favorites`
  }

  /**
   * Get all favorites for a user
   * @param {string} userId - User's ID
   * @returns {Promise<Array>} Array of favorite product IDs
   */
  async getFavorites(userId) {
    try {
      if (!userId) {
        console.log('No user ID provided for getFavorites')
        return []
      }

      const { data, error } = await this.supabase
        .from(this.table)
        .select('product_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Return array of product IDs
      return data.map(fav => fav.product_id)
    } catch (error) {
      console.error('Error fetching favorites:', error)
      return []
    }
  }

  /**
   * Add a product to favorites
   * @param {string} userId - User's ID
   * @param {string} productId - Product item_code
   * @returns {Promise<boolean>} Success status
   */
  async addFavorite(userId, productId) {
    try {
      if (!userId) {
        throw new Error('User must be logged in to save favorites')
      }

      const { error } = await this.supabase
        .from(this.table)
        .insert({
          user_id: userId,
          product_id: productId
        })

      if (error) {
        // Handle duplicate entry gracefully
        if (error.code === '23505') {
          console.log('Product already in favorites')
          return true
        }
        throw error
      }

      return true
    } catch (error) {
      console.error('Error adding favorite:', error)
      throw error
    }
  }

  /**
   * Remove a product from favorites
   * @param {string} userId - User's ID
   * @param {string} productId - Product item_code
   * @returns {Promise<boolean>} Success status
   */
  async removeFavorite(userId, productId) {
    try {
      if (!userId) {
        return false
      }

      const { error } = await this.supabase
        .from(this.table)
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId)

      if (error) throw error

      return true
    } catch (error) {
      console.error('Error removing favorite:', error)
      throw error
    }
  }

  /**
   * Check if a product is favorited
   * @param {string} userId - User's ID
   * @param {string} productId - Product item_code
   * @returns {Promise<boolean>} Is favorited
   */
  async isFavorite(userId, productId) {
    try {
      if (!userId) return false

      const { data, error } = await this.supabase
        .from(this.table)
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned

      return !!data
    } catch (error) {
      console.error('Error checking favorite:', error)
      return false
    }
  }

  /**
   * Get full product details for user's favorites
   * @param {string} userId - User's ID
   * @returns {Promise<Array>} Array of favorite products with full details
   */
  async getFavoritesWithDetails(userId) {
    try {
      if (!userId) {
        return []
      }

      // Get favorite product IDs
      const { data: favorites, error: favError } = await this.supabase
        .from(this.table)
        .select('product_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (favError) throw favError

      if (!favorites || favorites.length === 0) {
        return []
      }

      const productIds = favorites.map(fav => fav.product_id)

      // Get full product details
      const { data: products, error: prodError } = await this.supabase
        .from('brand_products') // Note: This table name doesn't use prefix as it's shared
        .select('*')
        .in('item_code', productIds)
        .eq('is_active', true)

      if (prodError) throw prodError

      return products || []
    } catch (error) {
      console.error('Error fetching favorites with details:', error)
      return []
    }
  }

  /**
   * Toggle favorite status for a product
   * @param {string} userId - User's ID
   * @param {string} productId - Product item_code
   * @returns {Promise<Object>} Toggle result with action taken
   */
  async toggleFavorite(userId, productId) {
    try {
      if (!userId) {
        return { success: false, requiresAuth: true }
      }

      const isFavorited = await this.isFavorite(userId, productId)
      
      if (isFavorited) {
        const success = await this.removeFavorite(userId, productId)
        return { success, action: 'removed' }
      } else {
        const success = await this.addFavorite(userId, productId)
        return { success, action: 'added' }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get favorites count for a user
   * @param {string} userId - User's ID
   * @returns {Promise<number>} Number of favorites
   */
  async getFavoritesCount(userId) {
    try {
      if (!userId) return 0

      const { count, error } = await this.supabase
        .from(this.table)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (error) throw error

      return count || 0
    } catch (error) {
      console.error('Error getting favorites count:', error)
      return 0
    }
  }
}

