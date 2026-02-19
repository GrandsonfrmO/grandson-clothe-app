-- Allow guest orders by making user_id nullable
-- This allows users to place orders without creating an account

ALTER TABLE orders 
ALTER COLUMN user_id DROP NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN orders.user_id IS 'User ID (NULL for guest orders)';

-- Add index for guest orders
CREATE INDEX IF NOT EXISTS idx_orders_is_guest ON orders(is_guest) WHERE is_guest = true;

-- Add index for guest email lookups
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON orders(guest_email) WHERE guest_email IS NOT NULL;
