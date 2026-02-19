'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  Palette, 
  Eye, 
  Trash2, 
  Check, 
  Plus, 
  Smartphone, 
  Monitor,
  ArrowLeft,
  History,
  RefreshCw,
  AlertCircle,
  Upload as UploadIcon,
  ImageIcon,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface AppIcon {
  id: string
  name: string
  description?: string
  favicon_url: string
  icon_192_url: string
  icon_512_url: string
  apple_touch_icon_url: string
  maskable_icon_url?: string
  theme_color: string
  background_color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface IconHistory {
  id: string
  icon_id: string
  previous_icon_id?: string
  changed_by: string
  change_reason: string
  created_at: string
}

export default function AppIconsPage() {
  const [icons, setIcons] = useState<AppIcon[]>([])
  const [history, setHistory] = useState<IconHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingField, setUploadingField] = useState<string>('')

  // Formulaire de création
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    favicon_url: '',
    icon_192_url: '',
    icon_512_url: '',
    apple_touch_icon_url: '',
    maskable_icon_url: '',
    theme_color: '#000000',
    background_color: '#ffffff'
  })

  // Charger les icônes existantes
  useEffect(() => {
    loadIcons()
    loadHistory()
  }, [])

  const loadIcons = async () => {
    try {
      const response = await fetch('/api/admin/app-icons')
      if (response.ok) {
        const data = await response.json()
        setIcons(data.icons || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des icônes:', error)
      toast.error('Erreur lors du chargement des icônes')
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/admin/app-icons/history')
      if (response.ok) {
        const data = await response.json()
        setHistory(data.history || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error)
    }
  }

  // Upload d'image vers Cloudinary
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'app_icons')
    formData.append('folder', 'grandson-clothes/app-icons')

    // Get cloud name from environment or use default
    const cloudName = 'dqhxhqhqh' // Default cloud name
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    )

    if (!response.ok) {
      throw new Error('Erreur lors de l\'upload')
    }

    const data = await response.json()
    return data.secure_url
  }

  // Gérer l'upload de fichier
  const handleFileUpload = async (file: File, field: string) => {
    if (!file) return

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB')
      return
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }

    setUploading(true)
    setUploadingField(field)
    
    try {
      const url = await uploadImage(file)
      setFormData(prev => ({ ...prev, [field]: url }))
      toast.success('Image uploadée avec succès!')
    } catch (error) {
      console.error('Erreur upload:', error)
      toast.error('Erreur lors de l\'upload de l\'image')
    } finally {
      setUploading(false)
      setUploadingField('')
    }
  }

  // Créer un nouveau set d'icônes
  const createIconSet = async () => {
    if (!formData.name || !formData.favicon_url || !formData.icon_192_url || !formData.icon_512_url) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/app-icons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Set d\'icônes créé avec succès')
        setShowCreateDialog(false)
        setFormData({
          name: '',
          description: '',
          favicon_url: '',
          icon_192_url: '',
          icon_512_url: '',
          apple_touch_icon_url: '',
          maskable_icon_url: '',
          theme_color: '#000000',
          background_color: '#ffffff'
        })
        loadIcons()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la création du set d\'icônes')
    } finally {
      setIsCreating(false)
    }
  }

  // Activer un set d'icônes
  const activateIconSet = async (iconId: string) => {
    try {
      const response = await fetch('/api/admin/app-icons/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iconId, reason: 'Activation depuis l\'admin' })
      })

      if (response.ok) {
        toast.success('Icônes activées avec succès')
        loadIcons()
        loadHistory()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de l\'activation')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'activation des icônes')
    }
  }

  // Supprimer un set d'icônes
  const deleteIconSet = async (iconId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce set d\'icônes ?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/app-icons/${iconId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Set d\'icônes supprimé')
        loadIcons()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const activeIcon = icons.find(icon => icon.is_active)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Icônes d'Application</h1>
            <p className="text-muted-foreground">
              Gérez les favicons et icônes PWA de votre application
            </p>
          </div>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Set d'Icônes
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un Nouveau Set d'Icônes</DialogTitle>
              <DialogDescription>
                Uploadez vos icônes dans différentes tailles pour une expérience optimale
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Informations générales */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom du Set *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Logo Hiver 2024"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description optionnelle du set d'icônes"
                  />
                </div>
              </div>

              {/* Upload des icônes */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Icônes Requises</h3>
                </div>
                
                {/* Favicon */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Favicon (32x32px) *</Label>
                    <span className="text-xs text-muted-foreground">Format: ICO, PNG</span>
                  </div>
                  <div className="relative">
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer">
                        <div className={`
                          flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg
                          transition-all hover:border-primary hover:bg-primary/5
                          ${uploadingField === 'favicon_url' ? 'border-primary bg-primary/5' : 'border-gray-300'}
                        `}>
                          {uploadingField === 'favicon_url' ? (
                            <>
                              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                              <span className="text-sm font-medium">Upload en cours...</span>
                            </>
                          ) : formData.favicon_url ? (
                            <>
                              <Check className="h-5 w-5 text-green-600" />
                              <span className="text-sm font-medium text-green-600">Image uploadée</span>
                            </>
                          ) : (
                            <>
                              <UploadIcon className="h-5 w-5 text-muted-foreground" />
                              <span className="text-sm font-medium">Cliquer pour uploader</span>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(file, 'favicon_url')
                          }}
                          disabled={uploading}
                        />
                      </label>
                      {formData.favicon_url && (
                        <div className="flex items-center justify-center w-20 h-20 border-2 rounded-lg bg-white">
                          <Image
                            src={formData.favicon_url}
                            alt="Favicon"
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Icône 192px */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Icône PWA 192x192px *</Label>
                    <span className="text-xs text-muted-foreground">Format: PNG</span>
                  </div>
                  <div className="relative">
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer">
                        <div className={`
                          flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg
                          transition-all hover:border-primary hover:bg-primary/5
                          ${uploadingField === 'icon_192_url' ? 'border-primary bg-primary/5' : 'border-gray-300'}
                        `}>
                          {uploadingField === 'icon_192_url' ? (
                            <>
                              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                              <span className="text-sm font-medium">Upload en cours...</span>
                            </>
                          ) : formData.icon_192_url ? (
                            <>
                              <Check className="h-5 w-5 text-green-600" />
                              <span className="text-sm font-medium text-green-600">Image uploadée</span>
                            </>
                          ) : (
                            <>
                              <UploadIcon className="h-5 w-5 text-muted-foreground" />
                              <span className="text-sm font-medium">Cliquer pour uploader</span>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(file, 'icon_192_url')
                          }}
                          disabled={uploading}
                        />
                      </label>
                      {formData.icon_192_url && (
                        <div className="flex items-center justify-center w-20 h-20 border-2 rounded-lg bg-white">
                          <Image
                            src={formData.icon_192_url}
                            alt="Icône 192px"
                            width={64}
                            height={64}
                            className="object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Icône 512px */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Icône PWA 512x512px *</Label>
                    <span className="text-xs text-muted-foreground">Format: PNG</span>
                  </div>
                  <div className="relative">
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer">
                        <div className={`
                          flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg
                          transition-all hover:border-primary hover:bg-primary/5
                          ${uploadingField === 'icon_512_url' ? 'border-primary bg-primary/5' : 'border-gray-300'}
                        `}>
                          {uploadingField === 'icon_512_url' ? (
                            <>
                              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                              <span className="text-sm font-medium">Upload en cours...</span>
                            </>
                          ) : formData.icon_512_url ? (
                            <>
                              <Check className="h-5 w-5 text-green-600" />
                              <span className="text-sm font-medium text-green-600">Image uploadée</span>
                            </>
                          ) : (
                            <>
                              <UploadIcon className="h-5 w-5 text-muted-foreground" />
                              <span className="text-sm font-medium">Cliquer pour uploader</span>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(file, 'icon_512_url')
                          }}
                          disabled={uploading}
                        />
                      </label>
                      {formData.icon_512_url && (
                        <div className="flex items-center justify-center w-20 h-20 border-2 rounded-lg bg-white">
                          <Image
                            src={formData.icon_512_url}
                            alt="Icône 512px"
                            width={64}
                            height={64}
                            className="object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Apple Touch Icon */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Apple Touch Icon (180x180px)</Label>
                    <span className="text-xs text-muted-foreground">Format: PNG</span>
                  </div>
                  <div className="relative">
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer">
                        <div className={`
                          flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg
                          transition-all hover:border-primary hover:bg-primary/5
                          ${uploadingField === 'apple_touch_icon_url' ? 'border-primary bg-primary/5' : 'border-gray-300'}
                        `}>
                          {uploadingField === 'apple_touch_icon_url' ? (
                            <>
                              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                              <span className="text-sm font-medium">Upload en cours...</span>
                            </>
                          ) : formData.apple_touch_icon_url ? (
                            <>
                              <Check className="h-5 w-5 text-green-600" />
                              <span className="text-sm font-medium text-green-600">Image uploadée</span>
                            </>
                          ) : (
                            <>
                              <UploadIcon className="h-5 w-5 text-muted-foreground" />
                              <span className="text-sm font-medium">Cliquer pour uploader</span>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(file, 'apple_touch_icon_url')
                          }}
                          disabled={uploading}
                        />
                      </label>
                      {formData.apple_touch_icon_url && (
                        <div className="flex items-center justify-center w-20 h-20 border-2 rounded-lg bg-white">
                          <Image
                            src={formData.apple_touch_icon_url}
                            alt="Apple Touch Icon"
                            width={64}
                            height={64}
                            className="object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Maskable Icon */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Icône Maskable (512x512px)</Label>
                    <span className="text-xs text-muted-foreground">Optionnel • Format: PNG</span>
                  </div>
                  <div className="relative">
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer">
                        <div className={`
                          flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg
                          transition-all hover:border-primary hover:bg-primary/5
                          ${uploadingField === 'maskable_icon_url' ? 'border-primary bg-primary/5' : 'border-gray-300'}
                        `}>
                          {uploadingField === 'maskable_icon_url' ? (
                            <>
                              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                              <span className="text-sm font-medium">Upload en cours...</span>
                            </>
                          ) : formData.maskable_icon_url ? (
                            <>
                              <Check className="h-5 w-5 text-green-600" />
                              <span className="text-sm font-medium text-green-600">Image uploadée</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                              <span className="text-sm font-medium">Cliquer pour uploader (optionnel)</span>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(file, 'maskable_icon_url')
                          }}
                          disabled={uploading}
                        />
                      </label>
                      {formData.maskable_icon_url && (
                        <div className="flex items-center justify-center w-20 h-20 border-2 rounded-lg bg-white">
                          <Image
                            src={formData.maskable_icon_url}
                            alt="Icône Maskable"
                            width={64}
                            height={64}
                            className="object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Couleurs */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Palette className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Personnalisation PWA</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="theme_color" className="text-base font-medium">
                      Couleur du Thème
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="theme_color"
                        type="color"
                        value={formData.theme_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, theme_color: e.target.value }))}
                        className="w-20 h-12 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={formData.theme_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, theme_color: e.target.value }))}
                        placeholder="#000000"
                        className="flex-1 font-mono"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Couleur de la barre d'adresse sur mobile
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="background_color" className="text-base font-medium">
                      Couleur de Fond
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="background_color"
                        type="color"
                        value={formData.background_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                        className="w-20 h-12 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={formData.background_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                        placeholder="#FFFFFF"
                        className="flex-1 font-mono"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Couleur de fond au chargement de l'app
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  disabled={isCreating}
                >
                  Annuler
                </Button>
                <Button
                  onClick={createIconSet}
                  disabled={isCreating || uploading}
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Créer le Set
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="icons" className="space-y-6">
        <TabsList>
          <TabsTrigger value="icons">Sets d'Icônes</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
        </TabsList>

        {/* Liste des sets d'icônes */}
        <TabsContent value="icons" className="space-y-4">
          {icons.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Palette className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun set d'icônes</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Créez votre premier set d'icônes pour personnaliser l'apparence de votre application
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un Set d'Icônes
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {icons.map((icon) => (
                <Card 
                  key={icon.id} 
                  className={`
                    transition-all hover:shadow-lg
                    ${icon.is_active ? 'ring-2 ring-primary shadow-md' : ''}
                  `}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {icon.name}
                          {icon.is_active && (
                            <Badge variant="default" className="ml-auto">
                              <Check className="h-3 w-3 mr-1" />
                              Actif
                            </Badge>
                          )}
                        </CardTitle>
                        {icon.description && (
                          <CardDescription className="mt-1">{icon.description}</CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Aperçu des icônes */}
                    <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                      <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm">
                        <Image
                          src={icon.favicon_url}
                          alt="Favicon"
                          width={16}
                          height={16}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-center w-14 h-14 bg-white rounded-xl shadow-sm">
                        <Image
                          src={icon.icon_192_url}
                          alt="Icône 192px"
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-md">
                        <Image
                          src={icon.icon_512_url}
                          alt="Icône 512px"
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      </div>
                    </div>

                    {/* Couleurs */}
                    <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg border-2 border-white shadow-sm"
                          style={{ backgroundColor: icon.theme_color }}
                          title={`Thème: ${icon.theme_color}`}
                        />
                        <span className="text-xs font-mono text-muted-foreground">
                          {icon.theme_color}
                        </span>
                      </div>
                      <div className="w-px h-6 bg-gray-300" />
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg border-2 border-gray-300 shadow-sm"
                          style={{ backgroundColor: icon.background_color }}
                          title={`Fond: ${icon.background_color}`}
                        />
                        <span className="text-xs font-mono text-muted-foreground">
                          {icon.background_color}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {!icon.is_active ? (
                        <Button
                          size="sm"
                          onClick={() => activateIconSet(icon.id)}
                          className="flex-1"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Activer
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 cursor-default"
                          disabled
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Actif
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteIconSet(icon.id)}
                        disabled={icon.is_active}
                        className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Historique */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historique des Changements
              </CardTitle>
              <CardDescription>
                Suivi des activations et modifications des icônes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucun historique disponible
                </p>
              ) : (
                <div className="space-y-4">
                  {history.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{entry.change_reason}</p>
                        <p className="text-sm text-muted-foreground">
                          Par {entry.changed_by} • {new Date(entry.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aperçu */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Aperçu des Icônes Actives
              </CardTitle>
              <CardDescription>
                Visualisez comment vos icônes apparaissent sur différents appareils
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeIcon ? (
                <div className="space-y-6">
                  {/* Aperçu navigateur */}
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Navigateur Web
                    </h3>
                    <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                      <Image
                        src={activeIcon.favicon_url}
                        alt="Favicon"
                        width={16}
                        height={16}
                      />
                      <span className="text-sm">Grandson Clothes</span>
                    </div>
                  </div>

                  {/* Aperçu mobile */}
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Application Mobile (PWA)
                    </h3>
                    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <Image
                        src={activeIcon.icon_192_url}
                        alt="Icône PWA"
                        width={64}
                        height={64}
                        className="rounded-xl"
                      />
                      <div>
                        <p className="font-medium">Grandson Clothes</p>
                        <p className="text-sm text-muted-foreground">Application</p>
                      </div>
                    </div>
                  </div>

                  {/* Informations techniques */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Informations Techniques</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Couleur du thème:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: activeIcon.theme_color }}
                          />
                          <span>{activeIcon.theme_color}</span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Couleur de fond:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: activeIcon.background_color }}
                          />
                          <span>{activeIcon.background_color}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Aucun set d'icônes actif. Créez et activez un set pour voir l'aperçu.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}