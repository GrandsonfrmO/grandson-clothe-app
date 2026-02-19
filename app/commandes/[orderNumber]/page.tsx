"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductImage } from "@/components/ui/product-image"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useApiClient } from "@/hooks/use-api"
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Download,
  Share2,
  MessageSquare,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"

const getStatusIcon = (status: string) => {
  switch (status) {
    case "delivered":
      return <CheckCircle className="w-5 h-5 text-green-500" />
    case "shipped":
      return <Truck className="w-5 h-5 text-blue-500" />
    case "processing":
      return <Clock className="w-5 h-5 text-orange-500" />
    case "cancelled":
      return <AlertCircle className="w-5 h-5 text-red-500" />
    default:
      return <Package className="w-5 h-5 text-muted-foreground" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-500/10 text-green-500 border-green-500/20"
    case "shipped":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    case "processing":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20"
    case "cancelled":
      return "bg-red-500/10 text-red-500 border-red-500/20"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "En attente"
    case "processing":
      return "En préparation"
    case "shipped":
      return "Expédiée"
    case "delivered":
      return "Livrée"
    case "cancelled":
      return "Annulée"
    default:
      return status
  }
}

const getPaymentStatusLabel = (status: string) => {
  switch (status) {
    case "paid":
      return "Payé"
    case "pending":
      return "En attente"
    case "failed":
      return "Échoué"
    case "refunded":
      return "Remboursé"
    default:
      return status
  }
}

function OrderDetailsContent() {
  const params = useParams()
  const orderNumber = params.orderNumber as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expandedItems, setExpandedItems] = useState<number[]>([])
  const api = useApiClient()

  useEffect(() => {
    loadOrderDetails()
  }, [orderNumber])

  const loadOrderDetails = async () => {
    try {
      setLoading(true)
      const data = await api.getOrderDetails(orderNumber)
      setOrder(data)
    } catch (error) {
      console.error('Error loading order:', error)
      toast.error("Erreur lors du chargement de la commande")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = async () => {
    try {
      const invoice = await api.getOrderInvoice(orderNumber)
      
      // Create a simple text-based invoice
      const invoiceText = `
FACTURE - GRANDSON CLOTHES
================================

Numéro de commande: ${invoice.orderNumber}
Date: ${invoice.date}

CLIENT
------
Nom: ${invoice.customer.name}
Email: ${invoice.customer.email}
Téléphone: ${invoice.customer.phone}

ARTICLES
--------
${invoice.items.map((item: any) => 
  `${item.name}
  Quantité: ${item.quantity} x ${parseFloat(item.price).toLocaleString()} GNF = ${parseFloat(item.total).toLocaleString()} GNF`
).join('\n\n')}

RÉSUMÉ
------
Sous-total: ${parseFloat(invoice.subtotal).toLocaleString()} GNF
Frais de livraison: ${parseFloat(invoice.shippingCost).toLocaleString()} GNF
TOTAL: ${parseFloat(invoice.total).toLocaleString()} GNF

Méthode de paiement: ${invoice.paymentMethod}
Statut du paiement: ${getPaymentStatusLabel(invoice.paymentStatus)}

ADRESSE DE LIVRAISON
--------------------
${invoice.shippingAddress.address}
${invoice.shippingAddress.city}, ${invoice.shippingAddress.commune}
${invoice.shippingAddress.phone}

================================
Merci pour votre achat!
      `

      // Create blob and download
      const blob = new Blob([invoiceText], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `facture-${orderNumber}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Facture téléchargée")
    } catch (error) {
      console.error('Error downloading invoice:', error)
      toast.error("Erreur lors du téléchargement de la facture")
    }
  }

  const handleShareOrder = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Commande ${orderNumber}`,
          text: `Consultez ma commande ${orderNumber} sur GRANDSON CLOTHES`,
          url: window.location.href,
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast.success("Lien copié dans le presse-papiers")
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader title="Détails de la commande" showBack />
        <main className="px-4 py-4 space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </main>
        <BottomNav />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader title="Détails de la commande" showBack />
        <main className="px-4 py-4">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Commande non trouvée</h2>
            <p className="text-muted-foreground mb-4">
              La commande que vous recherchez n'existe pas ou n'est pas accessible.
            </p>
            <Button onClick={() => window.history.back()}>
              Retour
            </Button>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  const statusTimeline = [
    { status: 'pending', label: 'Commande reçue', completed: true },
    { status: 'processing', label: 'En préparation', completed: ['processing', 'shipped', 'delivered'].includes(order.status) },
    { status: 'shipped', label: 'Expédiée', completed: ['shipped', 'delivered'].includes(order.status) },
    { status: 'delivered', label: 'Livrée', completed: order.status === 'delivered' },
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title={`Commande ${order.orderNumber}`} showBack />
      
      <main className="px-4 py-4 space-y-4">
        {/* Status Card */}
        <div className="bg-card rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">{order.orderNumber}</h2>
              <p className="text-sm text-muted-foreground">
                {format(new Date(order.createdAt), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
              </p>
            </div>
            <Badge className={getStatusColor(order.status)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(order.status)}
                {getStatusLabel(order.status)}
              </div>
            </Badge>
          </div>

          {/* Payment Status */}
          <div className="flex items-center justify-between p-3 bg-secondary rounded-xl">
            <span className="text-sm font-medium">Paiement:</span>
            <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
              {getPaymentStatusLabel(order.paymentStatus)}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-2"
              onClick={handleDownloadInvoice}
            >
              <Download className="w-4 h-4" />
              Facture
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-2"
              onClick={handleShareOrder}
            >
              <Share2 className="w-4 h-4" />
              Partager
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-2"
              onClick={loadOrderDetails}
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-card rounded-2xl p-4">
          <h3 className="font-semibold mb-4">Suivi de la commande</h3>
          <div className="space-y-4">
            {statusTimeline.map((item, index) => (
              <div key={item.status} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    item.completed 
                      ? 'bg-accent text-accent-foreground' 
                      : 'bg-secondary text-muted-foreground'
                  }`}>
                    {item.completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                  {index < statusTimeline.length - 1 && (
                    <div className={`w-0.5 h-12 ${
                      item.completed ? 'bg-accent' : 'bg-border'
                    }`} />
                  )}
                </div>
                <div className="pb-4">
                  <p className={`font-medium ${
                    item.completed ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {item.label}
                  </p>
                  {item.completed && (
                    <p className="text-xs text-muted-foreground">
                      {item.status === order.status 
                        ? 'Actuellement à cette étape'
                        : 'Complété'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold">Articles ({order.items.length})</h3>
          {order.items.map((item: any, index: number) => (
            <div key={index} className="border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedItems(prev => 
                  prev.includes(index) 
                    ? prev.filter(i => i !== index)
                    : [...prev, index]
                )}
                className="w-full p-3 flex items-center gap-3 hover:bg-secondary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  <ProductImage
                    src={item.product.images[0] || "/placeholder.svg"}
                    alt={item.product.name}
                    width={48}
                    height={48}
                    className="w-full h-full"
                  />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-medium text-sm">{item.product.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    Qté: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">
                    {parseFloat(item.total).toLocaleString()} GNF
                  </p>
                  {expandedItems.includes(index) ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {expandedItems.includes(index) && (
                <div className="p-3 bg-secondary/50 border-t border-border space-y-2 text-sm">
                  {item.size && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taille:</span>
                      <span className="font-medium">{item.size}</span>
                    </div>
                  )}
                  {item.color && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Couleur:</span>
                      <span className="font-medium">{item.color}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prix unitaire:</span>
                    <span className="font-medium">
                      {parseFloat(item.price).toLocaleString()} GNF
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantité:</span>
                    <span className="font-medium">{item.quantity}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold">
                      {parseFloat(item.total).toLocaleString()} GNF
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Shipping Address */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Adresse de livraison
          </h3>
          <div className="space-y-2 text-sm">
            <p className="font-medium">{order.shippingAddress.address}</p>
            <p className="text-muted-foreground">
              {order.shippingAddress.commune}, {order.shippingAddress.city}
            </p>
            {order.shippingAddress.landmark && (
              <p className="text-muted-foreground">
                📍 {order.shippingAddress.landmark}
              </p>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              {order.shippingAddress.phone}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold">Résumé de la commande</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{parseFloat(order.subtotal).toLocaleString()} GNF</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frais de livraison</span>
              <span>{parseFloat(order.shippingCost).toLocaleString()} GNF</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">
                {parseFloat(order.total).toLocaleString()} GNF
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground pt-2">
              <span>Méthode de paiement</span>
              <span className="capitalize">{order.paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-card rounded-2xl p-4 space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Notes
            </h3>
            <p className="text-sm text-muted-foreground">{order.notes}</p>
          </div>
        )}

        {/* Support */}
        <div className="bg-accent/10 rounded-2xl p-4 border border-accent/20">
          <h3 className="font-semibold mb-2">Besoin d'aide ?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Si vous avez des questions sur cette commande, contactez notre support.
          </p>
          <Button variant="outline" className="w-full gap-2">
            <MessageSquare className="w-4 h-4" />
            Contacter le support
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default function OrderDetailsPage() {
  return (
    <ProtectedRoute>
      <OrderDetailsContent />
    </ProtectedRoute>
  )
}
