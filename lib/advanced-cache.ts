// Advanced caching with compression and memory optimization
import { compress, decompress } from 'lz-string'

interface CacheEntry {
  data: string // Compressed data
  timestamp: number
  size: number
}

const cache = new Map<string, CacheEntry>()
const MAX_CACHE_SIZE = 50 * 1024 * 1024 // 50MB max
let currentSize = 0

export function compressData(data: any): string {
  return compress(JSON.stringify(data))
}

export function decompressData(compressed: string): any {
  return JSON.parse(decompress(compressed))
}

export function setAdvancedCache(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
  try {
    const compressed = compressData(data)
    const size = compressed.length

    // Check if we need to clear old entries
    if (currentSize + size > MAX_CACHE_SIZE) {
      // Remove oldest entries (LRU)
      const entriesToClear = Array.from(cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, Math.floor(cache.size * 0.3))

      entriesToClear.forEach(([k]) => {
        const entry = cache.get(k)
        if (entry) {
          currentSize -= entry.size
          cache.delete(k)
        }
      })
    }

    cache.set(key, { data: compressed, timestamp: Date.now(), size })
    currentSize += size

    // Auto cleanup expired entries
    setTimeout(() => {
      const entry = cache.get(key)
      if (entry && Date.now() - entry.timestamp > ttl) {
        currentSize -= entry.size
        cache.delete(key)
      }
    }, ttl)
  } catch (error) {
    console.error('Cache compression error:', error)
  }
}

export function getAdvancedCache(key: string, ttl: number = 5 * 60 * 1000): any | null {
  try {
    const entry = cache.get(key)
    if (entry && Date.now() - entry.timestamp < ttl) {
      return decompressData(entry.data)
    }
    if (entry) {
      currentSize -= entry.size
      cache.delete(key)
    }
    return null
  } catch (error) {
    console.error('Cache decompression error:', error)
    return null
  }
}

export function clearAdvancedCache(pattern?: string): void {
  if (pattern) {
    for (const [key, entry] of cache.entries()) {
      if (key.includes(pattern)) {
        currentSize -= entry.size
        cache.delete(key)
      }
    }
  } else {
    currentSize = 0
    cache.clear()
  }
}

export function getCacheStats(): { size: number; entries: number; maxSize: number } {
  return {
    size: currentSize,
    entries: cache.size,
    maxSize: MAX_CACHE_SIZE,
  }
}
