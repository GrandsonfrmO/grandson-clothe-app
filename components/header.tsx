"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, ShoppingBag, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { UserMenu } from "@/components/auth/user-menu"

const navigation = [
  { name: "NOUVEAUTES", href: "#nouveautes" },
  { name: "HOODIES", href: "#hoodies" },
  { name: "T-SHIRTS", href: "#tshirts" },
  { name: "PANTALONS", href: "#pantalons" },
  { name: "ACCESSOIRES", href: "#accessoires" },
]

interface HeaderProps {
  cartCount?: number
}

export function Header({ cartCount = 0 }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Mobile menu */}
          <div className="flex lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-foreground">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Ouvrir le menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-background border-border">
                <div className="font-[family-name:var(--font-display)] text-3xl tracking-wider text-foreground mt-4 mb-8">
                  GRANDSON
                </div>
                <nav className="flex flex-col gap-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-lg font-bold tracking-wider text-foreground hover:text-accent transition-colors py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="font-[family-name:var(--font-display)] text-2xl lg:text-3xl tracking-wider text-foreground">
                GRANDSON
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wider"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex flex-1 items-center justify-end gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden sm:flex text-foreground hover:text-accent"
              asChild
            >
              <Link href="/recherche">
                <Search className="h-5 w-5" />
                <span className="sr-only">Rechercher</span>
              </Link>
            </Button>
            
            <div className="hidden sm:flex">
              <UserMenu />
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-foreground hover:text-accent"
              asChild
            >
              <Link href="/panier">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent text-accent-foreground"
                  >
                    {cartCount}
                  </Badge>
                )}
                <span className="sr-only">Panier</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
