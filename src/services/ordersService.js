import { supabase, TABLES } from './supabase';

class OrdersService {
  // Create a new order
  async createOrder(orderData) {
    try {
      const {
        userId,
        customerEmail,
        customerName,
        customerPhone,
        items,
        totalAmount,
        shippingAddress,
        paymentMethod = 'CAC Bank',
        currency = 'DJF'
      } = orderData;

      // Generate order number
      const orderNumber = `URB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const orderPayload = {
        user_id: userId || null,
        customer_id: userId || null,
        order_number: orderNumber,
        customer_email: customerEmail,
        customer_name: customerName,
        customer_phone: customerPhone,
        items: items,
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        currency: currency,
        status: 'pending',
        payment_status: 'pending'
      };

      // Use unified orders table with store_name
      const orderWithStore = {
        ...orderPayload,
        store_name: 'Urban Jungle' // Ensure store_name is set
      };
      
      const { data, error } = await supabase
        .from('orders')
        .insert([orderWithStore])
        .select()
        .single();

      if (error) throw error;

      return { success: true, order: data };
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user orders
  async getUserOrders(userId) {
    try {
      if (!userId) {
        return { success: false, requiresAuth: true, orders: [] };
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`user_id.eq.${userId},customer_id.eq.${userId}`)
        .eq('store_name', 'Urban Jungle')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, orders: data || [] };
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return { success: false, error: error.message, orders: [] };
    }
  }

  // Get order by ID
  async getOrderById(orderId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('store_name', 'Urban Jungle')
        .single();

      if (error) throw error;

      return { success: true, order: data };
    } catch (error) {
      console.error('Error fetching order:', error);
      return { success: false, error: error.message };
    }
  }

  // Get order by order number
  async getOrderByNumber(orderNumber) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .eq('store_name', 'Urban Jungle')
        .single();

      if (error) throw error;

      return { success: true, order: data };
    } catch (error) {
      console.error('Error fetching order by number:', error);
      return { success: false, error: error.message };
    }
  }

  // Update order payment status
  async updateOrderPayment(orderId, paymentData) {
    try {
      const updatePayload = {
        updated_at: new Date().toISOString()
      };

      if (paymentData.transactionId) {
        updatePayload.transaction_id = paymentData.transactionId;
      }
      if (paymentData.paymentStatus) {
        updatePayload.payment_status = paymentData.paymentStatus;
      }
      if (paymentData.status) {
        updatePayload.status = paymentData.status;
      }
      if (paymentData.cacPaymentRequestId) {
        updatePayload.cac_payment_request_id = paymentData.cacPaymentRequestId;
      }
      if (paymentData.paymentStatus === 'paid') {
        updatePayload.paid_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', orderId)
        .eq('store_name', 'Urban Jungle')
        .select()
        .single();

      if (error) throw error;

      return { success: true, order: data };
    } catch (error) {
      console.error('Error updating order payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('store_name', 'Urban Jungle')
        .select()
        .single();

      if (error) throw error;

      return { success: true, order: data };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.message };
    }
  }

  // Cancel order
  async cancelOrder(orderId, userId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .or(`user_id.eq.${userId},customer_id.eq.${userId}`)
        .eq('store_name', 'Urban Jungle')
        .select()
        .single();

      if (error) throw error;

      return { success: true, order: data };
    } catch (error) {
      console.error('Error cancelling order:', error);
      return { success: false, error: error.message };
    }
  }

  // Get orders by email (for guest checkout)
  async getOrdersByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', email)
        .eq('store_name', 'Urban Jungle')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, orders: data || [] };
    } catch (error) {
      console.error('Error fetching orders by email:', error);
      return { success: false, error: error.message, orders: [] };
    }
  }

  // Get order statistics for user
  async getUserOrderStats(userId) {
    try {
      if (!userId) {
        return { success: false, requiresAuth: true };
      }

      const { data, error } = await supabase
        .from('orders')
        .select('status, total_amount, payment_status')
        .or(`user_id.eq.${userId},customer_id.eq.${userId}`)
        .eq('store_name', 'Urban Jungle');

      if (error) throw error;

      const stats = {
        totalOrders: data.length,
        pendingOrders: data.filter(o => o.status === 'pending').length,
        completedOrders: data.filter(o => o.status === 'delivered').length,
        totalSpent: data.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
      };

      return { success: true, stats };
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return { success: false, error: error.message };
    }
  }
}

export const ordersService = new OrdersService();
export default ordersService;






