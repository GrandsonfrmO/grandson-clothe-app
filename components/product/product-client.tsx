"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProductImage } from "@/components/ui/product-image"
import { useCart } from "@/lib/cart-context"
import { useFavoritesContext } from "@/lib/favorites-context"
import { useAuth } from "@/lib/auth-context"
import { Heart, Share, Star, ShoppingBag, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

interface ProductClientProps {
  product: any
}

export function ProductClient({ product }: ProductClientProps) {
  const { addItem } = useCart()
  const { toggleFavorite, isFavorite } = useFavoritesContext()
  const { user } = useAuth()
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedImage, setSelectedImage] = useState(0)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewTitle, setReviewTitle] = useState("")
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)
  
  const isProductFavorite = isFavorite(product.id)
  const price = parseFloat(product.price)
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : null

  const handleAddToCart = () => {
    if (product.sizes.length > 0 && !selectedSize) {
      toast.error("Veuillez sélectionner une taille")
      return
    }
    
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error("Veuillez sélectionner une couleur")
      return
    }
    
    addItem({
      id: product.id,
      name: product.name,
      price: price,
      image: (product.images && product.images[0]) || '/images/products/placeholder.svg',
      size: selectedSize,
      color: selectedColor
    })
    
    toast.success("Produit ajouté au panier !")
  }

  const handleToggleFavorite = () => {
    const favoriteProduct = {
      id: product.id,
      name: product.name,
      price: price,
      originalPrice: originalPrice,
      images: product.images,
      category: product.category?.name || 'Produit',
      isNew: product.isNew,
      description: product.description || '',
      features: product.features,
      sizes: product.sizes,
      colors: product.colors || [],
      rating: parseFloat(product.rating),
      reviews: product.reviewCount,
      inStock: product.stock > 0
    }
    
    toggleFavorite(favoriteProduct)
  }

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour laisser un avis")
      return
    }

    if (rating === 0) {
      toast.error("Veuillez sélectionner une note")
      return
    }

    setSubmittingReview(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          productId: product.id,
          rating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de l\'ajout de l\'avis')
      }

      toast.success("Avis ajouté avec succès !")
      setRating(0)
      setReviewTitle("")
      setReviewComment("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'ajout de l'avis")
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <main className="space-y-6">
      {/* Product Images */}
      <div className="relative">
        <div className="aspect-square bg-secondary mx-4 rounded-2xl overflow-hidden">
          <ProductImage
            src={product.images[selectedImage] || "/placeholder.svg"}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-full"
            priority
          />
        </div>
        
        {/* Image Thumbnails */}
        {product.images.length > 1 && (
          <div className="flex gap-2 px-4 mt-4 overflow-x-auto">
            {product.images.map((image: string, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  "w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all",
                  selectedImage === index 
                    ? "border-accent" 
                    : "border-transparent"
                )}
              >
                <ProductImage
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  width={64}
                  height={64}
                  className="w-full h-full"
                />
              </button>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleToggleFavorite}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all",
              isProductFavorite
                ? "bg-accent text-accent-foreground"
                : "bg-background/60 text-foreground"
            )}
          >
            <Heart className={cn("w-5 h-5", isProductFavorite && "fill-current")} />
          </button>
          <button className="w-10 h-10 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center">
            <Share className="w-5 h-5" />
          </button>
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isNew && (
            <Badge className="bg-accent text-accent-foreground">
              Nouveau
            </Badge>
          )}
          {discount && (
            <Badge variant="destructive">
              -{discount}%
            </Badge>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="px-4 space-y-4">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider">
            {product.category?.name || 'Produit'}
          </p>
          <h1 className="text-2xl font-bold mt-1">{product.name}</h1>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < Math.floor(parseFloat(product.rating))
                    ? "fill-accent text-accent"
                    : "text-muted-foreground"
                )}
              />
            ))}
          </div>
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-sm text-muted-foreground">
            ({product.reviewCount} avis)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold">
            {price.toLocaleString()} GNF
          </span>
          {originalPrice && (
            <span className="text-lg text-muted-foreground line-through">
              {originalPrice.toLocaleString()} GNF
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            product.stock > 0 ? "bg-green-500" : "bg-red-500"
          )} />
          <span className="text-sm text-muted-foreground">
            {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
          </span>
        </div>

        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Couleur</h3>
            <div className="flex gap-2">
              {product.colors.map((color: string) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "px-4 py-2 rounded-xl border-2 transition-all",
                    selectedColor === color
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/50"
                  )}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sizes */}
        {product.sizes.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Taille</h3>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "w-12 h-12 rounded-xl border-2 font-semibold transition-all",
                    selectedSize === size
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border hover:border-accent/50"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="space-y-2">
            <h3 className="font-semibold">Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        {/* Features */}
        {product.features.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Caractéristiques</h3>
            <ul className="space-y-1">
              {product.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1 h-1 bg-accent rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Review Section */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold">Laisser un avis</h3>
          
          {!user ? (
            <p className="text-sm text-muted-foreground">
              Veuillez vous connecter pour laisser un avis
            </p>
          ) : (
            <div className="space-y-4">
              {/* Star Rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Note</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "w-8 h-8 transition-all",
                          (hoverRating || rating) >= star
                            ? "fill-accent text-accent"
                            : "text-muted-foreground"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label htmlFor="review-title" className="text-sm font-medium">
                  Titre (optionnel)
                </label>
                <Input
                  id="review-title"
                  placeholder="Résumez votre avis..."
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  maxLength={255}
                />
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <label htmlFor="review-comment" className="text-sm font-medium">
                  Commentaire (optionnel)
                </label>
                <Textarea
                  id="review-comment"
                  placeholder="Partagez votre expérience avec ce produit..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitReview}
                disabled={submittingReview || rating === 0}
                className="w-full gap-2"
              >
                <Send className="w-4 h-4" />
                {submittingReview ? "Envoi..." : "Envoyer l'avis"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="px-4 pb-4">
        <Button
          onClick={handleAddToCart}
          disabled={
            product.stock === 0 ||
            (product.sizes.length > 0 && !selectedSize) ||
            (product.colors && product.colors.length > 0 && !selectedColor)
          }
          className="w-full h-12 rounded-2xl text-base font-semibold gap-2"
        >
          <ShoppingBag className="w-5 h-5" />
          {product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
        </Button>
      </div>
    </main>
  )
}
