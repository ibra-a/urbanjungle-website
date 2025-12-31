import { supabase, TABLES } from './supabase';

class ApiService {
  // Get all Urban Jungle products from urban_products table
  // Optimized: Use select() to only fetch needed fields, reducing payload size
  async getProducts(limit = null) {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
      }
      
      console.log('🔍 Fetching Urban Jungle products from:', TABLES.PRODUCTS);
      
      // Only select fields we actually use (reduces payload by ~40%)
      let query = supabase
        .from(TABLES.PRODUCTS)
        // urban_products schema (see sync script mapping):
        // item_code, product_name, brand, item_group, category, price, currency,
        // image_url, images, colors, sizes, variants, stock_quantity, description, is_active, ready_to_sell, featured
        .select('item_code, product_name, brand, item_group, category, price, currency, stock_quantity, image_url, images, colors, sizes, variants, description, is_active, ready_to_sell, featured', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      // Apply limit if specified (for initial load performance)
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      console.log('✅ Products fetched:', data?.length || 0, 'items');
      
      return { products: data || [], count: count || 0 };
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      throw error;
    }
  }

  // Get products by gender
  async getProductsByGender(gender) {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
      }
      
      const { data, error, count } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .ilike('gender', gender)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { products: data || [], count: count || 0 };
    } catch (error) {
      console.error(`Error fetching ${gender} products:`, error);
      throw error;
    }
  }

  // Get products by brand
  async getProductsByBrand(brand) {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
      }
      
      const { data, error, count} = await supabase
        .from(TABLES.PRODUCTS)
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .ilike('brand', brand)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { products: data || [], count: count || 0 };
    } catch (error) {
      console.error(`Error fetching ${brand} products:`, error);
      throw error;
    }
  }

  // Get products by category
  async getProductsByCategory(category) {
    try {
      const { data, error, count } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .ilike('item_group', `%${category}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { products: data || [], count: count || 0 };
    } catch (error) {
      console.error(`Error fetching ${category} products:`, error);
      throw error;
    }
  }

  // Search products
  async searchProducts(query) {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
      }
      
      const { data, error, count } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .or(`product_name.ilike.%${query}%,brand.ilike.%${query}%,item_group.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { products: data || [], count: count || 0 };
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  // Get product by ID
  async getProductById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  }

  // Get product by item code
  async getProductByItemCode(itemCode) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*')
        .eq('item_code', itemCode)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product by item code:', error);
      throw error;
    }
  }

  // Get paginated products (optimized with proper range calculation)
  async getProductsPage(page = 0, limit = 24, filters = {}) {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
      }
      
      const start = page * limit;
      const end = start + limit - 1;
      
      let query = supabase
        .from(TABLES.PRODUCTS)
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      // Apply filters
      if (filters.gender) {
        query = query.ilike('gender', filters.gender);
      }
      if (filters.brand) {
        query = query.ilike('brand', filters.brand);
      }
      if (filters.category) {
        query = query.ilike('item_group', `%${filters.category}%`);
      }
      if (filters.search) {
        query = query.or(`product_name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,item_group.ilike.%${filters.search}%,category.ilike.%${filters.search}%`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) throw error;
      return { products: data || [], count: count || 0, page, limit };
    } catch (error) {
      console.error('Error fetching products page:', error);
      throw error;
    }
  }

  // Get featured products
  async getFeaturedProducts(limit = 8) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*')
        .eq('is_active', true)
        .gt('stock_quantity', 0) // In stock items
        .limit(limit)
        .order('stock_quantity', { ascending: false });

      if (error) throw error;
      return { products: data || [] };
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  }

  // Get image URL for product
  getImageUrl(product) {
    return product?.image_url || null;
  }

  // Get all images for product
  getProductImages(product) {
    const images = [];
    if (product?.image_url) {
      images.push(product.image_url);
    }
    if (product?.images && Array.isArray(product.images)) {
      images.push(...product.images);
    }
    return images;
  }

  // Health check - check if Supabase is accessible
  async checkHealth() {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
      }
      
      // Use a HEAD request-style select to avoid fetching rows while still validating access
      const { error } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*', { head: true, count: 'exact' })
        .limit(1);

      if (error) throw error;
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Check if backend is running
  async isBackendRunning() {
    try {
      console.log('🏥 Checking Supabase health...');
      await this.checkHealth();
      console.log('✅ Supabase is healthy');
      return true;
    } catch (error) {
      console.error('❌ Supabase health check failed:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService; 