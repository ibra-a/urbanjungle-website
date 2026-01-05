-- ============================================
-- Migration: Add Stock Reservation System
-- Purpose: Prevent overselling with stock reservations
-- Date: January 2025
-- ============================================

-- STEP 1: Add reserved_quantity column to urban_products table
ALTER TABLE urban_products
ADD COLUMN IF NOT EXISTS reserved_quantity INTEGER DEFAULT 0;

-- STEP 2: Add index for performance (filtering by available stock)
CREATE INDEX IF NOT EXISTS idx_urban_products_available_stock 
ON urban_products((stock_quantity - COALESCE(reserved_quantity, 0)));

-- STEP 3: Add comment explaining the field
COMMENT ON COLUMN urban_products.reserved_quantity IS 
'Quantity reserved by pending orders. Available stock = stock_quantity - reserved_quantity';

-- STEP 4: Verify migration
SELECT 
  COUNT(*) as total_products,
  SUM(COALESCE(reserved_quantity, 0)) as total_reserved
FROM urban_products;

