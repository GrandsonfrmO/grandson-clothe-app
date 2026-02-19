"use client"

import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Truck,
  CheckCircle,
  Lock,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/protected-route"

function PaiementContent() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Paiement" showBack />
      
      <main className="px-4 py-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Mode de paiement</h2>
          <p className="text-muted-foreground">Paiement simple et sécurisé</p>
        </div>

        {/* Payment Method Card */}
        <div className="bg-card rounded-2xl p-6 space-y-4 border-2 border-accent">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center">
                <Truck className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Paiement à la livraison</h3>
                <p className="text-sm text-muted-foreground">Cash on Delivery</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              <CheckCircle className="w-3 h-3 mr-1" />
              Actif
            </Badge>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">Comment ça marche?</h4>
            <ol className="text-sm text-muted-foreground space-y-2">
              <li className="flex gap-3">
                <span className="font-bold text-accent">1.</span>
                <span>Passez votre commande en ligne</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-accent">2.</span>
                <span>Recevez votre colis à domicile</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-accent">3.</span>
                <span>Payez le livreur à la réception</span>
              </li>
            </ol>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Aucune commission</p>
                <p className="text-xs text-muted-foreground">Pas de frais supplémentaires</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Flexible</p>
                <p className="text-xs text-muted-foreground">Payez exactement le montant de votre commande</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Sécurisé</p>
                <p className="text-xs text-muted-foreground">Vérifiez votre colis avant de payer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-accent/10 rounded-2xl p-4 border border-accent/20 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">À savoir</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Assurez-vous d'avoir de l'argent liquide à la livraison</li>
                <li>• Le livreur vous contactera avant l'arrivée</li>
                <li>• Vous pouvez vérifier votre colis avant de payer</li>
                <li>• Conservez votre reçu de livraison</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Sécurité</h3>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              Vos données personnelles sont protégées
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              Aucune information de paiement stockée
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              Transactions sécurisées et vérifiées
            </li>
          </ul>
        </div>

        {/* FAQ */}
        <div className="bg-card rounded-2xl p-4 space-y-4">
          <h3 className="font-semibold">Questions fréquentes</h3>
          
          <div className="space-y-3">
            <div>
              <p className="font-medium text-sm mb-1">Puis-je payer par chèque?</p>
              <p className="text-xs text-muted-foreground">Non, le paiement se fait uniquement en espèces à la livraison.</p>
            </div>
            
            <div>
              <p className="font-medium text-sm mb-1">Que faire si je n'ai pas d'argent?</p>
              <p className="text-xs text-muted-foreground">Vous pouvez reprogrammer la livraison ou annuler votre commande.</p>
            </div>
            
            <div>
              <p className="font-medium text-sm mb-1">Y a-t-il des frais supplémentaires?</p>
              <p className="text-xs text-muted-foreground">Non, vous payez uniquement le montant de votre commande.</p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-secondary/50 rounded-2xl p-4 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Besoin d'aide?</p>
          <Link href="/aide/paiement">
            <Button variant="outline" className="w-full">
              Consulter l'aide
            </Button>
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default function PaiementPage() {
  return (
    <ProtectedRoute>
      <PaiementContent />
    </ProtectedRoute>
  )
}
