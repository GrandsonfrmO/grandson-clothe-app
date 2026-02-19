-- Create models table
CREATE TABLE IF NOT EXISTS models (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  bio TEXT,
  instagram_handle VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create special_offers table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_models_is_active ON models(is_active);
CREATE INDEX IF NOT EXISTS idx_models_display_order ON models(display_order);
CREATE INDEX IF NOT EXISTS idx_special_offers_is_active ON special_offers(is_active);

-- Enable RLS
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_offers ENABLE ROW LEVEL SECURITY;

-- Create policies for models
CREATE POLICY "Allow public read access to models" ON models
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admin full access to models" ON models
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for special_offers
CREATE POLICY "Allow public read access to special_offers" ON special_offers
  FOR SELECT USING (is_active = true);

C