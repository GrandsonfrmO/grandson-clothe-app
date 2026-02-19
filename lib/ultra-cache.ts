/**
 * Ultra Cache - Simple in-memory cache with stats
 */

interface CacheEntry {
  data: any
  timestamp: number
}

interface CacheStats {
  hits: number
  misses: number
  totalSize: number
  hitRate: number
}

class UltraCache {
  private cache = new Map<string, CacheEntry>()
  private hits = 0
  private misses = 0

  get(key: string, ttl: number = 5 * 60 * 1000): any | null {
    const entry = this.cache.get(key)
    
    if (entry && Date.now() - entry.timestamp < ttl) {
      this.hits++
      return entry.data
    }
    
    this.misses++
    if (entry) {
      this.cache.delete(key)
    }
    return null
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  clear(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }

  getStats(): CacheStats {
    const totalRequests = this.hits + this.misses
    const hitRate = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0
    
    // Calculate total size (rough estimate)
    let totalSize = 0
    for (const entry of this.cache.values()) {
      totalSize += JSON.stringify(entry.data).length
    }

    return {
      hits: this.hits,
      misses: this.misses,
      totalSize,
      hitRate: Math.round(hitRate * 100) / 100
    }
  }
}

export const ultraCache = new UltraCache()
