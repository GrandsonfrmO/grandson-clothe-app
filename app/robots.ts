import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://votre-domaine.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/panier',
          '/checkout',
          '/checkout-guest',
          '/checkout-choice',
          '/commandes/',
          '/profil',
          '/parametres/',
          '/favoris',
          '/adresses',
          '/notifications',
          '/paiement',
          '/payment-success',
          '/payment-failure',
          '/order-confirmation',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
