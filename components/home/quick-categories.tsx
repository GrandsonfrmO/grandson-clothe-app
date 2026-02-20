"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getCategoryImageUrl } from "@/lib/image-optimizer"

interface Category {
  id: number
  category_name: string
  image: string
  href: string
  color: string
}

export function QuickCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchCategories()
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

  const fetchCategories = async () => {
    try {
      const { cachedFetch } = await import('@/lib/request-cache')
      const data = await cachedFetch('/api/admin/categories', {}, 60 * 60 * 1000) // 1 hour cache
      
      const fetchedCategories = ((data as any).categories || []).map((cat: any) => ({
        id: cat.id,
        category_name: cat.category_name,
        image: cat.image_url,
        href: `/explorer?category=${encodeURIComponent(cat.category_name)}`,
        color: cat.color_gradient,
      }))

      setCategories(fetchedCategories)
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Fallback to default categories
      setCategories([
        {
          id: 1,
          category_name: "Hoodies",
          image: "/images/category-hoodies.jpg",
          href: "/explorer?category=Hoodies",
          color: "from-orange-500/20 to-red-500/20"
        },
        {
          id: 2,
          category_name: "T-Shirts",
          image: "/images/category-tshirts.jpg",
          href: "/explorer?category=T-Shirts",
          color: "from-blue-500/20 to-cyan-500/20"
        },
        {
          id: 3,
          category_name: "Pantalons",
          image: "/images/category-pants.jpg",
          href: "/explorer?category=Pantalons",
          color: "from-green-500/20 to-emerald-500/20"
        },
        {
          id: 4,
          category_name: "Accessoires",
          image: "/images/category-accessories.jpg",
          href: "/explorer?category=Accessoires",
          color: "from-purple-500/20 to-pink-500/20"
        },
        {
          id: 5,
          category_name: "Homme",
          image: "/images/category-men.jpg",
          href: "/explorer?category=Homme",
          color: "from-gray-500/20 to-slate-500/20"
        },
        {
          id: 6,
          category_name: "Femme",
          image: "/images/category-women.jpg",
          href: "/explorer?category=Femme",
          color: "from-rose-500/20 to-pink-500/20"
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || loading) {
    return (
      <section className="py-4">
        <div className="px-4 mb-4">
          <h3 className="text-lg font-bold">Catégories</h3>
        </div>
        <div className="grid grid-cols-3 gap-3 px-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="py-4">
      <div className="px-4 mb-4">
        <h3 className="text-lg font-bold">Catégories</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 px-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={category.href}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-secondary"
          >
            <img
              src={getCategoryImageUrl(category.image, screenSize)}
              alt={category.category_name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className={cn(
              "absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent",
              "group-hover:from-background/90 transition-all duration-300"
            )} />
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-60",
              category.color
            )} />
            
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h4 className="font-semibold text-sm text-white drop-shadow-lg">
                {category.category_name}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}