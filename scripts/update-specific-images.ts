import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Charger les variables d'environnement
config({ path: '.env.local' })

async function updateSpecificImages() {
  console.log('🎨 Mise à jour avec des images spécifiques...')

  try {
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Mapping des produits avec leurs images spécifiques
    const productImages = [
      {
        name: 'T-shirt Graphique Streetwear',
        images: ['/images/products/tshirt-graphic.svg', '/images/placeholder.jpg']
      },
      {
        name: 'Hoodie Oversized Premium',
        images: ['/images/products/hoodie-black.svg', '/images/placeholder.jpg']
      },
      {
        name: 'Jean Cargo Streetwear',
        images: ['/images/products/cargo-pants.svg', '/images/placeholder.jpg']
      },
      {
        name: 'Casquette Snapback Logo',
        images: ['/images/products/cap.svg', '/images/placeholder.jpg']
      },
      {
        name: 'Bomber Jacket Premium',
        images: ['/images/products/bomber-jacket.svg', '/images/placeholder.jpg']
      }
    ]

    for (const productData of productImages) {
      const { error } = await supabase
        .from('products')
        .update({
          images: JSON.stringify(productData.images)
        })
        .eq('name', productData.name)

      if (error) {
        console.error(`❌ Erreur pour ${productData.name}:`, error)
      } else {
        console.log(`✅ Images mises à jour pour: ${productData.name}`)
      }
    }

    console.log('\n🎉 Toutes les images ont été mises à jour !')
    console.log('🖼️ Les produits ont maintenant des images personnalisées')

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error)
  }
}

updateSpecificImages()