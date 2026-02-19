/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Ne plus ignorer les erreurs TypeScript en production
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  
  // ============================================
  // OPTIMISATION IMAGES
  // ============================================
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 an
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ============================================
  // COMPRESSION & OPTIMISATION
  // ============================================
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  
  // Suppress hydration warnings in development
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // ============================================
  // HEADERS DE SÉCURITÉ & PERFORMANCE
  // ============================================
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Sécurité
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()'
          },
          // Performance
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
        ],
      },
      // Cache statique agressif
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache API court
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600',
          },
        ],
      },
    ]
  },

  // ============================================
  // CONFIGURATION EXPÉRIMENTALE ULTRA-OPTIMISÉE
  // ============================================
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'recharts',
    ],
    serverActions: {
      bodySizeLimit: '2mb',
    },
    scrollRestoration: true,
    // ✅ Partial Prerendering (si disponible)
    ppr: false, // Activer quand stable
  },

  // ============================================
  // CONFIGURATION TURBOPACK
  // ============================================
  turbopack: {},

  // ============================================
  // OPTIMISATION DU BUNDLING
  // ============================================
  webpack: (config, { isServer }) => {
    // Optimisation de la taille du bundle
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk pour les dépendances lourdes
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
              reuseExistingChunk: true,
            },
            // Chunk séparé pour les composants UI
            ui: {
              name: 'ui',
              test: /[\\/]components[\\/]ui[\\/]/,
              chunks: 'all',
              priority: 10,
              minSize: 10000,
            },
            // Chunk pour les icônes
            icons: {
              name: 'icons',
              test: /[\\/]node_modules[\\/](lucide-react|@radix-ui)[\\/]/,
              chunks: 'all',
              priority: 15,
              minSize: 10000,
            },
            // Chunk commun
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
              minSize: 10000,
            },
          },
        },
      }
    }
    return config
  },

  // ============================================
  // VARIABLES D'ENVIRONNEMENT
  // ============================================
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
}

export default nextConfig
