"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-background overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-streetwear-1.jpg"
          alt="GRANDSON CLOTHES Streetwear"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <p className="text-accent font-medium tracking-[0.3em] mb-4 text-sm">
            STREETWEAR DEPUIS LA GUINEE
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-foreground leading-none mb-6">
            GRANDSON
            <br />
            <span className="text-accent">CLOTHES</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mb-8 leading-relaxed">
            Vetements urbains authentiques. Style audacieux. Culture africaine.
            Decouvrez la nouvelle collection streetwear.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-foreground text-background hover:bg-accent hover:text-accent-foreground font-bold tracking-wider px-8">
              VOIR LA COLLECTION
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-foreground text-foreground hover:bg-foreground hover:text-background font-bold tracking-wider px-8 bg-transparent">
              NOUVEAUTES
            </Button>
          </div>
        </div>
      </div>

      {/* Side image */}
      <div className="hidden lg:block absolute right-0 top-0 w-1/3 h-full">
        <img
          src="/images/hero-streetwear-2.jpg"
          alt="Streetwear collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent" />
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground">
        <span className="text-xs tracking-[0.3em]">SCROLL</span>
        <div className="w-px h-12 bg-gradient-to-b from-muted-foreground to-transparent" />
      </div>
    </section>
  )
}
