// Fallback database pour développement local sans Supabase
import { products as productsSchema } from './schema'

interface Product {
  id: number
  name: string
  slug: string
  description: string | null
  price: string
  originalPrice: string | null
  categoryId: number | null
  images: string
  sizes: string
  colors: string
  features: string
  stock: number
  isNew: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Stockage en mémoire
let productsStore: Product[] = []
let nextId = 1

export const fallbackDb = {
  products: {
    async findMany(options?: any) {
      let results = [...productsStore]
      
      // Filtrage
      if (options?.where) {
        const where = options.where
        results = results.filter(p => {
          if (where.isActive !== undefined && p.isActive !== where.isActive) return false
          if (where.categoryId !== undefined && p.categoryId !== where.categoryId) return false
          if (where.name && !p.name.toLowerCase().includes(where.name.toLowerCase())) return false
          return true
        })
      }
      
      // Tri
      if (options?.orderBy) {
        results.sort((a, b) => {
          if (options.orderBy.createdAt === 'desc') {
            return b.createdAt.getTime() - a.createdAt.getTime()
          }
          return 0
        })
      }
      
      // Pagination
      if (options?.limit) {
        const offset = options.offset || 0
        results = results.slice(offset, offset + options.limit)
      }
      
      return results
    },
    
    async create(data: any) {
      const now = new Date()
      const newProduct: Product = {
        id: nextId++,
        name: data.name,
        slug: data.slug || '',
        description: data.description || null,
        price: data.price,
        originalPrice: data.originalPrice || null,
        categoryId: data.categoryId || null,
        images: data.images || '[]',
        sizes: data.sizes || '[]',
        colors: data.colors || '[]',
        features: data.features || '[]',
        stock: data.stock || 0,
        isNew: data.isNew || false,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: now,
        updatedAt: now,
      }
      
      productsStore.push(newProduct)
      console.log('✅ Product created in fallback DB:', newProduct.id)
      return newProduct
    },
    
    async update(id: number, data: any) {
      const index = productsStore.findIndex(p => p.id === id)
      if (index === -1) return null
      
      productsStore[index] = {
        ...productsStore[index],
        ...data,
        updatedAt: new Date(),
      }
      
      return productsStore[index]
    },
    
    async delete(id: number) {
      const index = productsStore.findIndex(p => p.id === id)
      if (index === -1) return false
      
      productsStore.splice(index, 1)
      return true
    },
    
    async findById(id: number) {
      return productsStore.find(p => p.id === id) || null
    },
    
    async count(options?: any) {
      let results = [...productsStore]
      
      if (options?.where) {
        const where = options.where
        results = results.filter(p => {
          if (where.isActive !== undefined && p.isActive !== where.isActive) return false
          if (where.categoryId !== undefined && p.categoryId !== where.categoryId) return false
          return true
        })
      }
      
      return results.length
    }
  }
}

// Initialiser avec quelques produits de test
export function initFallbackData() {
  if (productsStore.length === 0) {
    console.log('🔄 Initializing fallback database with sample data...')
    
    const sampleProducts = [
      {
        name: 'Hoodie Oversize Noir',
        slug: 'hoodie-oversize-noir',
        description: 'Hoodie confortable et stylé',
        price: '450000',
        originalPrice: '550000',
        categoryId: 2,
        images: JSON.stringify(['https://via.placeholder.com/400']),
        sizes: JSON.stringify(['M', 'L', 'XL']),
        colors: JSON.stringify(['Noir']),
        features: JSON.stringify([]),
        stock: 10,
        isNew: true,
        isActive: true,
      },
      {
        name: 'T-shirt Blanc Classique',
        slug: 't-shirt-blanc-classique',
        description: 'T-shirt basique en coton',
        price: '150000',
        originalPrice: null,
        categoryId: 1,
        images: JSON.stringify(['https://via.placeholder.com/400']),
        sizes: JSON.stringify(['S', 'M', 'L']),
        colors: JSON.stringify(['Blanc']),
        features: JSON.stringify([]),
        stock: 25,
        isNew: false,
        isActive: true,
      }
    ]
    
    sampleProducts.forEach(p => fallbackDb.products.create(p))
    console.log('✅ Fallback database initialized with', productsStore.length, 'products')
  }
}
