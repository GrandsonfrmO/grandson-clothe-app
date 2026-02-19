'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { getCategoryImageUrl } from '@/lib/image-optimizer'
import { cachedFetch } from '@/lib/request-cache'

interface Model {
  id: number
  name: string
  image_url: string
  bio: string
  instagram_handle?: string
  is_active: boolean
}

export function ModelsSection() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const data = await cachedFetch<{ models: Model[] }>('/api/admin/models')
      setModels(data.models || [])
    } catch (error) {
      console.error('Error fetching models:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || models.length === 0) {
    return null
  }

  return (
    <section className="px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Pour nos mannequins
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Découvrez nos ambassadeurs</p>
        </div>
        <Link href="/models">
          <Button variant="ghost" size="sm" className="gap-1 text-accent hover:text-accent/80">
            Voir tous
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {models.slice(0, 4).map((model) => (
          <Link key={model.id} href={`/models/${model.id}`}>
            <div className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={getCategoryImageUrl(model.image_url, 'mobile')}
                  alt={model.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <h3 className="font-bold text-sm sm:text-base text-white truncate">{model.name}</h3>
                {model.instagram_handle && (
                  <p className="text-xs text-accent mt-1">@{model.instagram_handle}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
