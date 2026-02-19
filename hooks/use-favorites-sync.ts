"use client"

import { useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { useFavoritesContext } from "@/lib/favorites-context"
import { apiClient } from "@/hooks/use-api"
import { toast } from "sonner"

export function useFavoritesSync() {
  const { user } = useAuth()
  const { favorites, addToFavorites, removeFromFavorites } = useFavoritesContext()

  // Sync local favorites to API when user logs in
  useEffect(() => {
    const syncToAPI = async () => {
      if (!user || favorites.length === 0) return

      try {
        // Get current API favorites
        const response = await apiClient.getFavorites()
        const apiFavorites = response.favorites || []
        const apiFavoriteIds = apiFavorites.map(f => f.product.id)

        // Add local favorites that are not in API
        for (const favorite of favorites) {
          if (!apiFavoriteIds.includes(favorite.id)) {
            try {
              await apiClient.addToFavorites(favorite.id)
            } catch (error) {
              console.error(`Error adding favorite ${favorite.id}:`, error)
            }
          }
        }
      } catch (error) {
        console.error('Error syncing favorites to API:', error)
      }
    }

    syncToAPI()
  }, [user])

  // Sync API favorites to local storage when component mounts
  useEffect(() => {
    const syncFromAPI = async () => {
      if (!user) return

      try {
        const response = await apiClient.getFavorites()
        const apiFavorites = response.favorites || []

        // Add API favorites to local storage
        for (const favorite of apiFavorites) {
          if (favorite.product) {
            addToFavorites({
              id: favorite.product.id,
              name: favorite.product.name,
              price: favorite.product.price,
              originalPrice: favorite.product.originalPrice,
              images: favorite.product.images,
              category: favorite.product.category?.name || 'Produit',
              isNew: favorite.product.isNew,
              description: favorite.product.description || '',
              features: favorite.product.features || [],
              sizes: favorite.product.sizes || [],
              colors: favorite.product.colors || [],
              rating: parseFloat(favorite.product.rating) || 0,
              reviews: favorite.product.reviewCount || 0,
              inStock: favorite.product.stock > 0
            })
          }
        }
      } catch (error) {
        console.error('Error syncing favorites from API:', error)
      }
    }

    syncFromAPI()
  }, [user, addToFavorites])

  return {
    favorites
  }
}
