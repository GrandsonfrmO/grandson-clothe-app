-- Migration pour le système de gestion des icônes d'application
-- Créé le 2026-02-07

-- Table pour stocker les différents sets d'icônes
CREATE TABLE IF NOT EXISTS app_icons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- URLs des différentes icônes
  favicon_url TEXT NOT NULL,
  icon_192_url TEXT NOT NULL,
  icon_512_url TEXT NOT NULL,
  apple_touch_icon_url TEXT NOT NULL,
  maskable_icon_url TEXT,
  
  -- Couleurs pour le thème PWA
  theme_color VARCHAR(7) DEFAULT '#000000',
  background_color VARCHAR(7) DEFAULT '#ffffff',
  
  -- État d'activation
  is_active BOOLEAN DEFAULT FALSE,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT valid_theme_color CHECK (theme_color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_background_color CHECK (background_color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Table pour l'historique des changements d'icônes
CREATE TABLE IF NOT EXISTS app_icons_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  icon_id UUID REFERENCES app_icons(id) ON DELETE CASCADE,
  previous_icon_id UUID REFERENCES app_icons(id) ON DELETE SET NULL,
  changed_by VARCHAR(255) NOT NULL,
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_app_icons_active ON app_icons(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_app_icons_created_at ON app_icons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_icons_history_created_at ON app_icons_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_icons_history_icon_id ON app_icons_history(icon_id);

-- Fonction pour activer une icône (désactive automatiquement les autres)
CREATE OR REPLACE FUNCTION activate_app_icon(
  icon_id UUID,
  changed_by_email VARCHAR(255) DEFAULT 'system'
)
RETURNS VOID AS $$
DECLARE
  previous_active_id UUID;
BEGIN
  -- Récupérer l'ID de l'icône actuellement active
  SELECT id INTO previous_active_id 
  FROM app_icons 
  WHERE is_active = true 
  LIMIT 1;
  
  -- Désactiver toutes les icônes
  UPDATE app_icons SET is_active = false WHERE is_active = true;
  
  -- Activer la nouvelle icône
  UPDATE app_icons 
  SET is_active = true, updated_at = NOW() 
  WHERE id = icon_id;
  
  -- Enregistrer dans l'historique
  INSERT INTO app_icons_history (
    icon_id, 
    previous_icon_id, 
    changed_by, 
    change_reason
  ) VALUES (
    icon_id, 
    previous_active_id, 
    changed_by_email, 
    'Activation via interface admin'
  );
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
  SELECT 
    ai.id,
    ai.name,
    ai.description,
    ai.favicon_url,
    ai.icon_192_url,
    ai.icon_512_url,
    ai.apple_touch_icon_url,
    ai.maskable_icon_url,
    ai.theme_color,
    ai.background_color,
    ai.is_active,
    ai.created_at,
    ai.updated_at
  FROM app_icons ai
  WHERE ai.is_active = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_app_icons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_app_icons_updated_at
  BEFORE UPDATE ON app_icons
  FOR EACH ROW
  EXECUTE FUNCTION update_app_icons_updated_at();

-- RLS (Row Level Security)
ALTER TABLE app_icons ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_icons_history ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique des icônes actives
CREATE POLICY "Allow public read of active icons" ON app_icons
  FOR SELECT USING (is_active = true);

-- Politique pour permettre toutes les opérations aux utilisateurs authentifiés
CREATE POLICY "Allow all operations for authenticated users" ON app_icons
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users on history" ON app_icons_history
  FOR ALL USING (auth.role() = 'authenticated');

-- Insérer un set d'icônes par défaut
INSERT INTO app_icons (
  name,
  description,
  favicon_url,
  icon_192_url,
  icon_512_url,
  apple_touch_icon_url,
  theme_color,
  background_color,
  is_active
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

-- Commentaires pour la documentation
COMMENT ON TABLE app_icons IS 'Stockage des différents sets d''icônes d''application (favicon, PWA, etc.)';
COMMENT ON TABLE app_icons_history IS 'Historique des changements d''icônes d''application';
COMMENT ON FUNCTION activate_app_icon(UUID, VARCHAR) IS 'Active une icône et désactive les autres automatiquement';
COMMENT ON FUNCTION get_active_app_icon() IS 'Retourne l''icône actuellement active';