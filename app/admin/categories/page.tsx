'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Edit2, Image as ImageIcon } from 'lucide-react'
import { AdvancedMediaUploader } from '@/components/admin/advanced-media-uploader'
import { toast } from 'sonner'

interface Category {
  id: number
  category_name: string
  image_url: string
  color_gradient: string
  display_order: number
  is_active: boolean
  created_at: string
}

const COLOR_PRESETS = [
  { name: 'Orange-Red', value: 'from-orange-500/20 to-red-500/20' },
  { name: 'Blue-Cyan', value: 'from-blue-500/20 to-cyan-500/20' },
  { name: 'Green-Emerald', value: 'from-green-500/20 to-emerald-500/20' },
  { name: 'Purple-Pink', value: 'from-purple-500/20 to-pink-500/20' },
  { name: 'Gray-Slate', value: 'from-gray-500/20 to-slate-500/20' },
  { name: 'Rose-Pink', value: 'from-rose-500/20 to-pink-500/20' },
  { name: 'Indigo-Blue', value: 'from-indigo-500/20 to-blue-500/20' },
  { name: 'Amber-Orange', value: 'from-amber-500/20 to-orange-500/20' },
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    image_url: '',
    color_gradient: '',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
      const response = await fetch('/api/admin/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Erreur lors du chargement des catégories')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.image_url || !formData.color_gradient) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    if (!editingCategory) return

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
      const response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to save category')

      toast.success('Catégorie mise à jour')
      setIsDialogOpen(false)
      setEditingCategory(null)
      setFormData({ image_url: '', color_gradient: '' })
      fetchCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      image_url: category.image_url,
      color_gradient: category.color_gradient,
    })
    setIsDialogOpen(true)
  }

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingCategory(null)
      setFormData({ image_url: '', color_gradient: '' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded-lg animate-pulse" />
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Gestion des Catégories
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">Modifiez les images et couleurs des catégories</p>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-3 sm:gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="border-border bg-gradient-to-br from-card to-secondary/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Preview */}
                <div className="flex-shrink-0 w-full sm:w-32 h-32 rounded-lg overflow-hidden bg-muted relative">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${category.image_url})` }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br opacity-60 ${category.color_gradient}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-xs font-semibold drop-shadow-lg truncate">
                      {category.category_name}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">{category.category_name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                      {category.image_url}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant={category.is_active ? 'default' : 'secondary'} className="text-xs">
                        {category.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Ordre: {category.display_order}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <Dialog open={isDialogOpen && editingCategory?.id === category.id} onOpenChange={(open) => {
                    if (open) handleEdit(category)
                    handleDialogChange(open)
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded w-full sm:w-auto mt-2 sm:mt-0"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Modifier {category.category_name}</DialogTitle>
                        <DialogDescription>
                          Mettez à jour l'image et la couleur de cette catégorie
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-3 block">URL de l'image *</label>
                          <AdvancedMediaUploader
                            onFileSelect={(file) => {
                              setFormData({ ...formData, image_url: file.url })
                            }}
                            acceptedTypes={['image']}
                            maxSize={50}
                            multiple={false}
                          />
                          {formData.image_url && (
                            <div className="mt-3">
                              <p className="text-xs text-muted-foreground mb-2">Aperçu</p>
                              <img
                                src={formData.image_url}
                                alt="Aperçu"
                                className="h-40 w-full object-cover rounded-lg"
                              />
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-3 block">Couleur de gradient *</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {COLOR_PRESETS.map((preset) => (
                              <button
                                key={preset.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, color_gradient: preset.value })}
                                className={`p-2 rounded-lg border-2 transition-all ${
                                  formData.color_gradient === preset.value
                                    ? 'border-accent'
                                    : 'border-border'
                                }`}
                              >
                                <div className={`h-10 rounded bg-gradient-to-br ${preset.value}`} />
                                <p className="text-xs font-medium mt-1 text-center truncate">{preset.name}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Preview */}
                        <div>
                          <label className="text-sm font-medium mb-2 block">Aperçu</label>
                          <div className="relative w-full h-32 sm:h-40 rounded-lg overflow-hidden bg-muted">
                            <div
                              className="absolute inset-0 bg-cover bg-center"
                              style={{ backgroundImage: `url(${formData.image_url})` }}
                            />
                            <div className={`absolute inset-0 bg-gradient-to-br opacity-60 ${formData.color_gradient}`} />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4">
                              <p className="text-white text-sm font-semibold drop-shadow-lg">
                                {category.category_name}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-4">
                          <Button type="submit" className="flex-1">
                            Mettre à jour
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleDialogChange(false)}
                            className="flex-1 sm:flex-none"
                          >
                            Annuler
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="border-border bg-gradient-to-br from-accent/10 to-accent/5 hover:shadow-lg transition-shadow">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg" style={{ fontFamily: 'var(--font-display)' }}>
            💡 Conseils
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 text-xs sm:text-sm space-y-2 text-muted-foreground">
          <p>• Utilisez des images carrées (au moins 400x400px)</p>
          <p>• Les images doivent être claires et reconnaissables</p>
          <p>• Choisissez une couleur de gradient qui complète l'image</p>
          <p>• Testez l'aperçu avant de sauvegarder</p>
        </CardContent>
      </Card>
    </div>
  )
}
