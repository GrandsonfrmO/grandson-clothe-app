"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProductImage } from "@/components/ui/product-image"
import { 
  CheckCircle, 
  Mail, 
  Phone, 
  Package,
  Clock,
  Home,
  Printer,
  Download,
  MapPin,
  Truck,
  ShoppingBag,
  Loader2
} from "lucide-react"
import Link from "next/link"

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderNumber = searchParams.get('orderNumber')
  const email = searchParams.get('email')
  const total = searchParams.get('total')
  
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderNumber) {
        setLoading(false)
        return
      }
      
      try {
        // Build URL with email parameter for guest orders
        let url = `/api/orders/${orderNumber}`
        if (email) {
          url += `?email=${encodeURIComponent(email)}`
        }
        
        // Use the endpoint that works for both guest and authenticated orders
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          },
        })
        
        if (!response.ok) {
          throw new Error('Commande non trouvée')
        }
        
        const data = await response.json()
        setOrder(data.order)
      } catch (err) {
        console.error('Error fetching order:', err)
        setError("Erreur lors du chargement de la commande")
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrder()
  }, [orderNumber, email])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    // Generate a simple PDF-like receipt
    const receiptContent = `
REÇU DE COMMANDE - GRANDSON CLOTHES
=====================================

Numéro de commande: ${orderNumber}
Date: ${new Date().toLocaleDateString('fr-FR')}
Email: ${email}

${order ? `
DÉTAILS DE LA COMMANDE:
${order.items?.map((item: any) => `
- ${item.product?.name || 'Produit'}
  Quantité: ${item.quantity}
  Taille: ${item.size || 'N/A'}
  Couleur: ${item.color || 'N/A'}
  Prix unitaire: ${item.price?.toLocaleString()} GNF
  Total: ${item.total?.toLocaleString()} GNF
`).join('\n')}

RÉSUMÉ:
Sous-total: ${order.subtotal?.toLocaleString()} GNF
Frais de livraison: ${order.shippingCost?.toLocaleString()} GNF
TOTAL: ${order.total?.toLocaleString()} GNF

Mode de paiement: ${order.paymentMethod}
Statut: ${order.status}

ADRESSE DE LIVRAISON:
${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}
${order.shippingAddress?.address}
${order.shippingAddress?.city}
Téléphone: ${order.shippingAddress?.phone}
` : `
Total: ${total} GNF
`}

Merci pour votre commande!
GRANDSON CLOTHES
    `
    
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptContent))
    element.setAttribute('download', `receipt-${orderNumber}.txt`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (!orderNumber) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader title="Confirmation" showBack />
        <div className="flex flex-col items-center justify-center h-96 px-4">
          <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
            <Package className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Commande introuvable</h2>
          <p className="text-muted-foreground text-center mb-6">
            Aucune information de commande disponible
          </p>
          <Link href="/">
            <Button className="rounded-full px-8">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader title="Confirmation" showBack />
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
          <p className="text-muted-foreground">Chargement de votre commande...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader title="Confirmation" showBack />
        <div className="flex flex-col items-center justify-center h-96 px-4">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <Package className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Erreur</h2>
          <p className="text-muted-foreground text-center mb-6">{error}</p>
          <Link href="/">
            <Button className="rounded-full px-8">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 print:bg-white">
      <MobileHeader title="Commande confirmée" showBack />
      
      <main className="px-4 py-6 space-y-4 print:px-8">
        {/* Success Header */}
        <div className="text-center space-y-4 print:mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto print:hidden">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-green-700 mb-2 print:text-black">
              Commande confirmée !
            </h1>
            <p className="text-muted-foreground print:text-gray-600">
              Votre commande a été créée avec succès
            </p>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block text-center mb-8 pb-4 border-b-2">
          <h1 className="text-2xl font-bold">GRANDSON CLOTHES</h1>
          <p className="text-sm text-gray-600">Reçu de commande</p>
          <p className="text-xs text-gray-500 mt-2">{new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Order Number Card */}
        <div className="bg-card rounded-2xl p-4 space-y-3 print:border print:shadow-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-accent print:hidden" />
              <h3 className="font-semibold">Numéro de commande</h3>
            </div>
            <Badge variant="secondary" className="font-mono text-xs">
              {orderNumber}
            </Badge>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-accent mt-0.5 print:hidden" />
              <div>
                <p className="text-xs text-muted-foreground print:text-gray-600">Statut</p>
                <p className="text-sm font-medium">
                  {order?.status === 'pending' ? 'En attente' : 
                   order?.status === 'processing' ? 'En préparation' :
                   order?.status === 'shipped' ? 'Expédiée' :
                   order?.status === 'delivered' ? 'Livrée' : order?.status}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Truck className="w-4 h-4 text-accent mt-0.5 print:hidden" />
              <div>
                <p className="text-xs text-muted-foreground print:text-gray-600">Livraison</p>
                <p className="text-sm font-medium">2-5 jours ouvrés</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        {order?.items && order.items.length > 0 && (
          <div className="bg-card rounded-2xl p-4 space-y-4 print:border print:shadow-none">
            <h3 className="font-semibold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-accent print:hidden" />
              Articles commandés
            </h3>
            
            <div className="space-y-3">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-3 pb-3 border-b last:border-0 print:text-sm">
                  {/* Product Image */}
                  {item.product?.images && item.product.images.length > 0 && (
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-secondary print:w-12 print:h-12">
                      <ProductImage
                        src={(item.product.images && item.product.images[0]) || '/images/products/placeholder.svg'}
                        alt={item.product?.name || 'Produit'}
                        width={64}
                        height={64}
                        className="w-full h-full"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product?.name || 'Produit'}</p>
                    <p className="text-xs text-muted-foreground print:text-gray-600">
                      {item.size && `Taille: ${item.size}`}
                      {item.color && ` • Couleur: ${item.color}`}
                      {` • Qté: ${item.quantity}`}
                    </p>
                    <p className="text-xs text-muted-foreground print:text-gray-600 mt-1">
                      {item.price?.toLocaleString()} GNF × {item.quantity}
                    </p>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-sm">{item.total?.toLocaleString()} GNF</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Summary */}
        <div className="bg-card rounded-2xl p-4 space-y-3 print:border print:shadow-none">
          <h3 className="font-semibold">Résumé</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground print:text-gray-600">Sous-total</span>
              <span className="font-medium">{order?.subtotal?.toLocaleString() || total} GNF</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground print:text-gray-600">Frais de livraison</span>
              <span className="font-medium">
                {order?.shippingCost === 0 || order?.shippingCost === '0' ? 'Gratuit' : `${order?.shippingCost?.toLocaleString()} GNF`}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-base pt-1">
              <span>Total</span>
              <span className="text-accent print:text-black">{order?.total?.toLocaleString() || total} GNF</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {order?.shippingAddress && (
          <div className="bg-card rounded-2xl p-4 space-y-3 print:border print:shadow-none">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent print:hidden" />
              Adresse de livraison
            </h3>
            <div className="text-sm space-y-1">
              <p className="font-medium">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p className="text-muted-foreground print:text-gray-700">
                {order.shippingAddress.address}
              </p>
              <p className="text-muted-foreground print:text-gray-700">
                {order.shippingAddress.city} {order.shippingAddress.commune}
              </p>
              <div className="flex items-center gap-2 pt-2">
                <Phone className="w-4 h-4 text-accent print:hidden" />
                <p className="text-muted-foreground print:text-gray-700">
                  {order.shippingAddress.phone}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Information */}
        {email && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3 print:bg-white print:border-gray-300">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600 print:hidden" />
              <h3 className="font-semibold text-blue-900 print:text-black">Confirmation envoyée</h3>
            </div>
            <p className="text-sm text-blue-700 print:text-gray-700">
              Un email de confirmation avec tous les détails de votre commande 
              vous a été envoyé à <strong>{email}</strong>
            </p>
            <p className="text-xs text-blue-600 print:text-gray-600">
              Vérifiez également votre dossier spam
            </p>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-card rounded-2xl p-4 space-y-4 print:border print:shadow-none">
          <h3 className="font-semibold">Prochaines étapes</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 print:bg-gray-400">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Traitement de la commande</p>
                <p className="text-xs text-muted-foreground print:text-gray-600 mt-1">
                  Nous préparons votre commande dans notre entrepôt
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-secondary text-muted-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 print:bg-gray-300 print:text-gray-700">
                2
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Expédition</p>
                <p className="text-xs text-muted-foreground print:text-gray-600 mt-1">
                  Votre commande sera expédiée sous 24-48h
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-secondary text-muted-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 print:bg-gray-300 print:text-gray-700">
                3
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Livraison</p>
                <p className="text-xs text-muted-foreground print:text-gray-600 mt-1">
                  Réception de votre commande à l'adresse indiquée
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="bg-card rounded-2xl p-4 space-y-3 print:border print:shadow-none">
          <h3 className="font-semibold">Besoin d'aide ?</h3>
          
          <p className="text-sm text-muted-foreground print:text-gray-600">
            Si vous avez des questions concernant votre commande, 
            n'hésitez pas à nous contacter :
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-accent print:hidden" />
              <span>+224 621 234 567</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-accent print:hidden" />
              <span>support@grandsonclothes.com</span>
            </div>
          </div>
        </div>

        {/* Print and Download Buttons */}
        <div className="space-y-2 print:hidden">
          <Button 
            onClick={handlePrint}
            className="w-full rounded-2xl h-12"
            variant="outline"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimer le reçu
          </Button>
          
          <Button 
            onClick={handleDownloadPDF}
            className="w-full rounded-2xl h-12"
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger le reçu
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 print:hidden">
          <Link href="/explorer">
            <Button className="w-full rounded-2xl h-12">
              Continuer mes achats
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="w-full rounded-2xl h-12">
              <Home className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader title="Confirmation" showBack />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-12 h-12 text-accent animate-spin" />
        </div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  )
}
