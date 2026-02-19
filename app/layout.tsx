import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { PerformanceMonitor } from "@/components/performance-monitor"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import { FavoritesProvider } from "@/lib/favorites-context"
import { ImageProvider } from "@/lib/image-provider"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://votre-domaine.com'
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Boutique E-commerce'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: "Boutique en ligne ultra-rapide avec livraison en Guinée. Découvrez nos produits de qualité à prix compétitifs.",
  keywords: ['boutique en ligne', 'e-commerce', 'shopping', 'Guinée', 'livraison rapide', 'paiement sécurisé'],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteUrl,
    siteName: siteName,
    title: siteName,
    description: "Boutique en ligne ultra-rapide avec livraison en Guinée",
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: "Boutique en ligne ultra-rapide avec livraison en Guinée",
  },
  alternates: {
    canonical: siteUrl,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/recherche?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Préconnexion aux domaines externes */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        
        {/* Schema.org pour Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ImageProvider>
          <AuthProvider>
            <CartProvider>
              <FavoritesProvider>
                {children}
                {/* <PerformanceMonitor /> */}
              </FavoritesProvider>
            </CartProvider>
          </AuthProvider>
        </ImageProvider>
      </body>
    </html>
  )
}
