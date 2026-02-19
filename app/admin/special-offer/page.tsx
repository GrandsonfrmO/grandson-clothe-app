'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Edit2, Zap } from 'lucide-react'
import { AdvancedMediaUploader } from '@/components/admin/advanced-media-uploader'
import { toast } from 'sonner'

interface SpecialOffer {
  id: number
  title: string
  description: string
  image_url: string
  discount_text: string
  cta_text: string
  cta_link: string
  is_active: boolean
  created_at: string
}

export default function SpecialOfferPage() {
  const [offer, setOffer] = useState<SpecialOffer | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    discount_text: '',
    cta_text: '',
    cta_link: '',
  })

  useEffect(() => {
    fetchOffer()
  }, [])

  const fetchOffer = async () => {
    try {
      const response = await fetch('/api/admin/special-offer')
      const data = await response.json()
      if (data.offer) {
        setOffer(data.offer)
        setFormData({
          title: data.offer.title,
          description: data.offer.description,
          image_url: data.offer.image_url,
          discount_text: data.offer.discount_text,
          cta_text: data.offer.cta_text,
          cta_link: data.offer.cta_link,
        })
      }
    } catch (error) {
      console.error('Error fetching offer:', error)
      toast.error('Erreur lors du chargement de l\'offre')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.image_url || !formData.cta_text || !formData.cta_link) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
      const response = await fetch('/api/admin/special-offer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: offer?.id,
          ...formData,
        })
      })

      if (!response.ok) throw new Error('Failed to save offer')

      toast.success('Offre mise à jour')
      setIsDialogOpen(false)
      fetchOffer()
    } catch (error) {
      console.error('Error saving offer:', error)
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded-lg animate-pulse" />
        <div className="h-96 bg-muted rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Offre Spéciale
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Gérez l'offre spéciale affichée sur la page d'accueil</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl w-full sm:w-auto">
              <Edit2 className="h-4 w-4" />
              Modifier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier l'offre spéciale</DialogTitle>
              <DialogDescription>
                Mettez à jour les détails de l'offre spéciale
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Titre *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Soldes d'été"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de l'offre"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Texte de réduction *</label>
                <Input
                  value={formData.discount_text}
                  onChange={(e) => setFormData({ ...formData, discount_text: e.target.value })}
                  placeholder="Ex: -50% sur tout"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Image *</label>
                <AdvancedMediaUploader
                  onFileSelect={(file) => {
                    setFormData({ ...formData, image_url: file.url })
                  }}
                  acceptedTypes={['image']}
                  maxSize={50}
                  multiple={false}
                />
                {formData.image_url && (
                  <img
                    src={formData.image_url}
                    alt="Aperçu"
                    className="mt-3 h-40 w-full object-cover rounded-xl"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Texte du bouton *</label>
                  <Input
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    placeholder="Ex: Découvrir"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Lien du bouton *</label>
                  <Input
                    value={formData.cta_link}
                    onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                    placeholder="Ex: /explorer"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl">
                  Mettre à jour
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 sm:flex-none rounded-xl"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Offer Preview */}
      {offer ? (
        <Card className="border-border bg-gradient-to-br from-card to-secondary/20 hover:shadow-lg transition-all duration-300">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <Zap className="h-5 w-5 text-accent" />
              Aperçu de l'offre
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-4">
              {/* Preview Card */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30">
                <div className="absolute inset-0 opacity-30">
                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent" />
                <div className="relative p-6 sm:p-8 flex flex-col justify-between min-h-48 sm:min-h-56">
                  <div>
                    <div className="inline-block mb-3">
                      <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs sm:text-sm font-bold">
                        {offer.discount_text}
                      </span>
                    </div>
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

              {/* Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-border">
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                  <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Lien</h4>
                  <p className="text-sm font-mono text-accent">{offer.cta_link}</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                  <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Statut</h4>
                  <Badge variant={offer.is_active ? 'default' : 'secondary'} className="rounded-lg">
                    {offer.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-gradient-to-br from-card to-secondary/20">
          <CardContent className="p-6 sm:p-12 text-center">
            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-display)' }}>Aucune offre</h3>
            <p className="text-muted-foreground mb-4">Créez votre première offre spéciale</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl">
                  <Edit2 className="h-4 w-4" />
                  Créer une offre
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-border bg-gradient-to-br from-accent/10 to-accent/5 hover:shadow-lg transition-shadow">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg" style={{ fontFamily: 'var(--font-display)' }}>
            💡 Conseils
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 text-xs sm:text-sm space-y-2 text-muted-foreground">
          <p>• Utilisez une image attrayante (au moins 1200x400px)</p>
          <p>• Gardez le titre court et percutant</p>
          <p>• Le texte de réduction doit être clair et visible</p>
          <p>• Testez le lien avant de publier</p>
        </CardContent>
      </Card>
    </div>
  )
}
