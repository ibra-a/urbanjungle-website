/**
 * CAC International Bank Payment Service
 * Handles all payment operations with CAC Bank API
 * Documentation: https://documenter.getpostman.com/view/26519164/2sB3QMLUwM
 * 
 * NOTE: Uses serverless functions for secure credential handling.
 * Both GAB Fashion and Urban Jungle use the same CAC Bank credentials
 * because they are under the same GAB company and account number.
 */

import { supabase } from './supabase';
import toast from 'react-hot-toast';
import JSONbig from 'json-bigint';

// API Configuration - Direct CAC Bank API (Production)
const CAC_API_BASE_URL = import.meta.env.VITE_CAC_API_URL || 'https://services.cacintbank.com:8749/pay/v1';
const TEST_MODE = import.meta.env.VITE_PAYMENT_TEST_MODE === 'true';

// Token cache to reuse the same token across initiation and confirmation
let cachedToken = null;
let tokenExpiry = null;

// Debug: Log the API URL being used
console.log('🔧 CAC Bank API URL:', CAC_API_BASE_URL);
console.log('🔧 Test Mode:', TEST_MODE);
console.log('🔧 Environment variable:', import.meta.env.VITE_CAC_API_URL);

/**
 * Authenticate with CAC Bank API (Sign In)
 * Uses serverless function to avoid CORS and IP whitelisting issues
 * @param {Object} credentials - Username and password (optional, uses backend credentials)
 * @param {Boolean} forceNew - Force new authentication even if token is cached
 * @returns {Promise<Object>} Authentication token and details
 */
export const authenticate = async (credentials = {}, forceNew = false) => {
  try {
    // Check if we have a valid cached token (unless forced to get new)
    if (!forceNew && cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      console.log('🔄 Using cached Bearer token');
      return {
        success: true,
        token: cachedToken,
        cached: true
      };
    }

    console.log('🔧 Authenticating via serverless function...');
    
    // Use serverless function (routes through Digital Ocean proxy with whitelisted IP)
    const response = await fetch('/api/cacint/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Authentication failed');
    }

    const data = await response.json();
    
    if (!data.success || !data.token) {
      throw new Error(data.error || 'Authentication failed');
    }
    
    console.log('✅ Authentication successful');
    
    // Cache the token for 1 hour
    cachedToken = data.token;
    tokenExpiry = Date.now() + (60 * 60 * 1000); // 1 hour from now
    
    return {
      success: true,
      token: cachedToken,
      data: data
    };
  } catch (error) {
    console.error('CAC Auth Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Clear cached authentication token
 * Use this if you need to force re-authentication
 */
export const clearAuthCache = () => {
  cachedToken = null;
  tokenExpiry = null;
  console.log('🔄 Auth cache cleared');
};

/**
 * Initiate payment transaction
 * @param {Object} paymentData - Payment details
 * @returns {Promise<Object>} Payment initiation response with transaction ID
 */
export const initiatePayment = async (paymentData) => {
  try {
    const {
      amount,
      phoneNumber,
      orderId,
      description
    } = paymentData;

    // First authenticate to get token
    const authResult = await authenticate();
    if (!authResult.success || !authResult.token) {
      throw new Error('Authentication failed');
    }

    console.log('🔧 Initiating payment via serverless function...');
    
    // Use serverless function (routes through Digital Ocean proxy)
    const response = await fetch('/api/cacint/initiate-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: authResult.token,
        customer_mobile: phoneNumber,
        amount: parseFloat(amount),
        desc: description || `Urban Jungle - Order ${orderId}`,
        vender_ref: orderId || `UJ-${Date.now()}`
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      // Handle specific error codes
      let errorMsg = data.error || data.message || 'Payment initiation failed';
      
      if (data.details?.errorCode === 155 || errorMsg.includes('CAC Wallet')) {
        errorMsg = 'Phone number does not have an active CAC Wallet account. Please call 6363 to activate CAC Wallet, or use a different phone number.';
      }
      
      throw new Error(errorMsg);
    }

    // Payment request ID is already a string from the serverless function
    const paymentRequestId = data.paymentRequestId ? String(data.paymentRequestId) : null;
    
    console.log('✅ Payment initiated successfully');
    console.log('🔧 Payment Request ID:', paymentRequestId);
    
    return {
      success: true,
      paymentRequestId: paymentRequestId,
      message: data.message || 'OTP sent to your phone',
      data: data
    };
  } catch (error) {
    console.error('CAC Payment Initiation Error:', error);
    toast.error(error.message || 'Failed to initiate payment');
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Confirm payment with OTP
 * @param {Object} confirmData - Confirmation details
 * @returns {Promise<Object>} Payment confirmation response
 */
export const confirmPayment = async (confirmData) => {
  try {
    const {
      paymentRequestId,
      otp,
      phoneNumber
    } = confirmData;

    // TEST MODE: Simulate successful confirmation
    if (TEST_MODE) {
      console.log('🧪 TEST MODE: Simulating payment confirmation');
      console.log('🧪 Payment Request ID:', paymentRequestId);
      console.log('🧪 OTP:', otp);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful confirmation
      return {
        success: true,
        status: 'confirmed',
        message: 'Payment confirmed successfully (TEST MODE)',
        data: { paymentRequestId, otp, testMode: true }
      };
    }

    // CRITICAL: Reuse cached token from initiation (DO NOT get new token!)
    // CAC Bank requires the SAME token for initiation and confirmation
    const authResult = await authenticate({}, false); // Use cached token, don't force new
    if (!authResult.success || !authResult.token) {
      console.error('❌ No cached token available - confirmation will fail!');
      throw new Error('Authentication failed - please try payment again');
    }

    console.log('🔧 Confirming payment via serverless function...');
    console.log('🔧 Payment Request ID:', paymentRequestId);
    console.log('🔧 Using cached Bearer token:', authResult.cached ? 'YES ✅' : 'NO (NEW TOKEN) ⚠️');

    // Use serverless function (routes through Digital Ocean proxy)
    // CRITICAL: Keep payment_request_id as string to preserve precision for 17+ digit IDs
    const response = await fetch('/api/cacint/confirm-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: authResult.token,
        payment_request_id: String(paymentRequestId), // Keep as string for large IDs
        otp: String(otp)
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      let errorMessage = data.error || data.message || 'Payment confirmation failed';
      
      // Handle specific error codes
      if (data.details?.errorCode === 160) {
        errorMessage = 'Payment not found. The payment may have expired or the payment request ID is invalid.';
      }
      
      throw new Error(errorMessage);
    }

    console.log('✅ Payment confirmed successfully');
    
    return {
      success: true,
      status: 'confirmed',
      message: data.message || 'Payment confirmed successfully',
      reference: data.reference || data.confirmReference,
      confirmReference: data.confirmReference,
      data: data
    };
  } catch (error) {
    console.error('CAC Payment Confirmation Error:', error);
    toast.error(error.message || 'Failed to confirm payment');
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify payment status
 * @param {string} transactionId - Transaction ID to verify
 * @returns {Promise<Object>} Payment verification response
 */
export const verifyPayment = async (transactionId) => {
  try {
    const response = await fetch(`${CAC_API_BASE_URL}/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction_id: transactionId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Payment verification failed');
    }

    const data = await response.json();
    
    return {
      success: true,
      status: data.status,
      isPaid: data.status === 'success' || data.status === 'completed',
      amount: data.amount,
      message: data.message,
      data: data
    };
  } catch (error) {
    console.error('CAC Payment Verification Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Create order in Supabase
 * For CAC prepaid orders: Order is created AFTER payment is confirmed (OTP verified)
 * @param {Object} orderData - Order details
 * @returns {Promise<Object>} Created order
 */
export const createOrder = async (orderData) => {
  try {
    const {
      userId,
      items,
      totalAmount,
      shippingAddress,
      phoneNumber,
      customerEmail,
      customerName,
      // Payment details (provided after OTP confirmation)
      paymentRequestId,
      transactionId,
      reference,
      confirmReference
    } = orderData;

    // ✅ CAC PREPAID: Reserve stock after payment is confirmed (safe - payment is guaranteed)
    const { reserveStock } = await import('./stockReservationService');
    const reservationResult = await reserveStock(items);
    
    if (!reservationResult.success) {
      return {
        success: false,
        error: reservationResult.error || 'Insufficient stock available'
      };
    }

    // Build order data - payment_status is 'paid' since payment is already confirmed
    const orderPayload = {
      customer_id: userId || null,
      user_id: userId || null,
      items: items,
      total_amount: totalAmount,
      currency: 'DJF',
      shipping_address: shippingAddress,
      customer_email: customerEmail,
      customer_name: customerName,
      status: 'confirmed', // Order is confirmed since payment is done
      payment_status: 'paid', // ✅ Payment already confirmed via OTP
      payment_method: 'CAC Bank Mobile Money',
      delivery_status: 'pending',
      synced_to_erp: false,
      store_name: 'Urban Jungle',
      paid_at: new Date().toISOString() // Payment timestamp
    };

    // Add payment transaction details if provided
    if (transactionId) {
      orderPayload.transaction_id = transactionId;
    }
    if (paymentRequestId) {
      orderPayload.cac_payment_request_id = paymentRequestId;
    }
    if (reference) {
      orderPayload.reference = reference;
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([orderPayload])
      .select()
      .single();

    if (error) {
      // Release reservation if order creation fails
      const { releaseStock } = await import('./stockReservationService');
      await releaseStock(items);
      console.error('❌ Supabase Insert Error:', error);
      throw error;
    }

    console.log('✅ Order created successfully (payment confirmed):', data.id);

    // Release stock reservation (stock will be reduced in ERPNext)
    const { releaseStock } = await import('./stockReservationService');
    await releaseStock(items);

    // Sync to ERPNext (non-blocking)
    syncOrderToERPNext(data.id, 'urban').catch(err => {
      console.error('⚠️ ERPNext sync failed (non-blocking):', err);
      // Don't throw - order is created and paid, ERP sync can be retried later
    });

    return {
      success: true,
      order: data
    };
  } catch (error) {
    console.error('❌ Create Order Error:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    toast.error('Failed to create order: ' + (error.message || 'Unknown error'));
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update order payment status
 * @param {string} orderId - Order ID
 * @param {Object} paymentDetails - Payment details to update
 * @returns {Promise<Object>} Updated order
 */
export const updateOrderPayment = async (orderId, paymentDetails) => {
  try {
    const {
      transactionId,
      status,
      paymentStatus,
      paymentRequestId
    } = paymentDetails;

    const updateData = {
      payment_status: paymentStatus,
      status: status,
      updated_at: new Date().toISOString(),
    };

    // Add transaction ID if provided
    if (transactionId) {
      updateData.transaction_id = transactionId;
    }

    // Add CAC payment request ID if provided
    if (paymentRequestId) {
      updateData.cac_payment_request_id = paymentRequestId;
    }

    // Update paid_at when payment is completed
    if (paymentStatus === 'paid') {
      updateData.paid_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    // If payment is confirmed and paid, sync to ERPNext and release reservation
    if (paymentStatus === 'paid' && status === 'confirmed') {
      console.log('💰 Payment confirmed - syncing to ERPNext...');
      
      // Get order items to release reservation
      const { data: order } = await supabase
        .from('orders')
        .select('items')
        .eq('id', orderId)
        .single();
      
      // Release stock reservation (stock will be reduced in ERPNext)
      if (order?.items) {
        const { releaseStock } = await import('./stockReservationService');
        await releaseStock(order.items);
      }
      
      syncOrderToERPNext(orderId, 'urban').catch(err => {
        console.error('⚠️ ERPNext sync failed (non-blocking):', err);
        // Don't throw - order is already paid, ERP sync can be retried later
      });
    }

    return {
      success: true,
      order: data
    };
  } catch (error) {
    console.error('Update Order Payment Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Sync order to ERPNext (creates Sales Order and reduces stock)
 * @param {string} orderId - Order ID from Supabase
 * @param {string} storeType - Optional: 'urban' or 'gab' (defaults to 'urban' for Urban Jungle)
 * @returns {Promise<Object>} ERPNext sync result
 */
export const syncOrderToERPNext = async (orderId, storeType = 'urban') => {
  try {
    // Use unified orders table with store_name filter
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('store_name', 'Urban Jungle') // Ensure it's Urban Jungle order
      .single();

    if (error) throw error;

    // Check if already synced
    if (order.synced_to_erp) {
      console.log('ℹ️ Order already synced to ERPNext');
      return { success: true, alreadySynced: true };
    }

    // Call Supabase Edge Function (proper way - no CORS issues)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('📤 Syncing order to ERPNext via Edge Function...');
    const response = await fetch(`${supabaseUrl}/functions/v1/sync-order-to-erp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({ orderId })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Edge Function error:', errorText);
      throw new Error(`ERPNext sync failed: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Order synced to ERPNext:');
    console.log('   Sales Order:', result.salesOrderId);
    console.log('   Sales Invoice:', result.salesInvoiceId);
    console.log('   Stock reduced automatically ✅');

    // Send order confirmation email
    try {
      console.log('📧 Sending order confirmation email...');
      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({ 
          order: order,
          type: 'order_confirmation'
        })
      });

      if (emailResponse.ok) {
        console.log('✅ Order confirmation email sent');
      } else {
        console.warn('⚠️ Email send failed (non-critical):', await emailResponse.text());
      }
    } catch (emailError) {
      // Email is non-critical - don't fail the order
      console.warn('⚠️ Email send error (non-critical):', emailError);
    }

    return {
      success: true,
      salesOrderId: result.salesOrderId,
      salesInvoiceId: result.salesInvoiceId
    };
  } catch (error) {
    console.error('❌ ERPNext sync error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order details
 */
export const getOrder = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('store_name', 'Urban Jungle')
      .single();

    if (error) throw error;

    return {
      success: true,
      order: data
    };
  } catch (error) {
    console.error('Get Order Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get user orders
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of orders
 */
export const getUserOrders = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`user_id.eq.${userId},customer_id.eq.${userId}`)
      .eq('store_name', 'Urban Jungle')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      orders: data || []
    };
  } catch (error) {
    console.error('Get User Orders Error:', error);
    return {
      success: false,
      orders: [],
      error: error.message
    };
  }
};

export default {
  authenticate,
  clearAuthCache,
  initiatePayment,
  confirmPayment,
  verifyPayment,
  createOrder,
  updateOrderPayment,
  getOrder,
  getUserOrders
};

