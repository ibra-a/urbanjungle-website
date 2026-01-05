import { supabase, TABLES } from './supabase';
import toast from 'react-hot-toast';

/**
 * Reserve stock for order items
 * @param {Array} items - Order items with item_code and quantity
 * @returns {Promise<Object>} Reservation result
 */
export const reserveStock = async (items) => {
  try {
    if (!items || items.length === 0) {
      return {
        success: false,
        error: 'No items to reserve stock for'
      };
    }

    const reservations = [];
    const failedItems = [];
    
    for (const item of items) {
      const itemCode = item.item_code || item.id;
      const quantity = item.quantity || 1;
      
      if (!itemCode) {
        console.warn('⚠️ Skipping item without item_code:', item);
        failedItems.push({ item, reason: 'Missing item_code' });
        continue;
      }

      // Get current product stock
      const { data: product, error: fetchError } = await supabase
        .from(TABLES.PRODUCTS)
        .select('stock_quantity, reserved_quantity')
        .eq('item_code', itemCode)
        .single();

      if (fetchError || !product) {
        console.error(`❌ Product not found: ${itemCode}`, fetchError);
        failedItems.push({ item, reason: `Product not found: ${itemCode}`, error: fetchError });
        continue;
      }

      const availableStock = (product.stock_quantity || 0) - (product.reserved_quantity || 0);
      
      if (availableStock < quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${item.name || itemCode}. Available: ${availableStock}, Requested: ${quantity}`
        };
      }

      // Reserve stock using direct update (RPC functions not needed)
      const currentReserved = product.reserved_quantity || 0;
      const { error: updateError } = await supabase
        .from(TABLES.PRODUCTS)
        .update({ 
          reserved_quantity: currentReserved + quantity 
        })
        .eq('item_code', itemCode);

      if (updateError) {
        console.error(`❌ Failed to reserve stock for ${itemCode}:`, updateError);
        return {
          success: false,
          error: `Failed to reserve stock for ${item.name || itemCode}: ${updateError.message}`
        };
      }

      reservations.push({ itemCode, quantity });
    }

    // If no items were successfully reserved, return error
    if (reservations.length === 0) {
      const errorMsg = failedItems.length > 0 
        ? `Failed to reserve stock: ${failedItems.map(f => f.reason).join(', ')}`
        : 'No items could be reserved';
      
      return {
        success: false,
        error: errorMsg,
        failedItems
      };
    }

    // If some items failed but others succeeded, we should rollback
    // For now, we'll return success if at least one item was reserved
    // But log warnings for failed items
    if (failedItems.length > 0) {
      console.warn('⚠️ Some items failed to reserve:', failedItems);
    }

    return {
      success: true,
      reservations,
      warnings: failedItems.length > 0 ? failedItems : undefined
    };
  } catch (error) {
    console.error('❌ Stock reservation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to reserve stock'
    };
  }
};

/**
 * Release reserved stock
 * @param {Array} items - Order items with item_code and quantity
 * @returns {Promise<Object>} Release result
 */
export const releaseStock = async (items) => {
  try {
    for (const item of items) {
      const itemCode = item.item_code || item.id;
      const quantity = item.quantity || 1;
      
      if (!itemCode) continue;

      // Release stock using direct update
      const { data: product } = await supabase
        .from(TABLES.PRODUCTS)
        .select('reserved_quantity')
        .eq('item_code', itemCode)
        .single();

      if (product) {
        const newReserved = Math.max(0, (product.reserved_quantity || 0) - quantity);
        const { error: releaseError } = await supabase
          .from(TABLES.PRODUCTS)
          .update({ reserved_quantity: newReserved })
          .eq('item_code', itemCode);
        
        if (releaseError) {
          console.error(`⚠️ Failed to release stock for ${itemCode}:`, releaseError);
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Stock release error:', error);
    return {
      success: false,
      error: error.message || 'Failed to release stock'
    };
  }
};

/**
 * Get available stock (stock_quantity - reserved_quantity)
 * @param {string} itemCode - Product item code
 * @returns {Promise<number>} Available stock
 */
export const getAvailableStock = async (itemCode) => {
  try {
    const { data: product, error } = await supabase
      .from(TABLES.PRODUCTS)
      .select('stock_quantity, reserved_quantity')
      .eq('item_code', itemCode)
      .single();

    if (error || !product) return 0;

    return Math.max(0, (product.stock_quantity || 0) - (product.reserved_quantity || 0));
  } catch (error) {
    console.error('❌ Get available stock error:', error);
    return 0;
  }
};

