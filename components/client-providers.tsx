'use client'

/**
 * 🎯 CLIENT PROVIDERS
 * 
 * Wrapper pour tous les contextes client-side
 * Permet d'avoir des Server Components au niveau supérieur
 */

import { type ReactNode } from 'react'
import { SmartInstallPrompt } from './smart-install-prompt'
import { PWARegister } from './pwa-register'
import { OfflineIndicator } from './offline-indicator'

interface ClientProvidersProps {
  children: ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <>
      {/* <PWARegister /> */}
      {/* <OfflineIndicator /> */}
      {children}
      {/* <SmartInstallPrompt /> */}
    </>
  )
}
