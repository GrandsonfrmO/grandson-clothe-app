-- ============================================
-- GESTION DES ICÔNES DE L'APPLICATION
-- ============================================

-- Table pour stocker les configurations d'icônes
CREATE TABLE IF NOT EXISTS app_icons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  favicon_url TEXT NOT NULL,
  icon_192_url TEXT NOT NULL,
  icon_512_url TEXT NOT NULL,
  apple_touch_icon_url TEXT NOT NULL,
  maskable_icon_url TEXT,
  theme_color VARCHAR(7) DEFAULT '#000000',
  background_color VARCHAR(7) DEFAULT '#ffffff',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour l'historique des changements d'icônes
CREATE TABLE IF NOT EXISTS app_icons_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  icon_id UUID REFERENCES app_icons(id) ON DELETE CASCADE,
  previous_icon_id UUID,
  changed_by VARCHAR(100),
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_app_icons_active ON app_icons(is_active);
CREATE INDEX IF NOT EXISTS idx_app_icons_history_created ON app_icons_history(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE app_icons ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_icons_history ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique des icônes actives
CREATE POLICY "Allow public read active icons" ON app_icons
  FOR SELECT USING (is_active = true);

-- Politique pour permettre aux admins de tout gérer
CREATE POLICY "Allow admin full access to icons" ON app_icons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email LIKE '%admin%'
    )
  );

CREATE POLICY "Allow admin full access to icons history" ON app_icons_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email LIKE '%admin%'
    )
  );

-- Fonction pour activer une icône (désactive les autres)
CREATE OR REPLACE FUNCTION activate_app_icon(icon_id UUID, changed_by_email VARCHAR DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  previous_active_id UUID;
BEGIN
  -- Récupérer l'icône actuellement active
  SELECT id INTO previous_active_id 
  FROM app_icons 
  WHERE is_active = true 
  LIMIT 1;
  
  -- Désactiver toutes les icônes
  UPDATE app_icons SET is_active = false, updated_at = NOW();
  
  -- Activer la nouvelle icône
  UPDATE app_icons 
  SET is_active = true, updated_at = NOW() 
  WHERE id = icon_id;
  
  -- Enregistrer dans l'historique
  INSERT INTO app_icons_history (icon_id, previous_icon_id, changed_by, change_reason)
  VALUES (icon_id, previous_active_id, changed_by_email, 'Icon activated via admin panel');
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insérer les icônes par défaut
INSERT INTO app_icons (name, description, favicon_url, icon_192_url, icon_512_url, apple_touch_icon_url, theme_color, background_color, is_active)
VALUES 
  (
    'Default GRANDSON',
    'Icônes par défaut de GRANDSON CLOTHES',
    '/favicon.ico',
    '/icon-192.png',
    '/icon-512.png',
    '/apple-icon.png',
    '#000000',
    '#ffffff',
    true
  ),
  (
    'Dark Theme',
    'Icônes pour le thème sombre',
    '/icon-dark-32x32.png',
    '/icon-192.png',
    '/icon-512.png',
    '/apple-icon.png',
    '#1a1a1a',
    '#000000',
    false
  ),
  (
    'Light Theme',
    'Icônes pour le thème clair',
    '/icon-light-32x32.png',
    '/icon-192.png',
    '/icon-512.png',
    '/apple-icon.png',
    '#ffffff',
    '#f8f9fa',
    false
  );

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_app_icons_updated_at
  BEFORE UPDATE ON app_icons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE app_icons IS 'Configuration des icônes de l''application (favicon, PWA icons, etc.)';
COMMENT ON TABLE app_icons_history IS 'Historique des changements d''icônes';