import { db } from '../lib/database'
import { categories, products, users } from '../lib/schema'
import { hashPassword } from '../lib/auth'

async function seed() {
  console.log('🌱 Seeding database...')

  if (!db) {
    throw new Error('Database connection not initialized')
  }

  try {
    // Create categories
    console.log('Creating categories...')
    const categoriesData = await db.insert(categories).values([
      {
        name: 'Hoodies',
        slug: 'hoodies',
        description: 'Hoodies et sweats à capuche',
        image: '/images/category-hoodies.jpg',
      },
      {
        name: 'T-Shirts',
        slug: 't-shirts',
        description: 'T-shirts et tops',
        image: '/images/category-tshirts.jpg',
      },
      {
        name: 'Pantalons',
        slug: 'pantalons',
        description: 'Pantalons et jeans',
        image: '/images/category-pants.jpg',
      },
      {
        name: 'Vestes',
        slug: 'vestes',
        description: 'Vestes et manteaux',
        image: '/images/category-jackets.jpg',
      },
      {
        name: 'Accessoires',
        slug: 'accessoires',
        description: 'Accessoires et maroquinerie',
        image: '/images/category-accessories.jpg',
      },
    ]).returning()

    // Create admin user
    console.log('Creating admin user...')
    const adminPassword = await hashPassword('admin123')
    await db.insert(users).values({
      id: 'admin-user-id',
      email: 'admin@grandsonclothes.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'GRANDSON',
      role: 'admin',
      isVerified: true,
    })

    // Create test user
    console.log('Creating test user...')
    const userPassword = await hashPassword('user123')
    await db.insert(users).values({
      id: 'test-user-id',
      email: 'test@example.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+224123456789',
      isVerified: true,
    })

    // Create products
    console.log('Creating products...')
    const hoodieCategory = categoriesData.find(c => c.name === 'Hoodies')
    const tshirtCategory = categoriesData.find(c => c.name === 'T-Shirts')
    const pantsCategory = categoriesData.find(c => c.name === 'Pantalons')
    const jacketCategory = categoriesData.find(c => c.name === 'Vestes')
    const accessoryCategory = categoriesData.find(c => c.name === 'Accessoires')

    await db.insert(products).values([
      {
        name: 'Hoodie Oversize Noir',
        slug: 'hoodie-oversize-noir',
        description: 'Hoodie oversize premium en coton bio. Coupe décontractée parfaite pour le streetwear urbain.',
        price: '450000',
        categoryId: hoodieCategory?.id,
        images: JSON.stringify(['/images/product-hoodie-black.jpg', '/images/hero-streetwear-1.jpg']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
        colors: JSON.stringify(['Noir', 'Blanc', 'Gris']),
        features: JSON.stringify(['100% coton bio certifié', 'Coupe oversize confortable', 'Capuche doublée', 'Poche kangourou', 'Made in Guinea']),
        stock: 50,
        isNew: true,
        rating: '4.8',
        reviewCount: 24,
      },
      {
        name: 'T-Shirt Graphic',
        slug: 't-shirt-graphic',
        description: 'T-shirt avec design graphique exclusif GRANDSON. Impression haute qualité sur coton premium.',
        price: '180000',
        originalPrice: '220000',
        categoryId: tshirtCategory?.id,
        images: JSON.stringify(['/images/product-tshirt-graphic.jpg', '/images/hero-fashion-1.jpg']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['Noir', 'Blanc']),
        features: JSON.stringify(['Coton premium 180g/m²', 'Impression sérigraphie', 'Coupe regular fit', 'Col rond renforcé']),
        stock: 75,
        isNew: false,
        rating: '4.6',
        reviewCount: 18,
      },
      {
        name: 'Cargo Pants',
        slug: 'cargo-pants',
        description: 'Pantalon cargo streetwear avec multiples poches. Style urbain et fonctionnel.',
        price: '380000',
        categoryId: pantsCategory?.id,
        images: JSON.stringify(['/images/product-cargo.jpg', '/images/category-pants.jpg']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['Kaki', 'Noir', 'Beige']),
        features: JSON.stringify(['Tissu résistant', '6 poches fonctionnelles', 'Coupe droite', 'Taille ajustable']),
        stock: 30,
        isNew: true,
        rating: '4.7',
        reviewCount: 31,
      },
      {
        name: 'Bomber Jacket',
        slug: 'bomber-jacket',
        description: 'Veste bomber classique revisitée. Style intemporel avec finitions premium.',
        price: '520000',
        originalPrice: '650000',
        categoryId: jacketCategory?.id,
        images: JSON.stringify(['/images/product-bomber.jpg', '/images/hero-fashion-2.jpg']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
        colors: JSON.stringify(['Noir', 'Vert olive', 'Bordeaux']),
        features: JSON.stringify(['Tissu satiné', 'Doublure matelassée', 'Fermeture éclair YKK', 'Poches latérales']),
        stock: 25,
        isNew: false,
        rating: '4.9',
        reviewCount: 42,
      },
      {
        name: 'Casquette Streetwear',
        slug: 'casquette-streetwear',
        description: 'Casquette snapback avec logo GRANDSON brodé. Accessoire indispensable du streetwear.',
        price: '120000',
        categoryId: accessoryCategory?.id,
        images: JSON.stringify(['/images/product-cap.jpg', '/images/category-accessories.jpg']),
        sizes: JSON.stringify(['Unique']),
        colors: JSON.stringify(['Noir', 'Blanc', 'Rouge']),
        features: JSON.stringify(['Logo brodé haute qualité', 'Visière plate', 'Réglage snapback', '100% coton']),
        stock: 100,
        isNew: true,
        rating: '4.4',
        reviewCount: 15,
      },
    ])

    console.log('✅ Database seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

// Run seed if called directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('Seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}

export { seed }