'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

interface UseBackNavigationOptions {
  fallbackUrl?: string
}

export function useBackNavigation({ fallbackUrl = '/' }: UseBackNavigationOptions = {}) {
  const router = useRouter()

  const goBack = useCallback(() => {
    // Vérifier s'il y a un historique de navigation
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      // Fallback vers l'URL spécifiée si pas d'historique
      router.push(fallbackUrl)
    }
  }, [router, fallbackUrl])

  const goToUrl = useCallback((url: string) => {
    router.push(url)
  }, [router])

  return {
    goBack,
    goToUrl,
    router
  }
}