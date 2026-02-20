'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getThumbnailUrl, getResponsiveImageUrls } from '@/lib/cloudinary-service';

interface CloudinaryImageProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  priority?: boolean;
  fill?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
}

/**
 * Optimized Cloudinary image component
 * Automatically handles responsive images and optimization
 */
export function CloudinaryImage({
  publicId,
  alt,
  width,
  height,
  size = 'md',
  className = '',
  priority = false,
  fill = false,
  objectFit = 'cover',
}: CloudinaryImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get optimized URL
  const imageUrl = getThumbnailUrl(publicId, size);

  // Get responsive URLs for srcSet
  const responsiveUrls = getResponsiveImageUrls(publicId);

  if (!mounted) {
    // Return placeholder during SSR to avoid hydration mismatch
    return (
      <div
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
      />
    );
  }

  if (error) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Image non disponible</span>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className={`${isLoading ? 'blur-sm' : 'blur-0'} transition-all duration-300 ${className}`}
        style={{ objectFit }}
        priority={priority}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => setError(true)}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width || 300}
      height={height || 300}
      className={`${isLoading ? 'blur-sm' : 'blur-0'} transition-all duration-300 ${className}`}
      style={{ objectFit }}
      priority={priority}
      onLoadingComplete={() => setIsLoading(false)}
      onError={() => setError(true)}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    />
  );
}

/**
 * Simple Cloudinary image component (without Next.js Image optimization)
 * Use when you need a simple img tag
 */
export function CloudinaryImageSimple({
  publicId,
  alt,
  width,
  height,
  size = 'md',
  className = '',
}: Omit<CloudinaryImageProps, 'fill' | 'priority' | 'objectFit'>) {
  const imageUrl = getThumbnailUrl(publicId, size);

  return (
    <img
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
    />
  );
}

/**
 * Responsive Cloudinary image component
 * Shows different images based on screen size
 */
export function CloudinaryResponsiveImage({
  publicId,
  alt,
  className = '',
  priority = false,
}: Omit<CloudinaryImageProps, 'width' | 'height' | 'size' | 'fill' | 'objectFit'>) {
  const responsiveUrls = getResponsiveImageUrls(publicId);

  return (
    <picture>
      <source media="(max-width: 640px)" srcSet={responsiveUrls.mobile} />
      <source media="(max-width: 1024px)" srcSet={responsiveUrls.tablet} />
      <source media="(min-width: 1025px)" srcSet={responsiveUrls.desktop} />
      <img
        src={responsiveUrls.original}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
      />
    </picture>
  );
}
