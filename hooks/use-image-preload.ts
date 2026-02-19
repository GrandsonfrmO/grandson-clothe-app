'use client'

/**
 * 🚀 HOOK DE PRÉCHARGEMENT INTELLIGENT D'IMAGES
 * 
 * Précharge automatiquement les images en fonction du comportement utilisateur
 * - Précharge les images visibles
 * - Précharge les images au hover
 * - Précharge les images de la page suivante
 */

import { useEffect } from 'react'
import { useImageOptimization } from '@/lib/image-provider'

interface UseImagePreloadOptions {
  images: string[]
  enabled?: boolean
  priority?: 'high' | 'low'
}

export function useImagePreload({
  images,
  enabled = true,
  priority = 'low',
}: UseImagePreloadOptions) {
  const { preloadImages } = useImageOptimization()

  useEffect(() => {
    if (!enabled || images.length === 0) return

    if (priority === 'high') {
      // Préchargement immédiat pour les images prioritaires
      preloadImages(images)
    } else {
      // Préchargement pendant l'idle time pour les images non prioritaires
      if ('requestIdleCallback' in window) {
        const idleCallback = (window as any).requestIdleCallback(() => {
          preloadImages(images)
        })
        return () => (window as any).cancelIdleCallback(idleCallback)
      } else {
        // Fallback pour les navigateurs qui ne supportent pas requestIdleCallback
        const timeout = setTimeout(() => {
          preloadImages(images)
        }, 100)
        return () => clearTimeout(timeout)
      }
    }
  }, [images, enabled, priority, preloadImages])
}

// Hook pour précharger les images au hover
export function useHoverPreload(imageUrl: string) {
  const { preloadImage } = useImageOptimization()

  const handleMouseEnter = () => {
    preloadImage(imageUrl).catch(() => {})
  }

  return { onMouseEnter: handleMouseEnter }
}

// Hook pour précharger les images de la page suivante
export function useNextPagePreload(nextPageImages: string[]) {
  const { preloadImages } = useImageOptimization()

  useEffect(() => {
    // Précharger après un court délai
    const timeout = setTimeout(() => {
      preloadImages(nextPageImages)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [nextPageImages, preloadImages])
}
