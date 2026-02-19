"use client"

import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Package, Search, MessageCircle, Phone } from "lucide-react"
import { useState } from "react"

const faqItems = [
  {
    id: "1",
    question: "Comment passer une commande ?",
    answer: "Pour passer une commande :\n1. Ajoutez vos produits au panier\n2. Cliquez sur 'Procéder au paiement'\n3. Renseignez votre adresse de livraison\n4. Choisissez votre mode de paiement\n5. Confirmez votre commande\n\nVous recevrez un email de confirmation avec votre numéro de commande."
  },
  {
    id: "2",
    question: "Comment suivre ma commande ?",
    answer: "Vous pouvez suivre votre commande de plusieurs façons :\n• Dans l'app : Menu > Mes commandes\n• Par email : Cliquez sur le lien dans l'email de confirmation\n• Par SMS : Vous recevrez des mises à jour automatiques\n\nVotre commande passe par ces étapes :\n1. En préparation\n2. Expédiée\n3. En transit\n4. Livrée"
  },
  {
    id: "3",
    question: "Puis-je modifier ma commande ?",
    answer: "Vous pouvez modifier votre commande uniquement si elle est encore 'En préparation' :\n• Contactez-nous immédiatement\n• Indiquez votre numéro de commande\n• Précisez les modifications souhaitées\n\nUne fois expédiée, la commande ne peut plus être modifiée."
  },
  {
    id: "4",
    question: "Comment annuler ma commande ?",
    answer: "Pour annuler votre commande :\n• Commande 'En préparation' : Annulation gratuite\n• Commande 'Expédiée' : Contactez le support\n• Commande 'Livrée' : Procédure de retour\n\nPour annuler :\n1. Allez dans 'Mes commandes'\n2. Sélectionnez la commande\n3. Cliquez sur 'Annuler'\n4. Confirmez l'annulation"
  },
  {
    id: "5",
    question: "Que faire si ma commande est en retard ?",
    answer: "Si votre commande dépasse les délais annoncés :\n1. Vérifiez le statut dans 'Mes commandes'\n2. Contactez notre support client\n3. Nous enquêterons immédiatement\n\nEn cas de retard :\n• Nous vous informons par SMS/email\n• Compensation possible selon le retard\n• Livraison prioritaire pour la prochaine commande"
  },
  {
    id: "6",
    question: "Comment obtenir une facture ?",
    answer: "Votre facture est disponible :\n• Par email : Envoyée automatiquement\n• Dans l'app : Menu > Mes commandes > Détails\n• Format PDF téléchargeable\n\nLa facture contient :\n• Détails des produits\n• Prix et taxes\n• Informations de livraison\n• Numéro de commande"
  },
  {
    id: "7",
    question: "Problème avec ma commande reçue ?",
    answer: "Si vous avez un problème avec votre commande :\n\n• Produit défectueux : Retour gratuit sous 14 jours\n• Mauvaise taille : Échange gratuit\n• Produit manquant : Renvoi immédiat\n• Erreur de commande : Remboursement complet\n\nContactez-nous avec :\n• Numéro de commande\n• Photos du problème\n• Description détaillée"
  },
  {
    id: "8",
    question: "Délais de traitement des commandes ?",
    answer: "Nos délais de traitement :\n\n• Préparation : 1-2 jours ouvrés\n• Expédition : Même jour si commande avant 14h\n• Livraison standard : 2-5 jours ouvrés\n• Livraison express : 24-48h\n\nFacteurs pouvant affecter les délais :\n• Jours fériés\n• Conditions météorologiques\n• Disponibilité des produits\n• Zone de livraison"
  }
]

export default function CommandesFAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  
  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="FAQ Commandes" showBack />
      
      <main className="px-4 py-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-xl font-bold">Questions sur les commandes</h1>
          <p className="text-sm text-muted-foreground">
            Tout ce que vous devez savoir sur vos commandes
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

        {/* Quick Actions */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold">Besoin d'aide supplémentaire ?</h3>
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

        {/* Related Topics */}
        <div className="bg-secondary/50 rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold">Sujets connexes</h3>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start text-sm">
              → FAQ Livraison
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm">
              → FAQ Paiement
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm">
              → FAQ Retours
            </Button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}