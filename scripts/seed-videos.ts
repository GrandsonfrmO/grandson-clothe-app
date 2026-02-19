import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'exists' : 'missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedVideos() {
  try {
    console.log('🌱 Seeding videos...')

    const videos = [
      {
        title: 'Collection 2026 - Présentation',
        description: 'Découvrez notre nouvelle collection 2026',
        thumbnail_url: 'https://images.unsplash.com/photo-1611339555312-e607c04352fa',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '3:45',
        order_index: 0,
        is_active: true,
      },
      {
        title: 'Tutoriel - Comment bien porter nos pièces',
        description: 'Apprenez à styler nos vêtements',
        thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '5:20',
        order_index: 1,
        is_active: true,
      },
      {
        title: 'Coulisses - Fabrication artisanale',
        description: 'Voyez comment nos produits sont fabriqués',
        thumbnail_url: 'https://images.unsplash.com/photo-1556821552-5f63b1c14786',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '4:15',
        order_index: 2,
        is_active: true,
      },
    ]

    const { data, error } = await supabase
      .from('videos')
      .insert(videos)
      .select()

    if (error) throw error
    console.log(`✅ Inserted ${data?.length || 0} videos`)

    console.log('✨ Videos seeding completed!')
  } catch (error) {
    console.error('❌ Error seeding videos:', error)
    process.exit(1)
  }
}

seedVideos()
