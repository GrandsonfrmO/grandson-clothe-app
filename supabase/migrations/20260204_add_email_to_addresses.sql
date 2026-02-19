-- Add email column to addresses table
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS email text;
