'use client'

import { useEffect, useState } from 'react'

/**
 * Hydration Boundary Component
 * Prevents hydration mismatches by only rendering children after mount
 */
export function HydrationBoundary({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <>{children}</>
}
