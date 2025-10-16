/**
 * Cart Service
 * Handles cart operations with localStorage and optional server persistence
 */
export class CartService {
  constructor(supabaseClient = null, tablePrefix = '') {
    this.supabase = supabaseClient
    this.table = supabaseClient ? `${tablePrefix}user_cart` : null
    this.storageKey = 'cart'
  }

  /**
   * Get cart from localStorage
   * @returns {Object} Cart data
   */
  getCart() {
    try {
      const cartData = localStorage.getItem(this.storageKey)
      return cartData ? JSON.parse(cartData) : { items: [], total: 0, itemCount: 0 }
    } catch (error) {
      console.error('Error getting cart from localStorage:', error)
      return { items: [], total: 0, itemCount: 0 }
    }
  }

  /**
   * Save cart to localStorage
   * @param {Object} cart - Cart data
   */
  saveCart(cart) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(cart))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }

  /**
   * Add item to cart
   * @param {Object} item - Item to add
   * @param {string} item.id - Product ID
   * @param {string} item.size - Product size
   * @param {number} item.quantity - Quantity
   * @param {number} item.price - Price per unit
   * @param {string} item.name - Product name
   * @param {string} item.image - Product image URL
   * @returns {Object} Updated cart
   */
  addToCart(item) {
    const cart = this.getCart()
    const existingItem = cart.items.find(cartItem => 
      cartItem.id === item.id && cartItem.size === item.size
    )

    if (existingItem) {
      // Update quantity of existing item
      existingItem.quantity += item.quantity
    } else {
      // Add new item
      cart.items.push(item)
    }

    // Recalculate totals
    cart.total = cart.items.reduce((sum, cartItem) => sum + (cartItem.price * cartItem.quantity), 0)
    cart.itemCount = cart.items.reduce((sum, cartItem) => sum + cartItem.quantity, 0)

    this.saveCart(cart)
    return cart
  }

  /**
   * Remove item from cart
   * @param {string} itemId - Product ID
   * @param {string} size - Product size
   * @returns {Object} Updated cart
   */
  removeFromCart(itemId, size) {
    const cart = this.getCart()
    cart.items = cart.items.filter(item => 
      !(item.id === itemId && item.size === size)
    )

    // Recalculate totals
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

    this.saveCart(cart)
    return cart
  }

  /**
   * Update item quantity in cart
   * @param {string} itemId - Product ID
   * @param {string} size - Product size
   * @param {number} quantity - New quantity
   * @returns {Object} Updated cart
   */
  updateQuantity(itemId, size, quantity) {
    const cart = this.getCart()
    const item = cart.items.find(cartItem => 
      cartItem.id === itemId && cartItem.size === size
    )

    if (item) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return this.removeFromCart(itemId, size)
      } else {
        item.quantity = quantity
      }
    }

    // Recalculate totals
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

    this.saveCart(cart)
    return cart
  }

  /**
   * Clear cart
   * @returns {Object} Empty cart
   */
  clearCart() {
    const emptyCart = { items: [], total: 0, itemCount: 0 }
    this.saveCart(emptyCart)
    return emptyCart
  }

  /**
   * Get cart item count
   * @returns {number} Total number of items in cart
   */
  getItemCount() {
    const cart = this.getCart()
    return cart.itemCount
  }

  /**
   * Get cart total
   * @returns {number} Total price of all items in cart
   */
  getTotal() {
    const cart = this.getCart()
    return cart.total
  }

  /**
   * Check if item is in cart
   * @param {string} itemId - Product ID
   * @param {string} size - Product size
   * @returns {boolean} Whether item is in cart
   */
  isInCart(itemId, size) {
    const cart = this.getCart()
    return cart.items.some(item => item.id === itemId && item.size === size)
  }

  /**
   * Get item quantity in cart
   * @param {string} itemId - Product ID
   * @param {string} size - Product size
   * @returns {number} Item quantity
   */
  getItemQuantity(itemId, size) {
    const cart = this.getCart()
    const item = cart.items.find(cartItem => 
      cartItem.id === itemId && cartItem.size === size
    )
    return item ? item.quantity : 0
  }

  /**
   * Save cart to server (if Supabase is configured)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Save result
   */
  async saveCartToServer(userId) {
    if (!this.supabase || !this.table) {
      return { success: false, error: 'Server cart not configured' }
    }

    try {
      const cart = this.getCart()
      
      const { data, error } = await this.supabase
        .from(this.table)
        .upsert({
          user_id: userId,
          items: cart.items,
          total: cart.total,
          item_count: cart.itemCount,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error saving cart to server:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Load cart from server (if Supabase is configured)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Load result
   */
  async loadCartFromServer(userId) {
    if (!this.supabase || !this.table) {
      return { success: false, error: 'Server cart not configured' }
    }

    try {
      const { data, error } = await this.supabase
        .from(this.table)
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned

      if (data) {
        const cart = {
          items: data.items || [],
          total: data.total || 0,
          itemCount: data.item_count || 0
        }
        this.saveCart(cart)
        return { success: true, cart }
      } else {
        // No server cart found, keep local cart
        return { success: true, cart: this.getCart() }
      }
    } catch (error) {
      console.error('Error loading cart from server:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Clear server cart (if Supabase is configured)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Clear result
   */
  async clearServerCart(userId) {
    if (!this.supabase || !this.table) {
      return { success: false, error: 'Server cart not configured' }
    }

    try {
      const { error } = await this.supabase
        .from(this.table)
        .delete()
        .eq('user_id', userId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error clearing server cart:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Sync cart with server (load from server and merge with local)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Sync result
   */
  async syncCartWithServer(userId) {
    if (!this.supabase || !this.table) {
      return { success: false, error: 'Server cart not configured' }
    }

    try {
      const localCart = this.getCart()
      const serverResult = await this.loadCartFromServer(userId)

      if (serverResult.success && serverResult.cart) {
        const serverCart = serverResult.cart
        
        // Merge local and server carts (server takes precedence for conflicts)
        const mergedItems = [...localCart.items]
        
        serverCart.items.forEach(serverItem => {
          const localIndex = mergedItems.findIndex(localItem => 
            localItem.id === serverItem.id && localItem.size === serverItem.size
          )
          
          if (localIndex >= 0) {
            // Update existing item with server data
            mergedItems[localIndex] = serverItem
          } else {
            // Add new item from server
            mergedItems.push(serverItem)
          }
        })

        const mergedCart = {
          items: mergedItems,
          total: mergedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          itemCount: mergedItems.reduce((sum, item) => sum + item.quantity, 0)
        }

        this.saveCart(mergedCart)
        await this.saveCartToServer(userId)

        return { success: true, cart: mergedCart }
      } else {
        // No server cart, just save local cart to server
        await this.saveCartToServer(userId)
        return { success: true, cart: localCart }
      }
    } catch (error) {
      console.error('Error syncing cart with server:', error)
      return { success: false, error: error.message }
    }
  }
}

