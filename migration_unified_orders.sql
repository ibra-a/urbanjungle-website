-- ============================================
-- Migration: Unified Orders Table
-- Purpose: Migrate urban_orders to orders table for professional architecture
-- Date: January 2025
-- ============================================

-- STEP 1: Add missing columns to urban_orders (to match orders structure)
-- This ensures data compatibility before migration

ALTER TABLE urban_orders
ADD COLUMN IF NOT EXISTS delivery_status VARCHAR DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS synced_to_erp BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS erp_synced BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS erp_order_id VARCHAR,
ADD COLUMN IF NOT EXISTS erp_synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES drivers(id),
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS out_for_delivery_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ready_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivery_note_id VARCHAR,
ADD COLUMN IF NOT EXISTS shipping_city VARCHAR,
ADD COLUMN IF NOT EXISTS shipping_country VARCHAR DEFAULT 'Djibouti',
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS sales_invoice_id VARCHAR,
ADD COLUMN IF NOT EXISTS collection_photo_url TEXT,
ADD COLUMN IF NOT EXISTS collection_photo_taken_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivery_photo_url TEXT,
ADD COLUMN IF NOT EXISTS delivery_photo_taken_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS collected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS assigned_by_admin_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_payment_intent VARCHAR;

-- STEP 2: Add missing columns to orders (to support Urban Jungle features)
-- Add order_number and ensure user_id exists

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS order_number VARCHAR UNIQUE,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- STEP 3: Migrate urban_orders data to orders table
-- Only migrate orders that don't already exist (by ID)

INSERT INTO orders (
  id,
  customer_id,
  user_id,
  order_number,
  customer_name,
  customer_email,
  customer_phone,
  items,
  total_amount,
  currency,
  shipping_address,
  payment_method,
  payment_status,
  status,
  delivery_status,
  transaction_id,
  cac_payment_request_id,
  synced_to_erp,
  erp_synced,
  erp_order_id,
  erp_synced_at,
  synced_at,
  store_name,
  created_at,
  updated_at,
  paid_at
)
SELECT 
  id,
  customer_id,
  user_id,
  order_number,
  customer_name,
  customer_email,
  customer_phone,
  items,
  total_amount,
  currency,
  shipping_address,
  payment_method,
  payment_status,
  status,
  COALESCE(delivery_status, 'pending') as delivery_status,
  transaction_id,
  cac_payment_request_id,
  COALESCE(synced_to_erp, false) as synced_to_erp,
  COALESCE(erp_synced, false) as erp_synced,
  erp_order_id,
  erp_synced_at,
  synced_at,
  COALESCE(store_name, 'Urban Jungle') as store_name,
  created_at,
  updated_at,
  paid_at
FROM urban_orders
ON CONFLICT (id) DO NOTHING; -- Skip if order already exists

-- STEP 4: Verify migration
-- Check counts and store distribution

SELECT 
  store_name,
  COUNT(*) as order_count,
  COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_orders,
  COUNT(CASE WHEN synced_to_erp = true THEN 1 END) as synced_orders
FROM orders
GROUP BY store_name
ORDER BY store_name;

-- STEP 5: Update any NULL store_name values (safety check)
UPDATE orders
SET store_name = 'Tommy CK'
WHERE store_name IS NULL 
  AND id IN (SELECT id FROM orders WHERE store_name IS NULL LIMIT 100);

-- Verify no NULL store_name
SELECT COUNT(*) as null_store_count
FROM orders
WHERE store_name IS NULL;






