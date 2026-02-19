"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { cachedFetch } from "@/lib/request-cache"

interface GalleryImage {
  id: number
  image: string
  name: string
  description: string
}

const FALLBACK_IMAGES: GalleryImage[] = [
  {
    id: 1,
    image: '/images/gallery-1.jpg',
    name: 'Street Style',
    description: 'Nos clients portent la marque avec style'
  },
  {
    id: 2,
    image: '/images/gallery-2.jpg',
    name: 'Urban Look',
    description: 'Collection 2026 en action'
  },
  {
    id: 3,
    image: '/images/gallery-3.jpg',
    name: 'Fashion Forward',
    description: 'Tendances streetwear'
  },
  {
    id: 4,
    image: '/images/gallery-4.jpg',
    name: 'Made in Guinea',
    description: 'Fierté locale'
  },
  {
    id: 5,
    image: '/images/gallery-5.jpg',
    name: 'Community',
    description: 'Notre communauté grandit'
  }
]

export function GallerySection() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [autoScroll, setAutoScroll] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchGalleryImages()
  }, [])

  const fetchGalleryImages = async () => {
    try {
      const data = await cachedFetch<{ gallery: GalleryImage[] }>('/api/admin/gallery')
      if (data.gallery && data.gallery.length > 0) {
        setImages(data.gallery)
      } else {
        setImages(FALLBACK_IMAGES)
      }
    } catch (error) {
      console.error('Error fetching gallery:', error)
      setImages(FALLBACK_IMAGES)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!autoScroll || images.length === 0) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 4000)

    return () => clearInterval(timer)
  }, [autoScroll, images.length])

  const handlePrev = () => {
    setAutoScroll(false)
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleNext = () => {
    setAutoScroll(false)
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const handleDotClick = (index: number) => {
    setAutoScroll(false)
    setCurrentIndex(index)
  }

  if (loading || images.length === 0) {
    return (
      <div className="px-4 py-8">
        <div className="h-96 bg-muted rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <section className="px-4 py-8 space-y-4">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Nos Clients
        </h2>
        <p className="text-muted-foreground">
          Découvrez comment nos clients portent la marque
        </p>
      </div>

      <div className="relative group">
        <div className="relative h-96 rounded-2xl overflow-hidden bg-muted">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={cn(
                "absolute inset-0 transition-all duration-500 ease-out",
                index === currentIndex
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-105"
              )}
            >
              <img
                src={image.image}
                alt={image.name}
                loading={index === currentIndex ? "eager" : "lazy"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-2">
                <h3 className="text-2xl font-bold">{image.name}</h3>
                <p className="text-sm text-white/80">{image.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handlePrev}
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 z-10",
            "bg-white/80 hover:bg-white text-black rounded-full p-2",
            "transition-all duration-200 opacity-0 group-hover:opacity-100"
          )}
          aria-label="Image précédente"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2 z-10",
            "bg-white/80 hover:bg-white text-black rounded-full p-2",
            "transition-all duration-200 opacity-0 group-hover:opacity-100"
          )}
          aria-label="Image suivante"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => handleDotClick(index)}
            className={cn(
              "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden",
              "transition-all duration-200 border-2",
              index === currentIndex
                ? "border-accent scale-105"
                : "border-transparent opacity-60 hover:opacity-100"
            )}
          >
            <img
              src={image.image}
              alt={image.name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              index === currentIndex
                ? "w-8 bg-accent"
                : "w-2 bg-foreground/30 hover:bg-foreground/50"
            )}
            aria-label={`Aller à l'image ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
