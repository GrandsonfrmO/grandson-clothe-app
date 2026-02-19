-- Create categories_images table
CREATE TABLE IF NOT EXISTS categories_images (
  id SERIAL PRIMARY KEY,
  category_name TEXT NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  color_gradient TEXT DEFAULT 'from-gray-500/20 to-slate-500/20',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_categories_images_active ON categories_images(is_active);
CREATE INDEX idx_categories_images_order ON categories_images(display_order);

-- Insert default categories
INSERT INTO categories_images (category_name, image_url, color_gradient, display_order, is_active) VALUES
  ('Hoodies', '/images/category-hoodies.jpg', 'from-orange-500/20 to-red-500/20', 1, true),
  ('T-Shirts', '/images/category-tshirts.jpg', 'from-blue-500/20 to-cyan-500/20', 2, true),
  ('Pantalons', '/images/category-pants.jpg', 'from-green-500/20 to-emerald-500/20', 3, true),
  ('Accessoires', '/images/category-accessories.jpg', 'from-purple-500/20 to-pink-500/20', 4, true),
  ('Homme', '/images/category-men.jpg', 'from-gray-500/20 to-slate-500/20', 5, true),
  ('Femme', '/images/category-women.jpg', 'from-rose-500/20 to-pink-500/20', 6, true)
ON CONFLICT (category_name) DO NOTHING;
