"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function PromoCard() {
  return (
    <div className="mx-4 my-6">
      <Link
        href="/explorer?filter=promo"
        className="block relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/20 via-secondary to-card p-6 min-h-[180px]"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-accent rounded-full blur-3xl transform translate-x-20 -translate-y-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent rounded-full blur-3xl transform -translate-x-16 translate-y-16" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-between">
          <div>
            <p className="text-accent text-sm font-semibold uppercase tracking-wider mb-2">
              Offre Speciale
            </p>
            <h3 className="text-3xl font-bold leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              -20% SUR
              <br />
              TOUT LE SITE
            </h3>
          </div>

          <div className="flex items-center gap-2 text-accent font-medium mt-4">
            <span>Code: GRANDSON20</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-20 h-20 border border-accent/30 rounded-full" />
        <div className="absolute bottom-8 right-8 w-12 h-12 border border-accent/20 rounded-full" />
      </Link>
    </div>
  )
}
