-- Add inventory tracking table
CREATE TABLE IF NOT EXISTS inventory_history (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity_change INTEGER NOT NULL,
  reason TEXT NOT NULL, -- 'order', 'restock', 'adjustment', 'return', 'damage'
  reference_id TEXT, -- order_id or other reference
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add low stock threshold to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_inventory_history_product_id ON inventory_history(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_history_created_at ON inventory_history(created_at);

-- Add stock status column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_status TEXT DEFAULT 'in_stock'; -- 'in_stock', 'low_stock', 'out_of_stock'

-- Update stock status based on current stock
UPDATE products 
SET stock_status = CASE 
  WHEN stock <= 0 THEN 'out_of_stock'
  WHEN stock <= low_stock_threshold THEN 'low_stock'
  ELSE 'in_stock'
END;
