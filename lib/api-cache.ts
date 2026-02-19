import { NextResponse } from 'next/server'

interface CacheEntry {
  data: any
  timestamp: number
  etag: string
}

const cache = new Map<string, CacheEntry>()

function generateETag(data: any): string {
  return `"${Buffer.from(JSON.stringify(data)).toString('base64').slice(0, 16)}"`
}

export function getCacheKey(url: string, userId?: string): string {
  return `${url}:${userId || 'public'}`
}

export function setApiCache(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
  const etag = generateETag(data)
  cache.set(key, { data, timestamp: Date.now(), etag })
  
  // Auto-cleanup old entries
  if (cache.size > 1000) {
    const now = Date.now()
    for (const [k, v] of cache.entries()) {
      if (now - v.timestamp > ttl * 2) {
        cache.delete(k)
      }
    }
  }
}

export function getApiCache(key: string, ttl: number = 5 * 60 * 1000): any | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data
  }
  cache.delete(key)
  return null
}

export function createCachedResponse(
  data: any,
  cacheKey: string,
  ttl: number = 5 * 60 * 1000,
  headers?: Record<string, string>
): NextResponse {
  const etag = generateETag(data)
  setApiCache(cacheKey, data, ttl)
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': `public, max-age=${Math.floor(ttl / 1000)}`,
      'ETag': etag,
      ...headers,
    },
  })
}

export function clearApiCache(pattern?: string): void {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key)
      }
    }
  } else {
    cache.clear()
  }
}
