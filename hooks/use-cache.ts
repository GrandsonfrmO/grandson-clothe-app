import { useEffect, useState, useRef } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class ClientCache {
  private cache = new Map<string, CacheEntry<any>>()
  private timers = new Map<string, NodeJS.Timeout>()

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000) {
    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })

    // Auto-clear after TTL
    const timer = setTimeout(() => {
      this.cache.delete(key)
      this.timers.delete(key)
    }, ttl)

    this.timers.set(key, timer)
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) return null

    const age = Date.now() - entry.timestamp
    if (age > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  clear() {
    this.cache.clear()
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()
  }
}

const globalCache = new ClientCache()

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttl?: number; skip?: boolean } = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (options.skip) {
      setLoading(false)
      return
    }

    const cached = globalCache.get<T>(key)
    if (cached) {
      setData(cached)
      setLoading(false)
      return
    }

    let cancelled = false

    const fetch = async () => {
      try {
        setLoading(true)
        const result = await fetcher()
        if (!cancelled && isMountedRef.current) {
          globalCache.set(key, result, options.ttl)
          setData(result)
          setError(null)
        }
      } catch (err) {
        if (!cancelled && isMountedRef.current) {
          setError(err instanceof Error ? err : new Error(String(err)))
        }
      } finally {
        if (!cancelled && isMountedRef.current) {
          setLoading(false)
        }
      }
    }

    fetch()

    return () => {
      cancelled = true
    }
  }, [key, options.ttl, options.skip])

  return { data, loading, error }
}

export function clearCache() {
  globalCache.clear()
}

export function getCachedData<T>(key: string): T | null {
  return globalCache.get<T>(key)
}
