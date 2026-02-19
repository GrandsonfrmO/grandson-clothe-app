import { useEffect, useState, useRef } from 'react'
import { cachedFetch } from '@/lib/request-cache'

interface UseOptimizedApiOptions {
  ttl?: number
  skip?: boolean
  onError?: (error: Error) => void
}

export function useOptimizedApi<T>(
  url: string,
  options: UseOptimizedApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(!options.skip)
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

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await cachedFetch<T>(url, undefined, options.ttl)
        
        if (isMountedRef.current) {
          setData(result)
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        if (isMountedRef.current) {
          setError(error)
          options.onError?.(error)
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
      }
    }

    fetchData()
  }, [url, options])

  return { data, loading, error }
}

// Batch multiple API calls
export function useBatchApi<T extends Record<string, any>>(
  urls: Record<string, string>,
  options: UseOptimizedApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(!options.skip)
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

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all URLs in parallel
        const results = await Promise.all(
          Object.entries(urls).map(([key, url]) =>
            cachedFetch(url, undefined, options.ttl).then(data => [key, data])
          )
        )

        if (isMountedRef.current) {
          const combined = Object.fromEntries(results) as T
          setData(combined)
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        if (isMountedRef.current) {
          setError(error)
          options.onError?.(error)
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
      }
    }

    fetchData()
  }, [JSON.stringify(urls), options])

  return { data, loading, error }
}
