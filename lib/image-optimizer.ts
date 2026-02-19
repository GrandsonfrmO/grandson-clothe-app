/**
 * Image Optimizer
 * Generates optimized Cloudinary URLs for different sections and screen sizes
 */

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

/**
 * Generate Cloudinary URL with transformations
 */
export function generateCloudinaryUrl(
  imageUrl: string,
  options: {
    width?: number
    height?: number
    crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb' | 'pad'
    quality?: 'auto' | number
    format?: 'auto' | 'webp' | 'jpg' | 'png'
    gravity?: 'auto' | 'face' | 'center'
    aspectRatio?: string
  } = {}
): string {
  // Vérifier si imageUrl est défini
  if (!imageUrl) {
    return '/images/products/placeholder.svg'
  }

  // If it's already a Cloudinary URL, extract the public ID
  if (imageUrl.includes('res.cloudinary.com')) {
    const match = imageUrl.match(/\/upload\/(.+?)(?:\?|$)/)
    if (match) {
      imageUrl = match[1]
    }
  }

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    gravity = 'auto',
    aspectRatio,
  } = options

  const transformations: string[] = []

  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  if (aspectRatio) transformations.push(`ar_${aspectRatio}`)
  transformations.push(`c_${crop}`)
  transformations.push(`g_${gravity}`)
  transformations.push(`q_${quality}`)
  transformations.push(`f_${format}`)

  const transformationString = transformations.join(',')
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformationString}/${imageUrl}`
}

/**
 * Hero Banner Image - Responsive for different screen sizes
 * Mobile: 400x300, Tablet: 800x600, Desktop: 1200x800
 */
export function getHeroBannerImageUrl(imageUrl: string, screenSize: 'mobile' | 'tablet' | 'desktop' = 'desktop'): string {
  const sizes = {
    mobile: { width: 400, height: 300, aspectRatio: '4:3' },
    tablet: { width: 800, height: 600, aspectRatio: '4:3' },
    desktop: { width: 1200, height: 800, aspectRatio: '3:2' },
  }

  const size = sizes[screenSize]
  return generateCloudinaryUrl(imageUrl, {
    width: size.width,
    height: size.height,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    format: 'auto',
  })
}

/**
 * Category Image - Square format for grid display
 * Mobile: 150x150, Tablet: 200x200, Desktop: 250x250
 */
export function getCategoryImageUrl(imageUrl: string, screenSize: 'mobile' | 'tablet' | 'desktop' = 'desktop'): string {
  const sizes = {
    mobile: { width: 150, height: 150 },
    tablet: { width: 200, height: 200 },
    desktop: { width: 250, height: 250 },
  }

  const size = sizes[screenSize]
  return generateCloudinaryUrl(imageUrl, {
    width: size.width,
    height: size.height,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto',
    format: 'auto',
  })
}

/**
 * Video Thumbnail - 16:9 aspect ratio
 * Mobile: 200x112, Tablet: 300x169, Desktop: 400x225
 */
export function getVideoThumbnailUrl(imageUrl: string, screenSize: 'mobile' | 'tablet' | 'desktop' = 'desktop'): string {
  // If it's an external URL (not Cloudinary), return it as-is with query params for sizing
  if (!imageUrl.includes('res.cloudinary.com') && !imageUrl.includes('cloudinary')) {
    const sizes = {
      mobile: { width: 200, height: 112 },
      tablet: { width: 300, height: 169 },
      desktop: { width: 400, height: 225 },
    }
    const size = sizes[screenSize]
    const separator = imageUrl.includes('?') ? '&' : '?'
    return `${imageUrl}${separator}w=${size.width}&h=${size.height}&fit=crop`
  }

  const sizes = {
    mobile: { width: 200, height: 112 },
    tablet: { width: 300, height: 169 },
    desktop: { width: 400, height: 225 },
  }

  const size = sizes[screenSize]
  return generateCloudinaryUrl(imageUrl, {
    width: size.width,
    height: size.height,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    format: 'auto',
  })
}

/**
 * Product Image - Flexible sizing
 * Mobile: 200x200, Tablet: 300x300, Desktop: 400x400
 */
export function getProductImageUrl(imageUrl: string, screenSize: 'mobile' | 'tablet' | 'desktop' = 'desktop'): string {
  const sizes = {
    mobile: { width: 200, height: 200 },
    tablet: { width: 300, height: 300 },
    desktop: { width: 400, height: 400 },
  }

  const size = sizes[screenSize]
  return generateCloudinaryUrl(imageUrl, {
    width: size.width,
    height: size.height,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    format: 'auto',
  })
}

/**
 * Promo Card Image - Wide format
 * Mobile: 300x180, Tablet: 500x300, Desktop: 800x480
 */
export function getPromoCardImageUrl(imageUrl: string, screenSize: 'mobile' | 'tablet' | 'desktop' = 'desktop'): string {
  const sizes = {
    mobile: { width: 300, height: 180 },
    tablet: { width: 500, height: 300 },
    desktop: { width: 800, height: 480 },
  }

  const size = sizes[screenSize]
  return generateCloudinaryUrl(imageUrl, {
    width: size.width,
    height: size.height,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    format: 'auto',
  })
}

/**
 * Get responsive srcset for different screen sizes
 */
export function getResponsiveSrcSet(
  imageUrl: string,
  type: 'hero' | 'category' | 'video' | 'product' | 'promo'
): string {
  const getUrl = {
    hero: getHeroBannerImageUrl,
    category: getCategoryImageUrl,
    video: getVideoThumbnailUrl,
    product: getProductImageUrl,
    promo: getPromoCardImageUrl,
  }[type]

  return [
    `${getUrl(imageUrl, 'mobile')} 400w`,
    `${getUrl(imageUrl, 'tablet')} 800w`,
    `${getUrl(imageUrl, 'desktop')} 1200w`,
  ].join(', ')
}

/**
 * Get sizes attribute for responsive images
 */
export function getResponsiveSizes(type: 'hero' | 'category' | 'video' | 'product' | 'promo'): string {
  const sizes = {
    hero: '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw',
    category: '(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw',
    video: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    product: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
    promo: '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw',
  }

  return sizes[type]
}
