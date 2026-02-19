"use client"

import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Shield, Eye, Lock, Users, Mail, Phone } from "lucide-react"

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Confidentialité" showBack />
      
      <main className="px-4 py-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold">Politique de Confidentialité</h1>
          <p className="text-sm text-muted-foreground">
            Dernière mise à jour : 15 janvier 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h2 className="font-semibold">Notre engagement</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Chez GRANDSON CLOTHES, nous respectons votre vie privée et nous nous engageons à protéger vos données personnelles. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
          </p>
        </div>

        {/* Data Collection */}
        <div className="bg-card rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-accent" />
            <h2 className="font-semibold">Données collectées</h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <h3 className="font-medium text-sm">Informations personnelles</h3>
              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                <li>• Nom, prénom, adresse email</li>
                <li>• Numéro de téléphone</li>
                <li>• Adresse de livraison</li>
                <li>• Informations de paiement (cryptées)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-sm">Données d'utilisation</h3>
              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                <li>• Historique de navigation</li>
                <li>• Préférences produits</li>
                <li>• Historique des commandes</li>
                <li>• Données analytiques anonymisées</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Usage */}
        <div className="bg-card rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            <h2 className="font-semibold">Utilisation des données</h2>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Nous utilisons vos données pour :</p>
            <ul className="space-y-1">
              <li>• Traiter et livrer vos commandes</li>
              <li>• Améliorer votre expérience d'achat</li>
              <li>• Vous envoyer des notifications importantes</li>
              <li>• Personnaliser nos recommandations</li>
              <li>• Assurer la sécurité de notre plateforme</li>
              <li>• Respecter nos obligations légales</li>
            </ul>
          </div>
        </div>

        {/* Data Protection */}
        <div className="bg-card rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-accent" />
            <h2 className="font-semibold">Protection des données</h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <h3 className="font-medium text-sm">Mesures de sécurité</h3>
              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                <li>• Cryptage SSL 256 bits</li>
                <li>• Serveurs sécurisés</li>
                <li>• Accès restreint aux données</li>
                <li>• Surveillance continue</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-sm">Stockage des données</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Vos données sont stockées sur des serveurs sécurisés et ne sont conservées que le temps nécessaire à nos services.
              </p>
            </div>
          </div>
        </div>

        {/* User Rights */}
        <div className="bg-card rounded-2xl p-4 space-y-4">
          <h2 className="font-semibold">Vos droits</h2>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Vous avez le droit de :</p>
            <ul className="space-y-1">
              <li>• Accéder à vos données personnelles</li>
              <li>• Rectifier vos informations</li>
              <li>• Supprimer votre compte</li>
              <li>• Limiter le traitement de vos données</li>
              <li>• Vous opposer au marketing direct</li>
              <li>• Portabilité de vos données</li>
            </ul>
          </div>
        </div>

        {/* Cookies */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h2 className="font-semibold">Cookies et technologies similaires</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Nous utilisons des cookies pour améliorer votre expérience, analyser l'utilisation du site et personnaliser le contenu. Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
          </p>
        </div>

        {/* Third Parties */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h2 className="font-semibold">Partage avec des tiers</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Nous ne vendons jamais vos données personnelles. Nous pouvons partager certaines informations avec nos partenaires de confiance (transporteurs, processeurs de paiement) uniquement pour fournir nos services.
          </p>
        </div>

        {/* Updates */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h2 className="font-semibold">Modifications de cette politique</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Nous pouvons mettre à jour cette politique de confidentialité. Les modifications importantes vous seront notifiées par email ou via l'application.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 space-y-3">
          <h2 className="font-semibold">Nous contacter</h2>
          <p className="text-sm text-muted-foreground">
            Pour toute question concernant cette politique ou vos données personnelles :
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-accent" />
              <span>privacy@grandsonclothes.com</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-accent" />
              <span>+224 XX XX XX XX</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button className="w-full rounded-2xl">
            Gérer mes préférences
          </Button>
          <Button variant="outline" className="w-full rounded-2xl">
            Télécharger mes données
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground space-y-1 pt-4">
          <p>GRANDSON CLOTHES</p>
          <p>Conakry, Guinée</p>
          <p>© 2026 Tous droits réservés</p>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}