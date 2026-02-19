"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useFavoritesContext } from "@/lib/favorites-context"
import { ProductImage } from "@/components/ui/product-image"
import type { Product } from "@/lib/mock-data"

interface ProductCardProduct {
  id: number
  name: string
  price: number
  originalPrice?: number | null
  image: string
  category: string
  isNew?: boolean
}

interface ProductCardProps {
  product: ProductCardProduct
  size?: "default" | "large"
}

export function ProductCard({ product, size = "default" }: ProductCardProps) {
  const { toggleFavorite, isFavorite } = useFavoritesContext()
  const [isPressed, setIsPressed] = useState(false)
  const isProductFavorite = isFavorite(product.id)

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  return (
    <Link
      href={`/produit/${product.id}`}
      className={cn(
        "group block relative",
        size === "large" ? "min-w-[200px]" : "min-w-[160px]"
      )}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-card transition-transform duration-200",
          size === "large" ? "aspect-[3/4]" : "aspect-square",
          isPressed && "scale-[0.98]"
        )}
      >
        <ProductImage
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={size === "large" ? 200 : 160}
          height={size === "large" ? 267 : 160}
          className="w-full h-full transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isNew && (
            <span className="px-2 py-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full uppercase">
              New
            </span>
          )}
          {discount && (
            <span className="px-2 py-0.5 bg-destructive text-white text-[10px] font-bold rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            // Convert to full Product type for favorites context
            const fullProduct: Product = {
              ...product,
              images: [product.image],
              description: "",
              features: [],
              sizes: [],
              rating: 0,
              reviews: 0,
              inStock: true
            }
            toggleFavorite(fullProduct)
            
            // Show toast notification
            if (isProductFavorite) {
              // Will be removed from favorites
              import("sonner").then(({ toast }) => {
                toast.success("Retiré des favoris")
              })
            } else {
              // Will be added to favorites
              import("sonner").then(({ toast }) => {
                toast.success("Ajouté aux favoris ❤️")
              })
            }
          }}
          className={cn(
            "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
            isProductFavorite
              ? "bg-accent text-accent-foreground"
              : "bg-background/60 backdrop-blur-sm text-foreground hover:bg-background/80"
          )}
        >
          <Heart
            className={cn("w-4 h-4 transition-all", isProductFavorite && "fill-current")}
          />
        </button>
      </div>

      {/* Product info */}
      <div className="mt-3 space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {product.category}
        </p>
        <h4 className="font-medium text-sm line-clamp-1">{product.name}</h4>
        <div className="flex items-center gap-2">
          <span className="font-bold">
            {product.price.toLocaleString()} GNF
          </span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
