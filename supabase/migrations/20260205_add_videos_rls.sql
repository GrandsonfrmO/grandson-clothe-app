-- Enable RLS on videos table
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active videos
CREATE POLICY "Allow public read access to videos"
  ON videos FOR SELECT
  USING (is_active = true);

-- Allow authenticated users (admin) to manage videos
CREATE POLICY "Allow admin full access to videos"
  ON videos FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Enable RLS on homepage_content table
ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active homepage content
CREATE POLICY "Allow public read access to homepage_content"
  ON homepage_content FOR SELECT
  USING (is_active = true);

-- Allow authenticated users (admin) to manage homepage content
CREATE POLICY "Allow admin full access to homepage_content"
  ON homepage_content FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
