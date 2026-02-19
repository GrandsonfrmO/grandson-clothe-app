/**
 * SYSTÈME DE CACHE ULTRA-RAPIDE
 * Cache en mémoire avec TTL pour réduire les requêtes DB
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Nettoyage automatique toutes les 60 secondes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  set<T>(key: string, data: T, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

// Instance globale
export const cache = new MemoryCache()

// Helpers pour les cas d'usage courants
export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300000
): Promise<T> {
  const cached = cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  const data = await fetcher()
  cache.set(key, data, ttl)
  return data
}

// Cache spécifique pour les produits (5 minutes)
export const CACHE_TTL = {
  PRODUCTS: 300000, // 5 minutes
  PRODUCT_DETAIL: 600000, // 10 minutes
  CATEGORIES: 3600000, // 1 heure
  USER_DATA: 60000, // 1 minute
  ORDERS: 30000, // 30 secondes
  CART: 0, // Pas de cache
}
