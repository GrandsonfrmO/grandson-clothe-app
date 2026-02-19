"use client"

import { useState } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useFavoritesContext } from "@/lib/favorites-context"
import { useProfile, useOrders, apiClient } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"
import { 
  User, 
  Package, 
  Heart, 
  Settings, 
  HelpCircle, 
  Shield, 
  Bell,
  MapPin,
  CreditCard,
  LogOut,
  ChevronRight,
  Star,
  Gift,
  Edit,
  Loader2
} from "lucide-react"
import Link from "next/link"

const menuItems = [
  {
    icon: Package,
    label: "Mes commandes",
    href: "/commandes",
  },
  {
    icon: Heart,
    label: "Mes favoris",
    href: "/favoris",
  },
  {
    icon: MapPin,
    label: "Adresses de livraison",
    href: "/adresses",
  },
  {
    icon: CreditCard,
    label: "Moyens de paiement",
    href: "/paiement",
  },
  {
    icon: Bell,
    label: "Notifications",
    href: "/notifications",
  },
  {
    icon: Settings,
    label: "Paramètres",
    href: "/parametres",
  },
  {
    icon: HelpCircle,
    label: "Aide & Support",
    href: "/aide",
  },
  {
    icon: Shield,
    label: "Confidentialité",
    href: "/confidentialite",
  }
]

function EditProfileDialog({ user, onUpdate }: { user: any, onUpdate: (user: any) => void }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiClient.updateProfile(formData)
      onUpdate(response.user)
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la mise à jour",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full rounded-xl gap-2">
          <Edit className="w-4 h-4" />
          Modifier le profil
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le profil</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+224 123 456 789"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sauvegarder
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ChangePasswordDialog() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      })
      return
    }

    if (formData.newPassword.length < 8) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await apiClient.changePassword(formData)
      toast({
        title: "Succès",
        description: "Votre mot de passe a été changé avec succès",
      })
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors du changement de mot de passe",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full rounded-xl gap-2">
          <Shield className="w-4 h-4" />
          Changer le mot de passe
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Changer le mot de passe</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.current ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.new ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.confirm ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Changer le mot de passe
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ProfilContent() {
  const { user, logout, updateUser } = useAuth()
  const { data: profileData, loading: profileLoading } = useProfile()
  const { data: ordersData } = useOrders({ limit: 1 })
  const { totalFavorites } = useFavoritesContext()

  const profile = profileData?.user || user
  const ordersCount = ordersData?.pagination?.total || 0
  const favoritesCount = totalFavorites

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const handleLogout = () => {
    logout()
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader title="Profil" showBack />
        <main className="px-4 py-6 space-y-6">
          {/* Profile Skeleton */}
          <div className="bg-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-4">
                <Skeleton className="h-8 w-8 mx-auto mb-2" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Profil" showBack />
      
      <main className="px-4 py-6 space-y-6">
        {/* User Profile */}
        <div className="bg-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="bg-accent text-accent-foreground text-xl font-bold">
                {getInitials(profile.firstName, profile.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  {profile.role === 'admin' ? 'Administrateur' : 'Client'}
                </Badge>
              </div>
            </div>
          </div>
          
          <EditProfileDialog user={profile} onUpdate={updateUser} />
          <ChangePasswordDialog />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-accent">{ordersCount}</div>
            <div className="text-xs text-muted-foreground">Commandes</div>
          </div>
          <div className="bg-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-accent">{favoritesCount}</div>
            <div className="text-xs text-muted-foreground">Favoris</div>
          </div>
          <div className="bg-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-accent">{profile.loyaltyPoints || 0}</div>
            <div className="text-xs text-muted-foreground">Points</div>
          </div>
        </div>

        {/* Loyalty Program */}
        {profile.loyaltyPoints > 0 && (
          <div className="bg-gradient-to-r from-accent/20 to-accent/10 rounded-2xl p-4 border border-accent/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <Gift className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Programme de fidélité</h3>
                <p className="text-sm text-muted-foreground">
                  {profile.loyaltyPoints} points disponibles
                </p>
              </div>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 mb-2">
              <div 
                className="bg-accent h-2 rounded-full" 
                style={{ width: `${Math.min((profile.loyaltyPoints / 1000) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground">
              {profile.loyaltyPoints < 1000 
                ? `Plus que ${1000 - profile.loyaltyPoints} points pour débloquer une récompense !`
                : 'Félicitations ! Vous avez débloqué des récompenses.'
              }
            </p>
          </div>
        )}

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 p-4 bg-card rounded-xl hover:bg-card/80 transition-colors"
            >
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <span className="font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>

        {/* App Info */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold">À propos</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Version de l'app</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Dernière mise à jour</span>
              <span>15 Jan 2026</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full rounded-2xl h-12 text-destructive border-destructive/20 hover:bg-destructive/10 gap-2"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </Button>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground space-y-1 pt-4">
          <p>GRANDSON CLOTHES</p>
          <p>Streetwear authentique depuis la Guinée</p>
          <p>© 2026 Tous droits réservés</p>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default function ProfilPage() {
  return (
    <ProtectedRoute>
      <ProfilContent />
    </ProtectedRoute>
  )
}