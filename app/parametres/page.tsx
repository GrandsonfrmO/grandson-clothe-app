"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { usePWA } from "@/hooks/use-pwa"
import { PWAInstructions } from "@/components/pwa-instructions"
import { useApiClient } from "@/hooks/use-api"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { toast } from "sonner"
import { 
  Bell, 
  Moon, 
  Globe, 
  Shield, 
  Smartphone,
  Mail,
  MessageSquare,
  ChevronRight,
  Download,
  Check,
  Loader2
} from "lucide-react"

function ParametresContent() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    newsletter: false,
    marketingEmails: false,
    privacyMode: false,
    dataCollection: true,
  })
  
  const [darkMode, setDarkMode] = useState(true)
  const api = useApiClient()
  const { user } = useAuth()
  const { isInstallable, isInstalled, installApp } = usePWA()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await api.getSettings()
      setSettings(data)
    } catch (error) {
      console.error('Error loading settings:', error)
      // Use default settings on error
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = async (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)

    try {
      setSaving(true)
      await api.updateSettings(newSettings)
      toast.success("Paramètres mis à jour")
    } catch (error) {
      console.error('Error updating settings:', error)
      // Revert change
      setSettings(settings)
      toast.error("Erreur lors de la mise à jour")
    } finally {
      setSaving(false)
    }
  }

  const handleInstallApp = async () => {
    await installApp()
  }

  const settingsGroups = [
    {
      title: "Notifications",
      icon: Bell,
      settings: [
        {
          key: "pushNotifications",
          label: "Notifications push",
          description: "Recevoir des notifications sur votre appareil",
        },
        {
          key: "emailNotifications",
          label: "Notifications par email",
          description: "Recevoir des emails pour les commandes",
        },
        {
          key: "smsNotifications",
          label: "Notifications SMS",
          description: "Recevoir des SMS pour les mises à jour importantes",
        },
        {
          key: "newsletter",
          label: "Infolettre",
          description: "Recevoir nos actualités et mises à jour",
        },
        {
          key: "marketingEmails",
          label: "Emails marketing",
          description: "Recevoir les promotions et offres spéciales",
        },
      ]
    },
    {
      title: "Confidentialité",
      icon: Shield,
      settings: [
        {
          key: "privacyMode",
          label: "Mode confidentialité",
          description: "Limiter la collecte de données personnelles",
        },
        {
          key: "dataCollection",
          label: "Collecte de données",
          description: "Autoriser la collecte de données pour améliorer le service",
        },
      ]
    }
  ]

  const actionItems = [
    {
      icon: Globe,
      label: "Langue",
      value: "Français",
      href: "/parametres/langue"
    },
    {
      icon: Shield,
      label: "Confidentialité",
      value: "",
      href: "/confidentialite"
    },
    {
      icon: Smartphone,
      label: "À propos de l'app",
      value: "v1.0.0",
      href: "/parametres/about"
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader title="Paramètres" showBack />
        
        <main className="px-4 py-4 space-y-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            ))}
          </div>
        </main>

        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Paramètres" showBack />
      
      <main className="px-4 py-4 space-y-6">
        {/* PWA Installation */}
        {(isInstallable || isInstalled) && (
          <div className="space-y-4">
            <h3 className="font-semibold">Application</h3>
            <div className="bg-card rounded-2xl divide-y divide-border">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    {isInstalled ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Download className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {isInstalled ? "Application installée" : "Installer l'application"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {isInstalled 
                        ? "L'application est installée sur votre appareil" 
                        : "Accès rapide depuis votre écran d'accueil"
                      }
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <PWAInstructions />
                  {isInstallable && !isInstalled && (
                    <Button onClick={handleInstallApp} size="sm">
                      Installer
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Groups */}
        {settingsGroups.map((group) => (
          <div key={group.title} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                <group.icon className="w-4 h-4 text-accent" />
              </div>
              <h3 className="font-semibold">{group.title}</h3>
            </div>
            
            <div className="bg-card rounded-2xl divide-y divide-border">
              {group.settings.map((setting, index) => (
                <div key={index} className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <h4 className="font-medium">{setting.label}</h4>
                    <p className="text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                  <Switch
                    checked={settings[setting.key as keyof typeof settings]}
                    onCheckedChange={(value) => handleSettingChange(setting.key, value)}
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Action Items */}
        <div className="space-y-4">
          <h3 className="font-semibold">Général</h3>
          <div className="bg-card rounded-2xl divide-y divide-border">
            {actionItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between p-4 w-full text-left hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.value && (
                    <span className="text-sm text-muted-foreground">
                      {item.value}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Support */}
        <div className="space-y-4">
          <h3 className="font-semibold">Support</h3>
          <div className="bg-card rounded-2xl divide-y divide-border">
            <a 
              href="mailto:support@grandson.com"
              className="flex items-center justify-between p-4 w-full text-left hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="font-medium">Contacter le support</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </a>
            
            <a 
              href="mailto:support@grandson.com?subject=Signaler un problème"
              className="flex items-center justify-between p-4 w-full text-left hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="font-medium">Signaler un problème</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </a>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-4">
          <h3 className="font-semibold text-destructive">Zone de danger</h3>
          <div className="bg-card rounded-2xl border border-destructive/20">
            <Button 
              variant="ghost" 
              className="w-full justify-start p-4 text-destructive hover:bg-destructive/10 rounded-2xl"
              onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
                  // Handle account deletion
                  console.log('Account deletion requested')
                  toast.error("Suppression de compte non disponible pour le moment")
                }
              }}
            >
              Supprimer mon compte
            </Button>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center text-xs text-muted-foreground space-y-1 pt-4">
          <p>GRANDSON CLOTHES v1.0.0</p>
          <p>© 2026 Tous droits réservés</p>
        </div>
      </main>

      <BottomNav />
      <PWAInstructions />
    </div>
  )
}

export default function ParametresPage() {
  return (
    <ProtectedRoute>
      <ParametresContent />
    </ProtectedRoute>
  )
}