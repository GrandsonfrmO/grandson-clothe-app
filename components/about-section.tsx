"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function AboutSection() {
  return (
    <section id="apropos" className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden bg-secondary">
              <img
                src="/images/brand-story.jpg"
                alt="GRANDSON CLOTHES Studio"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-accent text-accent-foreground p-6 max-w-[200px] hidden md:block">
              <p className="font-[family-name:var(--font-display)] text-5xl">2020</p>
              <p className="text-sm mt-1 font-medium">
                Fonde a Conakry, Guinee
              </p>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-accent font-medium tracking-[0.3em] mb-4 text-sm">
              NOTRE HISTOIRE
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl text-foreground mb-6">
              NE EN AFRIQUE
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                GRANDSON CLOTHES est ne en 2020 a Conakry, Guinee, avec une vision simple: 
                creer du streetwear authentique qui represente la culture urbaine africaine.
              </p>
              <p>
                Chaque piece est concue avec passion, melangeant les influences de la rue 
                africaine avec les tendances streetwear mondiales. Nous creons des vetements 
                pour ceux qui osent se demarquer.
              </p>
              <p>
                De Conakry a Dakar, d&apos;Abidjan a Lagos, GRANDSON CLOTHES habille la 
                nouvelle generation africaine avec style et authenticite.
              </p>
            </div>
            <div className="flex flex-wrap gap-8 mt-8 mb-8">
              <div>
                <p className="font-[family-name:var(--font-display)] text-4xl text-foreground">5K+</p>
                <p className="text-sm text-muted-foreground">Clients satisfaits</p>
              </div>
              <div>
                <p className="font-[family-name:var(--font-display)] text-4xl text-foreground">15+</p>
                <p className="text-sm text-muted-foreground">Pays livres</p>
              </div>
              <div>
                <p className="font-[family-name:var(--font-display)] text-4xl text-foreground">100%</p>
                <p className="text-sm text-muted-foreground">Made in Africa</p>
              </div>
            </div>
            <Button className="tracking-wider text-sm bg-foreground text-background hover:bg-accent hover:text-accent-foreground font-bold">
              DECOUVRIR LA MARQUE
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
