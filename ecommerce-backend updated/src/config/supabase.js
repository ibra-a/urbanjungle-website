import { createClient } from '@supabase/supabase-js'

/**
 * Create a configurable Supabase client with table prefix support
 * @param {Object} config - Configuration object
 * @param {string} config.url - Supabase project URL
 * @param {string} config.anonKey - Supabase anonymous key
 * @param {string} config.tablePrefix - Table prefix for multi-site support (e.g., 'gab_', 'urban_')
 * @returns {Object} Supabase client with table helpers
 */
export const createSupabaseClient = (config) => {
  const { url, anonKey, tablePrefix = '' } = config
  
  if (!url || !anonKey) {
    throw new Error('Missing Supabase configuration: url and anonKey are required')
  }

  const client = createClient(url, anonKey)

  // Return client with table helpers
  return {
    client,
    tables: {
      products: `${tablePrefix}brand_products`,
      orders: `${tablePrefix}orders`,
      favorites: `${tablePrefix}user_favorites`,
      orderItems: `${tablePrefix}order_items`,
      // Add more tables as needed
    },
    // Helper method to get table name with prefix
    getTableName: (tableName) => `${tablePrefix}${tableName}`,
    // Helper method to check if table prefix is set
    hasTablePrefix: () => !!tablePrefix
  }
}

/**
 * Default Supabase configuration factory
 * @param {Object} config - Configuration object
 * @returns {Object} Configured Supabase client
 */
export const createDefaultSupabaseClient = (config) => {
  return createSupabaseClient({
    url: config.supabaseUrl,
    anonKey: config.supabaseAnonKey,
    tablePrefix: config.tablePrefix || ''
  })
}

