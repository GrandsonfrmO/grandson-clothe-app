-- Materialized views for ultra-fast queries
-- These are pre-computed views that are much faster than regular queries

-- Product statistics view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_product_stats AS
SELECT
  p.id,
  p.name,
  p.price,
  COUNT(DISTINCT oi.id) as total_sold,
  COALESCE(SUM(oi.quantity), 0) as total_quantity,
  COALESCE(AVG(r.rating), 0) as avg_rating,
  COUNT(DISTINCT r.id) as review_count,
  COUNT(DISTINCT f.id) as favorite_count,
  p.stock,
  p.is_active
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN reviews r ON p.id = r.product_id
LEFT JOIN favorites f ON p.id = f.product_id
GROUP BY p.id, p.name, p.price, p.stock, p.is_active;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_mv_product_stats_id ON mv_product_stats(id);
CREATE INDEX IF NOT EXISTS idx_mv_product_stats_is_active ON mv_product_stats(is_active);

-- Category statistics view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_category_stats AS
SELECT
  c.id,
  c.name,
  COUNT(DISTINCT p.id) as product_count,
  COUNT(DISTINCT CASE WHEN p.is_active THEN p.id END) as active_product_count,
  COALESCE(AVG(p.price), 0) as avg_price,
  COALESCE(MAX(p.price), 0) as max_price,
  COALESCE(MIN(p.price), 0) as min_price
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_mv_category_stats_id ON mv_category_stats(id);

-- Order statistics view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_order_stats AS
SELECT
  DATE(o.created_at) as order_date,
  COUNT(DISTINCT o.id) as total_orders,
  COALESCE(SUM(o.total), 0) as total_revenue,
  COALESCE(AVG(o.total), 0) as avg_order_value,
  COUNT(DISTINCT CASE WHEN o.status = 'completed' THEN o.id END) as completed_orders,
  COUNT(DISTINCT CASE WHEN o.status = 'pending' THEN o.id END) as pending_orders,
  COUNT(DISTINCT CASE WHEN o.payment_status = 'paid' THEN o.id END) as paid_orders
FROM orders o
GROUP BY DATE(o.created_at);

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_mv_order_stats_date ON mv_order_stats(order_date DESC);

-- User statistics view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_stats AS
SELECT
  u.id,
  u.email,
  COUNT(DISTINCT o.id) as total_orders,
  COALESCE(SUM(o.total), 0) as total_spent,
  COALESCE(AVG(o.total), 0) as avg_order_value,
  COUNT(DISTINCT f.id) as favorite_count,
  COUNT(DISTINCT r.id) as review_count,
  MAX(o.created_at) as last_order_date
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
LEFT JOIN favorites f ON u.id = f.user_id
LEFT JOIN reviews r ON u.id = r.user_id
GROUP BY u.id, u.email;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_mv_user_stats_id ON mv_user_stats(id);

-- Refresh materialized views function
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_category_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_order_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_stats;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh views on data changes (optional, can be expensive)
-- Uncomment if you want automatic refresh
-- CREATE TRIGGER refresh_views_on_product_change
-- AFTER INSERT OR UPDATE OR DELETE ON products
-- FOR EACH STATEMENT
-- EXECUTE FUNCTION refresh_materialized_views();
