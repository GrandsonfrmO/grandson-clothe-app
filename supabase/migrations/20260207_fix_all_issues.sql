-- ═══════════════════════════════════════════════════════════
-- CORRECTION COMPLÈTE DE TOUS LES PROBLÈMES DU SITE
-- Date: 2026-02-07
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- PARTIE 1: CORRECTION DES POLICIES RLS
-- ═══════════════════════════════════════════════════════════

-- Table: users
DROP POLICY IF EXISTS "users_policy" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authentication" ON users;

CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id OR auth.role() = 'service_role');

-- Table: products
DROP POLICY IF EXISTS "products_policy" ON products;
DROP POLICY IF EXISTS "Enable read access for all users" ON products;

CREATE POLICY "products_select_all" ON products
  FOR SELECT USING (true);

CREATE POLICY "products_insert_admin" ON products
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "products_update_admin" ON products
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "products_delete_admin" ON products
  FOR DELETE USING (auth.role() = 'service_role');

-- Table: categories
DROP POLICY IF EXISTS "categories_policy" ON categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;

CREATE POLICY "categories_select_all" ON categories
  FOR SELECT USING (true);

CREATE POLICY "categories_insert_admin" ON categories
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "categories_update_admin" ON categories
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "categories_delete_admin" ON categories
  FOR DELETE USING (auth.role() = 'service_role');

-- Table: orders
DROP POLICY IF EXISTS "orders_policy" ON orders;
DROP POLICY IF EXISTS "Enable read access for own orders" ON orders;

CREATE POLICY "orders_select_own" ON orders
  FOR SELECT USING (
    user_id = auth.uid() OR 
    auth.role() = 'service_role' OR
    user_id IS NULL
  );

CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR 
    auth.role() = 'service_role' OR
    user_id IS NULL
  );

CREATE POLICY "orders_update_own" ON orders
  FOR UPDATE USING (
    user_id = auth.uid() OR 
    auth.role() = 'service_role'
  );

-- Table: reviews
DROP POLICY IF EXISTS "reviews_policy" ON reviews;
DROP POLICY IF EXISTS "Enable read access for all users" ON reviews;

CREATE POLICY "reviews_select_all" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "reviews_insert_own" ON reviews
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR 
    auth.role() = 'service_role'
  );

CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE USING (
    user_id = auth.uid() OR 
    auth.role() = 'service_role'
  );

CREATE POLICY "reviews_delete_own" ON reviews
  FOR DELETE USING (
    user_id = auth.uid() OR 
    auth.role() = 'service_role'
  );

-- ═══════════════════════════════════════════════════════════
-- PARTIE 2: CORRECTION DE LA TABLE GALLERY
-- ═══════════════════════════════════════════════════════════

ALTER TABLE gallery 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

UPDATE gallery SET is_active = true WHERE is_active IS NULL;

-- ═══════════════════════════════════════════════════════════
-- PARTIE 3: CRÉATION DE LA TABLE SPECIAL_OFFER
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS special_offer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  discount_percentage INTEGER,
  image_url TEXT,
  link_url TEXT,
  is_active BOOLEAN DEFAULT false,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE special_offer ENABLE ROW LEVEL SECURITY;

CREATE POLICY "special_offer_select_all" ON special_offer
  FOR SELECT USING (true);

CREATE POLICY "special_offer_admin" ON special_offer
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_special_offer_active 
  ON special_offer(is_active) WHERE is_active = true;

-- ═══════════════════════════════════════════════════════════
-- PARTIE 4: CRÉATION DE LA TABLE INVENTORY
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
  low_stock_threshold INTEGER DEFAULT 10,
  last_restocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT positive_quantity CHECK (quantity >= 0),
  CONSTRAINT positive_reserved CHECK (reserved_quantity >= 0),
  CONSTRAINT reserved_not_exceed CHECK (reserved_quantity <= quantity),
  CONSTRAINT unique_product_inventory UNIQUE (product_id)
);

CREATE TABLE IF NOT EXISTS inventory_history (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('restock', 'sale', 'adjustment', 'return', 'reservation', 'release')),
  quantity_change INTEGER NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  reason TEXT,
  order_id INTEGER,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_select_all" ON inventory
  FOR SELECT USING (true);

CREATE POLICY "inventory_history_select_all" ON inventory_history
  FOR SELECT USING (true);

CREATE POLICY "inventory_admin" ON inventory
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "inventory_history_admin" ON inventory_history
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_inventory_product 
  ON inventory(product_id);

CREATE INDEX IF NOT EXISTS idx_inventory_low_stock 
  ON inventory(available_quantity) 
  WHERE available_quantity <= low_stock_threshold;

CREATE INDEX IF NOT EXISTS idx_inventory_history_product 
  ON inventory_history(product_id);

CREATE INDEX IF NOT EXISTS idx_inventory_history_created 
  ON inventory_history(created_at DESC);

-- Fonction pour créer automatiquement l'inventaire
CREATE OR REPLACE FUNCTION create_inventory_for_product()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO inventory (product_id, quantity)
  VALUES (NEW.id, COALESCE(NEW.stock, 0))
  ON CONFLICT (product_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_inventory ON products;
CREATE TRIGGER trigger_create_inventory
  AFTER INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION create_inventory_for_product();

-- ═══════════════════════════════════════════════════════════
-- PARTIE 5: CRÉATION DE LA TABLE APP_ICONS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS app_icons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_192 TEXT NOT NULL,
  icon_512 TEXT NOT NULL,
  apple_icon TEXT,
  favicon TEXT,
  is_active BOOLEAN DEFAULT false,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_icons_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon_id UUID REFERENCES app_icons(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'activated', 'deactivated', 'updated', 'deleted')),
  previous_active_icon_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE app_icons ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_icons_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_icons_select_all" ON app_icons
  FOR SELECT USING (true);

CREATE POLICY "app_icons_history_select_all" ON app_icons_history
  FOR SELECT USING (true);

CREATE POLICY "app_icons_admin" ON app_icons
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "app_icons_history_admin" ON app_icons_history
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_app_icons_active 
  ON app_icons(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_app_icons_history_icon 
  ON app_icons_history(icon_id);

CREATE INDEX IF NOT EXISTS idx_app_icons_history_created 
  ON app_icons_history(created_at DESC);

-- Fonction pour s'assurer qu'une seule icône est active
CREATE OR REPLACE FUNCTION ensure_single_active_icon()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE app_icons 
    SET is_active = false 
    WHERE id != NEW.id AND is_active = true;
    
    INSERT INTO app_icons_history (icon_id, action, previous_active_icon_id)
    SELECT NEW.id, 'activated', id
    FROM app_icons
    WHERE id != NEW.id AND is_active = true
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_single_active_icon ON app_icons;
CREATE TRIGGER trigger_single_active_icon
  BEFORE INSERT OR UPDATE OF is_active ON app_icons
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION ensure_single_active_icon();

-- ═══════════════════════════════════════════════════════════
-- FIN DE LA MIGRATION
-- ═══════════════════════════════════════════════════════════
