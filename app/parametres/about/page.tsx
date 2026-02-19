"use client"

import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Package, 
  Heart, 
  Users, 
  Zap,
  Globe,
  Shield,
  Smartphone
} from "lucide-react"

export default function AboutPage() {
  const features = [
    {
      icon: Package,
      title: "Streetwear Authentique",
      description: "Collection exclusive depuis la Guinée"
    },
    {
      icon: Zap,
      title: "Livraison Rapide",
      description: "Livraison en 2-5 jours ouvrés"
    },
    {
      icon: Shield,
      title: "Paiement Sécurisé",
      description: "Paiement à la livraison en toute sécurité"
    },
    {
      icon: Heart,
      title: "Qualité Premium",
      description: "Matériaux de haute qualité"
    },
    {
      icon: Users,
      title: "Communauté",
      description: "Rejoignez notre communauté urbaine"
    },
    {
      icon: Smartphone,
      title: "App Mobile",
      description: "Accès facile depuis votre téléphone"
    }
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="À propos" showBack />
      
      <main className="px-4 py-6 space-y-8">
        {/* App Info */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-4xl font-bold text-accent-foreground">GC</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">GRANDSON</h1>
            <p className="text-muted-foreground">CLOTHES</p>
          </div>
          <Badge variant="secondary">v1.0.0</Badge>
        </div>

        {/* Description */}
        <div className="bg-card rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">À propos de nous</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            GRANDSON CLOTHES est une plateforme de e-commerce spécialisée dans le streetwear authentique depuis la Guinée. 
            Nous proposons une collection exclusive de vêtements urbains de haute qualité.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Notre mission est de rendre la mode urbaine accessible à tous en offrant des produits de qualité à des prix compétitifs.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Nos fonctionnalités</h2>
          <div className="grid grid-cols-1 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="bg-card rounded-xl p-4 flex gap-4">
                <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-card rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Nous contacter</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <a href="mailto:support@grandson.com" className="text-accent hover:underline">
                support@grandson.com
              </a>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Téléphone</p>
              <a href="tel:+224621234567" className="text-accent hover:underline">
                +224 621 234 567
              </a>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Localisation</p>
              <p className="text-sm">Conakry, Guinée</p>
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full rounded-xl">
            Conditions d'utilisation
          </Button>
          <Button variant="outline" className="w-full rounded-xl">
            Politique de confidentialité
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground space-y-1 pt-4">
          <p>© 2026 GRANDSON CLOTHES</p>
          <p>Tous droits réservés</p>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
