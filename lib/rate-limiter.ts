/**
 * RATE LIMITER ULTRA-PERFORMANT
 * Limite les requêtes par IP/utilisateur pour éviter la surcharge
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Nettoyage automatique toutes les minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  async check(
    key: string,
    maxRequests: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now()
    const entry = this.limits.get(key)

    if (!entry || now > entry.resetTime) {
      // Nouvelle fenêtre
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs,
      })
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs,
      }
    }

    if (entry.count >= maxRequests) {
      // Limite atteinte
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      }
    }

    // Incrémenter le compteur
    entry.count++
    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime,
    }
  }

  reset(key: string): void {
    this.limits.delete(key)
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key)
      }
    }
  }

  getStats() {
    return {
      activeKeys: this.limits.size,
      keys: Array.from(this.limits.keys()),
    }
  }
}

// Instance globale
export const rateLimiter = new RateLimiter()

// Configurations prédéfinies
export const RATE_LIMITS = {
  // API publiques
  PRODUCTS_LIST: { maxRequests: 100, windowMs: 60000 }, // 100 req/min
  PRODUCT_DETAIL: { maxRequests: 200, windowMs: 60000 }, // 200 req/min
  
  // API authentifiées
  ORDERS_CREATE: { maxRequests: 10, windowMs: 300000 }, // 10 commandes/5min
  ORDERS_LIST: { maxRequests: 50, windowMs: 60000 }, // 50 req/min
  
  // API sensibles
  AUTH_LOGIN: { maxRequests: 5, windowMs: 300000 }, // 5 tentatives/5min
  AUTH_REGISTER: { maxRequests: 3, windowMs: 3600000 }, // 3 inscriptions/heure
  
  // Paiement
  PAYMENT_PROCESS: { maxRequests: 5, windowMs: 300000 }, // 5 paiements/5min
  
  // Admin
  ADMIN_WRITE: { maxRequests: 100, windowMs: 60000 }, // 100 req/min
}

// Helper pour extraire l'IP du client
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  return 'unknown'
}

// Middleware pour appliquer le rate limiting
export async function applyRateLimit(
  request: Request,
  config: { maxRequests: number; windowMs: number },
  identifier?: string
): Promise<{ allowed: boolean; headers: Record<string, string> }> {
  const ip = getClientIP(request)
  const key = identifier ? `${ip}:${identifier}` : ip
  
  const result = await rateLimiter.check(key, config.maxRequests, config.windowMs)
  
  const headers = {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  }
  
  if (!result.allowed) {
    headers['Retry-After'] = Math.ceil((result.resetTime - Date.now()) / 1000).toString()
  }
  
  return {
    allowed: result.allowed,
    headers,
  }
}
