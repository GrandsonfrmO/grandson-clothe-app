'use client'

import { useEffect, useState } from 'react'
import { getMonitor } from '@/lib/performance-monitor'

export function PerformanceMonitor() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const monitor = getMonitor()

    // Record page load time
    if (typeof window !== 'undefined' && window.performance) {
      const perfData = window.performance.timing
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
      if (pageLoadTime > 0) {
        monitor.recordMetric('page_load_time', pageLoadTime, 'ms')
      }

      // Record First Contentful Paint (FCP)
      const paintEntries = performance.getEntriesByType('paint')
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          monitor.recordMetric('first_contentful_paint', entry.startTime, 'ms')
        }
      })

      // Record Largest Contentful Paint (LCP) if available
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1]
            monitor.recordMetric('largest_contentful_paint', lastEntry.startTime, 'ms')
          })
          observer.observe({ entryTypes: ['largest-contentful-paint'] })
        } catch (e) {
          // LCP observer not supported
        }
      }
    }
  }, [mounted])

  return null
}
