"use client"

import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Truck, Search, MessageCircle, Phone, MapPin } from "lucide-react"
import { useState } from "react"

const faqItems = [
  {
    id: "1",
    question: "Quels sont les délais de livraison ?",
    answer: "Nos délais de livraison :\n\n• Livraison standard (gratuite) : 2-5 jours ouvrés\n• Livraison express : 24-48h (25,000 GNF)\n\nZones de livraison :\n• Conakry centre : 1-2 jours\n• Banlieue de Conakry : 2-3 jours\n• Autres villes : 3-5 jours\n\nLes délais peuvent varier selon les conditions météorologiques et les jours fériés."
  },
  {
    id: "2",
    question: "Dans quelles zones livrez-vous ?",
    answer: "Nous livrons dans toute la Guinée :\n\n🏙️ Conakry et banlieue :\n• Kaloum, Dixinn, Matam, Ratoma, Matoto\n• Coyah, Dubréka, Forécariah\n\n🌍 Autres villes :\n• Kindia, Mamou, Labé, Faranah\n• Kankan, Siguiri, Kouroussa\n• N'Zérékoré, Macenta, Guéckédou\n\nLivraison internationale : Bientôt disponible"
  },
  {
    id: "3",
    question: "Comment suivre ma livraison ?",
    answer: "Suivez votre livraison facilement :\n\n📱 Dans l'application :\n• Menu > Mes commandes\n• Cliquez sur votre commande\n• Voir le statut en temps réel\n\n📧 Par email/SMS :\n• Notifications automatiques\n• Lien de suivi inclus\n• Alerte avant livraison\n\n📞 Par téléphone :\n• Appelez notre service client\n• Donnez votre numéro de commande"
  },
  {
    id: "4",
    question: "Frais de livraison",
    answer: "Structure de nos frais :\n\n🆓 Livraison gratuite :\n• Commandes > 500,000 GNF\n• Livraison standard uniquement\n• Toutes zones confondues\n\n💰 Frais selon la zone :\n• Conakry centre : Gratuit\n• Banlieue Conakry : 15,000 GNF\n• Autres villes : 25,000 GNF\n\n⚡ Livraison express :\n• +25,000 GNF partout\n• Livraison en 24-48h"
  },
  {
    id: "5",
    question: "Que faire si je ne suis pas là ?",
    answer: "Si vous êtes absent lors de la livraison :\n\n1️⃣ Premier passage :\n• Le livreur vous appelle\n• Tentative de livraison\n• Avis de passage laissé\n\n2️⃣ Deuxième tentative :\n• Nouvelle tentative le lendemain\n• SMS de confirmation\n\n3️⃣ Point relais :\n• Après 2 tentatives ratées\n• Colis disponible en point relais\n• 7 jours pour récupérer\n\n💡 Conseils :\n• Indiquez un point de repère\n• Donnez un numéro joignable\n• Précisez vos horaires de disponibilité"
  },
  {
    id: "6",
    question: "Livraison en point relais",
    answer: "Nos points relais partenaires :\n\n📍 Conakry :\n• Boutiques Orange Money\n• Stations-service Total\n• Pharmacies partenaires\n• Centres commerciaux\n\n📋 Comment ça marche :\n1. Choisissez un point relais\n2. Votre colis y est livré\n3. SMS de confirmation\n4. Récupérez avec votre pièce d'identité\n\n⏰ Horaires :\n• Lundi-Samedi : 8h-20h\n• Dimanche : 10h-18h\n• Durée de conservation : 7 jours"
  },
  {
    id: "7",
    question: "Problème avec ma livraison",
    answer: "En cas de problème :\n\n📦 Colis endommagé :\n• Refusez la livraison\n• Prenez des photos\n• Contactez-nous immédiatement\n• Remplacement gratuit\n\n📦 Colis perdu :\n• Enquête immédiate\n• Remboursement ou renvoi\n• Compensation pour le désagrément\n\n📦 Retard de livraison :\n• Suivi en temps réel\n• Compensation selon le retard\n• Livraison prioritaire suivante\n\n📞 Contact urgent : +224 XX XX XX XX"
  },
  {
    id: "8",
    question: "Livraison le weekend ?",
    answer: "Livraisons weekend :\n\n📅 Samedi :\n• Livraisons normales\n• Tous les services disponibles\n• Horaires : 8h-18h\n\n📅 Dimanche :\n• Livraison express uniquement\n• Conakry centre seulement\n• Horaires : 10h-16h\n• Supplément : +10,000 GNF\n\n🎉 Jours fériés :\n• Pas de livraison\n• Reprise le jour ouvré suivant\n• Délais ajustés automatiquement"
  }
]

export default function LivraisonFAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  
  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="FAQ Livraison" showBack />
      
      <main className="px-4 py-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
            <Truck className="w-6 h-6 text-blue-500" />
          </div>
          <h1 className="text-xl font-bold">Questions sur la livraison</h1>
          <p className="text-sm text-muted-foreground">
            Tout savoir sur nos services de livraison
          </p>
        </div>

        {/* Quick Info */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-sm">Livraison gratuite</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Pour toute commande supérieure à 500,000 GNF partout en Guinée
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans la FAQ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-2xl bg-secondary border-0"
          />
        </div>

        {/* FAQ Accordion */}
        <div className="bg-card rounded-2xl overflow-hidden">
          <Accordion type="single" collapsible className="w-full">
            {filteredFAQ.map((item) => (
              <AccordionItem key={item.id} value={item.id} className="border-b border-border last:border-b-0">
                <AccordionTrigger className="px-4 py-4 text-left hover:no-underline hover:bg-secondary/50">
                  <span className="font-medium">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {item.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {filteredFAQ.length === 0 && (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Aucun résultat</h3>
            <p className="text-sm text-muted-foreground">
              Essayez avec d'autres mots-clés
            </p>
          </div>
        )}

        {/* Delivery Zones Map */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold">Zones de livraison</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <h4 className="font-medium text-green-500">Zone 1 - Gratuit</h4>
              <p className="text-muted-foreground">Conakry centre</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-500">Zone 2 - 15,000 GNF</h4>
              <p className="text-muted-foreground">Banlieue Conakry</p>
            </div>
            <div>
              <h4 className="font-medium text-orange-500">Zone 3 - 25,000 GNF</h4>
              <p className="text-muted-foreground">Autres villes</p>
            </div>
            <div>
              <h4 className="font-medium text-purple-500">Express - +25,000 GNF</h4>
              <p className="text-muted-foreground">24-48h partout</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold">Besoin d'aide ?</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat
            </Button>
            <Button variant="outline" className="gap-2">
              <Phone className="w-4 h-4" />
              Appeler
            </Button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}