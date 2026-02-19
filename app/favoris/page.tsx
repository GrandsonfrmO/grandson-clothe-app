"use client"

import { useState, useEffect } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { ProductCard } from "@/components/home/product-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useFavoritesContext } from "@/lib/favorites-context"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/hooks/use-api"
import { Heart, Grid, List } from "lucide-react"
import { toast } from "sonner"

function FavorisContent() {
  const { favorites, totalFavorites } = useFavoritesContext()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Sync favorites with API on mount
  useEffect(() => {
    const syncFavorites = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        // Fetch favorites from API
        const response = await apiClient.getFavorites()
        // The local context will handle the display
      } catch (error) {
        console.error('Error syncing favorites:', error)
      } finally {
        setLoading(false)
      }
    }

    syncFavorites()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader title="Favoris" showBack />
        <main className="px-4 py-6">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  if (totalFavorites === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader title="Favoris" showBack />
        
        <main className="min-h-[60vh]">
          <EmptyState
            icon={Heart}
            title="Aucun favori"
            description="Vous n'avez pas encore ajouté de produits à vos favoris. Explorez notre collection et sauvegardez vos coups de cœur."
            actionLabel="Découvrir nos produits"
            actionHref="/explorer"
          />
        </main>

        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title={`Favoris (${totalFavorites})`} showBack />
      
      <main className="px-4 py-4 space-y-6">
        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {totalFavorites} produit{totalFavorites > 1 ? 's' : ''} en favoris
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="rounded-xl"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="rounded-xl"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Favorites Grid */}
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-2 gap-4" 
            : "space-y-4"
        }>
          {favorites.map((product) => (
            <ProductCard 
              key={product.id} 
              product={{
                id: product.id,
                name: product.name,
                price: typeof product.price === 'string' 
                  ? parseFloat(product.price) 
                  : product.price,
                originalPrice: product.originalPrice 
                  ? (typeof product.originalPrice === 'string' 
                      ? parseFloat(product.originalPrice) 
                      : product.originalPrice)
                  : null,
                image: product.images?.[0] || '/placeholder.jpg',
                category: product.category || 'Produit',
                isNew: product.isNew || false
              }}
              size={viewMode === "grid" ? "default" : "large"}
            />
          ))}
        </div>

        {/* Recommendations */}
        <div className="bg-card rounded-2xl p-4 space-y-4">
          <h3 className="font-semibold">Vous pourriez aussi aimer</h3>
          <p className="text-sm text-muted-foreground">
            Découvrez des produits similaires à vos favoris
          </p>
          <Button variant="outline" className="w-full rounded-xl">
            Voir les recommandations
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default function FavorisPage() {
  return (
    <ProtectedRoute>
      <FavorisContent />
    </ProtectedRoute>
  )
}