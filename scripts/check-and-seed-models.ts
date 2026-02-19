import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAndSeedModels() {
  console.log('🔍 Vérification de la table models...')

  // Vérifier si la table existe et contient des données
  const { data: existingModels, error: fetchError } = await supabase
    .from('models')
    .select('*')

  if (fetchError) {
    console.error('❌ Erreur lors de la récupération des models:', fetchError)
    return
  }

  console.log(`📊 Nombre de models existants: ${existingModels?.length || 0}`)

  if (existingModels && existingModels.length > 0) {
    console.log('✅ Des models existent déjà:')
    existingModels.forEach((model, index) => {
      console.log(`   ${index + 1}. ${model.name} (${model.is_active ? 'Actif' : 'Inactif'})`)
    })
    return
  }

  console.log('📝 Ajout de models de démonstration...')

  const demoModels = [
    {
      name: 'Sarah Johnson',
      image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
      bio: 'Mannequin professionnel avec 5 ans d\'expérience dans la mode urbaine',
      instagram_handle: 'sarahjohnson',
      email: 'sarah@example.com',
      phone: '+237600000001',
      is_active: true,
      display_order: 1,
    },
    {
      name: 'Marcus Williams',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      bio: 'Ambassadeur de la marque, spécialisé dans le streetwear',
      instagram_handle: 'marcuswilliams',
      email: 'marcus@example.com',
      phone: '+237600000002',
      is_active: true,
      display_order: 2,
    },
    {
      name: 'Emma Davis',
      image_url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800',
      bio: 'Influenceuse mode et ambassadrice Grandson Clothes',
      instagram_handle: 'emmadavis',
      email: 'emma@example.com',
      phone: '+237600000003',
      is_active: true,
      display_order: 3,
    },
    {
      name: 'David Brown',
      image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800',
      bio: 'Mannequin et photographe, passionné de mode contemporaine',
      instagram_handle: 'davidbrown',
      email: 'david@example.com',
      phone: '+237600000004',
      is_active: true,
      display_order: 4,
    },
  ]

  const { data, error } = await supabase
    .from('models')
    .insert(demoModels)
    .select()

  if (error) {
    console.error('❌ Erreur lors de l\'ajout des models:', error)
    return
  }

  console.log(`✅ ${data?.length || 0} models ajoutés avec succès!`)
  data?.forEach((model, index) => {
    console.log(`   ${index + 1}. ${model.name}`)
  })
}

checkAndSeedModels()
  .then(() => {
    console.log('\n✨ Terminé!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })
