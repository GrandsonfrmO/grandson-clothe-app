"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ProductImage } from "@/components/ui/product-image"
import { Heart, ShoppingBag } from "lucide-react"

const products = [
  {
    id: 1,
    name: "Hoodie Oversize Noir",
    price: 85000,
    originalPrice: null,
    image: "/images/product-hoodie-black.jpg",
    category: "Hoodies",
    isNew: true,
  },
  {
    id: 2,
    name: "T-Shirt Graphic Urban",
    price: 45000,
    originalPrice: 55000,
    image: "/images/product-tshirt-graphic.jpg",
    category: "T-Shirts",
    isNew: false,
  },
  {
    id: 3,
    name: "Cargo Pants Noir",
    price: 75000,
    originalPrice: null,
    image: "/images/product-cargo.jpg",
    category: "Pantalons",
    isNew: true,
  },
  {
    id: 4,
    name: "Bomber Jacket Classic",
    price: 120000,
    originalPrice: null,
    image: "/images/product-bomber.jpg",
    category: "Vestes",
    isNew: true,
  },
  {
    id: 5,
    name: "Joggers Tech Grey",
    price: 65000,
    originalPrice: 80000,
    image: "/images/product-joggers.jpg",
    category: "Pantalons",
    isNew: false,
  },
  {
    id: 6,
    name: "Hoodie Oversize Vert",
    price: 85000,
    originalPrice: null,
    image: "/images/product-hoodie-green.jpg",
    category: "Hoodies",
    isNew: true,
  },
  {
    id: 7,
    name: "Snapback Cap Logo",
    price: 35000,
    originalPrice: null,
    image: "/images/product-cap.jpg",
    category: "Accessoires",
    isNew: false,
  },
  {
    id: 8,
    name: "T-Shirt Essential",
    price: 40000,
    originalPrice: 50000,
    image: "/images/product-tshirt-graphic.jpg",
    category: "T-Shirts",
    isNew: false,
  },
]

interface ProductsSectionProps {
  onAddToCart?: (productId: number) => void
}

export function ProductsSection({ onAddToCart }: ProductsSectionProps) {
  const [favorites, setFavorites] = useState<number[]>([])

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'decimal',
    }).format(price) + ' GNF'
  }

  return (
    <section id="nouveautes" className="py-20 bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
          <div>
            <p className="text-accent font-medium tracking-[0.3em] mb-2 text-sm">DROP 2026</p>
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl text-foreground">
              NOUVEAUTES
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl">
              Les dernieres pieces de notre collection streetwear
            </p>
          </div>
          <Button variant="outline" className="mt-6 sm:mt-0 tracking-wider text-sm border-foreground text-foreground hover:bg-foreground hover:text-background bg-transparent">
            VOIR TOUT
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product) => (
            <div key={product.id} className="group">
              <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4">
                <ProductImage
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  width={300}
                  height={400}
                  className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.isNew && (
                    <span className="bg-accent text-accent-foreground text-xs uppercase tracking-wider px-2 py-1 font-bold">
                      NEW
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="bg-foreground text-background text-xs uppercase tracking-wider px-2 py-1 font-bold">
                      PROMO
                    </span>
                  )}
                </div>

                {/* Favorite button */}
                <div className="absolute top-3 right-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 bg-background/80 backdrop-blur-sm hover:bg-background"
                    onClick={() => toggleFavorite(product.id)}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        favorites.includes(product.id)
                          ? "fill-accent text-accent"
                          : "text-foreground"
                      }`}
                    />
                    <span className="sr-only">Ajouter aux favoris</span>
                  </Button>
                </div>

                {/* Add to cart overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <Button 
                    className="w-full text-sm tracking-wider bg-foreground text-background hover:bg-accent hover:text-accent-foreground font-bold"
                    onClick={() => onAddToCart?.(product.id)}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    AJOUTER
                  </Button>
                </div>
              </div>

              {/* Product info */}
              <div>
                <p className="text-xs text-accent tracking-[0.2em] mb-1">
                  {product.category.toUpperCase()}
                </p>
                <h3 className="font-medium text-foreground mb-2 line-clamp-1">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
