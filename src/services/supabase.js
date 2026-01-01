import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// CRITICAL: Don't create client if env vars are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Missing Supabase environment variables!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl || '❌ MISSING');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set (length: ' + supabaseAnonKey.length + ')' : '❌ MISSING');
  console.error('💡 Create a .env file in the project root with:');
  console.error('   VITE_SUPABASE_URL=your-url');
  console.error('   VITE_SUPABASE_ANON_KEY=your-key');
  console.error('💡 Then restart the dev server: npm run dev');
}

// Only create client if we have valid credentials (like Tommy CK - simple and clean)
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with error handling for token refresh (like Tommy CK)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }
});

// Listen for auth errors and handle token refresh failures gracefully (like Tommy CK)
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    // Handle token refresh errors silently (they're expected when session expires)
    if (event === 'TOKEN_REFRESHED') {
      // Token refreshed successfully
    } else if (event === 'SIGNED_OUT' && !session) {
      // User signed out or session expired - this is normal
    }
  });
}

// Urban Jungle table names
export const TABLES = {
  PRODUCTS: 'urban_products', // ✅ Use urban_products table (faster - only Urban Jungle items, no filtering needed)
  ORDERS: 'orders', // ✅ Use unified orders table with store_name filter
  FAVORITES: 'urban_user_favorites',
  CART: 'urban_user_cart'
};

// Expose supabase and TABLES globally for debugging (only in development)
if (import.meta.env.DEV && supabase) {
  window.supabase = supabase;
  window.TABLES = TABLES;
  console.log('🔧 Supabase exposed globally as window.supabase for debugging');
}

// Optimized Products helper functions with pagination
export const products = {
  // Get paginated products (optimized with range and count)
  // Filters for Urban Jungle: warehouse = 'UJ - GFH' only
  getPage: async (page = 0, limit = 24, filters = {}) => {
    const start = page * limit;
    const end = start + limit - 1;
    
    let query = supabase
      .from(TABLES.PRODUCTS) // Now using 'urban_products' table
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
      query = query.or(`product_name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,category.ilike.%${filters.search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false }) // Use created_at instead of synced_at
      .range(start, end);

    return { data, error, count };
  },

  // Get all products - SIMPLIFIED (like Tommy CK)
  getAll: async (includeNotReady = false) => {
    // Check if Supabase client is initialized
    if (!supabase) {
      const error = new Error('Supabase client not initialized - check environment variables');
      return { data: null, error };
    }
    
    try {
      let query = supabase
        .from(TABLES.PRODUCTS)
        .select('*')
        .eq('is_active', true);
      
      // For category pages, we want to show all products with stock, even if missing images
      if (!includeNotReady) {
        // Production: Only show items that are ready to sell (have images, price, etc.)
        query = query.eq('ready_to_sell', true);
      } else {
        // Show products with stock, even if missing images (for category browsing)
        query = query.gt('stock_quantity', 0);
      }
      
      const { data, error } = await query
        .order('stock_quantity', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(500);
      
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // Search products (optimized)
  // Uses urban_products table (only Urban Jungle products)
  search: async (query) => {
    const { data, error } = await supabase
      .from(TABLES.PRODUCTS) // Now using 'urban_products' table
      .select('*')
      .eq('is_active', true)
      .or(`product_name.ilike.%${query}%,description.ilike.%${query}%,item_code.ilike.%${query}%`)
      .order('created_at', { ascending: false }) // Use created_at instead of synced_at
      .limit(100);
    
    return { data, error };
  }
};

// Orders helper functions - Using unified orders table
export const orders = {
  // Create new order (for Urban Jungle)
  create: async (orderData) => {
    // Ensure store_name is set for Urban Jungle
    const orderWithStore = {
      ...orderData,
      store_name: orderData.store_name || 'Urban Jungle'
    };
    const { data, error } = await supabase
      .from('orders')
      .insert([orderWithStore])
      .select()
    return { data, error }
  },

  // Get user orders (filter by store_name for Urban Jungle)
  getUserOrders: async (userId, storeName = 'Urban Jungle') => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`customer_id.eq.${userId},user_id.eq.${userId}`)
      .eq('store_name', storeName)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Get orders by email (for guest checkout, filter by store)
  getOrdersByEmail: async (email, storeName = 'Urban Jungle') => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_email', email)
      .eq('store_name', storeName)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Get single order by ID (filter by store to ensure correct order)
  getById: async (orderId, storeName = 'Urban Jungle') => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('store_name', storeName)
      .single()
    return { data, error }
  },

  // Update order status
  updateStatus: async (orderId, status, storeName = 'Urban Jungle') => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .eq('store_name', storeName) // Ensure we're updating the right store's order
      .select()
    return { data, error }
  }
};

// Auth helper functions (for OAuth callbacks)
export const auth = {
  // Sign in with OAuth (Google)
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    return { data, error };
  },

  // Sign in with OAuth (Facebook)
  signInWithFacebook: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    return { data, error };
  },

  // Get current session
  getCurrentSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  }
};

export default supabase;
