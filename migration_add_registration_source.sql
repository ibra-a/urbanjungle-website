-- ============================================
-- Migration: Add registration_source to profiles
-- Purpose: Track which store/platform a user registered from
-- Date: January 2025
-- ============================================

-- Add registration_source column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS registration_source VARCHAR(50);

-- Add comment for documentation
COMMENT ON COLUMN profiles.registration_source IS 
  'Store/platform where user registered: "Tommy CK", "Urban Jungle", or NULL for existing users';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_registration_source 
ON profiles(registration_source);

-- Optional: Update existing users based on their first order (if they have orders)
-- This is a best-effort approach - users without orders will remain NULL
UPDATE profiles p
SET registration_source = (
  SELECT o.store_name
  FROM orders o
  WHERE (o.customer_id = p.id OR o.user_id = p.id)
  ORDER BY o.created_at ASC
  LIMIT 1
)
WHERE p.registration_source IS NULL
AND EXISTS (
  SELECT 1
  FROM orders o
  WHERE (o.customer_id = p.id OR o.user_id = p.id)
);

