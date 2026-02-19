'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  objectFit?: 'cover' | 'contain' | 'fill'
  quality?: number
  sizes?: string
}

export function OptimizedImageV2({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  objectFit = 'cover',
  quality = 75,
  sizes,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  // Optimize Cloudinary URLs
  const optimizedSrc = optimizeCloudinaryUrl(src, width, height, quality)

  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/50 to-muted animate-pulse" />
      )}

      {!error ? (
        fill ? (
          <Image
            src={optimizedSrc}
            alt={alt}
            fill
            priority={priority}
            quality={quality}
            sizes={sizes}
            className={cn(
              'transition-opacity duration-300',
              isLoading ? 'opacity-0' : 'opacity-100',
              `object-${objectFit}`
            )}
            onLoadingComplete={() => setIsLoading(false)}
            onError={() => {
              setError(true)
              setIsLoading(false)
            }}
          />
        ) : (
          <Image
            src={optimizedSrc}
            alt={alt}
            width={width || 400}
            height={height || 300}
            priority={priority}
            quality={quality}
            sizes={sizes}
            className={cn(
              'w-full h-full transition-opacity duration-300',
              isLoading ? 'opacity-0' : 'opacity-100',
              `object-${objectFit}`
            )}
            onLoadingComplete={() => setIsLoading(false)}
            onError={() => {
              setError(true)
              setIsLoading(false)
            }}
          />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
          <span className="text-sm">Image non disponible</span>
        </div>
      )}
    </div>
  )
}

function optimizeCloudinaryUrl(
  url: string,
  width?: number,
  height?: number,
  quality: number = 75
): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url
  }

  try {
    // Parse Cloudinary URL
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/upload/')

    if (pathParts.length !== 2) return url

    const [basePath, imagePath] = pathParts

    // Build transformation parameters
    const transforms: string[] = []

    // Quality optimization
    transforms.push(`q_${Math.min(quality, 85)}`)

    // Auto format (WebP for modern browsers)
    transforms.push('f_auto')

    // Responsive sizing
    if (width) {
      transforms.push(`w_${width}`)
    }
    if (height) {
      transforms.push(`h_${height}`)
    }

    // Combine transforms
    const transformString = transforms.join(',')
    const optimizedUrl = `${basePath}/upload/${transformString}/${imagePath}`

    return optimizedUrl
  } catch (error) {
    console.warn('Failed to optimize Cloudinary URL:', error)
    return url
  }
}
