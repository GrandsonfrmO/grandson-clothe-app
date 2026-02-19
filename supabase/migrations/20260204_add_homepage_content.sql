-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  duration TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create homepage_content table
CREATE TABLE IF NOT EXISTS homepage_content (
  id SERIAL PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  cta_text TEXT,
  cta_link TEXT,
  content_data JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_videos_active ON videos(is_active);
CREATE INDEX idx_videos_order ON videos(order_index);
CREATE INDEX idx_homepage_content_key ON homepage_content(section_key);

-- Insert default homepage content sections
INSERT INTO homepage_content (section_key, title, subtitle, description, is_active) VALUES
  ('hero_banner', 'Hero Banner', 'Main banner on homepage', 'Main banner section', true),
  ('new_drop', 'NEW DROP', 'Collection 2026', 'New collection banner', true),
  ('street_vibes', 'STREET VIBES', 'Made in Guinea', 'Street vibes collection', true),
  ('quick_categories', 'Quick Categories', 'Quick category shortcuts', 'Quick category section', true),
  ('featured_products', 'Featured Products', 'Featured products section', 'Featured products', true),
  ('promo_card', 'Promo Card', 'Promotional card', 'Special offer card', true),
  ('trending_section', 'Trending Section', 'Trending products', 'Trending products', true),
  ('videos_section', 'Videos Section', 'Videos showcase', 'Videos section', true)
ON CONFLICT (section_key) DO NOTHING;
