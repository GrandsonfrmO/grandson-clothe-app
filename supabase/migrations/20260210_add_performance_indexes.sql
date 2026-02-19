-- Performance optimization: Add indexes for frequently queried columns
-- Only creates indexes on columns that actually exist in the tables

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING GIN(to_tsvector('french', name));

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status) WHERE payment_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE role IS NOT NULL;

-- Categories table indexes
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug) WHERE slug IS NOT NULL;

-- Models table indexes
CREATE INDEX IF NOT EXISTS idx_models_is_active ON models(is_active);

-- Gallery table indexes
CREATE INDEX IF NOT EXISTS idx_gallery_is_active ON gallery(is_active) WHERE is_active IS NOT NULL;

-- Special offers table indexes
CREATE INDEX IF NOT EXISTS idx_special_offers_is_active ON special_offers(is_active);

-- Videos table indexes
CREATE INDEX IF NOT EXISTS idx_videos_is_active ON videos(is_active);

-- Favorites table indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);

-- Reviews table indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_active_category ON products(is_active, category_id) WHERE category_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_active_new ON products(is_active, is_new);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_order_items_order_product ON order_items(order_id, product_id);
