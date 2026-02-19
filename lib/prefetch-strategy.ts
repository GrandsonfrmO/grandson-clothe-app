// Intelligent prefetching strategy for critical resources
import { cachedFetch } from './request-cache'

interface PrefetchConfig {
  url: string
  priority: 'high' | 'medium' | 'low'
  delay: number // ms before prefetch
  ttl: number // cache TTL
}

const prefetchQueue: PrefetchConfig[] = []
let isPrefetching = false

// Critical resources to prefetch on app load
export const CRITICAL_PREFETCH: PrefetchConfig[] = [
  {
    url: '/api/admin/categories',
    priority: 'high',
    delay: 100,
    ttl: 60 * 60 * 1000, // 1 hour
  },
  {
    url: '/api/admin/models',
    priority: 'high',
    delay: 200,
    ttl: 30 * 60 * 1000, // 30 min
  },
  {
    url: '/api/admin/gallery',
    priority: 'medium',
    delay: 300,
    ttl: 30 * 60 * 1000,
  },
  {
    url: '/api/admin/special-offer',
    priority: 'medium',
    delay: 400,
    ttl: 30 * 60 * 1000,
  },
]

export async function prefetchResource(config: PrefetchConfig): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        await cachedFetch(config.url, undefined, config.ttl)
        resolve()
      } catch (error) {
        console.error(`Prefetch failed for ${config.url}:`, error)
        resolve()
      }
    }, config.delay)
  })
}

export async function prefetchCriticalResources(): Promise<void> {
  if (isPrefetching) return

  isPrefetching = true

  // Sort by priority
  const sorted = [...CRITICAL_PREFETCH].sort((a, b) => {
    const priorityMap = { high: 0, medium: 1, low: 2 }
    return priorityMap[a.priority] - priorityMap[b.priority]
  })

  // Prefetch high priority immediately
  const highPriority = sorted.filter((c) => c.priority === 'high')
  await Promise.all(highPriority.map(prefetchResource))

  // Prefetch medium priority after high
  const mediumPriority = sorted.filter((c) => c.priority === 'medium')
  await Promise.all(mediumPriority.map(prefetchResource))

  // Prefetch low priority in background
  const lowPriority = sorted.filter((c) => c.priority === 'low')
  lowPriority.forEach(prefetchResource)

  isPrefetching = false
}

export function addPrefetchConfig(config: PrefetchConfig): void {
  prefetchQueue.push(config)
}

export function getPrefetchQueue(): PrefetchConfig[] {
  return [...prefetchQueue]
}
