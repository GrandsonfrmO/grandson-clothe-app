'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Edit2, Trash2, Users } from 'lucide-react'
import { AdvancedMediaUploader } from '@/components/admin/advanced-media-uploader'
import { toast } from 'sonner'

interface Model {
  id: number
  name: string
  image_url: string
  bio: string
  instagram_handle?: string
  display_order: number
  is_active: boolean
  created_at: string
}

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<Model | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    bio: '',
    instagram_handle: '',
    email: '',
    phone: '',
    display_order: 0,
  })

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
      const response = await fetch('/api/admin/models', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setModels(data.models || [])
    } catch (error) {
      console.error('Error fetching models:', error)
      toast.error('Erreur lors du chargement des mannequins')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.image_url) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
      const method = editingModel ? 'PUT' : 'POST'
      const url = editingModel ? `/api/admin/models/${editingModel.id}` : '/api/admin/models'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to save model')

      toast.success(editingModel ? 'Mannequin mis à jour' : 'Mannequin créé')
      setIsDialogOpen(false)
      setEditingModel(null)
      setFormData({ name: '', image_url: '', bio: '', instagram_handle: '', email: '', phone: '', display_order: 0 })
      fetchModels()
    } catch (error) {
      console.error('Error saving model:', error)
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (model: Model) => {
    setEditingModel(model)
    setFormData({
      name: model.name,
      image_url: model.image_url,
      bio: model.bio,
      instagram_handle: model.instagram_handle || '',
      email: (model as any).email || '',
      phone: (model as any).phone || '',
      display_order: model.display_order,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
      const response = await fetch(`/api/admin/models/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to delete model')

      toast.success('Mannequin supprimé')
      setDeleteId(null)
      fetchModels()
    } catch (error) {
      console.error('Error deleting model:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingModel(null)
      setFormData({ name: '', image_url: '', bio: '', instagram_handle: '', email: '', phone: '', display_order: 0 })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded-lg animate-pulse" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Gestion des Mannequins
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Gérez les ambassadeurs de la marque</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Ajouter un mannequin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingModel ? 'Modifier le mannequin' : 'Ajouter un mannequin'}</DialogTitle>
              <DialogDescription>
                {editingModel ? 'Modifiez les détails du mannequin' : 'Ajoutez un nouveau mannequin'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Jean Dupont"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Description du mannequin"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Handle Instagram</label>
                <Input
                  value={formData.instagram_handle}
                  onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                  placeholder="Ex: jean.dupont"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Ex: jean@example.com"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Téléphone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ex: +224 612 345 678"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Ordre d'affichage</label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
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

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl">
                  {editingModel ? 'Mettre à jour' : 'Créer'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogChange(false)}
                  className="flex-1 sm:flex-none rounded-xl"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Models Grid */}
      {models.length === 0 ? (
        <Card className="border-border bg-gradient-to-br from-card to-secondary/20">
          <CardContent className="p-6 sm:p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-display)' }}>Aucun mannequin</h3>
            <p className="text-muted-foreground mb-4">Commencez par ajouter votre premier mannequin</p>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl">
                  <Plus className="h-4 w-4" />
                  Ajouter un mannequin
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {models.map((model) => (
            <Card key={model.id} className="border-border bg-gradient-to-br from-card to-secondary/20 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-3 sm:p-4">
                <div className="flex gap-3 sm:gap-4">
                  {/* Image */}
                  <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-muted">
                    <img
                      src={model.image_url}
                      alt={model.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base sm:text-lg">{model.name}</h3>
                      {model.instagram_handle && (
                        <p className="text-xs sm:text-sm text-accent mt-1">@{model.instagram_handle}</p>
                      )}
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-2">
                        {model.bio || 'Pas de bio'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={model.is_active ? 'default' : 'secondary'} className="text-xs rounded-lg">
                          {model.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(model)}
                        className="rounded-lg hover:bg-accent/20"
                      >
                        <Edit2 className="h-4 w-4 text-accent" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(model.id)}
                        className="rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le mannequin</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce mannequin ? Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
