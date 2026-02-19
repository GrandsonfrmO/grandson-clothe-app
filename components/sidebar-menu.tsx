"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  X, 
  Package,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
  Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import { useFavoritesContext } from "@/lib/favorites-context"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface SidebarMenuProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { icon: Package, label: "Mes commandes", href: "/commandes" },
  { icon: HelpCircle, label: "Aide", href: "/aide" },
  { icon: Settings, label: "Paramètres", href: "/parametres" },
]

export function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { totalItems } = useCart()
  const { totalFavorites } = useFavoritesContext()
  const { user, logout } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  const getBadgeCount = (type: string) => {
    switch (type) {
      case "cart": return totalItems
      case "favorites": return totalFavorites
      default: return 0
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const handleLogout = () => {
    logout()
    router.push('/')
    setTimeout(onClose, 100)
  }

  const handleProfileClick = () => {
    if (user) {
      router.push('/profil')
      setTimeout(onClose, 100)
    }
  }

  const handleLinkClick = (e: React.MouseEvent) => {
    // Fermer le menu après un court délai pour permettre la navigation
    setTimeout(onClose, 100)
  }

  // Éviter l'erreur d'hydratation - ne rien rendre avant le montage
  if (!mounted) {
    return (
      <>
        <div className="fixed inset-0 pointer-events-none opacity-0" />
        <div className="fixed top-0 left-0 h-full w-80 -translate-x-full pointer-events-none" />
      </>
    )
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed top-0 left-0 h-full w-80 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                <span className="text-accent-foreground font-bold">GC</span>
              </div>
              <div>
                <h2 className="font-bold text-lg">GRANDSON</h2>
                <p className="text-xs text-muted-foreground tracking-widest">CLOTHES</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* User Profile */}
          <div className="p-6 border-b border-border">
            {user ? (
              <button
                onClick={handleProfileClick}
                className="w-full flex items-center gap-4 hover:opacity-80 transition-opacity"
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-accent text-accent-foreground font-bold">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {user.role === 'admin' ? 'Administrateur' : 'Client'}
                  </p>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-secondary">?</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">Non connecté</h3>
                  <p className="text-sm text-muted-foreground">Connectez-vous</p>
                </div>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2">
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                onClick={handleLinkClick}
                className="flex items-center gap-4 p-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors group border border-primary/20"
              >
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="flex-1 font-medium text-primary">Administration</span>
                <ChevronRight className="w-4 h-4 text-primary" />
              </Link>
            )}
            
            {menuItems.map((item) => {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary transition-colors group"
                >
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="flex-1 font-medium">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              )
            })}


          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-4">
            <div className="bg-gradient-to-r from-accent/20 to-accent/10 rounded-xl p-4 border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-accent-foreground text-xs font-bold">%</span>
                </div>
                <span className="font-semibold text-sm">Offre spéciale</span>
              </div>
              <p className="text-xs text-muted-foreground">
                -20% sur tout le site avec le code GRANDSON20
              </p>
            </div>

            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}