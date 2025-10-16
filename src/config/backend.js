import { supabase } from '../services/supabase';
import { apiService } from '../services/api';
import { favoritesService } from '../services/favoritesService';
import { ordersService } from '../services/ordersService';

// Urban Jungle backend configuration
const backend = {
  // Supabase client
  supabase,
  
  // Services
  products: apiService,
  favorites: favoritesService,
  orders: ordersService,
  
  // Auth methods (using Supabase auth directly)
  auth: {
    signUp: async (email, password, userData = {}) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      return { data, error };
    },
    
    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { data, error };
    },
    
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      return { error };
    },
    
    getCurrentUser: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    },
    
    resetPassword: async (email) => {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      return { data, error };
    },
    
    updatePassword: async (newPassword) => {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      return { data, error };
    }
  },
  
  // Payment configuration
  payment: {
    currency: 'DJF',
    testMode: import.meta.env.VITE_PAYMENT_TEST_MODE === 'true',
    cacProxyUrl: import.meta.env.VITE_CAC_PROXY_URL || 'http://157.230.110.104/api/cacint',
    credentials: {
      username: import.meta.env.VITE_CAC_USERNAME,
      password: import.meta.env.VITE_CAC_PASSWORD,
      apiKey: import.meta.env.VITE_CAC_API_KEY,
      secretKey: import.meta.env.VITE_CAC_SECRET_KEY,
      companyServicesId: import.meta.env.VITE_CAC_COMPANY_SERVICES_ID
    }
  }
};

export { backend };
export default backend;

