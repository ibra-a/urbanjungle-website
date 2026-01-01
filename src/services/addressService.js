/**
 * Address Service
 * Handles saving and importing addresses from orders
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Check if an address already exists (duplicate detection)
 * @param {string} userId - User ID
 * @param {Object} address - Address object to check
 * @returns {Promise<boolean>} - True if address exists
 */
const addressExists = async (userId, address) => {
  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('id')
      .eq('user_id', userId)
      .eq('city', address.city?.trim() || '')
      .eq('street_address', address.street_address?.trim() || '')
      .limit(1);

    if (error) {
      console.error('Error checking address existence:', error);
      return false; // If error, allow save (better to have duplicate than lose data)
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error checking address existence:', error);
    return false;
  }
};

/**
 * Save address to user_addresses table
 * @param {string} userId - User ID
 * @param {Object} shippingAddress - Shipping address from order
 * @returns {Promise<Object>} - Result with success/error
 */
export const saveAddressFromOrder = async (userId, shippingAddress) => {
  if (!userId || !shippingAddress) {
    return { success: false, error: 'Missing userId or shippingAddress' };
  }

  try {
    // Normalize address data
    const addressData = {
      full_name: shippingAddress.firstName && shippingAddress.lastName
        ? `${shippingAddress.firstName} ${shippingAddress.lastName}`
        : shippingAddress.full_name || shippingAddress.name || '',
      street_address: shippingAddress.address || shippingAddress.street_address || '',
      address_line_2: shippingAddress.apartment || shippingAddress.address_line_2 || null,
      city: shippingAddress.city || '',
      state: shippingAddress.region || shippingAddress.state || null,
      postal_code: shippingAddress.zipCode || shippingAddress.postal_code || null,
      country: shippingAddress.country || 'Djibouti',
      phone: shippingAddress.phone || shippingAddress.phone_number || null,
      label: null // Can be set by user later
    };

    // Check if address already exists
    const exists = await addressExists(userId, addressData);
    if (exists) {
      console.log('Address already exists, skipping save');
      return { success: true, skipped: true, message: 'Address already saved' };
    }

    // Save address
    const { data, error } = await supabase
      .from('user_addresses')
      .insert([{
        user_id: userId,
        ...addressData
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving address:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Address saved successfully:', data.id);
    return { success: true, data };
  } catch (error) {
    console.error('Error in saveAddressFromOrder:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Import addresses from guest orders (by email)
 * @param {string} userId - User ID
 * @param {string} email - User email to find guest orders
 * @returns {Promise<Object>} - Result with count of imported addresses
 */
export const importAddressesFromGuestOrders = async (userId, email) => {
  if (!userId || !email) {
    return { success: false, error: 'Missing userId or email' };
  }

  try {
    // Find all guest orders (customer_id is null) with matching email
    const { data: guestOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, shipping_address, customer_email, created_at, customer_id')
      .is('customer_id', null) // Guest orders only (customer_id is null)
      .eq('customer_email', email.toLowerCase().trim())
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching guest orders:', ordersError);
      return { success: false, error: ordersError.message };
    }

    if (!guestOrders || guestOrders.length === 0) {
      console.log('No guest orders found for email:', email);
      return { success: true, imported: 0, message: 'No guest orders found' };
    }

    // Extract unique addresses and save them
    const savedAddresses = new Set(); // Track saved addresses to avoid duplicates
    let importedCount = 0;
    let skippedCount = 0;

    for (const order of guestOrders) {
      if (!order.shipping_address) continue;

      const shippingAddress = order.shipping_address;
      
      // Create a unique key for this address (city + street)
      const addressKey = `${(shippingAddress.city || '').trim().toLowerCase()}_${(shippingAddress.address || shippingAddress.street_address || '').trim().toLowerCase()}`;
      
      // Skip if we've already saved this address
      if (savedAddresses.has(addressKey)) {
        skippedCount++;
        continue;
      }

      // Try to save the address
      const result = await saveAddressFromOrder(userId, shippingAddress);
      
      if (result.success && !result.skipped) {
        savedAddresses.add(addressKey);
        importedCount++;
      } else if (result.skipped) {
        savedAddresses.add(addressKey);
        skippedCount++;
      }
    }

    console.log(`✅ Imported ${importedCount} addresses, skipped ${skippedCount} duplicates`);
    return {
      success: true,
      imported: importedCount,
      skipped: skippedCount,
      total: guestOrders.length
    };
  } catch (error) {
    console.error('Error in importAddressesFromGuestOrders:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Auto-save address after checkout (for logged-in users)
 * Called after order is successfully created
 * @param {string} userId - User ID
 * @param {Object} order - Order object with shipping_address
 * @returns {Promise<void>}
 */
export const autoSaveAddressAfterCheckout = async (userId, order) => {
  if (!userId || !order?.shipping_address) {
    return; // Silently skip if no user or address
  }

  try {
    await saveAddressFromOrder(userId, order.shipping_address);
    // Silently save - no toast notification to keep it simple
  } catch (error) {
    console.error('Error auto-saving address after checkout:', error);
    // Silently fail - don't interrupt user flow
  }
};

/**
 * Auto-import addresses on signup (for new accounts)
 * Called after user successfully signs up
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export const autoImportAddressesOnSignup = async (userId, email) => {
  if (!userId || !email) {
    return; // Silently skip if missing data
  }

  try {
    const result = await importAddressesFromGuestOrders(userId, email);
    if (result.success && result.imported > 0) {
      console.log(`✅ Auto-imported ${result.imported} addresses on signup`);
    }
    // Silently import - no toast notification to keep it simple
  } catch (error) {
    console.error('Error auto-importing addresses on signup:', error);
    // Silently fail - don't interrupt user flow
  }
};

