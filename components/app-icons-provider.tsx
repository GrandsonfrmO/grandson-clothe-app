'use client'

import { useAppIcons } from '@/hooks/use-app-icons'
import { useEffect } from 'react'

export function AppIconsProvider({ children }: { children: React.ReactNode }) {
  const { activeIcon, loading } = useAppIcons()

  // Mettre à jour le document title et les meta tags
  useEffect(() => {
    if (activeIcon && !loading) {
      // Mettre à jour le titre si nécessaire
      if (document.title === 'GRANDSON CLOTHES' || document.title.includes('GRANDSON')) {
        // Le titre est déjà correct, ne pas le changer
      }
    }
  }, [activeIcon, loading])

  return <>{children}</>
}

// Composant pour afficher les icônes dans le head (côté serveur)
export function AppIconsHead({ 
  faviconUrl = '/favicon.ico',
  appleTouchIconUrl = '/apple-icon.png',
  themeColor = '#000000',
  backgroundColor = '#ffffff'
}: {
  faviconUrl?: string
  appleTouchIconUrl?: string
  themeColor?: string
  backgroundColor?: string
}) {
  return (
    <>
      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href={faviconUrl} />
      <link rel="shortcut icon" href={faviconUrl} />
      
      {/* Apple Touch Icon */}
      <link rel="apple-touch-icon" href={appleTouchIconUrl} />
      <link rel="apple-touch-icon" sizes="180x180" href={appleTouchIconUrl} />
      
      {/* Couleurs du thème */}
      <meta name="theme-color" content={themeColor} />
      <meta name="msapplication-TileColor" content={backgroundColor} />
      
      {/* PWA Meta Tags */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="GRANDSON CLOTHES" />
      
      {/* Manifest */}
      <link rel="manifest" href="/manifest.json" />
    </>
  )
}