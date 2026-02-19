'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Package, ImageIcon, X, Check, Loader2, Trash2 } from 'lucide-react'
import { productToasts } from '@/components/ui/toast-notifications'
import { AdvancedMediaUploader } from '@/components/admin/advanced-media-uploader'
import { toast } from 'sonner'

interface ProductForm {
  name: string
  slug: string
  description: string
  price: string
  originalPrice: string
  stock: number
  categoryId: string
  isActive: boolean
  isNew: boolean
  images: string[]
  sizes: string[]
  colors: string[]
}

const CATEGORIES = [
  { id: '1', name: 'T-shirts', icon: '👕' },
  { id: '2', name: 'Hoodies', icon: '🧥' },
  { id: '3', name: 'Pantalons', icon: '👖' },
  { id: '4', name: 'Accessoires', icon: '🎩' },
]

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const AVAILABLE_COLORS = ['Noir', 'Blanc', 'Gris', 'Bleu', 'Rouge', 'Vert', 'Jaune', 'Orange']

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<ProductForm>({
    name: '',
    slug: '',
    description: '',
    price: '',
    originalPrice: '',
    stock: 0,
    categoryId: '',
    isActive: true,
    isNew: false,
    images: [],
    sizes: [],
    colors: []
  })

  const handleInputChange = (field: keyof ProductForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (field === 'name') {
      const slug = value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim()
      setForm(prev => ({ ...prev, slug }))
    }
  }

  const removeImage = (index: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const toggleSize = (size: string) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
    }))
  }

  const toggleColor = (color: string) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.includes(color) ? prev.colors.filter(c => c !== color) : [...prev.colors, color]
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validation détaillée
    const errors: string[] = []
    
    if (!form.name.trim()) errors.push('Le nom du produit est requis')
    if (form.stock < 0) errors.push('Le stock ne peut pas être négatif')
    if (!form.categoryId) errors.push('Veuillez sélectionner une catégorie')
    if (form.images.length === 0) errors.push('Au moins une image est requise')
    
    if (errors.length > 0) {
      console.error('❌ Validation échouée:', errors)
      errors.forEach(err => console.error('  -', err))
      productToasts.createError()
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      const payload = {
        name: form.name.trim(),
        slug: form.slug,
        description: form.description.trim() || null,
        price: form.originalPrice ? parseFloat(form.originalPrice) : 0,
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
        categoryId: parseInt(form.categoryId),
        stock: parseInt(form.stock.toString()),
        isActive: form.isActive,
        isNew: form.isNew,
        images: form.images,
        sizes: form.sizes,
        colors: form.colors
      }
      
      console.log('📤 Envoi de la requête de création:', {
        name: payload.name,
        originalPrice: payload.originalPrice,
        categoryId: payload.categoryId,
        imagesCount: payload.images.length,
      })
      
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      console.log('📥 Réponse:', { status: response.status, data })

      if (response.ok) {
        console.log('✅ Produit créé avec succès')
        productToasts.created()
        router.push('/admin/products')
      } else {
        console.error('❌ Échec de la création:', data)
        if (data.details) {
          console.error('Détails:', data.details)
        }
        productToasts.createError()
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création:', error)
      productToasts.createError()
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nouveau Produit</h1>
          <p className="text-muted-foreground">Ajoutez un produit à votre catalogue</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Informations de base
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du produit *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ex: Hoodie Oversize Noir"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Catégorie *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleInputChange('categoryId', cat.id)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          form.categoryId === cat.id
                            ? 'border-accent bg-accent/10'
                            : 'border-border hover:border-accent/50'
                        }`}
                      >
                        <div className="text-2xl mb-1">{cat.icon}</div>
                        <div className="text-sm font-medium">{cat.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Prix original (GNF)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={form.originalPrice}
                      onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                      placeholder="550000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={form.stock}
                      onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                      placeholder="50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Décrivez votre produit..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Images ({form.images.length}/5)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Images du produit *</Label>
                    <span className="text-xs text-muted-foreground">{form.images.length}/5</span>
                  </div>
                  
                  <AdvancedMediaUploader
                    onFileSelect={(file) => {
                      if (file.status === 'success' && form.images.length < 5) {
                        setForm(prev => ({ ...prev, images: [...prev.images, file.url] }))
                        toast.success('Image ajoutée avec succès')
                      }
                    }}
                    acceptedTypes={['image']}
                    maxSize={10}
                    multiple={false}
                  />
                </div>

                {form.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Product ${idx + 1}`}
                          className="w-full aspect-square object-cover rounded-lg border-2 border-border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 bg-destructive text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {idx === 0 && (
                          <div className="absolute bottom-2 left-2 bg-accent text-accent-foreground px-2 py-1 rounded text-xs font-medium">
                            Image principale
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Tailles disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_SIZES.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`py-2 rounded-lg border-2 font-medium transition-all ${
                        form.sizes.includes(size)
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Couleurs disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {AVAILABLE_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleColor(color)}
                      className={`py-2 px-3 rounded-lg border-2 font-medium text-sm transition-all ${
                        form.colors.includes(color)
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      {form.colors.includes(color) && <Check className="h-3 w-3 inline mr-1" />}
                      {color}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Paramètres</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Produit actif</Label>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Nouveau produit</Label>
                  <Switch
                    checked={form.isNew}
                    onCheckedChange={(checked) => handleInputChange('isNew', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Aperçu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="aspect-square bg-secondary rounded-xl overflow-hidden">
                  {form.images[0] ? (
                    <img
                      src={form.images[0]}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-sm">{form.name || 'Nom du produit'}</h3>
                  <p className="text-xs text-muted-foreground">{form.slug || 'slug-auto'}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-lg">
                      {form.originalPrice ? `${parseInt(form.originalPrice).toLocaleString()} GNF` : 'Prix'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {form.isNew && <Badge className="text-xs">Nouveau</Badge>}
                  <Badge variant={form.isActive ? 'default' : 'secondary'} className="text-xs">
                    {form.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">Stock: {form.stock}</Badge>
                </div>

                {form.sizes.length > 0 && (
                  <div className="pt-2 border-t text-xs">
                    <p className="font-medium">Tailles: {form.sizes.join(', ')}</p>
                  </div>
                )}

                {form.colors.length > 0 && (
                  <div className="pt-2 border-t text-xs">
                    <p className="font-medium">Couleurs: {form.colors.join(', ')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {form.name && form.categoryId ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                  <span>Infos de base</span>
                </div>
                <div className="flex items-center gap-2">
                  {form.images.length > 0 ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                  <span>Images ({form.images.length}/5)</span>
                </div>
                <div className="flex items-center gap-2">
                  {form.sizes.length > 0 ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                  <span>Tailles ({form.sizes.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  {form.colors.length > 0 ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                  <span>Couleurs ({form.colors.length})</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading || !form.name || !form.categoryId || form.images.length === 0}
                className="flex-1 gap-2"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Créer
                  </>
                )}
              </Button>

              <Link href="/admin/products" className="flex-1">
                <Button variant="outline" className="w-full">
                  Annuler
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
