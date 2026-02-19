// Mock data pour le développement
export const mockProducts = [
  {
    id: 1,
    name: 'Hoodie Oversize Noir',
    slug: 'hoodie-oversize-noir',
    description: 'Hoodie oversize premium en coton bio. Coupe décontractée parfaite pour le streetwear urbain.',
    price: '450000',
    originalPrice: null,
    categoryId: 1,
    images: ['/images/products/hoodie-black.svg', '/images/hero-streetwear-1.jpg'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Noir', 'Blanc', 'Gris'],
    features: ['100% coton bio certifié', 'Coupe oversize confortable', 'Capuche doublée', 'Poche kangourou', 'Made in Guinea'],
    stock: 50,
    isNew: true,
    isActive: true,
    rating: '4.8',
    reviewCount: 24,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: { id: 1, name: 'Hoodies', slug: 'hoodies' }
  },
  {
    id: 2,
    name: 'T-Shirt Graphic',
    slug: 't-shirt-graphic',
    description: 'T-shirt avec design graphique exclusif GRANDSON. Impression haute qualité sur coton premium.',
    price: '180000',
    originalPrice: '220000',
    categoryId: 2,
    images: ['/images/products/tshirt-graphic.svg', '/images/hero-fashion-1.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Noir', 'Blanc'],
    features: ['Coton premium 180g/m²', 'Impression sérigraphie', 'Coupe regular fit', 'Col rond renforcé'],
    stock: 75,
    isNew: false,
    isActive: true,
    rating: '4.6',
    reviewCount: 18,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: { id: 2, name: 'T-Shirts', slug: 't-shirts' }
  },
  {
    id: 3,
    name: 'Cargo Pants',
    slug: 'cargo-pants',
    description: 'Pantalon cargo streetwear avec multiples poches. Style urbain et fonctionnel.',
    price: '380000',
    originalPrice: null,
    categoryId: 3,
    images: ['/images/products/cargo-pants.svg', '/images/category-pants.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Kaki', 'Noir', 'Beige'],
    features: ['Tissu résistant', '6 poches fonctionnelles', 'Coupe droite', 'Taille ajustable'],
    stock: 30,
    isNew: true,
    isActive: true,
    rating: '4.7',
    reviewCount: 31,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: { id: 3, name: 'Pantalons', slug: 'pantalons' }
  },
  {
    id: 4,
    name: 'Bomber Jacket',
    slug: 'bomber-jacket',
    description: 'Veste bomber streetwear avec finitions premium. Style urbain intemporel.',
    price: '520000',
    originalPrice: '650000',
    categoryId: 4,
    images: ['/images/products/bomber-jacket.svg', '/images/hero-streetwear-2.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Noir', 'Kaki', 'Marine'],
    features: ['Tissu technique résistant', 'Doublure matelassée', 'Poches zippées', 'Col côtelé'],
    stock: 25,
    isNew: false,
    isActive: true,
    rating: '4.9',
    reviewCount: 42,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: { id: 4, name: 'Vestes', slug: 'vestes' }
  },
  {
    id: 5,
    name: 'Casquette Streetwear',
    slug: 'casquette-streetwear',
    description: 'Casquette snapback avec logo GRANDSON brodé. Accessoire streetwear essentiel.',
    price: '120000',
    originalPrice: null,
    categoryId: 5,
    images: ['/images/products/cap.svg', '/images/category-accessories.jpg'],
    sizes: ['Unique'],
    colors: ['Noir', 'Blanc', 'Rouge'],
    features: ['Logo brodé haute qualité', 'Visière plate', 'Réglage snapback', '100% coton'],
    stock: 60,
    isNew: true,
    isActive: true,
    rating: '4.5',
    reviewCount: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: { id: 5, name: 'Accessoires', slug: 'accessoires' }
  }
]

export const mockOrders = [
  {
    id: 'order-1',
    orderNumber: 'CMD-2026-001',
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    subtotal: '450000',
    shippingCost: '25000',
    total: '475000',
    shippingAddress: {
      street: '123 Rue de la République',
      city: 'Conakry',
      postalCode: '00000',
      country: 'Guinée'
    },
    notes: null,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 jours
    updatedAt: new Date().toISOString(),
    user: {
      id: 'test-user-id',
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      phone: '+224123456789'
    },
    items: [
      {
        id: 1,
        quantity: 1,
        size: 'L',
        color: 'Noir',
        price: '450000',
        total: '450000',
        product: {
          id: 1,
          name: 'Hoodie Oversize Noir',
          images: ['/images/products/hoodie-black.svg']
        }
      }
    ]
  },
  {
    id: 'order-2',
    orderNumber: 'CMD-2026-002',
    status: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    subtotal: '560000',
    shippingCost: '25000',
    total: '585000',
    shippingAddress: {
      street: '456 Avenue de la Paix',
      city: 'Conakry',
      postalCode: '00000',
      country: 'Guinée'
    },
    notes: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 jour
    updatedAt: new Date().toISOString(),
    user: {
      id: 'test-user-id',
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      phone: '+224123456789'
    },
    items: [
      {
        id: 2,
        quantity: 1,
        size: 'M',
        color: 'Noir',
        price: '180000',
        total: '180000',
        product: {
          id: 2,
          name: 'T-Shirt Graphic',
          images: ['/images/products/tshirt-graphic.svg']
        }
      },
      {
        id: 3,
        quantity: 1,
        size: 'L',
        color: 'Kaki',
        price: '380000',
        total: '380000',
        product: {
          id: 3,
          name: 'Cargo Pants',
          images: ['/images/products/cargo-pants.svg']
        }
      }
    ]
  }
]