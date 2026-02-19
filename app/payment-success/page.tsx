'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MobileHeader } from '@/components/mobile-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, Loader2 } from 'lucide-react'

interface Order {
  id: string
  order_number: string
  total: number
  items: any[]
  customer_email?: string
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const transactionId = searchParams.get('transactionId')
  const orderId = searchParams.get('orderId')
  const paymentMethod = 'cash' // Paiement à la livraison uniquement

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!transactionId || !orderId) {
          setError('Paramètres de paiement manquants')
          setLoading(false)
          return
        }

        // Verify payment status
        const verifyResponse = await fetch(
          `/api/payment/process?transactionId=${encodeURIComponent(transactionId)}&paymentMethod=${paymentMethod}`
        )
        
        if (!verifyResponse.ok) {
          throw new Error('Erreur lors de la vérification du paiement')
        }

        const verifyData = await verifyResponse.json()
        
        if (!verifyData.success) {
          setError('Le paiement n\'a pas pu être vérifié')
          setLoading(false)
          return
        }

        // Fetch order details
        const orderResponse = await fetch(`/api/orders/${orderId}`)
        
        if (!orderResponse.ok) {
          throw new Error('Erreur lors de la récupération de la commande')
        }

        const orderData = await orderResponse.json()
        setOrder(orderData)
      } catch (err) {
        console.error('Error verifying payment:', err)
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [transactionId, orderId, paymentMethod])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader title="Paiement" showBack />
        <div className="p-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-accent mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Vérification du paiement...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader title="Erreur" showBack />
        <div className="p-4">
          <div className="max-w-md mx-auto mt-8">
            <Card className="p-8 text-center">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Erreur de Vérification
              </h1>
              
              <p className="text-gray-600 mb-6">
                {error}
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/panier')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Retour au panier
                </Button>
                
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="w-full"
                >
                  Retour à l'accueil
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="Paiement Réussi" showBack />
      <div className="p-4">
        <div className="max-w-md mx-auto mt-8">
          <Card className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Paiement Réussi
            </h1>
            
            <p className="text-gray-600 mb-6">
              Votre commande a été confirmée avec succès.
            </p>

            {order && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Numéro de commande</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {order.order_number}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Montant payé</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {order.total.toLocaleString('fr-GN')} GNF
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">ID Transaction</p>
                  <p className="text-xs font-mono text-gray-600 break-all">
                    {transactionId}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Nombre d'articles</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {order.items?.length || 0} article(s)
                  </p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-blue-900">
                <strong>📧 Confirmation:</strong> Un email de confirmation a été envoyé à votre adresse.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.push('/commandes')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Voir mes commandes
              </Button>
              
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full"
              >
                Continuer les achats
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Vous pouvez suivre votre commande dans la section "Mes commandes".
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <MobileHeader title="Paiement" showBack />
        <div className="p-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-accent mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
