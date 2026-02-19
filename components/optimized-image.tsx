'use client'

/**
 * 🚀 COMPOSANT IMAGE ULTRA-OPTIMISÉ
 * 
 * Chargement instantané des images avec :
 * - Lazy loading intelligent
 * - Blur placeholder progressif
 * - Préchargement prédictif
 * - Formats modernes (WebP, AVIF)
 * - Cache agressif
 */

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useImageOptimization } from '@/lib/image-provider'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  quality?: number
  priority?: boolean
  className?: string
  fill?: boolean
  sizes?: string
  onLoad?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width = 800,
  height,
  quality = 80,
  priority = false,
  className = '',
  fill = false,
  sizes,
  onLoad,
}: OptimizedImageProps) {
  const { optimizeImageUrl, preloadImage, isImageLoaded } = useImageOptimization()
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [mounted, setMounted] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Optimiser l'URL de l'image
  const optimizedSrc = optimizeImageUrl(src, {
    width,
    height,
    quality,
    format: 'auto',
  })

  const placeholderSrc = optimizeImageUrl(src, {
    width: 20,
    height: 20,
    quality: 10,
    blur: true,
  })

  // Préchargement intelligent avec Intersection Observer
  useEffect(() => {
    if (!mounted) return

    if (priority) {
      // Si prioritaire, précharger immédiatement
      preloadImage(optimizedSrc).catch(() => setHasError(true))
      return
    }

    // Sinon, précharger quand l'image est proche du viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            preloadImage(optimizedSrc).catch(() => setHasError(true))
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px', // Précharger 50px avant d'être visible
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [optimizedSrc, priority, preloadImage, mounted])

  // Vérifier si l'image est déjà en cache
  useEffect(() => {
    if (!mounted) return
    if (isImageLoaded(optimizedSrc)) {
      setIsLoading(false)
    }
  }, [optimizedSrc, isImageLoaded, mounted])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
  }

  if (!mounted) {
    // Return placeholder during SSR to avoid hydration mismatch
    return (
      <div
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
      />
    )
  }

  if (hasError) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    )
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder blur */}
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{
            backgroundImage: `url(${placeholderSrc})`,
            backgroundSize: 'cover',
            filter: 'blur(10px)',
            transform: 'scale(1.1)',
          }}
        />
      )}

      {/* Image principale */}
      <Image
        src={optimizedSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        quality={quality}
        priority={priority}
        sizes={sizes}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  )
}
