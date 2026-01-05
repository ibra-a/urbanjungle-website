import { supabase, TABLES } from './supabase';
import toast from 'react-hot-toast';

/**
 * Reserve stock for order items
 * @param {Array} items - Order items with item_code and quantity
 * @returns {Promise<Object>} Reservation result
 */
export const reserveStock = async (items) => {
  try {
    const reservations = [];
    
    for (const item of items) {
      const itemCode = item.item_code || item.id;
      const quantity = item.quantity || 1;
      
      if (!itemCode) {
        console.warn('⚠️ Skipping item without item_code:', item);
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
        continue;
      }

      const availableStock = (product.stock_quantity || 0) - (product.reserved_quantity || 0);
      
      if (availableStock < quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${item.name || itemCode}. Available: ${availableStock}, Requested: ${quantity}`
        };
      }

      // Reserve stock
      const { error: reserveError } = await supabase.rpc('increment_reserved_quantity', {
        p_item_code: itemCode,
        p_quantity: quantity
      });

      // Fallback: If RPC doesn't exist, use direct update
      if (reserveError && reserveError.code === '42883') {
        const { error: updateError } = await supabase
          .from(TABLES.PRODUCTS)
          .update({ 
            reserved_quantity: (product.reserved_quantity || 0) + quantity 
          })
          .eq('item_code', itemCode);

        if (updateError) {
          console.error(`❌ Failed to reserve stock for ${itemCode}:`, updateError);
          return {
            success: false,
            error: `Failed to reserve stock for ${item.name || itemCode}`
          };
        }
      } else if (reserveError) {
        console.error(`❌ Failed to reserve stock for ${itemCode}:`, reserveError);
        return {
          success: false,
          error: `Failed to reserve stock for ${item.name || itemCode}`
        };
      }

      reservations.push({ itemCode, quantity });
    }

    return {
      success: true,
      reservations
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

      // Release stock using RPC or direct update
      const { error: releaseError } = await supabase.rpc('decrement_reserved_quantity', {
        p_item_code: itemCode,
        p_quantity: quantity
      });

      // Fallback: If RPC doesn't exist, use direct update
      if (releaseError && releaseError.code === '42883') {
        const { data: product } = await supabase
          .from(TABLES.PRODUCTS)
          .select('reserved_quantity')
          .eq('item_code', itemCode)
          .single();

        if (product) {
          const newReserved = Math.max(0, (product.reserved_quantity || 0) - quantity);
          await supabase
            .from(TABLES.PRODUCTS)
            .update({ reserved_quantity: newReserved })
            .eq('item_code', itemCode);
        }
      } else if (releaseError) {
        console.error(`⚠️ Failed to release stock for ${itemCode}:`, releaseError);
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

