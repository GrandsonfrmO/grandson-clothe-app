/**
 * Lister les catégories disponibles
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function listCategories() {
  console.log('📋 Liste des catégories\n')
  
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('❌ Erreur:', error.message)
    return
  }
  
  if (!categories || categories.length === 0) {
    console.log('❌ Aucune catégorie trouvée')
    return
  }
  
  console.log(`✅ ${categories.length} catégorie(s) trouvée(s):\n`)
  categories.forEach(cat => {
    console.log(`  ${cat.id}. ${cat.name}`)
    console.log(`     Slug: ${cat.slug}`)
    console.log(`     Description: ${cat.description || 'N/A'}`)
    console.log()
  })
}

listCategories()
