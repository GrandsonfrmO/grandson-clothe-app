'use client'

/**
 * 🧠 PRÉCHARGEMENT INTELLIGENT
 * 
 * Précharge les données en fonction du comportement de l'utilisateur
 * - Hover sur un lien = précharge la page
 * - Scroll vers le bas = précharge la page suivante
 * - Visite d'un produit = précharge les produits similaires
 */

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface PrefetchConfig {
  enabled: boolean
  onHover: boolean
  onScroll: boolean
  onIdle: boolean
}

const defaultConfig: PrefetchConfig = {
  enabled: true,
  onHover: true,
  onScroll: true,
  onIdle: true,
}

export function SmartPrefetch({ config = defaultConfig }: { config?: Partial<PrefetchConfig> }) {
  const pathname = usePathname()
  const prefetchedUrls = useRef(new Set<string>())
  const finalConfig = { ...defaultConfig, ...config }

  useEffect(() => {
    if (!finalConfig.enabled) return

    // Préchargement au hover
    if (finalConfig.onHover) {
      const handleMouseEnter = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        const link = target.closest('a[href^="/"]') as HTMLAnchorElement
        
        if (link && link.href && !prefetchedUrls.current.has(link.href)) {
          prefetchedUrls.current.add(link.href)
          
          // Précharger la page
          const url = new URL(link.href)
          fetch(url.pathname, {
            method: 'HEAD',
            priority: 'low',
          } as any).catch(() => {})
        }
      }

      document.addEventListener('mouseenter', handleMouseEnter, true)
      return () => document.removeEventListener('mouseenter', handleMouseEnter, true)
    }
  }, [finalConfig])

  useEffect(() => {
    if (!finalConfig.enabled || !finalConfig.onScroll) return

    // Préchargement au scroll
    let scrollTimeout: NodeJS.Timeout
    const handleScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        const scrollPercentage = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight
        
        // Si on a scrollé à 70%, précharger la page suivante
        if (scrollPercentage > 0.7) {
          prefetchNextPage()
        }
      }, 200)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [finalConfig, pathname])

  useEffect(() => {
    if (!finalConfig.enabled || !finalConfig.onIdle) return

    // Préchargement pendant l'idle time
    if ('requestIdleCallback' in window) {
      const idleCallback = (window as any).requestIdleCallback(() => {
        prefetchCriticalData()
      })

      return () => (window as any).cancelIdleCallback(idleCallback)
    }
  }, [finalConfig])

  return null
}

// Précharger la page suivante (pagination)
function prefetchNextPage() {
  const currentUrl = new URL(window.location.href)
  const page = parseInt(currentUrl.searchParams.get('page') || '1')
  const nextPage = page + 1

  currentUrl.searchParams.set('page', nextPage.toString())
  
  fetch(currentUrl.pathname + currentUrl.search, {
    method: 'HEAD',
    priority: 'low',
  } as any).catch(() => {})
}

// Précharger les données critiques
function prefetchCriticalData() {
  const criticalEndpoints = [
    '/api/products?featured=true',
    '/api/categories',
  ]

  criticalEndpoints.forEach(endpoint => {
    fetch(endpoint, {
      priority: 'low',
    } as any).catch(() => {})
  })
}
