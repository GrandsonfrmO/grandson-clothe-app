"use client"

import { ChevronRight, TrendingUp } from "lucide-react"
import Link from "next/link"
import { ProductCard } from "./product-card"
import { useProducts } from "@/hooks/use-api"
import { Skeleton } from "@/components/ui/skeleton"

export function TrendingSection() {
  const { data, loading, error } = useProducts({ 
    limit: 4,
    // You could add a trending filter here if your API supports it
  })

  if (loading) {
    return (
      <section className="py-6">
        <div className="flex items-center justify-between px-4 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h3 className="text-xl font-bold">Tendances</h3>
          </div>
          <Link
            href="/explorer?filter=trending"
            className="flex items-center gap-1 text-sm text-accent hover:underline"
          >
            Voir tout
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-48">
              <Skeleton className="w-full h-48 rounded-lg mb-2" />
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-6">
        <div className="flex items-center justify-between px-4 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h3 className="text-xl font-bold">Tendances</h3>
          </div>
        </div>
        <div className="px-4">
          <p className="text-muted-foreground text-center py-8">
            Erreur lors du chargement des tendances
          </p>
        </div>
      </section>
    )
  }

  const products = data?.products || []

  return (
    <section className="py-6">
      <div className="flex items-center justify-between px-4 mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          <h3 className="text-xl font-bold">Tendances</h3>
        </div>
        <Link
          href="/explorer?filter=trending"
          className="flex items-center gap-1 text-sm text-accent hover:underline"
        >
          Voir tout
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x snap-mandatory">
        {products.map((product: any) => (
          <div key={product.id} className="snap-start">
            <ProductCard product={{
              id: product.id,
              name: product.name,
              price: parseFloat(product.price),
              originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : null,
              image: (product.images && product.images[0]) || '/images/products/placeholder.svg',
              category: product.category?.name || 'Produit',
              isNew: product.isNew
            }} size="large" />
          </div>
        ))}
      </div>

      {/* Trending Stats */}
      <div className="mx-4 mt-6 bg-card rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h4 className="font-semibold">Tendances cette semaine</h4>
            <p className="text-sm text-muted-foreground">Les plus populaires</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-accent">+45%</div>
            <div className="text-xs text-muted-foreground">Ventes Hoodies</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent">+32%</div>
            <div className="text-xs text-muted-foreground">Accessoires</div>
          </div>
        </div>
      </div>
    </section>
  )
}