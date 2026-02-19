import { useEffect } from 'react'
import { prefetchCriticalResources } from '@/lib/prefetch-strategy'

export function usePrefetch() {
  useEffect(() => {
    // Prefetch critical resources on app load
    if (typeof window !== 'undefined') {
      // Use requestIdleCallback if available, otherwise setTimeout
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          prefetchCriticalResources()
        })
      } else {
        setTimeout(() => {
          prefetchCriticalResources()
        }, 1000)
      }
    }
  }, [])
}

export function usePrefetchOnHover(url: string) {
  return {
    onMouseEnter: () => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        requestIdleCallback(() => {
          import('@/lib/request-cache').then(({ cachedFetch }) => {
            cachedFetch(url)
          })
        })
      }
    },
  }
}
