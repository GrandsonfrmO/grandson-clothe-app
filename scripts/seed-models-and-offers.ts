import { createClient } from '@supabase/supabase-js'

// Use hardcoded values from .env.local for this script
const supabaseUrl = 'https://zyhqiwaudcilqwrcckdq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5aHFpd2F1ZGNpbHF3cmNja2RxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE1NjYyNSwiZXhwIjoyMDg1NzMyNjI1fQ.ubuFLkzLZ06ufH8gNsKEpWDz7r_mc4fS9eFWnu6Oi3w'

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedData() {
  try {
    console.log('🌱 Seeding models and offers...')

    // Insert sample models
    const { data: modelsData, error: modelsError } = await supabase
      .from('models')
      .insert([
        {
          name: 'Jean Dupont',
          image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
          bio: 'Ambassadeur principal de la marque',
          instagram_handle: 'jean.dupont',
          display_order: 0,
          is_active: true,
        },
        {
          name: 'Marie Martin',
          image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
          bio: 'Influenceuse mode',
          instagram_handle: 'marie.martin',
          display_order: 1,
          is_active: true,
        },
        {
          name: 'Alex Johnson',
          image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
          bio: 'Styliste professionnel',
          instagram_handle: 'alex.johnson',
          display_order: 2,
          is_active: true,
        },
        {
          name: 'Sophie Laurent',
          image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
          bio: 'Créatrice de contenu',
          instagram_handle: 'sophie.laurent',
          display_order: 3,
          is_active: true,
        },
      ])
      .select()

    if (modelsError) throw modelsError
    console.log(`✅ Inserted ${modelsData?.length || 0} models`)

    // Insert sample special offer
    const { data: offerData, error: offerError } = await supabase
      .from('special_offers')
      .insert([
        {
          title: 'Soldes d\'été',
          description: 'Profitez de réductions exceptionnelles sur toute la collection',
          image_url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=1600&h=600&fit=crop',
          discount_text: '-50% sur tout',
          cta_text: 'Découvrir',
          cta_link: '/explorer',
          is_active: true,
        },
      ])
      .select()

    if (offerError) throw offerError
    console.log(`✅ Inserted ${offerData?.length || 0} special offer`)

    console.log('✨ Seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    process.exit(1)
  }
}

seedData()
