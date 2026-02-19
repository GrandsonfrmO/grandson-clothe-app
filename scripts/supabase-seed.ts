import { config } from 'dotenv'

// Charger les variables d'environnement
config({ path: '.env.local' })

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../lib/schema'
import { categories, products, users } from '../lib/schema'
import bcrypt from 'bcryptjs'

// Configuration de la base de données
const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,
  max: 1,
})
const db = drizzle(client, { schema })

async function supabaseSeed() {
  console.log('🌱 Début du seeding de la base de données Supabase...')

  try {
    // 1. Créer les catégories
    console.log('📂 Création des catégories...')
    const categoriesData = [
      {
        name: 'T-shirts',
        slug: 'tshirts',
        description: 'T-shirts tendance pour homme et femme',
        image: '/images/category-tshirts.jpg',
        isActive: true,
      },
      {
        name: 'Hoodies',
        slug: 'hoodies',
        description: 'Sweats à capuche confortables',
        image: '/images/category-hoodies.jpg',
        isActive: true,
      },
      {
        name: 'Pantalons',
        slug: 'pantalons',
        description: 'Pantalons et jeans de qualité',
        image: '/images/category-pants.jpg',
        isActive: true,
      },
      {
        name: 'Accessoires',
        slug: 'accessoires',
        description: 'Casquettes, sacs et accessoires',
        image: '/images/category-accessories.jpg',
        isActive: true,
      },
    ]

    const insertedCategories = await db.insert(categories).values(categoriesData).returning()
    console.log(`✅ ${insertedCategories.length} catégories créées`)

    // 2. Créer un utilisateur admin
    console.log('👤 Création de l\'utilisateur admin...')
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const adminUser = await db.insert(users).values({
      email: 'admin@grandson-clothes.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Grandson',
      role: 'admin',
      isVerified: true,
    }).returning()
    
    console.log(`✅ Utilisateur admin créé: ${adminUser[0].email}`)

    // 3. Créer des produits
    console.log('🛍️ Création des produits...')
    const productsData = [
      {
        name: 'T-shirt Graphique Streetwear',
        slug: 'tshirt-graphique-streetwear',
        description: 'T-shirt avec design graphique unique, parfait pour un look streetwear moderne.',
        price: '25.99',
        originalPrice: '35.99',
        categoryId: insertedCategories[0].id, // T-shirts
        images: JSON.stringify(['/images/product-tshirt-graphic.jpg']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['Noir', 'Blanc', 'Gris']),
        features: JSON.stringify(['100% Coton', 'Coupe moderne', 'Sérigraphie haute qualité']),
        stock: 50,
        isNew: true,
        isActive: true,
        rating: '4.5',
        reviewCount: 12,
      },
      {
        name: 'Hoodie Oversized Premium',
        slug: 'hoodie-oversized-premium',
        description: 'Hoodie oversized en coton premium, confort et style garantis.',
        price: '59.99',
        originalPrice: '79.99',
        categoryId: insertedCategories[1].id, // Hoodies
        images: JSON.stringify(['/images/product-hoodie-black.jpg', '/images/product-hoodie-green.jpg']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
        colors: JSON.stringify(['Noir', 'Vert', 'Beige']),
        features: JSON.stringify(['Coton premium', 'Coupe oversized', 'Capuche doublée']),
        stock: 30,
        isNew: true,
        isActive: true,
        rating: '4.8',
        reviewCount: 25,
      },
      {
        name: 'Jean Cargo Streetwear',
        slug: 'jean-cargo-streetwear',
        description: 'Jean cargo avec poches multiples, style urbain et fonctionnel.',
        price: '69.99',
        originalPrice: '89.99',
        categoryId: insertedCategories[2].id, // Pantalons
        images: JSON.stringify(['/images/product-cargo.jpg']),
        sizes: JSON.stringify(['28', '30', '32', '34', '36', '38']),
        colors: JSON.stringify(['Bleu foncé', 'Noir', 'Kaki']),
        features: JSON.stringify(['Denim résistant', 'Poches cargo', 'Coupe droite']),
        stock: 25,
        isNew: false,
        isActive: true,
        rating: '4.3',
        reviewCount: 18,
      },
      {
        name: 'Casquette Snapback Logo',
        slug: 'casquette-snapback-logo',
        description: 'Casquette snapback avec logo brodé, accessoire indispensable.',
        price: '19.99',
        originalPrice: '29.99',
        categoryId: insertedCategories[3].id, // Accessoires
        images: JSON.stringify(['/images/product-cap.jpg']),
        sizes: JSON.stringify(['Unique']),
        colors: JSON.stringify(['Noir', 'Blanc', 'Rouge']),
        features: JSON.stringify(['Logo brodé', 'Ajustable', 'Visière plate']),
        stock: 40,
        isNew: false,
        isActive: true,
        rating: '4.1',
        reviewCount: 8,
      },
      {
        name: 'Bomber Jacket Premium',
        slug: 'bomber-jacket-premium',
        description: 'Veste bomber en tissu premium, style intemporel et moderne.',
        price: '89.99',
        originalPrice: '119.99',
        categoryId: insertedCategories[0].id, // T-shirts (ou créer une catégorie Vestes)
        images: JSON.stringify(['/images/product-bomber.jpg']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['Noir', 'Kaki', 'Bleu marine']),
        features: JSON.stringify(['Tissu premium', 'Doublure satin', 'Fermeture zip']),
        stock: 15,
        isNew: true,
        isActive: true,
        rating: '4.7',
        reviewCount: 22,
      },
    ]

    const insertedProducts = await db.insert(products).values(productsData).returning()
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
  } finally {
    await client.end()
  }
}

supabaseSeed().catch((error) => {
  console.error('❌ Seeding échoué:', error)
  process.exit(1)
})