// Backend configuration for Urban Jungle project

import { createEcommerceBackend, URBAN_CONFIG } from '@gabfashion/ecommerce-backend'

// Create backend instance for Urban Jungle
export const backend = createEcommerceBackend({
  ...URBAN_CONFIG,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  tablePrefix: 'urban_',
  cacProxyUrl: import.meta.env.VITE_CAC_API_URL || 'http://157.230.110.104/api/cacint',
  paymentTestMode: import.meta.env.VITE_PAYMENT_TEST_MODE === 'true',
  currency: 'DJF',
  paymentCredentials: {
    username: 'CACPAY_URBAN', // You may want to use different credentials for Urban Jungle
    password: 'VPAP#$X3xZTO9HRcKjY9FjcGF9UGFzJA==' // Or same credentials
  },
  paymentApiKeys: {
    app_key: "TWVyYXNAY5FjcGF7",
    api_key: "TWGHBo$_CACpos"
  },
  companyServicesId: 20
})

// Export individual services for convenience
export const { auth, products, payment, cart, favorites, orders, supabase } = backend

// Export configuration
export const backendConfig = backend.config

export default backend
