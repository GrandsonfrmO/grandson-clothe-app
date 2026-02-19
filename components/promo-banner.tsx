"use client"

import { X } from "lucide-react"
import { useState } from "react"

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-accent text-accent-foreground py-2.5 px-4 relative">
      <div className="mx-auto max-w-7xl flex items-center justify-center gap-2">
        <p className="text-sm text-center font-medium tracking-wider">
          <span className="font-bold">LIVRAISON GRATUITE</span>
          {" — "}
          En Guinee et dans toute l&apos;Afrique de l&apos;Ouest
          {" | "}
          <span className="underline underline-offset-2 cursor-pointer hover:opacity-80">
            En savoir plus
          </span>
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
          aria-label="Fermer la banniere"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
