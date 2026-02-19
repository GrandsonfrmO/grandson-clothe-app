/**
 * Cloudinary Service
 * Handles all Cloudinary operations including uploads, transformations, and deletions
 */

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  bytes: number;
}

export interface CloudinaryDeleteResult {
  result: string;
}

/**
 * Upload a file to Cloudinary from a URL or buffer
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  folder: string,
  options: {
    publicId?: string;
    resourceType?: 'image' | 'video' | 'auto';
    transformation?: any[];
  } = {}
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: options.publicId,
        resource_type: options.resourceType || 'auto',
        transformation: options.transformation,
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result as CloudinaryUploadResult);
        }
      }
    );

    if (typeof file === 'string') {
      // If it's a URL, use upload instead
      cloudinary.uploader.upload(
        file,
        {
          folder,
          public_id: options.publicId,
          resource_type: options.resourceType || 'auto',
          transformation: options.transformation,
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as CloudinaryUploadResult);
          }
        }
      );
    } else {
      // If it's a buffer, use stream
      uploadStream.end(file);
    }
  });
}

/**
 * Delete a file from Cloudinary
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<CloudinaryDeleteResult> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      { resource_type: resourceType },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result as CloudinaryDeleteResult);
        }
      }
    );
  });
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb';
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    gravity?: string;
  } = {}
): string {
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    gravity = 'auto',
  } = options;

  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const transformationString = transformations.length
    ? `/${transformations.join(',')}`
    : '';

  return `https://res.cloudinary.com/${cloudName}/image/upload${transformationString}/${publicId}`;
}

/**
 * Get thumbnail URL
 */
export function getThumbnailUrl(publicId: string, size: 'sm' | 'md' | 'lg' = 'md'): string {
  const sizes = {
    sm: { width: 150, height: 150 },
    md: { width: 300, height: 300 },
    lg: { width: 600, height: 600 },
  };

  const { width, height } = sizes[size];
  return getOptimizedImageUrl(publicId, {
    width,
    height,
    crop: 'fill',
    quality: 'auto',
    format: 'webp',
  });
}

/**
 * Get responsive image URLs for different screen sizes
 */
export function getResponsiveImageUrls(publicId: string) {
  return {
    mobile: getOptimizedImageUrl(publicId, { width: 400, height: 400 }),
    tablet: getOptimizedImageUrl(publicId, { width: 600, height: 600 }),
    desktop: getOptimizedImageUrl(publicId, { width: 800, height: 800 }),
    original: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`,
  };
}

/**
 * Batch delete multiple files
 */
export async function batchDeleteFromCloudinary(
  publicIds: string[],
  resourceType: 'image' | 'video' = 'image'
): Promise<CloudinaryDeleteResult[]> {
  return Promise.all(
    publicIds.map(publicId => deleteFromCloudinary(publicId, resourceType))
  );
}

/**
 * Get resource info from Cloudinary
 */
export async function getResourceInfo(publicId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    cloudinary.api.resource(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * List resources in a folder
 */
export async function listResourcesInFolder(folder: string): Promise<any> {
  return new Promise((resolve, reject) => {
    cloudinary.api.resources(
      { type: 'upload', prefix: folder, max_results: 500 },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
}
