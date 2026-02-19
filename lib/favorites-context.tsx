"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useFavorites } from "@/hooks/use-favorites"
import type { Product } from "@/lib/mock-data"

interface FavoritesContextType {
  favorites: Product[]
  addToFavorites: (product: Product) => void
  removeFromFavorites: (productId: number) => void
  toggleFavorite: (product: Product) => void
  isFavorite: (productId: number) => boolean
  clearFavorites: () => void
  totalFavorites: number
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const favoritesData = useFavorites()

  return (
    <FavoritesContext.Provider value={favoritesData}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavoritesContext() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error("useFavoritesContext must be used within a FavoritesProvider")
  }
  return context
}