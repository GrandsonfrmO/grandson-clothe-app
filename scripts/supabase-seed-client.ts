import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// Charger les variables d'environnement
config({ path: '.env.local' })

async function supabaseSeedWithClient() {
  console.log('🌱 Seeding Supabase avec le client Supabase...')

  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  // Utiliser la service role key pour avoir tous les droits
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // 1. Créer les catégories
    console.log('📂 Création des catégories...')
    const categoriesData = [
      {
        name: 'T-shirts',
        slug: 'tshirts',
        description: 'T-shirts tendance pour homme et femme',
        image: '/images/category-tshirts.jpg',
        is_active: true,
      },
      {
        name: 'Hoodies',
        slug: 'hoodies',
        description: 'Sweats à capuche confortables',
        image: '/images/category-hoodies.jpg',
        is_active: true,
      },
      {
        name: 'Pantalons',
        slug: 'pantalons',
        description: 'Pantalons et jeans de qualité',
        image: '/images/category-pants.jpg',
        is_active: true,
      },
      {
        name: 'Accessoires',
        slug: 'accessoires',
        description: 'Casquettes, sacs et accessoires',
        image: '/images/category-accessories.jpg',
        is_active: true,
      },
    ]

    const { data: insertedCategories, error: categoriesError } = await supabase
      .from('categories')
      .insert(categoriesData)
      .select()

    if (categoriesError) {
      console.error('❌ Erreur catégories:', categoriesError)
      throw categoriesError
    }

    console.log(`✅ ${insertedCategories.length} catégories créées`)

    // 2. Créer un utilisateur admin
    console.log('👤 Création de l\'utilisateur admin...')
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const { data: adminUser, error: userError } = await supabase
      .from('users')
      .insert({
        email: 'admin@grandson-clothes.com',
        password: hashedPassword,
        first_name: 'Admin',
        last_name: 'Grandson',
        role: 'admin',
        is_verified: true,
      })
      .select()

    if (userError) {
      console.error('❌ Erreur utilisateur:', userError)
      throw userError
    }

    console.log(`✅ Utilisateur admin créé: ${adminUser[0].email}`)

    // 3. Créer des produits
    console.log('🛍️ Création des produits...')
    const productsData = [
      {
        name: 'T-shirt Graphique Streetwear',
        slug: 'tshirt-graphique-streetwear',
        description: 'T-shirt avec design graphique unique, parfait pour un look streetwear moderne.',
        price: 25.99,
        original_price: 35.99,
        category_id: insertedCategories[0].id, // T-shirts
        images: JSON.stringify(['/images/product-tshirt-graphic.jpg']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['Noir', 'Blanc', 'Gris']),
        features: JSON.stringify(['100% Coton', 'Coupe moderne', 'Sérigraphie haute qualité']),
        stock: 50,
        is_new: true,
        is_active: true,
        rating: 4.5,
        review_count: 12,
      },
      {
        name: 'Hoodie Oversized Premium',
        slug: 'hoodie-oversized-premium',
        description: 'Hoodie oversized en coton premium, confort et style garantis.',
        price: 59.99,
        original_price: 79.99,
        category_id: insertedCategories[1].id, // Hoodies
        images: JSON.stringify(['/images/product-hoodie-black.jpg', '/images/product-hoodie-green.jpg']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
        colors: JSON.stringify(['Noir', 'Vert', 'Beige']),
        features: JSON.stringify(['Coton premium', 'Coupe oversized', 'Capuche doublée']),
        stock: 30,
        is_new: true,
        is_active: true,
        rating: 4.8,
        review_count: 25,
      },
      {
        name: 'Jean Cargo Streetwear',
        slug: 'jean-cargo-streetwear',
        description: 'Jean cargo avec poches multiples, style urbain et fonctionnel.',
        price: 69.99,
        original_price: 89.99,
        category_id: insertedCategories[2].id, // Pantalons
        images: JSON.stringify(['/images/product-cargo.jpg']),
        sizes: JSON.stringify(['28', '30', '32', '34', '36', '38']),
        colors: JSON.stringify(['Bleu foncé', 'Noir', 'Kaki']),
        features: JSON.stringify(['Denim résistant', 'Poches cargo', 'Coupe droite']),
        stock: 25,
        is_new: false,
        is_active: true,
        rating: 4.3,
        review_count: 18,
      },
      {
        name: 'Casquette Snapback Logo',
        slug: 'casquette-snapback-logo',
        description: 'Casquette snapback avec logo brodé, accessoire indispensable.',
        price: 19.99,
        original_price: 29.99,
        category_id: insertedCategories[3].id, // Accessoires
        images: JSON.stringify(['/images/product-cap.jpg']),
        sizes: JSON.stringify(['Unique']),
        colors: JSON.stringify(['Noir', 'Blanc', 'Rouge']),
        features: JSON.stringify(['Logo brodé', 'Ajustable', 'Visière plate']),
        stock: 40,
        is_new: false,
        is_active: true,
        rating: 4.1,
        review_count: 8,
      },
      {
        name: 'Bomber Jacket Premium',
        slug: 'bomber-jacket-premium',
        description: 'Veste bomber en tissu premium, style intemporel et moderne.',
        price: 89.99,
        original_price: 119.99,
        category_id: insertedCategories[0].id, // T-shirts
        images: JSON.stringify(['/images/product-bomber.jpg']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['Noir', 'Kaki', 'Bleu marine']),
        features: JSON.stringify(['Tissu premium', 'Doublure satin', 'Fermeture zip']),
        stock: 15,
        is_new: true,
        is_active: true,
        rating: 4.7,
        review_count: 22,
      },
    ]

    const { data: insertedProducts, error: productsError } = await supabase
      .from('products')
      .insert(productsData)
      .select()

    if (productsError) {
      console.error('❌ Erreur produits:', productsError)
      throw productsError
    }

    console.log(`✅ ${insertedProducts.length} produits créés`)

    console.log('\n🎉 Seeding terminé avec succès !')
    console.log('📊 Résumé:')
    console.log(`- ${insertedCategories.length} catégories`)
    console.log(`- 1 utilisateur admin`)
    console.log(`- ${insertedProducts.length} produits`)
    console.log('\n🔑 Connexion admin:')
    console.log('Email: admin@grandson-clothes.com')
    console.log('Mot de passe: admin123')

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error)
    throw error
  }
}

supabaseSeedWithClient().catch((error) => {
  console.error('❌ Seeding échoué:', error)
  process.exit(1)
})