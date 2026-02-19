-- Create gallery table for customer photos
CREATE TABLE IF NOT EXISTS gallery (
  id BIGSERIAL PRIMARY KEY,
  image TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to gallery"
  ON gallery FOR SELECT
  USING (true);

-- Allow authenticated users to manage gallery (admin only)
CREATE POLICY "Allow authenticated users to insert gallery"
  ON gallery FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update gallery"
  ON gallery FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete gallery"
  ON gallery FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create index for display_order
CREATE INDEX idx_gallery_display_order ON gallery(display_order);
