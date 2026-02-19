'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  X, 
  Save,
  Eye,
  Package,
  ImageIcon,
  Trash2
} from 'lucide-react'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { productToasts } from '@/components/ui/toast-notifications'
import { AdvancedMediaUploader } from '@/components/admin/advanced-media-uploader'
import { toast } from 'sonner'

interface ProductForm {
  name: string
  slug: string
  description: string
  price: string
  originalPrice: string
  categoryId: string
  images: string[]
  sizes: string[]
  colors: string[]
  stock: number
  isNew: boolean
  isActive: boolean
}

interface EditProductPageProps {
  params: {
    id: string
  }
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter()
  const { confirm, ConfirmDialog } = useConfirmDialog()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    slug: '',
    description: '',
    price: '',
    originalPrice: '',
    categoryId: '',
    images: [],
    sizes: [],
    colors: [],
    features: [],
    stock: 0,
    isNew: false,
    isActive: true
  })

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/products/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        const product = data.product
        
        setFormData({
          name: product.name || '',
          slug: product.slug || '',
          description: product.description || '',
          price: product.price?.toString() || '',
          originalPrice: product.originalPrice?.toString() || '',
          categoryId: product.categoryId?.toString() || '',
          images: product.images || [],
          sizes: product.sizes || [],
          colors: product.colors || [],
          stock: product.stock || 0,
          isNew: product.isNew || false,
          isActive: product.isActive !== false
        })
      } else {
        setError('Produit non trouvé')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setError('Erreur lors du chargement du produit')
    } finally {
      setInitialLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleInputChange = (field: keyof ProductForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate slug from name
    if (field === 'name') {
      const slug = generateSlug(value)
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleImageRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/products?id=${params.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
          originalPrice: formData.originalPrice ? parseInt(formData.originalPrice) : null,
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : null
        })
      })

      const data = await response.json()

      if (response.ok) {
        productToasts.updated()
        router.push('/admin/products')
      } else {
        productToasts.updateError()
        setError(data.error || 'Erreur lors de la mise à jour du produit')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      productToasts.updateError()
      setError('Erreur lors de la mise à jour du produit')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    confirm({
      title: "Supprimer le produit",
      description: `Êtes-vous sûr de vouloir supprimer "${formData.name}" ? Cette action désactivera le produit.`,
      confirmText: "Supprimer",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token')
          const response = await fetch(`/api/admin/products?id=${params.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          })

          if (response.ok) {
            productToasts.deleted()
            router.push('/admin/products')
          } else {
            const data = await response.json()
            productToasts.deleteError()
            setError(data.error || 'Erreur lors de la suppression')
          }
        } catch (error) {
          console.error('Error deleting product:', error)
          productToasts.deleteError()
          setError('Erreur lors de la suppression du produit')
        }
      }
    })
  }

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Modifier le Produit</h1>
            <p className="text-muted-foreground">Modifiez les informations du produit</p>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Supprimer
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Informations de base
              </CardTitle>
              <CardDescription>
                Informations principales du produit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du produit *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ex: T-shirt Streetwear"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="t-shirt-streetwear"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Description détaillée du produit..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix (GNF) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="150000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Prix original (GNF)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                    placeholder="200000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                    placeholder="50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={formData.categoryId || "none"}
                  onValueChange={(value) => handleInputChange('categoryId', value === "none" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune catégorie</SelectItem>
                    <SelectItem value="1">T-shirts</SelectItem>
                    <SelectItem value="2">Hoodies</SelectItem>
                    <SelectItem value="3">Pantalons</SelectItem>
                    <SelectItem value="4">Accessoires</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Images du produit
              </CardTitle>
              <CardDescription>
                Ajoutez des images pour présenter votre produit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm">Ajouter des images</Label>
                  <AdvancedMediaUploader
                    onFileSelect={(file) => {
                      if (file.status === 'success') {
                        setFormData(prev => ({
                          ...prev,
                          images: [...prev.images, file.url]
                        }))
                        toast.success('Image ajoutée avec succès')
                      }
                    }}
                    acceptedTypes={['image']}
                    maxSize={10}
                    multiple={false}
                  />
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-secondary rounded-xl overflow-hidden border-2 border-border">
                          <img
                            src={image}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          onClick={() => handleImageRemove(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 bg-accent text-accent-foreground px-2 py-1 rounded text-xs font-medium">
                            Image principale
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button type="submit" disabled={loading} className="w-full gap-2">
                <Save className="h-4 w-4" />
                {loading ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
              <Link href="/admin/products">
                <Button variant="outline" className="w-full">
                  Annuler
                </Button>
              </Link>
              <Link href={`/produit/${params.id}`}>
                <Button variant="ghost" className="w-full gap-2">
                  <Eye className="h-4 w-4" />
                  Voir sur le site
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Paramètres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Produit actif</Label>
                  <p className="text-sm text-muted-foreground">
                    Visible sur le site
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nouveau produit</Label>
                  <p className="text-sm text-muted-foreground">
                    Badge "Nouveau"
                  </p>
                </div>
                <Switch
                  checked={formData.isNew}
                  onCheckedChange={(checked) => handleInputChange('isNew', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Aperçu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="aspect-square bg-secondary rounded-xl overflow-hidden">
                  {formData.images[0] ? (
                    <img
                      src={formData.images[0]}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{formData.name || 'Nom du produit'}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold">
                      {formData.price ? `${parseInt(formData.price).toLocaleString()} GNF` : 'Prix'}
                    </span>
                    {formData.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {parseInt(formData.originalPrice).toLocaleString()} GNF
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {formData.isNew && <Badge variant="outline" className="text-xs">Nouveau</Badge>}
                    <Badge variant={formData.isActive ? 'default' : 'secondary'} className="text-xs">
                      {formData.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      <ConfirmDialog />
    </div>
  )
}