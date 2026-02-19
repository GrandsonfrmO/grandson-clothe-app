/**
 * 🚀 SYSTÈME DE CACHE SERVEUR OPTIMISÉ
 * 
 * Utilise le cache Next.js natif avec revalidation intelligente
 */

import { unstable_cache } from 'next/cache'

interface CacheOptions {
  revalidate?: number | false
  tags?: string[]
}

/**
 * Cache une fonction avec Next.js cache natif
 */
export function createCachedFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: CacheOptions = {}
): T {
  const { revalidate = 300, tags = [] } = options
  
  return unstable_cache(fn, undefined, {
    revalidate,
    tags,
  }) as T
}

/**
 * Invalider le cache par tag
 */
export async function invalidateCache(tag: string) {
  const { revalidateTag } = await import('next/cache')
  revalidateTag(tag)
}

/**
 * Invalider le cache par path
 */
export async function invalidatePath(path: string) {
  const { revalidatePath } = await import('next/cache')
  revalidatePath(path)
}

// ============================================
// FONCTIONS DE CACHE PRÉDÉFINIES
// ============================================

/**
 * Cache pour les produits
 */
export const getCachedProducts = createCachedFunction(
  async (params: any) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/products?${new URLSearchParams(params)}`,
      { next: { revalidate: 300, tags: ['products'] } }
    )
    return response.json()
  },
  { revalidate: 300, tags: ['products'] }
)

/**
 * Cache pour un produit spécifique
 */
export const getCachedProduct = createCachedFunction(
  async (id: number) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/products/${id}`,
      { next: { revalidate: 600, tags: ['products', `product-${id}`] } }
    )
    return response.json()
  },
  { revalidate: 600, tags: ['products'] }
)

/**
 * Cache pour les catégories
 */
export const getCachedCategories = createCachedFunction(
  async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/categories`,
      { next: { revalidate: 3600, tags: ['categories'] } }
    )
    return response.json()
  },
  { revalidate: 3600, tags: ['categories'] }
)

/**
 * Cache pour le contenu de la page d'accueil
 */
export const getCachedHomeContent = createCachedFunction(
  async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/homepage-content`,
      { next: { revalidate: 600, tags: ['homepage'] } }
    )
    return response.json()
  },
  { revalidate: 600, tags: ['homepage'] }
)

// ============================================
// HELPERS POUR INVALIDATION
// ============================================

export const cacheInvalidation = {
  products: () => invalidateCache('products'),
  product: (id: number) => invalidateCache(`product-${id}`),
  categories: () => invalidateCache('categories'),
  homepage: () => invalidateCache('homepage'),
  all: () => {
    invalidateCache('products')
    invalidateCache('categories')
    invalidateCache('homepage')
  }
}
