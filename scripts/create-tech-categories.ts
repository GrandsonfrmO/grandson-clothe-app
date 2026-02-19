/**
 * Créer des catégories pour les produits tech
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function createTechCategories() {
  console.log('📱 Création des catégories tech...\n')
  
  const categories = [
    {
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Téléphones intelligents dernière génération'
    },
    {
      name: 'Ordinateurs',
      slug: 'ordinateurs',
      description: 'Ordinateurs portables et de bureau'
    },
    {
      name: 'Tablettes',
      slug: 'tablettes',
      description: 'Tablettes tactiles'
    }
  ]
  
  for (const cat of categories) {
    // Vérifier si existe déjà
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', cat.slug)
      .single()
    
    if (existing) {
      console.log(`⏭️  ${cat.name} existe déjà (ID: ${existing.id})`)
      continue
    }
    
    // Créer
    const { data, error } = await supabase
      .from('categories')
      .insert(cat)
      .select()
      .single()
    
    if (error) {
      console.error(`❌ Erreur pour ${cat.name}:`, error.message)
    } else {
      console.log(`✅ ${cat.name} créée (ID: ${data.id})`)
    }
  }
  
  console.log('\n📋 Liste finale des catégories:')
  const { data: allCategories } = await supabase
    .from('categories')
    .select('*')
    .order('id')
  
  allCategories?.forEach(cat => {
    console.log(`  ${cat.id}. ${cat.name} (${cat.slug})`)
  })
}

createTechCategories()
