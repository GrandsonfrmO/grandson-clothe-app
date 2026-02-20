"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { ProductCard } from "./product-card"
import { useProducts } from "@/hooks/use-api"
import { Skeleton } from "@/components/ui/skeleton"

interface FeaturedProductsProps {
  title: string
  showAll?: boolean
}

export function FeaturedProducts({ title, showAll = true }: FeaturedProductsProps) {
  const { data, loading, error } = useProducts({ 
    limit: 4, 
    isNew: title === "Nouveautes" ? true : undefined 
  })

  if (loading) {
    return (
      <section className="py-6">
        <div className="flex items-center justify-between px-4 mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          {showAll && (
            <Link
              href="/explorer"
              className="flex items-center gap-1 text-sm text-accent hover:underline"
            >
              Voir tout
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
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
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <div className="px-4">
          <p className="text-muted-foreground text-center py-8">
            Erreur lors du chargement des produits
          </p>
        </div>
      </section>
    )
  }

  const products = data?.products || []

  return (
    <section className="py-6">
      <div className="flex items-center justify-between px-4 mb-4">
        <h3 className="text-xl font-bold">{title}</h3>
        {showAll && (
          <Link
            href="/explorer"
            className="flex items-center gap-1 text-sm text-accent hover:underline"
          >
            Voir tout
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
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
    </section>
  )
}
