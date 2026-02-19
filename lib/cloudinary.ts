/**
 * Cloudinary Configuration and Utilities
 * Handles image uploads and transformations
 */

export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'doql0wu0l',
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
};

/**
 * Generate a Cloudinary image URL with transformations
 */
export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb';
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string {
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options;

  const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload`;
  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  const transformationString = transformations.length
    ? `/${transformations.join(',')}`
    : '';

  return `${baseUrl}${transformationString}/${publicId}`;
}

/**
 * Generate upload signature for client-side uploads
 * This should be called from an API route for security
 */
export function generateUploadSignature(
  timestamp: number,
  folder?: string
): {
  signature: string;
  timestamp: number;
} {
  const crypto = require('crypto');
  const apiSecret = cloudinaryConfig.apiSecret;

  if (!apiSecret) {
    throw new Error('CLOUDINARY_API_SECRET is not configured');
  }

  const paramsToSign = {
    timestamp,
    ...(folder && { folder }),
  };

  const paramsString = Object.entries(paramsToSign)
    .sort()
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const signature = crypto
    .createHash('sha1')
    .update(paramsString + apiSecret)
    .digest('hex');

  return { signature, timestamp };
}
