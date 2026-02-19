"use client"

import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  HelpCircle, 
  Package, 
  CreditCard,
  Truck,
  RefreshCw,
  ChevronRight,
  Search
} from "lucide-react"
import Link from "next/link"

const faqCategories = [
  {
    icon: Package,
    title: "Commandes",
    description: "Suivi, modifications, annulations",
    href: "/aide/commandes"
  },
  {
    icon: Truck,
    title: "Livraison",
    description: "Délais, frais, zones de livraison",
    href: "/aide/livraison"
  },
  {
    icon: CreditCard,
    title: "Paiement",
    description: "Moyens de paiement, sécurité",
    href: "/aide/paiement"
  },
  {
    icon: RefreshCw,
    title: "Retours",
    description: "Échanges, remboursements",
    href: "/aide/retours"
  }
]

const quickActions = [
  {
    icon: MessageCircle,
    title: "Chat en direct",
    description: "Réponse immédiate",
    action: "chat",
    available: true
  },
  {
    icon: Phone,
    title: "Appeler",
    description: "+224 XX XX XX XX",
    action: "call",
    available: true
  },
  {
    icon: Mail,
    title: "Email",
    description: "support@grandsonclothes.com",
    action: "email",
    available: true
  }
]

export default function AidePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Aide & Support" showBack />
      
      <main className="px-4 py-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans l'aide..."
            className="pl-10 pr-4 h-12 rounded-2xl bg-secondary border-0"
          />
        </div>

        {/* Quick Contact */}
        <div className="bg-card rounded-2xl p-4 space-y-4">
          <h3 className="font-semibold">Contactez-nous</h3>
          <div className="grid gap-3">
            {quickActions.map((action) => (
              <button
                key={action.action}
                className="flex items-center gap-4 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                  <action.icon className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{action.title}</h4>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {action.available && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-4">
          <h3 className="font-semibold">Questions fréquentes</h3>
          <div className="grid gap-3">
            {faqCategories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="flex items-center gap-4 p-4 bg-card rounded-2xl hover:bg-card/80 transition-colors"
              >
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <category.icon className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{category.title}</h4>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Questions */}
        <div className="space-y-4">
          <h3 className="font-semibold">Questions populaires</h3>
          <div className="space-y-2">
            {[
              "Comment suivre ma commande ?",
              "Quels sont les délais de livraison ?",
              "Comment retourner un article ?",
              "Quels moyens de paiement acceptez-vous ?",
              "Comment modifier ma commande ?"
            ].map((question, index) => (
              <button
                key={index}
                className="w-full text-left p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-between"
              >
                <span className="text-sm">{question}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold">Horaires d'ouverture</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Lundi - Vendredi</span>
              <span className="text-muted-foreground">9h00 - 18h00</span>
            </div>
            <div className="flex justify-between">
              <span>Samedi</span>
              <span className="text-muted-foreground">10h00 - 16h00</span>
            </div>
            <div className="flex justify-between">
              <span>Dimanche</span>
              <span className="text-muted-foreground">Fermé</span>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm text-green-500">Actuellement ouvert</span>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl p-4 border border-red-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold">Problème urgent ?</h3>
              <p className="text-sm text-muted-foreground">Contactez-nous immédiatement</p>
            </div>
          </div>
          <Button className="w-full rounded-xl bg-red-500 hover:bg-red-600">
            Assistance d'urgence
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}