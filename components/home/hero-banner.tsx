"use client"

import { useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { getHeroBannerImageUrl } from "@/lib/image-optimizer"

interface Slide {
  id: number
  title: string
  subtitle: string
  image: string
  cta: string
  href: string
}

export function HeroBanner() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchSlides()
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleResize = () => {
    if (typeof window === 'undefined') return
    const width = window.innerWidth
    if (width < 640) setScreenSize('mobile')
    else if (width < 1024) setScreenSize('tablet')
    else setScreenSize('desktop')
  }

  const fetchSlides = async () => {
    try {
      const { cachedFetch } = await import('@/lib/request-cache')
      const data: any = await cachedFetch('/api/admin/homepage-content', {}, 30 * 60 * 1000) // 30 min cache
      
      const content = data.content || []
      const newDropContent = content.find((c: any) => c.section_key === 'new_drop')
      const streetVibesContent = content.find((c: any) => c.section_key === 'street_vibes')

      const fetchedSlides: Slide[] = []

      if (newDropContent?.image_url) {
        fetchedSlides.push({
          id: 1,
          title: newDropContent.title || 'NEW DROP',
          subtitle: newDropContent.subtitle || 'Collection 2026',
          image: newDropContent.image_url,
          cta: newDropContent.cta_text || 'Découvrir',
          href: newDropContent.cta_link || '/explorer',
        })
      }

      if (streetVibesContent?.image_url) {
        fetchedSlides.push({
          id: 2,
          title: streetVibesContent.title || 'STREET VIBES',
          subtitle: streetVibesContent.subtitle || 'Made in Guinea',
          image: streetVibesContent.image_url,
          cta: streetVibesContent.cta_text || 'Explorer',
          href: streetVibesContent.cta_link || '/explorer',
        })
      }

      // Fallback to default slides if no content found
      if (fetchedSlides.length === 0) {
        fetchedSlides.push(
          {
            id: 1,
            title: 'NEW DROP',
            subtitle: 'Collection 2026',
            image: '/images/hero-streetwear-1.jpg',
            cta: 'Découvrir',
            href: '/explorer',
          },
          {
            id: 2,
            title: 'STREET VIBES',
            subtitle: 'Made in Guinea',
            image: '/images/hero-streetwear-2.jpg',
            cta: 'Explorer',
            href: '/explorer',
          }
        )
      }

      setSlides(fetchedSlides)
    } catch (error) {
      console.error('Error fetching slides:', error)
      // Fallback to default slides
      setSlides([
        {
          id: 1,
          title: 'NEW DROP',
          subtitle: 'Collection 2026',
          image: '/images/hero-streetwear-1.jpg',
          cta: 'Découvrir',
          href: '/explorer',
        },
        {
          id: 2,
          title: 'STREET VIBES',
          subtitle: 'Made in Guinea',
          image: '/images/hero-streetwear-2.jpg',
          cta: 'Explorer',
          href: '/explorer',
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (slides.length === 0) return
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  if (!mounted || loading || slides.length === 0) {
    return (
      <div className="relative h-[65vh] min-h-[400px] overflow-hidden rounded-3xl mx-4 mt-4 bg-muted animate-pulse" />
    )
  }

  return (
    <div className="relative h-[65vh] min-h-[400px] overflow-hidden rounded-3xl mx-4 mt-4">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-all duration-700 ease-out",
            index === currentSlide
              ? "opacity-100 scale-100"
              : "opacity-0 scale-105"
          )}
        >
          {/* ✅ Utiliser Next.js Image avec priority pour le premier slide */}
          <Image
            src={getHeroBannerImageUrl(slide.image, screenSize)}
            alt={slide.title}
            fill
            priority={index === 0}
            quality={85}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
            <div className="space-y-1">
              <p className="text-accent text-sm font-semibold tracking-wider uppercase">
                {slide.subtitle}
              </p>
              <h2 className="text-5xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                {slide.title}
              </h2>
            </div>
            
            <Link href={slide.href}>
              <Button className="rounded-full px-6 h-12 gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                {slide.cta}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      ))}

      {/* Slide indicators */}
      <div className="absolute bottom-6 right-6 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              index === currentSlide
                ? "w-8 bg-accent"
                : "w-2 bg-foreground/30 hover:bg-foreground/50"
            )}
          />
        ))}
      </div>
    </div>
  )
}
