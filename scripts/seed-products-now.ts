import { config } from 'dotenv'
config({ path: '.env.local' })

import { supabase } from '../lib/supabase'

async function seedProducts() {
  console.log('🌱 Seeding products to Supabase...')

  try {
    // First, check if products already exist
    const { data: existingProducts } = await supabase
      .from('products')
      .select('id')
      .limit(1)

    if (existingProducts && existingProducts.length > 0) {
      console.log('⚠️  Products already exist in database. Skipping...')
      return
    }

    // Insert categories
    console.log('📂 Creating categories...')
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .insert([
        { name: 'Hoodies', slug: 'hoodies', description: 'Hoodies et sweats à capuche', image: '/images/category-hoodies.jpg', is_active: true },
        { name: 'T-Shirts', slug: 't-shirts', description: 'T-shirts et tops', image: '/images/category-tshirts.jpg', is_active: true },
        { name: 'Pantalons', slug: 'pantalons', description: 'Pantalons et jeans', image: '/images/category-pants.jpg', is_active: true },
        { name: 'Vestes', slug: 'vestes', description: 'Vestes et manteaux', image: '/images/category-jackets.jpg', is_active: true },
        { name: 'Accessoires', slug: 'accessoires', description: 'Accessoires et maroquinerie', image: '/images/category-accessories.jpg', is_active: true },
      ])
      .select()

    if (catError) {
      console.error('❌ Category error:', catError)
      throw catError
    }
    console.log(`✅ ${categories?.length || 0} categories created`)

    // Insert products
    console.log('🛍️  Creating products...')
    const productsData = [
      {
        name: 'Hoodie Oversize Noir',
        slug: 'hoodie-oversize-noir',
        description: 'Hoodie oversize premium en coton bio. Coupe décontractée parfaite pour le streetwear urbain.',
        price: '450000',
        original_price: null,
        category_id: categories?.[0]?.id,
        images: JSON.stringify(['/images/product-hoodie-black.jpg', '/images/hero-streetwear-1.jpg']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
        colors: JSON.stringify(['Noir', 'Blanc', 'Gris']),
        features: JSON.stringify(['100% coton bio certifié', 'Coupe oversize confortable', 'Capuche doublée', 'Poche kangourou', 'Made in Guinea']),
        stock: 50,
        is_new: true,
        is_active: true,
        rating: '4.8',
        review_count: 24,
      },
      {
        name: 'T-Shirt Graphic',
        slug: 't-shirt-graphic',
        description: 'T-shirt avec design graphique exclusif GRANDSON. Impression haute qualité sur coton premium.',
        price: '180000',
        original_price: '220000',
        category_id: categories?.[1]?.id,
        images: JSON.stringify(['/images/product-tshirt-graphic.jpg', '/images/hero-fashion-1.jpg']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['Noir', 'Blanc']),
        features: JSON.stringify(['Coton premium 180g/m²', 'Impression sérigraphie', 'Coupe regular fit', 'Col rond renforcé']),
        stock: 75,
        is_new: false,
        is_active: true,
        rating: '4.6',
        review_count: 18,
      },
      {
        name: 'Cargo Pants',
        slug: 'cargo-pants',
        description: 'Pantalon cargo streetwear avec multiples poches. Style urbain et fonctionnel.',
        price: '380000',
        original_price: null,
        category_id: categories?.[2]?.id,
        images: JSON.stringify(['/images/product-cargo.jpg', '/images/category-pants.jpg']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['Kaki', 'Noir', 'Beige']),
        features: JSON.stringify(['Tissu résistant', '6 poches fonctionnelles', 'Coupe droite', 'Taille ajustable']),
        stock: 30,
        is_new: true,
        is_active: true,
        rating: '4.7',
        review_count: 31,
      },
      {
        name: 'Bomber Jacket',
        slug: 'bomber-jacket',
        description: 'Veste bomber classique revisitée. Style intemporel avec finitions premium.',
        price: '520000',
        original_price: '650000',
        category_id: categories?.[3]?.id,
        images: JSON.stringify(['/images/product-bomber.jpg', '/images/hero-fashion-2.jpg']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
        colors: JSON.stringify(['Noir', 'Vert olive', 'Bordeaux']),
        features: JSON.stringify(['Tissu satiné', 'Doublure matelassée', 'Fermeture éclair YKK', 'Poches latérales']),
        stock: 25,
        is_new: false,
        is_active: true,
        rating: '4.9',
        review_count: 42,
      },
      {
        name: 'Casquette Streetwear',
        slug: 'casquette-streetwear',
        description: 'Casquette snapback avec logo GRANDSON brodé. Accessoire indispensable du streetwear.',
        price: '120000',
        original_price: null,
        category_id: categories?.[4]?.id,
        images: JSON.stringify(['/images/product-cap.jpg', '/images/category-accessories.jpg']),
        sizes: JSON.stringify(['Unique']),
        colors: JSON.stringify(['Noir', 'Blanc', 'Rouge']),
        features: JSON.stringify(['Logo brodé haute qualité', 'Visière plate', 'Réglage snapback', '100% coton']),
        stock: 100,
        is_new: true,
        is_active: true,
        rating: '4.4',
        review_count: 15,
      },
      {
        name: 'Hoodie Vert Oversize',
        slug: 'hoodie-vert-oversize',
        description: 'Hoodie oversize dans une teinte verte unique. Même qualité premium que notre modèle noir.',
        price: '450000',
        original_price: null,
        category_id: categories?.[0]?.id,
        images: JSON.stringify(['/images/product-hoodie-black.svg', '/images/hero-streetwear-1.jpg']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
        colors: JSON.stringify(['Vert', 'Noir', 'Blanc']),
        features: JSON.stringify(['100% coton bio certifié', 'Coupe oversize confortable', 'Capuche doublée', 'Poche kangourou', 'Made in Guinea']),
        stock: 50,
        is_new: true,
        is_active: true,
        rating: '4.8',
        review_count: 19,
      },
      {
        name: 'Joggers Premium',
        slug: 'joggers-premium',
        description: 'Pantalon de jogging premium pour un style décontracté chic.',
        price: '320000',
        original_price: '380000',
        category_id: categories?.[2]?.id,
        images: JSON.stringify(['/images/product-joggers.jpg', '/images/category-pants.jpg']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['Gris', 'Noir', 'Marine']),
        features: JSON.stringify(['Coton mélangé doux', 'Taille élastique', 'Poches zippées', 'Chevilles resserrées']),
        stock: 40,
        is_new: false,
        is_active: true,
        rating: '4.5',
        review_count: 27,
      },
      {
        name: 'Sac Bandoulière',
        slug: 'sac-bandouliere',
        description: 'Sac bandoulière urbain avec compartiments multiples. Parfait pour le quotidien.',
        price: '280000',
        original_price: '320000',
        category_id: categories?.[4]?.id,
        images: JSON.stringify(['/images/product-bag.jpg', '/images/category-accessories.jpg']),
        sizes: JSON.stringify(['Unique']),
        colors: JSON.stringify(['Noir', 'Gris']),
        features: JSON.stringify(['Matière résistante à l\'eau', 'Multiples compartiments', 'Bandoulière ajustable', 'Fermetures sécurisées']),
        stock: 35,
        is_new: false,
        is_active: true,
        rating: '4.6',
        review_count: 22,
      },
    ]

    const { data: products, error: prodError } = await supabase
      .from('products')
      .insert(productsData)
      .select()

    if (prodError) {
      console.error('❌ Product error:', prodError)
      throw prodError
    }
    console.log(`✅ ${products?.length || 0} products created`)

    console.log('\n🎉 Seeding completed successfully!')
    console.log('📊 Summary:')
    console.log(`- ${categories?.length || 0} categories`)
    console.log(`- ${products?.length || 0} products`)
    console.log('\n✨ You can now create orders!')

  } catch (error) {
    console.error('❌ Seeding error:', error)
    process.exit(1)
  }
}

seedProducts()
