import { supabase, TABLES } from './supabase';

class ApiService {
  // Get all Urban Jungle products from urban_products table
  async getProducts() {
    try {
      console.log('🔍 Fetching Urban Jungle products from:', TABLES.PRODUCTS);
      
      const { data, error, count } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('synced_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      console.log('✅ Products fetched:', data?.length || 0, 'items');
      console.log('📦 Sample product:', data?.[0]);
      
      return { products: data || [], count: count || 0 };
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      throw error;
    }
  }

  // Get products by gender
  async getProductsByGender(gender) {
    try {
      const { data, error, count } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .ilike('gender', gender)
        .order('synced_at', { ascending: false });

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
      const { data, error, count} = await supabase
        .from(TABLES.PRODUCTS)
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .ilike('brand', brand)
        .order('synced_at', { ascending: false });

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
      const { data, error, count } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .or(`item_name.ilike.%${query}%,brand.ilike.%${query}%,item_group.ilike.%${query}%,description.ilike.%${query}%`)
        .order('synced_at', { ascending: false });

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

  // Get paginated products
  async getProductsPage(page = 0, limit = 24, filters = {}) {
    try {
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
        query = query.or(`item_name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,item_group.ilike.%${filters.search}%`);
      }

      const { data, error, count } = await query
        .range(page * limit, (page + 1) * limit - 1)
        .order('synced_at', { ascending: false });

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
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select('count')
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