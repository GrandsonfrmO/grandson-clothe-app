/**
 * Lister tous les produits
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function listAllProducts() {
  console.log('📦 Liste de tous les produits\n')
  
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, price, stock, category_id')
    .order('id')
  
  if (error) {
    console.error('❌ Erreur:', error.message)
    return
  }
  
  if (!products || products.length === 0) {
    console.log('❌ Aucun produit trouvé')
    return
  }
  
  console.log(`✅ ${products.length} produit(s) trouvé(s):\n`)
  products.forEach(p => {
    console.log(`${p.id}. ${p.name}`)
    console.log(`   Slug: ${p.slug}`)
    console.log(`   Prix: ${p.price} FCFA`)
    console.log(`   Stock: ${p.stock}`)
    console.log(`   Catégorie: ${p.category_id}`)
    console.log()
  })
}

listAllProducts()
