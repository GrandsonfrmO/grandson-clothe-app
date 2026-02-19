"use client"

import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { RefreshCw, Search, MessageCircle, Phone, Package, CheckCircle } from "lucide-react"
import { useState } from "react"

const faqItems = [
  {
    id: "1",
    question: "Puis-je retourner un produit ?",
    answer: "Oui, vous pouvez retourner vos produits :\n\n✅ Conditions de retour :\n• Dans les 14 jours après réception\n• Produit non porté, avec étiquettes\n• Emballage d'origine conservé\n• Facture d'achat obligatoire\n\n❌ Produits non retournables :\n• Sous-vêtements et maillots de bain\n• Produits personnalisés\n• Produits soldés (sauf défaut)\n• Produits endommagés par l'usage\n\n💡 Retour gratuit pour défaut de fabrication"
  },
  {
    id: "2",
    question: "Comment faire un retour ?",
    answer: "Procédure de retour en 4 étapes :\n\n1️⃣ Demande de retour :\n• Connectez-vous à votre compte\n• Menu > Mes commandes\n• Sélectionnez les produits à retourner\n• Indiquez le motif du retour\n\n2️⃣ Étiquette de retour :\n• Étiquette générée automatiquement\n• Téléchargez et imprimez\n• Collez sur le colis\n\n3️⃣ Expédition :\n• Remettez le colis à notre transporteur\n• Ou déposez en point relais\n• Suivi automatique du retour\n\n4️⃣ Traitement :\n• Réception sous 3-5 jours\n• Vérification du produit\n• Remboursement ou échange"
  },
  {
    id: "3",
    question: "Délais de remboursement",
    answer: "Délais selon le mode de paiement :\n\n💳 Carte bancaire :\n• Traitement : 2-3 jours ouvrés\n• Crédit sur compte : 3-7 jours\n• Total : 5-10 jours maximum\n\n📱 Mobile Money :\n• Traitement : 1-2 jours ouvrés\n• Crédit immédiat après validation\n• Total : 1-3 jours maximum\n\n💵 Paiement à la livraison :\n• Remboursement par Mobile Money\n• Délai : 2-3 jours ouvrés\n\n📧 Notification par email à chaque étape"
  },
  {
    id: "4",
    question: "Échange de taille ou couleur",
    answer: "Échange simple et gratuit :\n\n📏 Échange de taille :\n• Gratuit dans les 14 jours\n• Même produit, taille différente\n• Sous réserve de disponibilité\n• Expédition du nouveau produit immédiate\n\n🎨 Échange de couleur :\n• Même conditions que la taille\n• Même prix ou différence à payer\n• Remboursement si moins cher\n\n⚡ Échange express :\n• Nouveau produit envoyé avant retour\n• Caution temporaire prélevée\n• Remboursée après réception du retour\n\n💡 Guide des tailles disponible sur chaque produit"
  },
  {
    id: "5",
    question: "Produit défectueux ou erreur de commande",
    answer: "Nous prenons tout en charge :\n\n🔧 Produit défectueux :\n• Retour gratuit immédiat\n• Remplacement prioritaire\n• Ou remboursement intégral\n• Compensation pour le désagrément\n\n📦 Erreur de notre part :\n• Retour et renvoi gratuits\n• Produit correct expédié en priorité\n• Geste commercial selon le cas\n\n📸 Marche à suivre :\n1. Prenez des photos du problème\n2. Contactez-nous immédiatement\n3. Gardez le produit et l'emballage\n4. Nous organisons la récupération\n\n⚡ Traitement prioritaire sous 24h"
  },
  {
    id: "6",
    question: "Frais de retour",
    answer: "Qui paie les frais de retour ?\n\n🆓 Retour gratuit :\n• Produit défectueux\n• Erreur de notre part\n• Échange de taille/couleur\n• Première commande (geste commercial)\n\n💰 Frais à votre charge :\n• Changement d'avis\n• Produit ne convient pas\n• Retour après 14 jours\n• Frais : 15,000 GNF (Conakry), 25,000 GNF (autres villes)\n\n💡 Astuce : Groupez vos retours pour économiser\n\n🎁 Clients VIP : Retours toujours gratuits"
  },
  {
    id: "7",
    question: "Suivi de mon retour",
    answer: "Suivez votre retour en temps réel :\n\n📱 Dans l'application :\n• Menu > Mes retours\n• Statut mis à jour automatiquement\n• Notifications push à chaque étape\n\n📧 Par email :\n• Confirmation de demande\n• Étiquette de retour\n• Réception confirmée\n• Traitement terminé\n\n📞 Par téléphone :\n• Service client : +224 XX XX XX XX\n• Référence de retour nécessaire\n\n🔍 Étapes du retour :\n1. Demande créée\n2. Étiquette générée\n3. Colis expédié\n4. Reçu en entrepôt\n5. Vérifié et traité\n6. Remboursement effectué"
  },
  {
    id: "8",
    question: "Politique de satisfaction",
    answer: "Notre garantie satisfaction :\n\n😊 Engagement qualité :\n• Satisfaction garantie ou remboursé\n• Contrôle qualité avant expédition\n• Service client réactif\n• Amélioration continue\n\n🎯 Objectifs :\n• 99% de clients satisfaits\n• Résolution sous 24h\n• Zéro frais caché\n• Transparence totale\n\n🏆 Programme fidélité :\n• Points bonus pour chaque retour traité\n• Avantages clients fidèles\n• Retours gratuits à vie (VIP)\n• Support prioritaire\n\n💬 Votre avis compte :\n• Enquête de satisfaction après retour\n• Amélioration basée sur vos retours\n• Programme ambassadeur"
  }
]

export default function RetoursFAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  
  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="FAQ Retours" showBack />
      
      <main className="px-4 py-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6 text-purple-500" />
          </div>
          <h1 className="text-xl font-bold">Questions sur les retours</h1>
          <p className="text-sm text-muted-foreground">
            Retours et échanges simplifiés
          </p>
        </div>

        {/* Return Policy Summary */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-purple-500" />
            <span className="font-semibold text-sm">Retour gratuit sous 14 jours</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Échange ou remboursement • Produit non porté • Étiquettes conservées
          </p>
        </div>

        {/* Quick Return Process */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold">Processus de retour rapide</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-xs font-bold text-purple-500">1</div>
              <span>Demande en ligne</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-xs font-bold text-purple-500">2</div>
              <span>Étiquette gratuite</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-xs font-bold text-purple-500">3</div>
              <span>Expédition</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-xs font-bold text-purple-500">4</div>
              <span>Remboursement</span>
            </div>
          </div>
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

        {/* Quick Actions */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold">Faire un retour maintenant</h3>
          <div className="space-y-2">
            <Button className="w-full gap-2">
              <Package className="w-4 h-4" />
              Demander un retour
            </Button>
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
        </div>
      </main>

      <BottomNav />
    </div>
  )
}