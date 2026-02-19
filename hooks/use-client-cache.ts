'use client'

/**
 * 🎯 CACHE CÔTÉ CLIENT
 * 
 * Hook pour gérer le cache côté client avec SWR-like behavior
 * - Cache en mémoire
 * - Revalidation automatique
 * - Optimistic updates
 */

import { useState, useEffect, useCallback, useRef } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  isStale: boolean
}

interface UseCacheOptions {
  revalidateOnFocus?: boolean
  revalidateOnReconnect?: boolean
  dedupingInterval?: number
  staleTime?: number
}

const cache = new Map<string, CacheEntry<any>>()
const pendingRequests = new Map<string, Promise<any>>()

export function useClientCache<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: UseCacheOptions = {}
) {
  const {
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    dedupingInterval = 2000,
    staleTime = 5 * 60 * 1000, // 5 minutes
  } = options

  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  
  const mountedRef = useRef(true)

  const fetchData = useCallback(async (isRevalidation = false) => {
    if (!key) return

    // Vérifier le cache
    const cached = cache.get(key)
    if (cached && !isRevalidation) {
      setData(cached.data)
      
      // Si les données sont fraîches, ne pas revalider
      if (Date.now() - cached.timestamp < staleTime) {
        return
      }
    }

    // Déduplication des requêtes
    const pending = pendingRequests.get(key)
    if (pending && Date.now() - (cached?.timestamp || 0) < dedupingInterval) {
      try {
        const result = await pending
        if (mountedRef.current) {
          setData(result)
        }
        return
      } catch (err) {
        if (mountedRef.current) {
          setError(err as Error)
        }
        return
      }
    }

    // Nouvelle requête
    if (isRevalidation) {
      setIsValidating(true)
    } else {
      setIsLoading(true)
    }

    const promise = fetcher()
    pendingRequests.set(key, promise)

    try {
      const result = await promise
      
      if (mountedRef.current) {
        setData(result)
        setError(null)
        
        // Mettre en cache
        cache.set(key, {
          data: result,
          timestamp: Date.now(),
          isStale: false,
        })
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err as Error)
      }
    } finally {
      pendingRequests.delete(key)
      if (mountedRef.current) {
        setIsLoading(false)
        setIsValidating(false)
      }
    }
  }, [key, fetcher, staleTime, dedupingInterval])

  // Fetch initial
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Revalidation au focus
  useEffect(() => {
    if (!revalidateOnFocus) return

    const handleFocus = () => {
      fetchData(true)
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [revalidateOnFocus, fetchData])

  // Revalidation à la reconnexion
  useEffect(() => {
    if (!revalidateOnReconnect) return

    const handleOnline = () => {
      fetchData(true)
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [revalidateOnReconnect, fetchData])

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const mutate = useCallback(
    async (newData?: T | ((current: T | null) => T), shouldRevalidate = true) => {
      if (!key) return

      // Optimistic update
      if (newData !== undefined) {
        const updatedData = typeof newData === 'function' 
          ? (newData as Function)(data)
          : newData

        setData(updatedData)
        cache.set(key, {
          data: updatedData,
          timestamp: Date.now(),
          isStale: false,
        })
      }

      // Revalidation
      if (shouldRevalidate) {
        await fetchData(true)
      }
    },
    [key, data, fetchData]
  )

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    revalidate: () => fetchData(true),
  }
}

// Helper pour invalider le cache
export function invalidateCache(pattern?: string | RegExp) {
  if (!pattern) {
    cache.clear()
    return
  }

  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
  
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key)
    }
  }
}

// Helper pour précharger des données
export async function prefetchData<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<void> {
  try {
    const data = await fetcher()
    cache.set(key, {
      data,
      timestamp: Date.now(),
      isStale: false,
    })
  } catch (error) {
    console.error('Prefetch failed:', error)
  }
}
