'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { getThumbnailUrl, getResponsiveImageUrls } from '@/lib/cloudinary-service';

interface CloudinaryImage {
  publicId: string;
  url: string;
  thumbnail: string;
  responsive: {
    mobile: string;
    tablet: string;
    desktop: string;
    original: string;
  };
}

export function useCloudinaryImages() {
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Add an image from Cloudinary upload
   */
  const addImage = useCallback((publicId: string, url: string) => {
    const newImage: CloudinaryImage = {
      publicId,
      url,
      thumbnail: getThumbnailUrl(publicId, 'md'),
      responsive: getResponsiveImageUrls(publicId),
    };

    setImages(prev => [...prev, newImage]);
    return newImage;
  }, []);

  /**
   * Remove an image
   */
  const removeImage = useCallback(async (publicId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      setImages(prev => prev.filter(img => img.publicId !== publicId));
      toast.success('Image supprimée');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get image URLs for display
   */
  const getImageUrl = useCallback((publicId: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    return getThumbnailUrl(publicId, size);
  }, []);

  /**
   * Get responsive URLs for a product
   */
  const getResponsiveUrls = useCallback((publicId: string) => {
    return getResponsiveImageUrls(publicId);
  }, []);

  /**
   * Clear all images
   */
  const clearImages = useCallback(() => {
    setImages([]);
  }, []);

  /**
   * Set images from existing data
   */
  const setImagesFromData = useCallback((imageUrls: string[]) => {
    const newImages = imageUrls.map(url => {
      // Extract public ID from URL if possible
      const publicId = url.split('/').pop()?.split('?')[0] || url;
      return {
        publicId,
        url,
        thumbnail: getThumbnailUrl(publicId, 'md'),
        responsive: getResponsiveImageUrls(publicId),
      };
    });
    setImages(newImages);
  }, []);

  return {
    images,
    isLoading,
    addImage,
    removeImage,
    getImageUrl,
    getResponsiveUrls,
    clearImages,
    setImagesFromData,
  };
}
