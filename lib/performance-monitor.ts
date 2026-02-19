// Real-time performance monitoring
interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
}

interface PerformanceThreshold {
  metric: string
  warning: number
  critical: number
}

const metrics: PerformanceMetric[] = []
const MAX_METRICS = 10000

const DEFAULT_THRESHOLDS: PerformanceThreshold[] = [
  { metric: 'api_response_time', warning: 500, critical: 1000 },
  { metric: 'page_load_time', warning: 2000, critical: 5000 },
  { metric: 'database_query_time', warning: 200, critical: 500 },
  { metric: 'cache_hit_ratio', warning: 0.5, critical: 0.3 },
  { metric: 'memory_usage', warning: 100, critical: 200 },
]

export class PerformanceMonitor {
  private thresholds: Map<string, PerformanceThreshold>
  private cacheHits = 0
  private cacheMisses = 0

  constructor(customThresholds?: PerformanceThreshold[]) {
    this.thresholds = new Map()
    const allThresholds = [...DEFAULT_THRESHOLDS, ...(customThresholds || [])]
    allThresholds.forEach((t) => this.thresholds.set(t.metric, t))
  }

  recordMetric(name: string, value: number, unit: string = 'ms'): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
    }

    metrics.push(metric)
    if (metrics.length > MAX_METRICS) {
      metrics.shift()
    }

    // Check thresholds
    const threshold = this.thresholds.get(name)
    if (threshold) {
      if (value > threshold.critical) {
        console.warn(`🔴 CRITICAL: ${name} = ${value}${unit} (threshold: ${threshold.critical})`)
      } else if (value > threshold.warning) {
        console.warn(`🟡 WARNING: ${name} = ${value}${unit} (threshold: ${threshold.warning})`)
      }
    }
  }

  recordCacheHit(): void {
    this.cacheHits++
  }

  recordCacheMiss(): void {
    this.cacheMisses++
  }

  getCacheHitRatio(): number {
    const total = this.cacheHits + this.cacheMisses
    return total > 0 ? this.cacheHits / total : 0
  }

  getMetrics(name?: string, limit: number = 100): PerformanceMetric[] {
    let filtered = metrics
    if (name) {
      filtered = metrics.filter((m) => m.name === name)
    }
    return filtered.slice(-limit)
  }

  getAverageMetric(name: string, timeWindow: number = 60000): number {
    const now = Date.now()
    const relevant = metrics.filter(
      (m) => m.name === name && now - m.timestamp < timeWindow
    )

    if (relevant.length === 0) return 0
    const sum = relevant.reduce((acc, m) => acc + m.value, 0)
    return sum / relevant.length
  }

  getPercentile(name: string, percentile: number = 95, timeWindow: number = 60000): number {
    const now = Date.now()
    const relevant = metrics
      .filter((m) => m.name === name && now - m.timestamp < timeWindow)
      .map((m) => m.value)
      .sort((a, b) => a - b)

    if (relevant.length === 0) return 0
    const index = Math.ceil((percentile / 100) * relevant.length) - 1
    return relevant[Math.max(0, index)]
  }

  getSummary(): {
    totalMetrics: number
    cacheHitRatio: number
    averageApiTime: number
    p95ApiTime: number
    averagePageLoadTime: number
  } {
    return {
      totalMetrics: metrics.length,
      cacheHitRatio: this.getCacheHitRatio(),
      averageApiTime: this.getAverageMetric('api_response_time'),
      p95ApiTime: this.getPercentile('api_response_time', 95),
      averagePageLoadTime: this.getAverageMetric('page_load_time'),
    }
  }

  clearMetrics(): void {
    metrics.length = 0
    this.cacheHits = 0
    this.cacheMisses = 0
  }

  exportMetrics(): string {
    return JSON.stringify(
      {
        metrics: metrics.slice(-1000),
        summary: this.getSummary(),
      },
      null,
      2
    )
  }
}

// Global monitor instance
let monitor: PerformanceMonitor | null = null

export function getMonitor(): PerformanceMonitor {
  if (!monitor) {
    monitor = new PerformanceMonitor()
  }
  return monitor
}

export function recordMetric(name: string, value: number, unit?: string): void {
  getMonitor().recordMetric(name, value, unit)
}

export function recordCacheHit(): void {
  getMonitor().recordCacheHit()
}

export function recordCacheMiss(): void {
  getMonitor().recordCacheMiss()
}

export function getPerformanceSummary(): any {
  return getMonitor().getSummary()
}
