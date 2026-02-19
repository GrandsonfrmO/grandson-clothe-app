import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Charger les variables d'environnement
config({ path: '.env.local' })

async function updateProductImages() {
  console.log('🖼️ Mise à jour des images des produits...')

  try {
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variables Supabase manquantes')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Récupérer tous les produits
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, images')

    if (error) {
      throw error
    }

    console.log(`📦 ${products.length} produits trouvés`)

    // Mettre à jour chaque produit avec des images placeholder
    for (const product of products) {
      const updatedImages = [
        '/images/products/placeholder.svg',
        '/images/placeholder.jpg'
      ]

      const { error: updateError } = await supabase
        .from('products')
        .update({
          images: JSON.stringify(updatedImages)
        })
        .eq('id', product.id)

      if (updateError) {
        console.error(`❌ Erreur pour le produit ${product.id}:`, updateError)
      } else {
        console.log(`✅ Images mises à jour pour: ${product.name}`)
      }
    }

    console.log('\n🎉 Mise à jour des images terminée !')
    console.log('💡 Les produits utilisent maintenant des images placeholder')
    console.log('📁 Tu peux remplacer les images dans public/images/products/')

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error)
  }
}

updateProductImages()