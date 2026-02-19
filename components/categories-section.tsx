"use client"

import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

const categories = [
  {
    name: "HOODIES",
    description: "Confort & Style",
    image: "/images/category-hoodies.jpg",
    href: "#hoodies",
    count: "24 articles"
  },
  {
    name: "T-SHIRTS",
    description: "Graphiques Uniques",
    image: "/images/category-tshirts.jpg",
    href: "#tshirts",
    count: "36 articles"
  },
  {
    name: "PANTALONS",
    description: "Cargo & Joggers",
    image: "/images/category-pants.jpg",
    href: "#pantalons",
    count: "18 articles"
  },
]

export function CategoriesSection() {
  return (
    <section id="categories" className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <p className="text-accent font-medium tracking-[0.3em] mb-2 text-sm">COLLECTIONS</p>
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl text-foreground">
              NOS CATEGORIES
            </h2>
          </div>
          <Link 
            href="#shop" 
            className="text-muted-foreground hover:text-foreground transition-colors text-sm tracking-wider flex items-center gap-2"
          >
            VOIR TOUT
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative overflow-hidden aspect-[3/4] bg-secondary"
            >
              <img
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-accent text-xs tracking-[0.2em] mb-2">{category.count}</p>
                <h3 className="font-[family-name:var(--font-display)] text-3xl lg:text-4xl text-foreground mb-1">
                  {category.name}
                </h3>
                <p className="text-muted-foreground text-sm">{category.description}</p>
              </div>
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-foreground/10 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="h-5 w-5 text-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
