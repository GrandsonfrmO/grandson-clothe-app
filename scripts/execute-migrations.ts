import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Phase 1: Performance Indexes
const phase1SQL = `
-- Performance optimization: Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING GIN(to_tsvector('french', name));
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status) WHERE payment_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE role IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_models_is_active ON models(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_is_active ON gallery(is_active) WHERE is_active IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_special_offers_is_active ON special_offers(is_active);
CREATE INDEX IF NOT EXISTS idx_videos_is_active ON videos(is_active);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_products_active_category ON products(is_active, category_id) WHERE category_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_active_new ON products(is_active, is_new);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_order_items_order_product ON order_items(order_id, product_id);
`

// Phase 2: Materialized Views
const phase2SQL = `
-- Materialized views for ultra-fast queries
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

CREATE INDEX IF NOT EXISTS idx_mv_product_stats_id ON mv_product_stats(id);
CREATE INDEX IF NOT EXISTS idx_mv_product_stats_is_active ON mv_product_stats(is_active);

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

CREATE INDEX IF NOT EXISTS idx_mv_category_stats_id ON mv_category_stats(id);

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

CREATE INDEX IF NOT EXISTS idx_mv_order_stats_date ON mv_order_stats(order_date DESC);

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

CREATE INDEX IF NOT EXISTS idx_mv_user_stats_id ON mv_user_stats(id);

CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS \$\$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_category_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_order_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_stats;
END;
\$\$ LANGUAGE plpgsql;
`

async function executeMigrations() {
  try {
    console.log('🚀 Executing migrations...\n')

    // Execute Phase 1
    console.log('📝 Phase 1: Creating performance indexes...')
    const { error: error1 } = await supabase.rpc('exec', { sql: phase1SQL })
    
    if (error1) {
      console.error('❌ Phase 1 error:', error1.message)
    } else {
      console.log('✅ Phase 1 completed successfully\n')
    }

    // Execute Phase 2
    console.log('📝 Phase 2: Creating materialized views...')
    const { error: error2 } = await supabase.rpc('exec', { sql: phase2SQL })
    
    if (error2) {
      console.error('❌ Phase 2 error:', error2.message)
    } else {
      console.log('✅ Phase 2 completed successfully\n')
    }

    if (!error1 && !error2) {
      console.log('🎉 All migrations executed successfully!')
      console.log('\n✅ Indexes created: 20+')
      console.log('✅ Materialized views created: 4')
      console.log('✅ Refresh function created: 1')
    }
  } catch (error) {
    console.error('❌ Migration error:', error)
    process.exit(1)
  }
}

executeMigrations()
