"use client"

import { useState, useEffect } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { CONAKRY_DELIVERY_ZONES } from "@/lib/delivery-zones"
import { Button } from "@/components/ui/button"
import { ProductImage } from "@/components/ui/product-image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  MapPin, 
  Truck,
  CheckCircle,
  Lock,
  Loader2,
  Store,
  ArrowLeft,
  AlertTriangle,
  Check
} from "lucide-react"
import { useRouter } from "next/navigation"

// Delivery zones
const deliveryZones = CONAKRY_DELIVERY_ZONES.map(zone => ({
  id: zone.id,
  name: zone.name,
  price: zone.shippingCost,
  duration: `${zone.estimatedDays} jour${zone.estimatedDays > 1 ? 's' : ''}`,
}))

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, totalPrice, clearCart } = useCart()
  const { toast } = useToast()

  // State
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isVerifyingStock, setIsVerifyingStock] = useState(false)
  const [stockStatus, setStockStatus] = useState<any>(null)
  const [addressForm, setAddressForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    address: "",
  })
  const [selectedDelivery, setSelectedDelivery] = useState("pickup")

  // Verify stock on component mount
  useEffect(() => {
    verifyStock()
  }, [items])

  // Verify stock availability
  const verifyStock = async () => {
    if (items.length === 0) return

    setIsVerifyingStock(true)
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

      if (!data.available && data.insufficientItems?.length > 0) {
        toast({
          title: "Stock insuffisant",
          description: `${data.insufficientItems[0].productName} n'a que ${data.insufficientItems[0].available} unité(s) disponible(s)`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Stock verification error:', error)
      toast({
        title: "Erreur",
        description: "Impossible de vérifier le stock",
        variant: "destructive",
      })
    } finally {
      setIsVerifyingStock(false)
    }
  }

  // Calculate delivery price
  const getDeliveryPrice = () => {
    if (selectedDelivery === "pickup") return 0
    const zone = deliveryZones.find(z => z.id === selectedDelivery)
    return zone?.price || 5000 // Tarif par défaut 5000 GNF
  }

  const deliveryPrice = getDeliveryPrice()
  const finalTotal = totalPrice + deliveryPrice

  // Validation
  const validateAddress = () => {
    if (!addressForm.firstName.trim()) {
      toast({ title: "Erreur", description: "Prénom requis", variant: "destructive" })
      return false
    }
    if (!addressForm.lastName.trim()) {
      toast({ title: "Erreur", description: "Nom requis", variant: "destructive" })
      return false
    }
    if (!addressForm.phone.trim()) {
      toast({ title: "Erreur", description: "Téléphone requis", variant: "destructive" })
      return false
    }
    if (!addressForm.address.trim()) {
      toast({ title: "Erreur", description: "Adresse requise", variant: "destructive" })
      return false
    }
    return true
  }

  // Handle next step
  const handleNextStep = () => {
    if (step === 1 && !validateAddress()) return
    
    // Check stock before proceeding to payment
    if (step === 2 && !stockStatus?.available) {
      toast({
        title: "Stock insuffisant",
        description: "Veuillez ajuster votre panier",
        variant: "destructive",
      })
      return
    }
    
    setStep(step + 1)
  }

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!validateAddress()) return
    
    // Final stock verification before order creation
    if (!stockStatus?.available) {
      toast({
        title: "Stock insuffisant",
        description: "Le stock a changé. Veuillez vérifier votre panier.",
        variant: "destructive",
      })
      await verifyStock()
      return
    }

    setIsProcessing(true)

    try {
      // Prepare order data with product names for email
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          size: item.size,
          price: item.price,
        })),
        shippingAddress: {
          firstName: addressForm.firstName,
          lastName: addressForm.lastName,
          phone: addressForm.phone,
          address: addressForm.address,
          city: "Conakry",
          commune: selectedDelivery !== "pickup" ? deliveryZones.find(z => z.id === selectedDelivery)?.name : undefined,
        },
        deliveryZoneId: selectedDelivery !== "pickup" ? selectedDelivery : undefined,
        paymentMethod: "cash", // Paiement à la livraison uniquement
        paymentStatus: "pending",
        subtotal: totalPrice,
        shippingCost: deliveryPrice,
        total: finalTotal,
        notes: `Livraison: ${selectedDelivery === "pickup" ? "Venir chercher" : deliveryZones.find(z => z.id === selectedDelivery)?.name || selectedDelivery}`,
        userId: user?.id,
        email: user?.email || addressForm.phone, // Use phone as fallback
        isGuest: !user,
        guestEmail: user?.email || null,
        guestPhone: addressForm.phone,
      }

      console.log('Sending order data:', orderData)

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()
      console.log('Order response:', result)
      
      if (!response.ok) {
        // Gestion spécifique des erreurs de stock
        if (response.status === 409) {
          throw new Error(result.error || 'Stock insuffisant pour un ou plusieurs produits. Veuillez vérifier votre panier.')
        }
        throw new Error(result.error || 'Erreur lors de la création de la commande')
      }

      clearCart()
      toast({ 
        title: "Commande créée !", 
        description: `Numéro: ${result.order.orderNumber}`,
      })
      
      router.push(`/order-confirmation?orderNumber=${result.order.orderNumber}&email=${user?.email || addressForm.phone}&total=${finalTotal}`)
    } catch (error) {
      console.error('Order creation error:', error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de créer la commande",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader title="Commande" showBack />
        <div className="flex flex-col items-center justify-center h-96 px-4">
          <Truck className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Panier vide</h2>
          <Button onClick={() => router.push("/explorer")} className="mt-4">
            Découvrir nos produits
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Commande" showBack />
      <main className="px-4 py-4 space-y-6">
        {/* Stock Status Alert */}
        {isVerifyingStock && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Vérification du stock...</AlertDescription>
          </Alert>
        )}

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
                <p className="text-xs mt-2">Veuillez ajuster votre panier et réessayer.</p>
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
        {/* Progress */}
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= n ? "bg-accent text-white" : "bg-secondary text-muted-foreground"
              }`}>
                {step > n ? <CheckCircle className="w-4 h-4" /> : n}
              </div>
              {n < 3 && <div className={`w-12 h-0.5 mx-1 ${step > n ? "bg-accent" : "bg-secondary"}`} />}
            </div>
          ))}
        </div>

        <h2 className="text-center font-bold text-lg">
          {step === 1 && "Adresse de livraison"}
          {step === 2 && "Zone de livraison"}
          {step === 3 && "Confirmation"}
        </h2>

        {/* Step 1: Address */}
        {step === 1 && (
          <div className="bg-card rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-accent" />
              <h3 className="font-semibold">Vos informations</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prénom *</Label>
                <Input
                  value={addressForm.firstName}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Nom *</Label>
                <Input
                  value={addressForm.lastName}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Téléphone *</Label>
              <Input
                type="tel"
                placeholder="+224 XX XX XX XX"
                value={addressForm.phone}
                onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Adresse complète *</Label>
              <Input
                value={addressForm.address}
                onChange={(e) => setAddressForm(prev => ({ ...prev, address: e.target.value }))}
                className="mt-1"
                placeholder="Rue, quartier..."
              />
            </div>
          </div>
        )}

        {/* Step 2: Delivery */}
        {step === 2 && (
          <div className="bg-card rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-accent" />
              <h3 className="font-semibold">Zone de livraison</h3>
            </div>

            {/* Pickup */}
            <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer ${
              selectedDelivery === "pickup" ? "border-accent bg-accent/5" : "border-border"
            }`}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  value="pickup"
                  checked={selectedDelivery === "pickup"}
                  onChange={(e) => setSelectedDelivery(e.target.value)}
                  className="sr-only"
                />
                <Store className="w-5 h-5 text-accent" />
                <div>
                  <div className="font-medium">Venir chercher</div>
                  <p className="text-sm text-muted-foreground">Immédiat</p>
                </div>
              </div>
              <Badge>Gratuit</Badge>
            </label>

            {/* Zones */}
            <div className="space-y-2">
              {deliveryZones.map((zone) => (
                <label
                  key={zone.id}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer ${
                    selectedDelivery === zone.id ? "border-accent bg-accent/5" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      value={zone.id}
                      checked={selectedDelivery === zone.id}
                      onChange={(e) => setSelectedDelivery(e.target.value)}
                      className="sr-only"
                    />
                    <div>
                      <div className="font-medium text-sm">{zone.name}</div>
                      <p className="text-xs text-muted-foreground">{zone.duration}</p>
                    </div>
                  </div>
                  <span className="font-bold text-accent">{zone.price.toLocaleString()} GNF</span>
                </label>
              ))}
            </div>

            {/* Total */}
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span>Sous-total:</span>
                <span>{totalPrice.toLocaleString()} GNF</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Livraison:</span>
                <span>{selectedDelivery === "pickup" ? "Gratuit" : `${deliveryPrice.toLocaleString()} GNF`}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span className="text-accent">{finalTotal.toLocaleString()} GNF</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Items */}
            <div className="bg-card rounded-2xl p-4 space-y-3">
              <h3 className="font-semibold">Commande</h3>
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex items-center gap-3">
                  <ProductImage
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Taille: {item.size} • Qté: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-sm">{(item.price * item.quantity).toLocaleString()} GNF</span>
                </div>
              ))}
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{totalPrice.toLocaleString()} GNF</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span>{deliveryPrice === 0 ? "Gratuit" : `${deliveryPrice.toLocaleString()} GNF`}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{finalTotal.toLocaleString()} GNF</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-card rounded-2xl p-4">
              <h3 className="font-semibold mb-2">Livraison à</h3>
              <p className="text-sm"><strong>{addressForm.firstName} {addressForm.lastName}</strong></p>
              <p className="text-sm text-muted-foreground">{addressForm.phone}</p>
              <p className="text-sm text-muted-foreground">{addressForm.address}, Conakry</p>
            </div>

            {/* Security */}
            <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4 text-accent" />
                <span className="font-semibold text-sm">Paiement sécurisé</span>
              </div>
              <p className="text-xs text-muted-foreground">Paiement à la livraison</p>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex-1"
              disabled={isProcessing}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          )}
          {step < 3 ? (
            <Button 
              onClick={handleNextStep} 
              className="flex-1"
              disabled={!stockStatus?.available || isVerifyingStock}
            >
              Continuer
            </Button>
          ) : (
            <Button
              onClick={handlePlaceOrder}
              className="flex-1"
              disabled={isProcessing || !stockStatus?.available}
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isProcessing ? "Traitement..." : `Confirmer ${finalTotal.toLocaleString()} GNF`}
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
