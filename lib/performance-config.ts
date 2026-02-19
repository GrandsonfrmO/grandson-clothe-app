// Performance optimization configuration

export const PERFORMANCE_CONFIG = {
  // Cache TTLs (in milliseconds)
  CACHE_TTL: {
    PRODUCTS: 30 * 60 * 1000,      // 30 minutes
    CATEGORIES: 60 * 60 * 1000,    // 1 hour
    ANALYTICS: 5 * 60 * 1000,      // 5 minutes
    ORDERS: 1 * 60 * 1000,         // 1 minute
    MODELS: 30 * 60 * 1000,        // 30 minutes
    GALLERY: 30 * 60 * 1000,       // 30 minutes
    SPECIAL_OFFER: 30 * 60 * 1000, // 30 minutes
  },

  // Image optimization
  IMAGE_SIZES: {
    THUMBNAIL: 64,
    SMALL: 200,
    MEDIUM: 400,
    LARGE: 800,
    HERO: 1200,
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    ADMIN_LIMIT: 50,
  },

  // Request deduplication
  REQUEST_DEDUP_TIMEOUT: 1000, // 1 second

  // Database query optimization
  QUERY_LIMITS: {
    MAX_PRODUCTS_PER_PAGE: 100,
    MAX_ORDERS_PER_PAGE: 100,
    MAX_ANALYTICS_RECORDS: 10000,
  },

  // Response compression
  COMPRESSION: {
    ENABLED: true,
    THRESHOLD: 1024, // 1KB
  },

  // HTTP headers for caching
  CACHE_HEADERS: {
    PUBLIC_CACHE: 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600',
    PRIVATE_CACHE: 'private, max-age=300',
    NO_CACHE: 'no-cache, no-store, must-revalidate',
  },
}

// Performance monitoring
export const PERFORMANCE_THRESHOLDS = {
  API_RESPONSE_TIME: 1000,      // 1 second
  PAGE_LOAD_TIME: 3000,         // 3 seconds
  IMAGE_LOAD_TIME: 2000,        // 2 seconds
  SLOW_QUERY_TIME: 500,         // 500ms
}

// Batch request configuration
export const BATCH_CONFIG = {
  ENABLED: true,
  MAX_BATCH_SIZE: 10,
  BATCH_TIMEOUT: 50, // milliseconds
}
