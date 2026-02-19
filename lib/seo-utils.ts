/**
 * Utilitaires SEO - Code invisible pour optimiser Google
 * AUCUN impact visuel sur le site
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://votre-domaine.com'
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Boutique E-commerce'

interface Product {
  id: number
  name: string
  description?: string
  price: string
  original_price?: string
  images?: string[]
  rating?: string
  review_count?: number
  stock?: number
  category?: { name: string }
}

/**
 * Génère les données structurées pour un produit (invisible)
 */
export function generateProductJsonLd(product: Product) {
  const price = parseFloat(product.price)
  const images = product.images || []
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.name,
    image: images,
    brand: {
      '@type': 'Brand',
      name: siteName,
    },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/produit/${product.id}`,
      priceCurrency: 'GNF',
      price: price,
      availability: product.stock && product.stock > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: siteName,
      },
    },
    aggregateRating: product.rating && product.review_count ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.review_count,
      bestRating: '5',
      worstRating: '1',
    } : undefined,
  }
}

/**
 * Génère les données pour une liste de produits (invisible)
 */
export function generateProductListJsonLd(products: Product[], listName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        url: `${siteUrl}/produit/${product.id}`,
        image: product.images?.[0],
        offers: {
          '@type': 'Offer',
          price: parseFloat(product.price),
          priceCurrency: 'GNF',
        },
      },
    })),
  }
}

/**
 * Génère le fil d'Ariane pour Google (invisible)
 */
export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  }
}
