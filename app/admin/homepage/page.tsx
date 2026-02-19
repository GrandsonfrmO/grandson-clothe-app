'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Edit2, Image as ImageIcon, Type, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdvancedMediaUploader } from '@/components/admin/advanced-media-uploader'

interface HomepageContent {
  id: number
  section_key: string
  title: string
  description: string
  image_url: string
  subtitle?: string
  cta_text?: string
  cta_link?: string
  content_data: any
  is_active: boolean
  created_at: string
  updated_at?: string
}

const SECTIONS = [
  { key: 'hero_banner', label: 'Hero Banner', icon: '🎯' },
  { key: 'new_drop', label: 'NEW DROP', icon: '🆕' },
  { key: 'street_vibes', label: 'STREET VIBES', icon: '🌆' },
  { key: 'quick_categories', label: 'Catégories Rapides', icon: '📂' },
  { key: 'featured_products', label: 'Produits en Vedette', icon: '⭐' },
  { key: 'special_offer', label: 'Offre Spéciale', icon: '⚡' },
  { key: 'promo_card', label: 'Carte Promo', icon: '🎁' },
  { key: 'videos_section', label: 'Section Vidéos', icon: '🎬' },
  { key: 'models_section', label: 'Pour nos mannequins', icon: '👥' },
  { key: 'trending_section', label: 'Tendances', icon: '📈' },
]

export default function HomepagePage() {
  const [content, setContent] = useState<HomepageContent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSection, setSelectedSection] = useState('hero_banner')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    cta_text: '',
    cta_link: '',
  })

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
      const response = await fetch('/api/admin/homepage-content', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setContent(data.content || [])
    } catch (error) {
      console.error('Error fetching content:', error)
      toast.error('Erreur lors du chargement du contenu')
    } finally {
      setLoading(false)
    }
  }

  const currentContent = content.find(c => c.section_key === selectedSection)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
      const response = await fetch('/api/admin/homepage-content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          section_key: selectedSection,
          ...formData,
          is_active: true,
        })
      })

      if (!response.ok) throw new Error('Failed to save content')

      toast.success('Contenu mis à jour')
      setIsDialogOpen(false)
      fetchContent()
    } catch (error) {
      console.error('Error saving content:', error)
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const handleEditSection = () => {
    if (currentContent) {
      setFormData({
        title: currentContent.title || '',
        subtitle: currentContent.subtitle || '',
        description: currentContent.description || '',
        image_url: currentContent.image_url || '',
        cta_text: currentContent.cta_text || '',
        cta_link: currentContent.cta_link || '',
      })
    }
    setIsDialogOpen(true)
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
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Gestion de la Page d'Accueil
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">Modifiez les textes et images de votre page d'accueil</p>
      </div>

      {/* Tabs for sections */}
      <Tabs value={selectedSection} onValueChange={setSelectedSection} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 bg-gradient-to-r from-card to-secondary/20 border border-border rounded-2xl p-1">
          {SECTIONS.map((section) => (
            <TabsTrigger 
              key={section.key} 
              value={section.key} 
              className="text-xs rounded-xl data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              <span className="mr-1">{section.icon}</span>
              <span className="hidden sm:inline">{section.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {SECTIONS.map((section) => {
          const sectionContent = content.find(c => c.section_key === section.key)
          return (
            <TabsContent key={section.key} value={section.key} className="space-y-4">
              <Card className="border-border bg-gradient-to-br from-card to-secondary/20 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0 pb-4 p-3 sm:p-6">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                      <span>{section.icon}</span>
                      {section.label}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm mt-1">
                      Modifiez le contenu de cette section
                    </CardDescription>
                  </div>
                  <Dialog open={isDialogOpen && selectedSection === section.key} onOpenChange={(open) => {
                    if (open) handleEditSection()
                    setIsDialogOpen(open)
                  }}>
                    <DialogTrigger asChild>
                      <Button className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl w-full sm:w-auto">
                        <Edit2 className="h-4 w-4" />
                        Modifier
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Modifier {section.label}</DialogTitle>
                        <DialogDescription>
                          Mettez à jour le contenu de cette section
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Titre</label>
                          <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Titre de la section"
                            className="mt-1"
                          />
                        </div>

                        {(selectedSection === 'new_drop' || selectedSection === 'street_vibes') && (
                          <div>
                            <label className="text-sm font-medium">Sous-titre</label>
                            <Input
                              value={formData.subtitle}
                              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                              placeholder="Ex: Collection 2026"
                              className="mt-1"
                            />
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Description de la section"
                            className="mt-1"
                            rows={4}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Image de la section</label>
                          
                          {/* Image Preview */}
                          {formData.image_url && (
                            <div className="relative mb-4 group">
                              <img
                                src={formData.image_url}
                                alt="Aperçu"
                                className="w-full h-48 object-cover rounded-xl border-2 border-border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => setFormData({ ...formData, image_url: '' })}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Supprimer
                              </Button>
                            </div>
                          )}

                          {/* Advanced Uploader */}
                          <AdvancedMediaUploader
                            onFileSelect={(file) => {
                              if (file.status === 'success') {
                                setFormData({ ...formData, image_url: file.url })
                                toast.success('Image uploadée avec succès')
                              }
                            }}
                            acceptedTypes={['image']}
                            maxSize={10}
                            multiple={false}
                          />
                        </div>

                        {(selectedSection === 'new_drop' || selectedSection === 'street_vibes') && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Texte du bouton</label>
                                <Input
                                  value={formData.cta_text}
                                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                                  placeholder="Ex: Découvrir"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Lien du bouton</label>
                                <Input
                                  value={formData.cta_link}
                                  onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                                  placeholder="Ex: /explorer"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        <div className="flex gap-3 pt-4">
                          <Button type="submit" className="flex-1">
                            Mettre à jour
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                          >
                            Annuler
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>

                <CardContent className="space-y-4">
                  {sectionContent ? (
                    <>
                      <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                        <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Titre</h4>
                        <p className="text-lg sm:text-xl font-semibold text-accent">{sectionContent.title || 'Non défini'}</p>
                      </div>

                      {sectionContent.subtitle && (
                        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-card to-secondary/20 border border-border">
                          <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Sous-titre</h4>
                          <p className="text-sm">{sectionContent.subtitle}</p>
                        </div>
                      )}

                      <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-card to-secondary/20 border border-border">
                        <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Description</h4>
                        <p className="text-sm whitespace-pre-wrap">{sectionContent.description || 'Non définie'}</p>
                      </div>

                      {sectionContent.image_url && (
                        <div>
                          <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Image</h4>
                          <img
                            src={sectionContent.image_url}
                            alt={sectionContent.title}
                            className="w-full h-40 sm:h-64 object-cover rounded-2xl border border-border"
                          />
                        </div>
                      )}

                      {sectionContent.cta_text && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-card to-secondary/20 border border-border">
                            <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Texte du bouton</h4>
                            <p className="text-sm font-medium text-accent">{sectionContent.cta_text}</p>
                          </div>
                          <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-card to-secondary/20 border border-border">
                            <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Lien</h4>
                            <p className="text-sm text-accent font-mono">{sectionContent.cta_link}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-4 border-t border-border">
                        <Badge variant={sectionContent.is_active ? 'default' : 'secondary'} className="rounded-lg">
                          {sectionContent.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Mis à jour: {sectionContent.updated_at ? new Date(sectionContent.updated_at).toLocaleDateString('fr-FR') : 'N/A'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">Aucun contenu pour cette section</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>

      {/* Info Card */}
      <Card className="border-border bg-gradient-to-br from-accent/10 to-accent/5 hover:shadow-lg transition-shadow">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg" style={{ fontFamily: 'var(--font-display)' }}>
            💡 Conseils pour les images
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 text-xs sm:text-sm space-y-2 text-muted-foreground">
          <p>• <strong>Résolution recommandée:</strong> 1920x1080px (Full HD) pour les bannières</p>
          <p>• <strong>Format:</strong> JPG, PNG ou WebP (WebP recommandé pour la performance)</p>
          <p>• <strong>Taille maximale:</strong> 10MB par image</p>
          <p>• <strong>Ratio d'aspect:</strong> 16:9 pour les bannières, 1:1 pour les vignettes</p>
          <p>• <strong>Optimisation:</strong> Les images sont automatiquement optimisées lors de l'upload</p>
          <p>• <strong>Accessibilité:</strong> Ajoutez toujours un titre descriptif</p>
          <p className="pt-2 border-t border-border/50">
            <strong>✨ Nouveau:</strong> Upload direct d'images sans URL externe !
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
