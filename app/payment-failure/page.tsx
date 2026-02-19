'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MobileHeader } from '@/components/mobile-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

function PaymentFailureContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const orderId = searchParams.get('orderId')
  const reason = searchParams.get('reason') || 'Raison inconnue'
  const paymentMethod = 'cash' // Paiement à la livraison uniquement

  const getReasonMessage = (reason: string): string => {
    const reasons: Record<string, string> = {
      'cancelled': 'Vous avez annulé le paiement',
      'timeout': 'Le délai de paiement a expiré',
      'invalid_phone': 'Le numéro de téléphone est invalide',
      'insufficient_funds': 'Solde insuffisant',
      'network_error': 'Erreur réseau',
      'invalid_credentials': 'Identifiants invalides',
      'declined': 'Paiement refusé',
      'unknown': 'Erreur inconnue',
    }
    return reasons[reason] || reason
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="Paiement Échoué" showBack />
      <div className="p-4">
        <div className="max-w-md mx-auto mt-8">
          <Card className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Paiement Échoué
            </h1>
            
            <p className="text-gray-600 mb-6">
              Votre paiement n'a pas pu être traité.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left space-y-3">
              <div>
                <p className="text-xs text-red-600 font-semibold">Raison</p>
                <p className="text-sm text-red-900">
                  {getReasonMessage(reason)}
                </p>
              </div>

              {orderId && (
                <div>
                  <p className="text-xs text-gray-600">Numéro de commande</p>
                  <p className="text-sm font-mono text-gray-900">
                    {orderId}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-600">Méthode de paiement</p>
                <p className="text-sm text-gray-900 capitalize">
                  Paiement à la livraison
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-yellow-900">
                <strong>💡 Conseil:</strong> Vérifiez votre solde et réessayez. Si le problème persiste, contactez votre opérateur.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  if (orderId) {
                    router.push(`/checkout?orderId=${orderId}&retry=true`)
                  } else {
                    router.push('/checkout')
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Réessayer le paiement
              </Button>
              
              <Button
                onClick={() => router.push('/panier')}
                variant="outline"
                className="w-full"
              >
                Retour au panier
              </Button>

              <Button
                onClick={() => router.push('/')}
                variant="ghost"
                className="w-full"
              >
                Retour à l'accueil
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3">
                Besoin d'aide?
              </p>
              <div className="space-y-2">
                <a
                  href="/aide/paiement"
                  className="block text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  FAQ Paiement
                </a>
                <a
                  href="/aide"
                  className="block text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  Contacter le support
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <MobileHeader title="Paiement Échoué" showBack />
        <div className="p-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    }>
      <PaymentFailureContent />
    </Suspense>
  )
}
