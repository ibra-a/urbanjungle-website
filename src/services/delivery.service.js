/**
 * Delivery Management Service
 * Handles delivery status updates and tracking
 */

import { supabase } from '../services/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Update delivery status
 * @param {string} orderId - Order ID
 * @param {string} action - Action to perform (mark_packed, mark_shipped, mark_delivered, cancel_delivery)
 * @param {string} trackingNumber - Optional tracking number for shipping
 * @returns {Promise<Object>} Result
 */
export const updateDeliveryStatus = async (orderId, action, trackingNumber = null) => {
  try {
    console.log(`📦 Updating delivery status: ${action} for order ${orderId}`);

    const response = await fetch(`${SUPABASE_URL}/functions/v1/update-delivery-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        orderId,
        action,
        trackingNumber
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Delivery update failed:', errorText);
      throw new Error(`Delivery update failed: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Delivery status updated:', result);

    // Send email notification for shipped and delivered status
    if ((action === 'mark_shipped' || action === 'mark_delivered') && result.order) {
      try {
        console.log(`📧 Sending ${action === 'mark_shipped' ? 'shipping' : 'delivery'} notification email...`);
        
        const emailType = action === 'mark_shipped' ? 'order_shipped' : 'order_delivered';
        const emailResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-order-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ 
            order: result.order,
            type: emailType
          })
        });

        if (emailResponse.ok) {
          console.log('✅ Notification email sent');
        } else {
          console.warn('⚠️ Email send failed (non-critical):', await emailResponse.text());
        }
      } catch (emailError) {
        // Email is non-critical - don't fail the update
        console.warn('⚠️ Email send error (non-critical):', emailError);
      }
    }

    return {
      success: true,
      ...result
    };
  } catch (error) {
    console.error('❌ Delivery update error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get orders with delivery status
 * @param {string} status - Optional status filter
 * @returns {Promise<Array>} Orders
 */
export const getOrdersWithDelivery = async (status = null) => {
  try {
    let query = supabase
      .from('orders')
      .select('*')
      .not('delivery_note_id', 'is', null)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('delivery_status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error fetching orders with delivery:', error);
    return [];
  }
};

/**
 * Get delivery statistics
 * @returns {Promise<Object>} Stats
 */
export const getDeliveryStats = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('delivery_status')
      .not('delivery_note_id', 'is', null);

    if (error) {
      throw error;
    }

    const stats = {
      pending: 0,
      ready: 0,
      assigned: 0,
      out_for_delivery: 0,
      delivered: 0,
      completed: 0,
      cancelled: 0,
      total: data.length
    };

    data.forEach(order => {
      if (order.delivery_status && stats.hasOwnProperty(order.delivery_status)) {
        stats[order.delivery_status]++;
      }
    });

    return stats;
  } catch (error) {
    console.error('❌ Error fetching delivery stats:', error);
    return {
      pending: 0,
      ready: 0,
      assigned: 0,
      out_for_delivery: 0,
      delivered: 0,
      completed: 0,
      cancelled: 0,
      total: 0
    };
  }
};

/**
 * Get delivery status badge color
 * @param {string} status - Delivery status
 * @returns {string} Tailwind color class
 */
export const getDeliveryStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    ready: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    assigned: 'bg-teal-500/20 text-teal-400 border border-teal-500/30',
    out_for_delivery: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    delivered: 'bg-green-500/20 text-green-400 border border-green-500/30',
    completed: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border border-red-500/30'
  };

  return colors[status] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
};

/**
 * Get delivery status display name
 * @param {string} status - Delivery status
 * @returns {string} Display name
 */
export const getDeliveryStatusName = (status) => {
  const names = {
    pending: 'Pending',
    ready: 'Ready',
    assigned: 'Driver Assigned',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };

  return names[status] || status;
};

