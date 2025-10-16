import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Urban Jungle table names
export const TABLES = {
  PRODUCTS: 'urban_products', // Urban Jungle specific products table (optimized for shop)
  ORDERS: 'urban_orders',
  FAVORITES: 'urban_user_favorites',
  CART: 'urban_user_cart'
};

export default supabase;


