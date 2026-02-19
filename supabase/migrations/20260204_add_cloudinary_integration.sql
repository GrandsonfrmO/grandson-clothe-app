-- Add Cloudinary integration columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS cloudinary_folder TEXT DEFAULT 'grandson-clothes/products';
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_metadata TEXT; -- JSON with Cloudinary metadata

-- Add Cloudinary integration columns to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS cloudinary_url TEXT;

-- Add Cloudinary integration columns to users table (for avatars)
ALTER TABLE users ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cloudinary_url TEXT;

-- Add Cloudinary integration columns to reviews table (for review images)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS cloudinary_public_ids TEXT; -- JSON array

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_cloudinary_folder ON products(cloudinary_folder);
CREATE INDEX IF NOT EXISTS idx_categories_cloudinary_public_id ON categories(cloudinary_public_id);
CREATE INDEX IF NOT EXISTS idx_users_cloudinary_public_id ON users(cloudinary_public_id);
