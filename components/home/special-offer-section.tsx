'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getHeroBannerImageUrl } from '@/lib/image-optimizer'
import { cachedFetch } from '@/lib/request-cache'

interface SpecialOffer {
  id: number
  title: string
  description: string
  image_url: string
  discount_text: string
  cta_text: string
  cta_link: string
  is_active: boolean
}

export function SpecialOfferSection() {
  const [offer, setOffer] = useState<SpecialOffer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOffer()
  }, [])

  const fetchOffer = async () => {
    try {
      const data = await cachedFetch<{ offer: SpecialOffer }>('/api/admin/special-offer')
      if (data.offer) {
        setOffer(data.offer)
      }
    } catch (error) {
      console.error('Error fetching special offer:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !offer) return null

  return (
    <section className="px-4 py-6">
      <Link href={offer.cta_link}>
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <div className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity">
            <img
              src={getHeroBannerImageUrl(offer.image_url, 'mobile')}
              alt={offer.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent" />

          <div className="relative p-6 sm:p-8 flex flex-col justify-between min-h-48 sm:min-h-56">
            <div>
              {offer.discount_text && (
                <div className="inline-block mb-3">
                  <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs sm:text-sm font-bold">
                    {offer.discount_text}
                  </span>
                </div>
              )}
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                {offer.title}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md">
                {offer.description}
              </p>
            </div>

            <Button className="w-fit gap-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl mt-4">
              {offer.cta_text}
              <span>→</span>
            </Button>
          </div>
        </div>
      </Link>
    </section>
  )
}
