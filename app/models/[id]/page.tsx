'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { MobileHeader } from '@/components/mobile-header'
import { BottomNav } from '@/components/bottom-nav'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Instagram, Mail } from 'lucide-react'
import Link from 'next/link'
import { getCategoryImageUrl } from '@/lib/image-optimizer'

interface Model {
  id: number
  name: string
  image_url: string
  bio: string
  instagram_handle?: string
  email?: string
  phone?: string
  is_active: boolean
  display_order?: number
}

export default function ModelDetailPage() {
  const params = useParams()
  const modelId = params.id as string
  const [model, setModel] = useState<Model | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchModel()
  }, [modelId])

  const fetchModel = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/models/${modelId}`)
      if (response.ok) {
        const data = await response.json()
        setModel(data.model)
      } else {
        console.error('Response status:', response.status)
        const errorData = await response.json().catch(() => ({}))
        console.error('Error data:', errorData)
        setError('Mannequin non trouvé')
      }
    } catch (error) {
      console.error('Error fetching model:', error)
      setError('Erreur lors du chargement du mannequin')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Profil du Mannequin" showBack backUrl="/models" />

      <main className="space-y-6 px-4 py-6">

        {loading ? (
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-2xl animate-pulse" />
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-20 bg-muted rounded animate-pulse" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{error}</p>
            <Link href="/models">
              <Button className="mt-4">Retour aux mannequins</Button>
            </Link>
          </div>
        ) : model ? (
          <div className="space-y-6">
            {/* Image */}
            <div className="rounded-2xl overflow-hidden bg-muted">
              <img
                src={getCategoryImageUrl(model.image_url, 'desktop')}
                alt={model.name}
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Profile Info */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                  {model.name}
                </h2>
              </div>

              {/* Instagram */}
              {model.instagram_handle && (
                <div className="flex items-center gap-2">
                  <Instagram className="h-5 w-5 text-accent" />
                  <a
                    href={`https://instagram.com/${model.instagram_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    @{model.instagram_handle}
                  </a>
                </div>
              )}

              {/* Bio */}
              {model.bio && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">À propos</h3>
                  <p className="text-base leading-relaxed text-foreground">{model.bio}</p>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-3 pt-4 border-t border-border">
                {model.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <a href={`mailto:${model.email}`} className="text-sm hover:text-accent">
                      {model.email}
                    </a>
                  </div>
                )}
                {model.phone && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Téléphone:</span>
                    <a href={`tel:${model.phone}`} className="text-sm hover:text-accent">
                      {model.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="pt-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10">
                  <div className={`h-2 w-2 rounded-full ${model.is_active ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <span className="text-xs font-medium">
                    {model.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-6">
              {model.instagram_handle && (
                <a
                  href={`https://instagram.com/${model.instagram_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full gap-2">
                    <Instagram className="h-4 w-4" />
                    Suivre sur Instagram
                  </Button>
                </a>
              )}
              {model.email && (
                <a href={`mailto:${model.email}`}>
                  <Button variant="outline" className="w-full gap-2">
                    <Mail className="h-4 w-4" />
                    Envoyer un message
                  </Button>
                </a>
              )}
            </div>
          </div>
        ) : null}
      </main>

      <BottomNav />
    </div>
  )
}
