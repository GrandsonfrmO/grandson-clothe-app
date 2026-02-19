"use client"

import { Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    content: "La qualite est incroyable! J'ai commande un hoodie et je l'adore. Le style est unique et tout le monde me demande ou je l'ai achete.",
    author: "Mamadou S.",
    location: "Conakry, Guinee",
    rating: 5,
  },
  {
    id: 2,
    content: "Livraison rapide a Dakar et le t-shirt est exactement comme sur les photos. GRANDSON c'est ma nouvelle marque preferee!",
    author: "Fatou D.",
    location: "Dakar, Senegal",
    rating: 5,
  },
  {
    id: 3,
    content: "Enfin du streetwear africain de qualite! Les coupes sont parfaites et les designs sont originaux. Je recommande a 100%.",
    author: "Kofi A.",
    location: "Abidjan, Cote d'Ivoire",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-secondary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-accent font-medium tracking-[0.3em] mb-2 text-sm">
            TEMOIGNAGES
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl text-foreground">
            LA FAMILLE GRANDSON
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-background p-8 border border-border"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-accent text-accent"
                  />
                ))}
              </div>
              <blockquote className="text-foreground leading-relaxed mb-6">
                &ldquo;{testimonial.content}&rdquo;
              </blockquote>
              <div>
                <p className="font-bold text-foreground">
                  {testimonial.author}
                </p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
