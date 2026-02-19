"use client"

import { useEffect } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  UserPlus, 
  ShoppingBag, 
  Clock,
  Star,
  Gift,
  ArrowRight,
  CheckCircle
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function CheckoutChoicePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, totalPrice, totalItems } = useCart()

  useEffect(() => {
    if (items.length === 0) {
      router.push("/panier")
    } else if (user) {
      router.push("/checkout")
    }
  }, [items.length, user, router])

  // Ne pas rendre le contenu si on doit rediriger
  if (items.length === 0 || user) {
    return null
  }

  const handleGuestCheckout = () => {
    router.push("/checkout-guest")
  }

  const handleLoginCheckout = () => {
    router.push("/checkout")
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Mode de commande" showBack />
      
      <main className="px-4 py-6 space-y-6">
        {/* Order Summary */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Résumé de votre panier</h3>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {totalItems} article{totalItems > 1 ? 's' : ''}
            </span>
            <span className="font-bold text-lg">
              {totalPrice.toLocaleString()} GNF
            </span>
          </div>
        </Card>

        {/* Choice Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Comment souhaitez-vous commander ?</h1>
          <p className="text-muted-foreground">
            Choisissez votre mode de commande préféré
          </p>
        </div>

        {/* Guest Checkout Option */}
        <Card className="p-6 border-2 hover:border-accent/50 transition-all cursor-pointer group"
              onClick={handleGuestCheckout}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Commande rapide</h3>
                  <p className="text-sm text-muted-foreground">Sans créer de compte</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Rapide
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Commande en 2 minutes</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Aucune inscription requise</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Suivi par email et SMS</span>
              </div>
            </div>

            <Button className="w-full group-hover:bg-accent/90 transition-colors">
              Continuer sans compte
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>

        {/* Login/Register Option */}
        <Card className="p-6 border-2 hover:border-accent/50 transition-all cursor-pointer group"
              onClick={handleLoginCheckout}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Avec un compte</h3>
                  <p className="text-sm text-muted-foreground">Se connecter ou créer un compte</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Recommandé
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Points de fidélité</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Historique des commandes</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Gift className="w-4 h-4 text-purple-600" />
                <span>Offres exclusives</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Adresses sauvegardées</span>
              </div>
            </div>

            <Button variant="outline" className="w-full group-hover:bg-secondary transition-colors">
              Se connecter / S'inscrire
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>

        {/* Benefits of Account */}
        <div className="bg-gradient-to-r from-accent/10 to-blue-500/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-accent" />
            <span className="font-semibold">Avantages d'un compte</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Créez un compte pour bénéficier de points de fidélité, d'offres exclusives 
            et d'un suivi personnalisé de vos commandes.
          </p>
        </div>

        {/* Continue Shopping */}
        <div className="text-center">
          <Link 
            href="/panier" 
            className="text-accent hover:underline text-sm"
          >
            Retour au panier
          </Link>
        </div>
      </main>
    </div>
  )
}