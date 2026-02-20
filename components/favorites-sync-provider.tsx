"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useFavoritesContext } from "@/lib/favorites-context"
import { apiClient } from "@/hooks/use-api"

export function FavoritesSyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { favorites, addToFavorites } = useFavoritesContext()

  // Sync API favorites to local storage when user logs in
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
              id: Number(favorite.product.id),
              name: favorite.product.name,
              price: Number(favorite.product.price),
              originalPrice: favorite.product.originalPrice ? Number(favorite.product.originalPrice) : undefined,
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

  return <>{children}</>
}
