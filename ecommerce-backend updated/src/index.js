// Main exports for the ecommerce backend package
export { createSupabaseClient, createDefaultSupabaseClient } from './config/supabase.js'
export { AuthService } from './services/auth.service.js'
export { ProductsService } from './services/products.service.js'
export { PaymentService } from './services/payment.service.js'
export { CartService } from './services/cart.service.js'
export { FavoritesService } from './services/favorites.service.js'
export { OrdersService } from './services/orders.service.js'
export { AppProvider, useApp } from './context/AppContext.jsx'

/**
 * Create a complete ecommerce backend instance with all services
 * @param {Object} config - Configuration object
 * @param {string} config.supabaseUrl - Supabase project URL
 * @param {string} config.supabaseAnonKey - Supabase anonymous key
 * @param {string} config.tablePrefix - Table prefix for multi-site support (e.g., 'gab_', 'urban_')
 * @param {string} config.cacProxyUrl - CAC Bank proxy URL
 * @param {boolean} config.paymentTestMode - Enable test mode for payments
 * @param {Object} config.paymentCredentials - CAC Bank credentials
 * @param {Object} config.paymentApiKeys - CAC Bank API keys
 * @param {number} config.companyServicesId - CAC Bank company services ID
 * @param {string} config.currency - Currency code (default: 'DJF')
 * @returns {Object} Complete backend instance with all services
 */
export function createEcommerceBackend(config) {
  // Validate required configuration
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error('Missing required Supabase configuration: supabaseUrl and supabaseAnonKey are required')
  }

  // Create Supabase client with table prefix support
  const { client: supabaseClient, tables } = createSupabaseClient({
    url: config.supabaseUrl,
    anonKey: config.supabaseAnonKey,
    tablePrefix: config.tablePrefix || ''
  })

  // Create all services
  const auth = new AuthService(supabaseClient)
  const products = new ProductsService(supabaseClient, config.tablePrefix || '')
  const favorites = new FavoritesService(supabaseClient, config.tablePrefix || '')
  const orders = new OrdersService(supabaseClient, config.tablePrefix || '')
  const cart = new CartService(supabaseClient, config.tablePrefix || '')
  
  // Create payment service with configuration
  const payment = new PaymentService({
    proxyUrl: config.cacProxyUrl || 'http://157.230.110.104/api/cacint',
    testMode: config.paymentTestMode || false,
    credentials: config.paymentCredentials,
    apiKeys: config.paymentApiKeys,
    companyServicesId: config.companyServicesId,
    currency: config.currency || 'DJF'
  })

  // Return complete backend instance
  return {
    // Supabase client and table helpers
    supabase: supabaseClient,
    tables,
    
    // Services
    auth,
    products,
    payment,
    cart,
    favorites,
    orders,
    
    // Configuration
    config: {
      tablePrefix: config.tablePrefix || '',
      supabaseUrl: config.supabaseUrl,
      paymentTestMode: config.paymentTestMode || false,
      currency: config.currency || 'DJF'
    },
    
    // Utility methods
    utils: {
      // Get table name with prefix
      getTableName: (tableName) => `${config.tablePrefix || ''}${tableName}`,
      
      // Check if table prefix is set
      hasTablePrefix: () => !!(config.tablePrefix),
      
      // Get current configuration
      getConfig: () => config,
      
      // Update configuration
      updateConfig: (newConfig) => {
        Object.assign(config, newConfig)
      }
    }
  }
}

/**
 * Create a minimal backend instance with just Supabase client
 * @param {Object} config - Configuration object
 * @returns {Object} Minimal backend instance
 */
export function createMinimalBackend(config) {
  const { client: supabaseClient, tables } = createSupabaseClient({
    url: config.supabaseUrl,
    anonKey: config.supabaseAnonKey,
    tablePrefix: config.tablePrefix || ''
  })

  return {
    supabase: supabaseClient,
    tables,
    config: {
      tablePrefix: config.tablePrefix || '',
      supabaseUrl: config.supabaseUrl
    }
  }
}

/**
 * Default configuration for GAB Fashion House
 */
export const GAB_CONFIG = {
  tablePrefix: 'gab_',
  currency: 'DJF',
  paymentTestMode: false,
  cacProxyUrl: 'http://157.230.110.104/api/cacint'
}

/**
 * Default configuration for Urban Jungle
 */
export const URBAN_CONFIG = {
  tablePrefix: 'urban_',
  currency: 'DJF',
  paymentTestMode: false,
  cacProxyUrl: 'http://157.230.110.104/api/cacint'
}

// Default export
export default {
  createEcommerceBackend,
  createMinimalBackend,
  createSupabaseClient,
  AuthService,
  ProductsService,
  PaymentService,
  CartService,
  FavoritesService,
  OrdersService,
  AppProvider,
  useApp,
  GAB_CONFIG,
  URBAN_CONFIG
}

