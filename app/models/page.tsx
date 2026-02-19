'use client'

import { useEffect, useState } from 'react'
import { MobileHeader } from '@/components/mobile-header'
import { BottomNav } from '@/components/bottom-nav'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { getCategoryImageUrl } from '@/lib/image-optimizer'

interface Model {
  id: number
  name: string
  image_url: string
  bio: string
  instagram_handle?: string
  is_active: boolean
}

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/admin/models')
      if (response.ok) {
        const data = await response.json()
        setModels(data.models || [])
      }
    } catch (error) {
      console.error('Error fetching models:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Nos Mannequins" showBack />

      <main className="space-y-6 px-4 py-6">
        {/* Header */}
        <div>
          <p className="text-sm text-muted-foreground">Découvrez nos ambassadeurs</p>
        </div>

        {/* Models Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : models.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun mannequin disponible</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {models.map((model) => (
              <Link key={model.id} href={`/models/${model.id}`}>
                <div className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:shadow-lg transition-all duration-300 cursor-pointer">
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={getCategoryImageUrl(model.image_url, 'mobile')}
                      alt={model.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                    <h3 className="font-bold text-sm sm:text-base text-white truncate">{model.name}</h3>
                    {model.instagram_handle && (
                      <p className="text-xs text-accent mt-1">@{model.instagram_handle}</p>
                    )}
                    {model.bio && (
                      <p className="text-xs text-white/70 line-clamp-2 mt-2">{model.bio}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
