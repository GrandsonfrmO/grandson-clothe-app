import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'

async function simpleSeed() {
  console.log('🌱 Simple seeding database...')
  
  try {
    const sqlite = new Database('./dev.db')

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 12)
    const userPassword = await bcrypt.hash('user123', 12)

    // Insert categories
    console.log('Creating categories...')
    const insertCategory = sqlite.prepare(`
      INSERT INTO categories (name, slug, description, image) VALUES (?, ?, ?, ?)
    `)

    const categories = [
      ['Hoodies', 'hoodies', 'Hoodies et sweats à capuche', '/images/category-hoodies.jpg'],
      ['T-Shirts', 't-shirts', 'T-shirts et tops', '/images/category-tshirts.jpg'],
      ['Pantalons', 'pantalons', 'Pantalons et jeans', '/images/category-pants.jpg'],
      ['Vestes', 'vestes', 'Vestes et manteaux', '/images/category-jackets.jpg'],
      ['Accessoires', 'accessoires', 'Accessoires et maroquinerie', '/images/category-accessories.jpg']
    ]

    categories.forEach(cat => insertCategory.run(...cat))

    // Insert users
    console.log('Creating users...')
    const insertUser = sqlite.prepare(`
      INSERT INTO users (id, email, password, firstName, lastName, phone, role, isVerified) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    insertUser.run('admin-user-id', 'admin@grandsonclothes.com', adminPassword, 'Admin', 'GRANDSON', null, 'admin', 1)
    insertUser.run('test-user-id', 'test@example.com', userPassword, 'John', 'Doe', '+224123456789', 'customer', 1)

    // Insert products
    console.log('Creating products...')
    const insertProduct = sqlite.prepare(`
      INSERT INTO products (name, slug, description, price, originalPrice, categoryId, images, sizes, colors, features, stock, isNew, rating, reviewCount) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const products = [
      [
        'Hoodie Oversize Noir',
        'hoodie-oversize-noir',
        'Hoodie oversize premium en coton bio. Coupe décontractée parfaite pour le streetwear urbain.',
        '450000',
        null,
        1, // Hoodies category
        JSON.stringify(['/images/product-hoodie-black.jpg', '/images/hero-streetwear-1.jpg']),
        JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
        JSON.stringify(['Noir', 'Blanc', 'Gris']),
        JSON.stringify(['100% coton bio certifié', 'Coupe oversize confortable', 'Capuche doublée', 'Poche kangourou', 'Made in Guinea']),
        50,
        1,
        '4.8',
        24
      ],
      [
        'T-Shirt Graphic',
        't-shirt-graphic',
        'T-shirt avec design graphique exclusif GRANDSON. Impression haute qualité sur coton premium.',
        '180000',
        '220000',
        2, // T-Shirts category
        JSON.stringify(['/images/product-tshirt-graphic.jpg', '/images/hero-fashion-1.jpg']),
        JSON.stringify(['S', 'M', 'L', 'XL']),
        JSON.stringify(['Noir', 'Blanc']),
        JSON.stringify(['Coton premium 180g/m²', 'Impression sérigraphie', 'Coupe regular fit', 'Col rond renforcé']),
        75,
        0,
        '4.6',
        18
      ],
      [
        'Cargo Pants',
        'cargo-pants',
        'Pantalon cargo streetwear avec multiples poches. Style urbain et fonctionnel.',
        '380000',
        null,
        3, // Pantalons category
        JSON.stringify(['/images/product-cargo.jpg', '/images/category-pants.jpg']),
        JSON.stringify(['S', 'M', 'L', 'XL']),
        JSON.stringify(['Kaki', 'Noir', 'Beige']),
        JSON.stringify(['Tissu résistant', '6 poches fonctionnelles', 'Coupe droite', 'Taille ajustable']),
        30,
        1,
        '4.7',
        31
      ],
      [
        'Bomber Jacket',
        'bomber-jacket',
        'Veste bomber classique revisitée. Style intemporel avec finitions premium.',
        '520000',
        '650000',
        4, // Vestes category
        JSON.stringify(['/images/product-bomber.jpg', '/images/hero-fashion-2.jpg']),
        JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
        JSON.stringify(['Noir', 'Vert olive', 'Bordeaux']),
        JSON.stringify(['Tissu satiné', 'Doublure matelassée', 'Fermeture éclair YKK', 'Poches latérales']),
        25,
        0,
        '4.9',
        42
      ],
      [
        'Casquette Streetwear',
        'casquette-streetwear',
        'Casquette snapback avec logo GRANDSON brodé. Accessoire indispensable du streetwear.',
        '120000',
        null,
        5, // Accessoires category
        JSON.stringify(['/images/product-cap.jpg', '/images/category-accessories.jpg']),
        JSON.stringify(['Unique']),
        JSON.stringify(['Noir', 'Blanc', 'Rouge']),
        JSON.stringify(['Logo brodé haute qualité', 'Visière plate', 'Réglage snapback', '100% coton']),
        100,
        1,
        '4.4',
        15
      ]
    ]

    products.forEach(product => insertProduct.run(...product))

    sqlite.close()
    console.log('✅ Database seeded successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

// Run seed if called directly
if (require.main === module) {
  simpleSeed()
    .then(() => {
      console.log('Simple seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Simple seeding failed:', error)
      process.exit(1)
    })
}

export { simpleSeed }