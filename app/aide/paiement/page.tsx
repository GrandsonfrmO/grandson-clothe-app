"use client"

import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Truck, Search, MessageCircle, Phone, Shield, CheckCircle } from "lucide-react"
import { useState } from "react"

const faqItems = [
  {
    id: "1",
    question: "Quel est le seul mode de paiement disponible ?",
    answer: "Nous proposons uniquement le paiement à la livraison (Cash on Delivery) :\n\n💵 Paiement à la livraison :\n• Payez en espèces à la réception\n• Aucune commission supplémentaire\n• Montant exact de votre commande\n• Disponible à Conakry\n\n✅ Avantages :\n• Aucun risque de fraude\n• Vérifiez votre colis avant de payer\n• Flexible et simple\n• Pas de données bancaires requises"
  },
  {
    id: "2",
    question: "Comment fonctionne le paiement à la livraison ?",
    answer: "Processus simple en 3 étapes :\n\n1️⃣ Passez votre commande :\n• Ajoutez vos produits au panier\n• Remplissez votre adresse de livraison\n• Confirmez votre commande\n• Vous recevez un numéro de commande\n\n2️⃣ Recevez votre colis :\n• Le livreur vous contactera avant l'arrivée\n• Vérifiez votre colis à la réception\n• Assurez-vous que tout est correct\n\n3️⃣ Payez le livreur :\n• Payez en espèces exactes si possible\n• Demandez un reçu\n• Conservez votre reçu de livraison"
  },
  {
    id: "3",
    question: "Quels sont les frais de livraison ?",
    answer: "Frais de livraison selon la zone :\n\n📍 Zones de Conakry :\n• Kaloum : 5,000 GNF\n• Dixinn : 7,500 GNF\n• Ratoma : 10,000 GNF\n• Kindia : 15,000 GNF\n• Autres zones : Sur demande\n\n🚚 Venir chercher :\n• Gratuit\n• Retrait au magasin\n• Disponible immédiatement\n\n💡 Astuce : Vérifiez votre zone de livraison avant de commander"
  },
  {
    id: "4",
    question: "Combien de temps pour la livraison ?",
    answer: "Délais de livraison :\n\n⏱️ Délais standards :\n• Conakry centre : 1-2 jours\n• Banlieue : 2-3 jours\n• Autres zones : 3-5 jours\n\n🚀 Livraison express :\n• Disponible pour Conakry\n• Livraison le jour même\n• Frais supplémentaires : 5,000 GNF\n\n📦 Suivi :\n• Vous recevez un SMS avec le numéro du livreur\n• Vous pouvez le contacter directement\n• Suivi en temps réel disponible"
  },
  {
    id: "5",
    question: "Que faire si je n'ai pas d'argent à la livraison ?",
    answer: "Options si vous n'avez pas d'argent :\n\n❌ Refus de paiement :\n• Le livreur ne peut pas laisser le colis\n• Vous devez reprogrammer la livraison\n• Frais de relivraison : 2,500 GNF\n\n✅ Solutions :\n• Préparez l'argent avant la livraison\n• Demandez au livreur de revenir plus tard\n• Contactez-nous pour reporter la livraison\n• Annulez la commande (remboursement sous 3-5 jours)\n\n💡 Conseil : Assurez-vous d'avoir l'argent avant la livraison"
  },
  {
    id: "6",
    question: "Puis-je vérifier mon colis avant de payer ?",
    answer: "Oui, vous pouvez vérifier votre colis :\n\n✅ À la réception :\n• Ouvrez le colis devant le livreur\n• Vérifiez les articles\n• Vérifiez la quantité\n• Vérifiez l'état du produit\n\n❌ Si le colis est endommagé :\n• Refusez le colis\n• Contactez-nous immédiatement\n• Nous enverrons un nouveau colis\n• Remboursement complet si nécessaire\n\n📸 Conseil : Prenez des photos si vous constatez un problème"
  },
  {
    id: "7",
    question: "Comment obtenir une facture ?",
    answer: "Vos factures sont automatiquement générées :\n\n📧 Par email :\n• Envoyée après confirmation de commande\n• Format PDF téléchargeable\n• Contient tous les détails légaux\n\n📱 Dans l'app :\n• Menu > Mes commandes\n• Cliquez sur la commande\n• Bouton 'Télécharger la facture'\n\n🏢 Facture entreprise :\n• Indiquez vos informations fiscales\n• NIF, RCCM si applicable\n• Facture adaptée aux entreprises\n\n📞 Besoin d'aide : Contactez notre support"
  },
  {
    id: "8",
    question: "Remboursement : comment ça marche ?",
    answer: "Processus de remboursement :\n\n⏰ Délais :\n• Remboursement sous 3-5 jours ouvrés\n• Crédit sur votre compte\n• Confirmation par email\n\n📋 Procédure :\n1. Demande de remboursement\n2. Vérification de la commande\n3. Validation du remboursement\n4. Traitement du remboursement\n5. Crédit sur votre compte\n\n💰 Frais :\n• Remboursement gratuit\n• Aucun frais de traitement\n• Montant intégral remboursé\n\n📧 Suivi par email à chaque étape"
  },
  {
    id: "9",
    question: "Codes promo et réductions",
    answer: "Utilisation des codes promo :\n\n🎫 Comment utiliser :\n• Ajoutez vos produits au panier\n• Cliquez sur 'Code promo'\n• Saisissez votre code\n• Réduction appliquée automatiquement\n\n📅 Codes actuels :\n• GRANDSON20 : -20% sur tout\n• NOUVEAU15 : -15% première commande\n• FIDELE10 : -10% clients fidèles\n\n⚠️ Conditions :\n• Un code par commande\n• Non cumulable avec autres offres\n• Vérifiez la date d'expiration\n• Montant minimum parfois requis\n\n💡 Abonnez-vous à la newsletter pour les codes exclusifs"
  }
]

export default function PaiementFAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  
  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="FAQ Paiement" showBack />
      
      <main className="px-4 py-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
            <Truck className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-xl font-bold">Paiement à la livraison</h1>
          <p className="text-sm text-muted-foreground">
            Tout savoir sur notre mode de paiement simple et sécurisé
          </p>
        </div>

        {/* Payment Method Info */}
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-accent" />
            <span className="font-semibold">Paiement à la livraison</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Payez en espèces à la réception de votre colis. Simple, sécurisé et sans frais supplémentaires.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              <span>Aucune commission supplémentaire</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              <span>Vérifiez votre colis avant de payer</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              <span>Paiement en espèces uniquement</span>
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
          <h3 className="font-semibold">Besoin d'aide ?</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat urgent
            </Button>
            <Button variant="outline" className="gap-2">
              <Phone className="w-4 h-4" />
              Appel direct
            </Button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
