"use client"

import { Home, Search, Heart, ShoppingBag, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { useFavoritesContext } from "@/lib/favorites-context"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: Home, label: "Accueil", href: "/" },
  { icon: Search, label: "Explorer", href: "/explorer" },
  { icon: Heart, label: "Favoris", href: "/favoris" },
  { icon: ShoppingBag, label: "Panier", href: "/panier" },
  { icon: User, label: "Profil", href: "/profil" },
]

export function BottomNav() {
  const pathname = usePathname()
  const { totalItems } = useCart()
  const { totalFavorites } = useFavoritesContext()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          const isCart = item.href === "/panier"
          const isFavorites = item.href === "/favoris"

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-2xl transition-all duration-300 relative",
                isActive
                  ? "text-accent scale-110"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-6 h-6 transition-all duration-300",
                    isActive && "stroke-[2.5px]"
                  )}
                />
                {isCart && totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in-50 duration-200">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
                {isFavorites && totalFavorites > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in-50 duration-200">
                    {totalFavorites > 9 ? "9+" : totalFavorites}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-all duration-300",
                  isActive ? "opacity-100" : "opacity-70"
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-1 h-1 bg-accent rounded-full animate-in fade-in zoom-in duration-300" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
