"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Trash2, Plus, ChevronLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { AdvancedMediaUploader } from "@/components/admin/advanced-media-uploader"
import { toast as sonnerToast } from "sonner"

interface GalleryItem {
  id: number
  image: string
  name: string
  description: string
  display_order: number
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    image: '',
    name: '',
    description: '',
    display_order: 0
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchGallery()
  }, [])

  const fetchGallery = async () => {
    try {
      const response = await fetch('/api/admin/gallery')
      const data = await response.json()
      setItems(data.gallery || [])
    } catch (error) {
      console.error('Error fetching gallery:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger la galerie",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.image || !formData.name) {
      toast({
        title: "Erreur",
        description: "Veuillez télécharger une image et entrer un nom",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to add gallery item')

      const newItem = await response.json()
      setItems([...items, newItem])
      setFormData({ image: '', name: '', description: '', display_order: 0 })
      
      toast({
        title: "Succès",
        description: "Photo ajoutée à la galerie"
      })
    } catch (error) {
      console.error('Error adding gallery item:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la photo",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) return

    try {
      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (!response.ok) throw new Error('Failed to delete')

      setItems(items.filter(item => item.id !== id))
      toast({
        title: "Succès",
        description: "Photo supprimée"
      })
    } catch (error) {
      console.error('Error deleting gallery item:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la photo",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Galerie Photos</h1>
            <p className="text-xs text-muted-foreground">Gérez les photos clients</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {/* Add Form */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Ajouter une photo</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Upload Zone */}
            <div>
              <label className="block text-sm font-medium mb-2">Image *</label>
              <AdvancedMediaUploader
                onFileSelect={(file) => {
                  if (file.status === 'success') {
                    setFormData({ ...formData, image: file.url })
                    sonnerToast.success('Image uploadée avec succès')
                  }
                }}
                acceptedTypes={['image']}
                maxSize={10}
                multiple={false}
              />
              {formData.image && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">Aperçu</p>
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5">Nom *</label>
              <Input
                placeholder="Ex: Street Style"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5">Description</label>
              <Textarea
                placeholder="Description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5">Ordre</label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                className="text-sm"
              />
            </div>

            <Button 
              type="submit" 
              disabled={submitting || !formData.image} 
              className="w-full h-10 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              {submitting ? 'Ajout...' : 'Ajouter'}
            </Button>
          </form>
        </Card>

        {/* Gallery Items */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Photos ({items.length})</h2>
          {items.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm text-muted-foreground">Aucune photo</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-square overflow-hidden bg-muted relative group">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-active:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <Trash2 className="w-6 h-6 text-white" />
                    </button>
                  </div>
                  <div className="p-2 space-y-1">
                    <h3 className="text-xs font-semibold line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {item.description || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ordre: {item.display_order}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
