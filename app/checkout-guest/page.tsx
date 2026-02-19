"use client"

import { useState } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"
import { CONAKRY_DELIVERY_ZONES } from "@/lib/delivery-zones"
import { Button } from "@/components/ui/button"
import { ProductImage } from "@/components/ui/product-image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  CreditCard, 
  Truck,
  CheckCircle,
  ArrowLeft,
  Lock,
  Loader2,
  User,
  Store
} from "lucide-react"
import { useRouter } from "next/navigation"

const paymentMethods = [
  {
    id: "cash",
    name: "Paiement à la livraison",
    icon: "💵",
    description: "Payez en espèces",
    popular: true
  }
]

// Delivery zones for dropdown
const deliveryZones = CONAKRY_DELIVERY_ZONES.map(zone => ({
  id: zone.id,
  name: zone.name,
  price: zone.shippingCost,
  duration: `${zone.estimatedDays} jour${zone.estimatedDays > 1 ? 's' : ''}`,
  description: `Livraison à ${zone.commune}`,
  type: "delivery" as const
}))

export default function CheckoutGuestPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const { toast } = useToast()

  const [step, setStep] = useState(1) // 1: Contact & Address, 2: Payment, 3: Review
  const [selectedPayment, setSelectedPayment] = useState("cash")
  const [selectedDelivery, setSelectedDelivery] = useState("pickup")
  const [isProcessing, setIsProcessing] = useState(false)

  const [guestInfo, setGuestInfo] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "Conakry",
  })

  // Calculate delivery price based on selected delivery
  const getDeliveryPrice = () => {
    if (selectedDelivery === "pickup") {
      return 0
    }
    const selectedZone = deliveryZones.find(z => z.id === selectedDelivery)
    return selectedZone?.price || 0
  }
  
  const deliveryPrice = getDeliveryPrice()
  const finalTotal = totalPrice + deliveryPrice

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader title="Commande" showBack />
        <div className="flex flex-col items-center justify-center h-96 px-4">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
            <Truck className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Panier vide</h2>
          <p className="text-muted-foreground text-center mb-6">
            Ajoutez des produits à votre panier pour passer commande
          </p>
          <Button onClick={() => router.push("/explorer")}>
            Découvrir nos produits
          </Button>
        </div>
      </div>
    )
  }

  const handleNextStep = () => {
    if (step === 1) {
      // Validate contact and address info
      if (!guestInfo.email || !guestInfo.phone || !guestInfo.firstName || 
          !guestInfo.lastName || !guestInfo.address) {
        toast({
          title: "Informations manquantes",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive",
        })
        return
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(guestInfo.email)) {
        toast({
          title: "Email invalide",
          description: "Veuillez saisir une adresse email valide",
          variant: "destructive",
        })
        return
      }
    }
    
    if (step === 2) {
      // Payment step - pas de validation nécessaire pour paiement à la livraison
    }
    
    setStep(step + 1)
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    
    try {
      // Prepare order data for guest
      const orderData = {
        isGuest: true,
        guestEmail: guestInfo.email,
        guestPhone: guestInfo.phone,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          size: item.size,
          price: item.price,
          total: item.price * item.quantity,
        })),
        subtotal: totalPrice,
        shippingCost: deliveryPrice,
        total: finalTotal,
        shippingAddress: {
          firstName: guestInfo.firstName,
          lastName: guestInfo.lastName,
          phone: guestInfo.phone,
          email: guestInfo.email,
          address: guestInfo.address,
          city: guestInfo.city,
        },
        paymentMethod: selectedPayment,
        notes: `Livraison: ${selectedDelivery === "pickup" ? "Venir chercher" : selectedDelivery}`,
      }

      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const orderResult = await orderResponse.json()
      
      if (!orderResponse.ok) {
        throw new Error(orderResult.error || 'Erreur lors de la création de la commande')
      }
      
      // Clear cart and show success
      clearCart()
      toast({
        title: "Commande créée !",
        description: `Commande ${orderResult.order.orderNumber} créée avec succès. Vous recevrez un email de confirmation.`,
      })
      
      // Redirect to order confirmation page
      router.push(`/order-confirmation?orderNumber=${orderResult.order.orderNumber}&email=${guestInfo.email}`)
      
    } catch (error) {
      console.error('Order error:', error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la commande",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Commande rapide" showBack />
      
      <main className="px-4 py-4 space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= stepNumber 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-secondary text-muted-foreground"
              }`}>
                {step > stepNumber ? <CheckCircle className="w-4 h-4" /> : stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  step > stepNumber ? "bg-accent" : "bg-secondary"
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <h2 className="font-bold text-lg">
            {step === 1 && "Vos informations"}
            {step === 2 && "Mode de paiement"}
            {step === 3 && "Confirmation"}
          </h2>
        </div>

        {/* Step 1: Contact & Address */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-card rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-accent" />
                <h3 className="font-semibold">Informations de contact</h3>
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Vous recevrez la confirmation de commande par email
                </p>
              </div>

              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+224 XX XX XX XX"
                  value={guestInfo.phone}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-card rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-accent" />
                <h3 className="font-semibold">Adresse de livraison</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={guestInfo.firstName}
                    onChange={(e) => setGuestInfo(prev => ({ ...prev, firstName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    value={guestInfo.lastName}
                    onChange={(e) => setGuestInfo(prev => ({ ...prev, lastName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Adresse complète *</Label>
                <Input
                  id="address"
                  value={guestInfo.address}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, address: e.target.value }))}
                  className="mt-1"
                  placeholder="Rue, quartier..."
                />
              </div>
            </div>

            {/* Delivery Zones */}
            <div className="bg-card rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-accent" />
                <h3 className="font-semibold">Zone de livraison</h3>
              </div>
              
              {/* Pickup Option */}
              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedDelivery === "pickup"
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent/50"
                }`}>
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="radio"
                      name="delivery"
                      value="pickup"
                      checked={selectedDelivery === "pickup"}
                      onChange={(e) => setSelectedDelivery(e.target.value)}
                      className="sr-only"
                    />
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Store className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Venir chercher au magasin</span>
                        <Badge variant="secondary" className="text-xs">
                          Gratuit
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Immédiat • Conakry, Guinée
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-right">
                    Gratuit
                  </span>
                </label>
              </div>

              {/* Delivery Zones */}
              <div className="space-y-3">
                <Label>Sélectionnez votre zone de livraison</Label>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {deliveryZones.map((zone) => (
                    <label
                      key={zone.id}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedDelivery === zone.id
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="radio"
                          name="delivery"
                          value={zone.id}
                          checked={selectedDelivery === zone.id}
                          onChange={(e) => setSelectedDelivery(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{zone.name}</div>
                          <p className="text-xs text-muted-foreground">
                            {zone.duration}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-sm text-accent">
                        {zone.price.toLocaleString()} GNF
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-secondary/50 rounded-lg p-4 space-y-3 mt-4 border border-border">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Sous-total produits:</span>
                  <span className="font-semibold">{totalPrice.toLocaleString()} GNF</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Frais de livraison:</span>
                  <span className="font-semibold">
                    {selectedDelivery === "pickup" ? "Gratuit" : `${deliveryPrice.toLocaleString()} GNF`}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-lg text-accent">{finalTotal.toLocaleString()} GNF</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-accent" />
                <h3 className="font-semibold">Mode de paiement</h3>
              </div>
              
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPayment === method.id
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={selectedPayment === method.id}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{method.name}</span>
                        {method.popular && (
                          <Badge variant="secondary" className="text-xs">
                            Populaire
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-card rounded-2xl p-4 space-y-4">
              <h3 className="font-semibold">Résumé de la commande</h3>
              
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary">
                    <ProductImage
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      Taille: {item.size} • Qté: {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-sm">
                    {(item.price * item.quantity).toLocaleString()} GNF
                  </span>
                </div>
              ))}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sous-total</span>
                  <span>{totalPrice.toLocaleString()} GNF</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Livraison</span>
                  <span>
                    {deliveryPrice === 0 ? "Gratuit" : `${deliveryPrice.toLocaleString()} GNF`}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{finalTotal.toLocaleString()} GNF</span>
                </div>
              </div>
            </div>

            {/* Contact Summary */}
            <div className="bg-card rounded-2xl p-4 space-y-2">
              <h3 className="font-semibold mb-2">Informations de livraison</h3>
              <p className="text-sm">
                <strong>{guestInfo.firstName} {guestInfo.lastName}</strong>
              </p>
              <p className="text-sm text-muted-foreground">{guestInfo.email}</p>
              <p className="text-sm text-muted-foreground">{guestInfo.phone}</p>
              <p className="text-sm text-muted-foreground">
                {guestInfo.address}, {guestInfo.city}
              </p>
            </div>

            {/* Security Notice */}
            <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-accent" />
                <span className="font-semibold text-sm">Paiement sécurisé</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Vos informations sont protégées par un cryptage SSL 256 bits.
                Vous recevrez un email de confirmation après votre commande.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
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
            <Button onClick={handleNextStep} className="flex-1">
              Continuer
            </Button>
          ) : (
            <Button 
              onClick={handlePlaceOrder} 
              className="flex-1"
              disabled={isProcessing}
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isProcessing ? "Traitement..." : `Payer ${finalTotal.toLocaleString()} GNF`}
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
