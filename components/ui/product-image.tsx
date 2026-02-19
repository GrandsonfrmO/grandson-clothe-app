'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface ProductImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function ProductImage({ 
  src, 
  alt, 
  width = 400, 
  height = 400, 
  className = '',
  priority = false 
}: ProductImageProps) {
  const [mounted, setMounted] = useState(false)
  const [imgSrc, setImgSrc] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Validate and sanitize the src - handle edge cases
    const getSafeSrc = (source: string) => {
      if (!source || typeof source !== 'string' || source.trim() === '') {
        return '/images/products/placeholder.svg'
      }
      
      const trimmed = source.trim()
      
      // Check if it's a valid URL or path
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
        return trimmed
      }
      
      // If it's something weird (like 't' or other garbage), use placeholder
      if (trimmed.length < 4) {
        console.warn('Invalid image src detected:', trimmed)
        return '/images/products/placeholder.svg'
      }
      
      return trimmed
    }
    
    setImgSrc(getSafeSrc(src))
  }, [src])

  const handleError = () => {
    setHasError(true)
    setImgSrc('/images/products/placeholder.svg')
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  if (!mounted) {
    // Return placeholder during SSR to avoid hydration mismatch
    return (
      <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse bg-gray-200 w-full h-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
      
      <Image
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        unoptimized={imgSrc.endsWith('.svg')}
      />
      
      {hasError && (
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Image par défaut
        </div>
      )}
    </div>
  )
}