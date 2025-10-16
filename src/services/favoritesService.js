import { supabase, TABLES } from './supabase';

class FavoritesService {
  // Add product to favorites
  async addFavorite(userId, productId) {
    try {
      if (!userId) {
        return { success: false, requiresAuth: true, error: 'Authentication required' };
      }

      const { data, error } = await supabase
        .from(TABLES.FAVORITES)
        .insert([
          {
            user_id: userId,
            product_id: productId
          }
        ])
        .select()
        .single();

      if (error) {
        // Check if already exists
        if (error.code === '23505') {
          return { success: true, data, message: 'Already in favorites' };
        }
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return { success: false, error: error.message };
    }
  }

  // Remove product from favorites
  async removeFavorite(userId, productId) {
    try {
      if (!userId) {
        return { success: false, requiresAuth: true, error: 'Authentication required' };
      }

      const { error } = await supabase
        .from(TABLES.FAVORITES)
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return { success: false, error: error.message };
    }
  }

  // Toggle favorite (add if not exists, remove if exists)
  async toggleFavorite(userId, productId) {
    try {
      if (!userId) {
        return { success: false, requiresAuth: true, error: 'Authentication required' };
      }

      const isFavorited = await this.isFavorite(userId, productId);

      if (isFavorited) {
        return await this.removeFavorite(userId, productId);
      } else {
        return await this.addFavorite(userId, productId);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if product is favorited
  async isFavorite(userId, productId) {
    try {
      if (!userId) return false;

      const { data, error } = await supabase
        .from(TABLES.FAVORITES)
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return !!data;
    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  }

  // Get user's favorite product IDs
  async getFavoriteIds(userId) {
    try {
      if (!userId) return [];

      const { data, error } = await supabase
        .from(TABLES.FAVORITES)
        .select('product_id')
        .eq('user_id', userId);

      if (error) throw error;

      return data.map(item => item.product_id);
    } catch (error) {
      console.error('Error fetching favorite IDs:', error);
      return [];
    }
  }

  // Get user's favorites with product details
  async getFavoritesWithDetails(userId) {
    try {
      if (!userId) {
        return { success: false, requiresAuth: true, favorites: [] };
      }

      // First get favorite product IDs
      const { data: favorites, error: favError } = await supabase
        .from(TABLES.FAVORITES)
        .select('product_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (favError) throw favError;

      if (!favorites || favorites.length === 0) {
        return { success: true, favorites: [] };
      }

      // Get product details for favorited items
      const productIds = favorites.map(fav => fav.product_id);
      const { data: products, error: prodError } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*')
        .in('item_code', productIds);

      if (prodError) throw prodError;

      // Combine favorites with product details
      const favoritesWithDetails = favorites.map(fav => {
        const product = products.find(p => p.item_code === fav.product_id);
        return {
          ...product,
          favorited_at: fav.created_at
        };
      }).filter(item => item.id); // Filter out any missing products

      return { success: true, favorites: favoritesWithDetails };
    } catch (error) {
      console.error('Error fetching favorites with details:', error);
      return { success: false, error: error.message, favorites: [] };
    }
  }

  // Get favorites count for user
  async getFavoritesCount(userId) {
    try {
      if (!userId) return 0;

      const { count, error } = await supabase
        .from(TABLES.FAVORITES)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Error getting favorites count:', error);
      return 0;
    }
  }

  // Clear all favorites for user
  async clearFavorites(userId) {
    try {
      if (!userId) {
        return { success: false, requiresAuth: true, error: 'Authentication required' };
      }

      const { error } = await supabase
        .from(TABLES.FAVORITES)
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error clearing favorites:', error);
      return { success: false, error: error.message };
    }
  }
}

export const favoritesService = new FavoritesService();
export default favoritesService;



