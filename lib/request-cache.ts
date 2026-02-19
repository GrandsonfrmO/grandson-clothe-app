// Simple request deduplication and caching for client-side
interface CacheEntry {
  data: any
  timestamp: number
  promise?: Promise<any>
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export function getCacheKey(url: string, options?: any): string {
  return `${url}:${JSON.stringify(options || {})}`
}

export async function cachedFetch<T>(
  url: string,
  options?: RequestInit,
  ttl: number = CACHE_TTL
): Promise<T> {
  const key = getCacheKey(url, options)
  const cached = cache.get(key)

  // Return cached data if still valid
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data
  }

  // Return pending promise if request is in flight
  if (cached?.promise) {
    return cached.promise
  }

  // Make new request
  const promise = fetch(url, options)
    .then(res => res.json())
    .then(data => {
      cache.set(key, { data, timestamp: Date.now() })
      return data
    })

  // Store promise to deduplicate concurrent requests
  cache.set(key, { data: null, timestamp: Date.now(), promise })

  return promise
}

export function clearCache(url?: string): void {
  if (url) {
    const key = getCacheKey(url)
    cache.delete(key)
  } else {
    cache.clear()
  }
}
