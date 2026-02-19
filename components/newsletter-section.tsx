"use client"

import React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Check } from "lucide-react"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setEmail("")
    }
  }

  return (
    <section className="py-20 bg-accent text-accent-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl mb-4">
            REJOINS LA FAMILLE
          </h2>
          <p className="text-accent-foreground/80 mb-8 leading-relaxed">
            Inscris-toi pour recevoir les nouveaux drops en avant-premiere,
            des offres exclusives et les news de GRANDSON CLOTHES.
          </p>

          {isSubscribed ? (
            <div className="flex items-center justify-center gap-2 text-accent-foreground">
              <div className="w-10 h-10 bg-accent-foreground/20 flex items-center justify-center">
                <Check className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold">BIENVENUE DANS LA FAMILLE!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Ton adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-accent-foreground/10 border-accent-foreground/20 text-accent-foreground placeholder:text-accent-foreground/50 focus:border-accent-foreground/40"
              />
              <Button 
                type="submit"
                className="bg-accent-foreground text-accent hover:bg-accent-foreground/90 tracking-wider text-sm font-bold"
              >
                JE M&apos;INSCRIS
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          <p className="text-xs text-accent-foreground/60 mt-4">
            Pas de spam, promis. Tu peux te desinscrire a tout moment.
          </p>
        </div>
      </div>
    </section>
  )
}
