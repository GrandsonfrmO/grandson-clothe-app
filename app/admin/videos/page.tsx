'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Edit2, Trash2, Play } from 'lucide-react'
import { AdvancedMediaUploader } from '@/components/admin/advanced-media-uploader'
import { toast } from 'sonner'

interface Video {
  id: number
  title: string
  description: string
  thumbnail_url: string
  video_url: string
  duration: string
  order_index: number
  is_active: boolean
  created_at: string
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    video_url: '',
    duration: '',
  })

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
      const response = await fetch('/api/admin/videos', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setVideos(data.videos || [])
    } catch (error) {
      console.error('Error fetching videos:', error)
      toast.error('Erreur lors du chargement des vidéos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.thumbnail_url || !formData.video_url) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
      const method = editingVideo ? 'PUT' : 'POST'
      const url = editingVideo ? `/api/admin/videos/${editingVideo.id}` : '/api/admin/videos'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to save video')

      toast.success(editingVideo ? 'Vidéo mise à jour' : 'Vidéo créée')
      setIsDialogOpen(false)
      setEditingVideo(null)
      setFormData({ title: '', description: '', thumbnail_url: '', video_url: '', duration: '' })
      fetchVideos()
    } catch (error) {
      console.error('Error saving video:', error)
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (video: Video) => {
    setEditingVideo(video)
    setFormData({
      title: video.title,
      description: video.description,
      thumbnail_url: video.thumbnail_url,
      video_url: video.video_url,
      duration: video.duration,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
      const response = await fetch(`/api/admin/videos/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to delete video')

      toast.success('Vidéo supprimée')
      setDeleteId(null)
      fetchVideos()
    } catch (error) {
      console.error('Error deleting video:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingVideo(null)
      setFormData({ title: '', description: '', thumbnail_url: '', video_url: '', duration: '' })
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
            Gestion des Vidéos
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Gérez les vidéos affichées sur la page d'accueil</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Ajouter une vidéo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingVideo ? 'Modifier la vidéo' : 'Ajouter une vidéo'}</DialogTitle>
              <DialogDescription>
                {editingVideo ? 'Modifiez les détails de la vidéo' : 'Ajoutez une nouvelle vidéo à la page d\'accueil'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Titre *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Comment commander sur Grandson"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de la vidéo"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Durée</label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="Ex: 2:45"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Miniature de la vidéo *</label>
                <AdvancedMediaUploader
                  onFileSelect={(file) => {
                    if (file.status === 'success') {
                      setFormData({ ...formData, thumbnail_url: file.url })
                      toast.success('Miniature uploadée avec succès')
                    }
                  }}
                  acceptedTypes={['image']}
                  maxSize={10}
                  multiple={false}
                />
                {formData.thumbnail_url && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">Aperçu</p>
                    <img
                      src={formData.thumbnail_url}
                      alt="Aperçu"
                      className="h-32 w-full object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">URL de la vidéo (YouTube embed) *</label>
                <Input
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/embed/..."
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Pour YouTube: Utilisez le format embed (https://www.youtube.com/embed/VIDEO_ID)
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingVideo ? 'Mettre à jour' : 'Créer'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogChange(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <Card className="border-border bg-gradient-to-br from-card to-secondary/20">
          <CardContent className="p-6 sm:p-12 text-center">
            <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-display)' }}>Aucune vidéo</h3>
            <p className="text-muted-foreground mb-4">Commencez par ajouter votre première vidéo</p>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl">
                  <Plus className="h-4 w-4" />
                  Ajouter une vidéo
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {videos.map((video) => (
            <Card key={video.id} className="border-border bg-gradient-to-br from-card to-secondary/20 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-3 sm:p-4">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{video.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {video.description || 'Pas de description'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={video.is_active ? 'default' : 'secondary'}>
                            {video.is_active ? 'Actif' : 'Inactif'}
                          </Badge>
                          {video.duration && (
                            <Badge variant="outline">{video.duration}</Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(video)}
                          className="rounded-lg hover:bg-accent/20"
                        >
                          <Edit2 className="h-4 w-4 text-accent" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(video.id)}
                          className="rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
            <AlertDialogTitle>Supprimer la vidéo</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette vidéo ? Cette action ne peut pas être annulée.
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
