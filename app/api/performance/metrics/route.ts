/**
 * 🎯 API MÉTRIQUES DE PERFORMANCE
 * - Retourne les stats du cache
 * - Temps de réponse moyen
 * - Uniquement en dev
 */

import { NextResponse } from 'next/server'
import { ultraCache } from '@/lib/ultra-cache'

export async function GET() {
  // Uniquement en développement
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const stats = ultraCache.getStats()

  return NextResponse.json({
    cacheHitRate: stats.hitRate,
    avgResponseTime: 50, // Simulé pour l'instant
    totalRequests: stats.hits + stats.misses,
    cacheSize: `${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`,
  })
}
