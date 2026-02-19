"use client"

import { Truck, Shield, Recycle, HeadphonesIcon } from "lucide-react"

const features = [
  {
    icon: Truck,
    title: "Livraison Gratuite",
    description: "Livraison offerte en Guinee et en Afrique de l'Ouest"
  },
  {
    icon: Shield,
    title: "Paiement Securise",
    description: "Paiement à la livraison en toute sécurité"
  },
  {
    icon: Recycle,
    title: "Echanges Faciles",
    description: "14 jours pour echanger votre commande"
  },
  {
    icon: HeadphonesIcon,
    title: "Support WhatsApp",
    description: "Notre equipe vous repond 7j/7 sur WhatsApp"
  },
]

export function FeaturesSection() {
  return (
    <section className="py-16 bg-secondary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-accent/20 mb-4">
                <feature.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-bold text-foreground mb-2 tracking-wide">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
