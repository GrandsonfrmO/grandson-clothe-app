-- Add guest columns to orders table
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS is_guest boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS guest_email text,
  ADD COLUMN IF NOT EXISTS guest_phone text;

-- Make user_id nullable for guest orders
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
