-- Migration complète de toutes les nouvelles tables créées
-- Date: 2026-02-07
-- Description: Consolidation de toutes les nouvelles fonctionnalités

-- ============================================
-- 1. TABLE GALLERY (Photos clients)
-- ============================================
CREATE TABLE IF NOT EXISTS gallery (
  id BIGSERIAL PRIMARY KEY,
  image TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_display_order ON gallery(display_order);

ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public read access to gallery"
  ON gallery FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow authenticated users to insert gallery"
  ON gallery FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow authenticated users to update gallery"
  ON gallery FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete gallery"
  ON gallery FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- 2. TABLE VIDEOS (Vidéos homepage)
-- ============================================
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

CREATE INDEX IF NOT EXISTS idx_videos_active ON videos(is_active);
CREATE INDEX IF NOT EXISTS idx_videos_order ON videos(order_index);

-- ============================================
-- 3. TABLE HOMEPAGE_CONTENT (Contenu dynamique)
-- ============================================
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

CREATE INDEX IF NOT EXISTS idx_homepage_content_key ON homepage_content(section_key);

-- Insérer les sections par défaut
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

-- ============================================
-- 4. TABLE MODELS (Mannequins)
-- ============================================
CREATE TABLE IF NOT EXISTS models (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  bio TEXT,
  instagram_handle VARCHAR(255),
  whatsapp_number VARCHAR(50),
  email VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_models_is_active ON models(is_active);
CREATE INDEX IF NOT EXISTS idx_models_display_order ON models(display_order);

ALTER TABLE models ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public read access to models" 
  ON models FOR SELECT USING (is_active = true);

CREATE POLICY IF NOT EXISTS "Allow admin full access to models" 
  ON models FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 5. TABLE SPECIAL_OFFERS (Offres spéciales)
-- ============================================
CREATE TABLE IF NOT EXISTS special_offers (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  discount_text VARCHAR(255),
  cta_text VARCHAR(255) NOT NULL,
  cta_link VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_special_offers_is_active ON special_offers(is_active);

ALTER TABLE special_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public read access to special_offers" 
  ON special_offers FOR SELECT USING (is_active = true);

CREATE POLICY IF NOT EXISTS "Allow admin full access to special_offers" 
  ON special_offers FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 6. TABLE INVENTORY_HISTORY (Historique stock)
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_history (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity_change INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_id TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_history_product_id ON inventory_history(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_history_created_at ON inventory_history(created_at);

-- Ajouter colonnes de gestion de stock aux produits
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_status TEXT DEFAULT 'in_stock';

-- ============================================
-- 7. TABLE APP_ICONS (Icônes d'application)
-- ============================================
CREATE TABLE IF NOT EXISTS app_icons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  favicon_url TEXT NOT NULL,
  icon_192_url TEXT NOT NULL,
  icon_512_url TEXT NOT NULL,
  apple_touch_icon_url TEXT NOT NULL,
  maskable_icon_url TEXT,
  theme_color VARCHAR(7) DEFAULT '#000000',
  background_color VARCHAR(7) DEFAULT '#ffffff',
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_theme_color CHECK (theme_color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_background_color CHECK (background_color ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE TABLE IF NOT EXISTS app_icons_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  icon_id UUID REFERENCES app_icons(id) ON DELETE CASCADE,
  previous_icon_id UUID REFERENCES app_icons(id) ON DELETE SET NULL,
  changed_by VARCHAR(255) NOT NULL,
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_icons_active ON app_icons(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_app_icons_created_at ON app_icons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_icons_history_created_at ON app_icons_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_icons_history_icon_id ON app_icons_history(icon_id);

-- Fonction pour activer une icône
CREATE OR REPLACE FUNCTION activate_app_icon(
  icon_id UUID,
  changed_by_email VARCHAR(255) DEFAULT 'system'
)
RETURNS VOID AS $$
DECLARE
  previous_active_id UUID;
BEGIN
  SELECT id INTO previous_active_id 
  FROM app_icons 
  WHERE is_active = true 
  LIMIT 1;
  
  UPDATE app_icons SET is_active = false WHERE is_active = true;
  UPDATE app_icons SET is_active = true, updated_at = NOW() WHERE id = icon_id;
  
  INSERT INTO app_icons_history (icon_id, previous_icon_id, changed_by, change_reason) 
  VALUES (icon_id, previous_active_id, changed_by_email, 'Activation via interface admin');
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir l'icône active
CREATE OR REPLACE FUNCTION get_active_app_icon()
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  description TEXT,
  favicon_url TEXT,
  icon_192_url TEXT,
  icon_512_url TEXT,
  apple_touch_icon_url TEXT,
  maskable_icon_url TEXT,
  theme_color VARCHAR(7),
  background_color VARCHAR(7),
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT ai.* FROM app_icons ai WHERE ai.is_active = true LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_app_icons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_app_icons_updated_at
  BEFORE UPDATE ON app_icons
  FOR EACH ROW
  EXECUTE FUNCTION update_app_icons_updated_at();

ALTER TABLE app_icons ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_icons_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public read of active icons" 
  ON app_icons FOR SELECT USING (is_active = true);

CREATE POLICY IF NOT EXISTS "Allow all operations for authenticated users on icons" 
  ON app_icons FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow all operations for authenticated users on history" 
  ON app_icons_history FOR ALL USING (auth.role() = 'authenticated');

-- Insérer icône par défaut
INSERT INTO app_icons (
  name, description, favicon_url, icon_192_url, icon_512_url, 
  apple_touch_icon_url, theme_color, background_color, is_active
) VALUES (
  'Logo par défaut',
  'Set d''icônes par défaut pour GRANDSON CLOTHES',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-icon.png',
  '#000000',
  '#ffffff',
  true
) ON CONFLICT DO NOTHING;

-- ============================================
-- 8. TABLE USER_SETTINGS (Paramètres utilisateur)
-- ============================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  newsletter BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT false,
  privacy_mode BOOLEAN DEFAULT false,
  data_collection BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- ============================================
-- 9. INDEXES DE PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);

-- ============================================
-- 10. DÉSACTIVER RLS POUR DÉVELOPPEMENT
-- ============================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- ============================================
-- COMMENTAIRES
-- ============================================
COMMENT ON TABLE gallery IS 'Photos de clients portant les vêtements';
COMMENT ON TABLE videos IS 'Vidéos pour la section homepage';
COMMENT ON TABLE homepage_content IS 'Contenu dynamique de la page d''accueil';
COMMENT ON TABLE models IS 'Mannequins et ambassadeurs de la marque';
COMMENT ON TABLE special_offers IS 'Offres spéciales et promotions';
COMMENT ON TABLE inventory_history IS 'Historique des mouvements de stock';
COMMENT ON TABLE app_icons IS 'Gestion des icônes d''application (favicon, PWA)';
COMMENT ON TABLE app_icons_history IS 'Historique des changements d''icônes';
COMMENT ON TABLE user_settings IS 'Paramètres et préférences utilisateur';
