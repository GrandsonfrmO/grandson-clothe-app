'use client'

import { useState, useEffect } from 'react'

interface AppIcon {
  id: string
  name: string
  description?: string
  favicon_url: string
  icon_192_url: string
  icon_512_url: string
  apple_touch_icon_url: string
  maskable_icon_url?: string
  theme_color: string
  background_color: string
  is_active: boolean
}

export function useAppIcons() {
  const [activeIcon, setActiveIcon] = useState<AppIcon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadActiveIcon()
  }, [])

  const loadActiveIcon = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/app-icons/active')
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des icônes')
      }

      const data = await response.json()
      setActiveIcon(data.icon)
    } catch (err) {
      console.error('Erreur lors du chargement des icônes:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      
      // Fallback vers les icônes par défaut
      setActiveIcon({
        id: 'default',
        name: 'Icônes par défaut',
        favicon_url: '/favicon.ico',
        icon_192_url: '/icon-192.png',
        icon_512_url: '/icon-512.png',
        apple_touch_icon_url: '/apple-icon.png',
        maskable_icon_url: '/icon-512.png',
        theme_color: '#000000',
        background_color: '#ffffff',
        is_active: true
      })
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour rafraîchir les icônes
  const refreshIcons = () => {
    loadActiveIcon()
  }

  // Fonction pour appliquer les icônes au DOM
  const applyIconsToDOM = (icon: AppIcon) => {
    if (typeof window === 'undefined') return

    // Mettre à jour le favicon
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (!favicon) {
      favicon = document.createElement('link')
      favicon.rel = 'icon'
      document.head.appendChild(favicon)
    }
    favicon.href = icon.favicon_url

    // Mettre à jour l'Apple Touch Icon
    let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement
    if (!appleTouchIcon) {
      appleTouchIcon = document.createElement('link')
      appleTouchIcon.rel = 'apple-touch-icon'
      document.head.appendChild(appleTouchIcon)
    }
    appleTouchIcon.href = icon.apple_touch_icon_url

    // Mettre à jour la couleur du thème
    let themeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement
    if (!themeColor) {
      themeColor = document.createElement('meta')
      themeColor.name = 'theme-color'
      document.head.appendChild(themeColor)
    }
    themeColor.content = icon.theme_color

    // Mettre à jour la couleur de fond pour Safari
    let msapplicationTileColor = document.querySelector('meta[name="msapplication-TileColor"]') as HTMLMetaElement
    if (!msapplicationTileColor) {
      msapplicationTileColor = document.createElement('meta')
      msapplicationTileColor.name = 'msapplication-TileColor'
      document.head.appendChild(msapplicationTileColor)
    }
    msapplicationTileColor.content = icon.background_color
  }

  // Appliquer automatiquement les icônes quand elles changent
  useEffect(() => {
    if (activeIcon) {
      applyIconsToDOM(activeIcon)
    }
  }, [activeIcon])

  return {
    activeIcon,
    loading,
    error,
    refreshIcons,
    applyIconsToDOM
  }
}

// Hook pour les administrateurs avec plus de fonctionnalités
export function useAdminAppIcons() {
  const [icons, setIcons] = useState<AppIcon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAllIcons()
  }, [])

  const loadAllIcons = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/app-icons')
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des icônes')
      }

      const data = await response.json()
      setIcons(data.icons || [])
    } catch (err) {
      console.error('Erreur lors du chargement des icônes:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const activateIcon = async (iconId: string, userEmail?: string) => {
    try {
      const response = await fetch('/api/admin/app-icons/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iconId, userEmail })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de l\'activation')
      }

      await loadAllIcons()
      return true
    } catch (err) {
      console.error('Erreur lors de l\'activation:', err)
      throw err
    }
  }

  const deleteIcon = async (iconId: string) => {
    try {
      const response = await fetch(`/api/admin/app-icons/${iconId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la suppression')
      }

      await loadAllIcons()
      return true
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      throw err
    }
  }

  const createIcon = async (iconData: Partial<AppIcon>) => {
    try {
      const response = await fetch('/api/admin/app-icons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(iconData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la création')
      }

      await loadAllIcons()
      return true
    } catch (err) {
      console.error('Erreur lors de la création:', err)
      throw err
    }
  }

  const activeIcon = icons.find(icon => icon.is_active)

  return {
    icons,
    activeIcon,
    loading,
    error,
    loadAllIcons,
    activateIcon,
    deleteIcon,
    createIcon
  }
}