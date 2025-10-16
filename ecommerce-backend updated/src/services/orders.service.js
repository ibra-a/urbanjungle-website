/**
 * Orders Service
 * Handles all order operations with Supabase
 */
export class OrdersService {
  constructor(supabaseClient, tablePrefix = '') {
    this.supabase = supabaseClient
    this.table = `${tablePrefix}orders`
  }

  /**
   * Create new order
   * @param {Object} orderData - Order details
   * @returns {Promise<Object>} Created order
   */
  async createOrder(orderData) {
    try {
      const {
        userId,
        items,
        totalAmount,
        shippingAddress,
        phoneNumber,
        customerEmail,
        customerName,
        currency = 'DJF',
        paymentMethod = 'CAC Bank Mobile Money'
      } = orderData

      const { data, error } = await this.supabase
        .from(this.table)
        .insert([
          {
            customer_id: userId,
            user_id: userId, // Support both field names
            items: items,
            total_amount: totalAmount,
            currency: currency,
            shipping_address: shippingAddress,
            customer_email: customerEmail,
            customer_name: customerName,
            customer_phone: phoneNumber,
            status: 'pending',
            payment_status: 'pending',
            payment_method: paymentMethod,
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('❌ Supabase Insert Error:', error)
        throw error
      }

      console.log('✅ Order created successfully:', data)

      return {
        success: true,
        order: data
      }
    } catch (error) {
      console.error('❌ Create Order Error:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrder(orderId) {
    try {
      const { data, error } = await this.supabase
        .from(this.table)
        .select('*')
        .eq('id', orderId)
        .single()

      if (error) throw error

      return {
        success: true,
        order: data
      }
    } catch (error) {
      console.error('Get Order Error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get user orders
   * @param {string} userId - User ID
   * @returns {Promise<Object>} List of orders
   */
  async getUserOrders(userId) {
    try {
      const { data, error } = await this.supabase
        .from(this.table)
        .select('*')
        .or(`user_id.eq.${userId},customer_id.eq.${userId}`) // Support both field names
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        success: true,
        orders: data || []
      }
    } catch (error) {
      console.error('Get User Orders Error:', error)
      return {
        success: false,
        orders: [],
        error: error.message
      }
    }
  }

  /**
   * Update order payment status
   * @param {string} orderId - Order ID
   * @param {Object} paymentDetails - Payment details to update
   * @returns {Promise<Object>} Updated order
   */
  async updateOrderPayment(orderId, paymentDetails) {
    try {
      const {
        transactionId,
        status,
        paymentStatus,
        paymentRequestId
      } = paymentDetails

      const updateData = {
        payment_status: paymentStatus,
        status: status,
        updated_at: new Date().toISOString(),
      }

      // Add transaction ID if provided
      if (transactionId) {
        updateData.transaction_id = transactionId
      }

      // Add CAC payment request ID if provided
      if (paymentRequestId) {
        updateData.cac_payment_request_id = paymentRequestId
      }

      // Update paid_at when payment is completed
      if (paymentStatus === 'paid') {
        updateData.paid_at = new Date().toISOString()
      }

      const { data, error } = await this.supabase
        .from(this.table)
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        order: data
      }
    } catch (error) {
      console.error('Update Order Payment Error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated order
   */
  async updateOrderStatus(orderId, status) {
    try {
      const { data, error } = await this.supabase
        .from(this.table)
        .update({
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        order: data
      }
    } catch (error) {
      console.error('Update Order Status Error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get orders by status
   * @param {string} status - Order status
   * @param {number} limit - Maximum number of orders
   * @returns {Promise<Object>} Orders with specified status
   */
  async getOrdersByStatus(status, limit = 100) {
    try {
      const { data, error } = await this.supabase
        .from(this.table)
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return {
        success: true,
        orders: data || []
      }
    } catch (error) {
      console.error('Get Orders By Status Error:', error)
      return {
        success: false,
        orders: [],
        error: error.message
      }
    }
  }

  /**
   * Get orders by payment status
   * @param {string} paymentStatus - Payment status
   * @param {number} limit - Maximum number of orders
   * @returns {Promise<Object>} Orders with specified payment status
   */
  async getOrdersByPaymentStatus(paymentStatus, limit = 100) {
    try {
      const { data, error } = await this.supabase
        .from(this.table)
        .select('*')
        .eq('payment_status', paymentStatus)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return {
        success: true,
        orders: data || []
      }
    } catch (error) {
      console.error('Get Orders By Payment Status Error:', error)
      return {
        success: false,
        orders: [],
        error: error.message
      }
    }
  }

  /**
   * Delete order (admin only)
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteOrder(orderId) {
    try {
      const { error } = await this.supabase
        .from(this.table)
        .delete()
        .eq('id', orderId)

      if (error) throw error

      return {
        success: true,
        message: 'Order deleted successfully'
      }
    } catch (error) {
      console.error('Delete Order Error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get order statistics
   * @param {string} userId - User ID (optional, for user-specific stats)
   * @returns {Promise<Object>} Order statistics
   */
  async getOrderStats(userId = null) {
    try {
      let query = this.supabase
        .from(this.table)
        .select('status, payment_status, total_amount')

      if (userId) {
        query = query.or(`user_id.eq.${userId},customer_id.eq.${userId}`)
      }

      const { data, error } = await query

      if (error) throw error

      const stats = {
        total: data.length,
        pending: data.filter(o => o.status === 'pending').length,
        completed: data.filter(o => o.status === 'completed').length,
        cancelled: data.filter(o => o.status === 'cancelled').length,
        paid: data.filter(o => o.payment_status === 'paid').length,
        unpaid: data.filter(o => o.payment_status === 'pending').length,
        totalRevenue: data
          .filter(o => o.payment_status === 'paid')
          .reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0)
      }

      return {
        success: true,
        stats
      }
    } catch (error) {
      console.error('Get Order Stats Error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

