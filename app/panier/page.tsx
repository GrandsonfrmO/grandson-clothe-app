"use client"

import { useState, useEffect } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { ProductImage } from "@/components/ui/product-image"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Minus, Plus, Trash2, ShoppingBag, AlertTriangle, Check } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

function PanierContent() {
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart()
  const [stockStatus, setStockStatus] = useState<any>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  // Verify stock on mount and when items change
  useEffect(() => {
    if (items.length > 0) {
      verifyStock()
    }
  }, [items])

  const verifyStock = async () => {
    setIsVerifying(true)
    try {
      const response = await fetch('/api/checkout/verify-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            size: item.size,
          })),
        }),
      })

      const data = await response.json()
      setStockStatus(data)
    } catch (error) {
      console.error('Stock verification error:', error)
    } finally {
      setIsVerifying(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader title="Panier" showBack />
        
        <main className="flex flex-col items-center justify-center px-4 py-12 min-h-[60vh]">
          <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Panier vide</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-sm">
            Votre panier est vide. Découvrez nos dernières collections et ajoutez vos articles préférés.
          </p>
          <Link href="/explorer">
            <Button className="rounded-full px-8">
              Découvrir nos produits
            </Button>
          </Link>
        </main>

        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title={`Panier (${totalItems})`} showBack />
      
      <main className="px-4 py-4 space-y-4">
        {/* Stock Status Alert */}
        {stockStatus && !stockStatus.available && stockStatus.insufficientItems?.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Stock insuffisant pour:</p>
                {stockStatus.insufficientItems.map((item: any, idx: number) => (
                  <div key={idx} className="text-sm">
                    <p>{item.productName}</p>
                    <p className="text-xs">Demandé: {item.requested} • Disponible: {item.available}</p>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {stockStatus?.available && stockStatus.items?.length > 0 && (
          <Alert className="border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Tous les articles sont en stock ✓
            </AlertDescription>
          </Alert>
        )}
        {/* Cart Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={`${item.id}-${item.size}`} className="bg-card rounded-2xl p-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                  <ProductImage
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="w-full h-full"
                  />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">Taille: {item.size}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id, item.size)}
                      className="p-1 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-semibold min-w-[2ch] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold">
                        {(item.price * item.quantity).toLocaleString()} GNF
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.price.toLocaleString()} GNF/unité
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-2xl p-4 space-y-4">
          <h3 className="font-semibold">Résumé de la commande</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sous-total ({totalItems} article{totalItems > 1 ? 's' : ''})</span>
              <span>{totalPrice.toLocaleString()} GNF</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Livraison</span>
              <span className="text-muted-foreground">Calculée au checkout</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{totalPrice.toLocaleString()} GNF</span>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <div className="pt-4">
          <Link href="/checkout-choice">
            <Button 
              className="w-full h-12 rounded-2xl text-base font-semibold"
              disabled={!stockStatus?.available}
            >
              Procéder au paiement
            </Button>
          </Link>
          {!stockStatus?.available && (
            <p className="text-xs text-destructive text-center mt-2">
              Veuillez ajuster votre panier avant de continuer
            </p>
          )}
        </div>

        {/* Continue Shopping */}
        <div className="text-center">
          <Link 
            href="/explorer" 
            className="text-accent hover:underline text-sm"
          >
            Continuer mes achats
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default function PanierPage() {
  return <PanierContent />
}