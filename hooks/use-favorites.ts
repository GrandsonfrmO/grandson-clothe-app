"use client"

import { useState, useCallback, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { dataSyncEmitter, DATA_SYNC_EVENTS } from "./use-data-sync"
import type { Product } from "@/lib/mock-data"

export function useFavorites() {
  const [favorites, setFavorites] = useState<Product[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { user, isAuthenticated } = useAuth()

  // Memoized favorites key - prevents infinite loops
  const favoritesKey = isAuthenticated && user ? `favorites_user_${user.id}` : "favorites_guest"

  // Marquer comme monté côté client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Load favorites from localStorage on mount only
  useEffect(() => {
    if (!isMounted) return
    
    const stored = localStorage.getItem(favoritesKey)
    if (stored) {
      try {
        setFavorites(JSON.parse(stored))
      } catch (error) {
        console.error('Error loading favorites:', error)
        setFavorites([])
      }
    } else {
      setFavorites([])
    }
    setIsHydrated(true)
  }, [isMounted, favoritesKey])

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(favoritesKey, JSON.stringify(favorites))
    }
  }, [favorites, favoritesKey, isHydrated])

  // Handle user authentication changes
  useEffect(() => {
    if (!isHydrated) return

    // When user logs in/out, switch favorites context
    const stored = localStorage.getItem(favoritesKey)
    if (stored) {
      try {
        setFavorites(JSON.parse(stored))
      } catch (error) {
        console.error('Error switching favorites context:', error)
        setFavorites([])
      }
    } else {
      setFavorites([])
    }
  }, [favoritesKey, isHydrated])

  const addToFavorites = useCallback((product: Product) => {
    setFavorites(prev => {
      const exists = prev.find(item => item.id === product.id)
      if (exists) return prev
      const newFavorites = [...prev, product]
      // Emit event after state update
      setTimeout(() => dataSyncEmitter.emit(DATA_SYNC_EVENTS.FAVORITE_ADDED), 0)
      return newFavorites
    })
  }, [])

  const removeFromFavorites = useCallback((productId: number) => {
    setFavorites(prev => {
      const newFavorites = prev.filter(item => item.id !== productId)
      // Emit event after state update
      setTimeout(() => dataSyncEmitter.emit(DATA_SYNC_EVENTS.FAVORITE_REMOVED), 0)
      return newFavorites
    })
  }, [])

  const toggleFavorite = useCallback((product: Product) => {
    setFavorites(prev => {
      const exists = prev.find(item => item.id === product.id)
      if (exists) {
        const newFavorites = prev.filter(item => item.id !== product.id)
        // Emit event after state update
        setTimeout(() => dataSyncEmitter.emit(DATA_SYNC_EVENTS.FAVORITE_REMOVED), 0)
        return newFavorites
      } else {
        const newFavorites = [...prev, product]
        // Emit event after state update
        setTimeout(() => dataSyncEmitter.emit(DATA_SYNC_EVENTS.FAVORITE_ADDED), 0)
        return newFavorites
      }
    })
  }, [])

  const isFavorite = useCallback((productId: number) => {
    return favorites.some(item => item.id === productId)
  }, [favorites])

  const clearFavorites = useCallback(() => {
    setFavorites([])
  }, [])

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    totalFavorites: favorites.length
  }
}