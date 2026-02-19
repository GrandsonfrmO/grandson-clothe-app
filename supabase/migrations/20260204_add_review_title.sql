-- Add title column to reviews table if it doesn't exist
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS title text;

-- Verify the migration
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reviews' 
ORDER BY ordinal_position;
