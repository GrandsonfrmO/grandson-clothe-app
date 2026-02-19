'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Search,
  Filter,
  Package,
  AlertTriangle,
  TrendingDown,
  Plus,
  Minus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  History,
  Settings,
  Loader2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Product {
  id: number
  name: string
  price: string
  stock: number
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock'
  low_stock_threshold: number
  created_at: string
}

interface InventoryResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  stats: {
    inStock: number
    lowStock: number
    outOfStock: number
  }
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })
  const [stats, setStats] = useState({
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  })
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  })
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [stockForm, setStockForm] = useState({
    quantityChange: 0,
    reason: 'adjustment' as 'order' | 'restock' | 'adjustment' | 'return' | 'damage',
    notes: '',
  })
  const [thresholdForm, setThresholdForm] = useState({
    lowStockThreshold: 10,
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchInventory()
  }, [pagination.page, filters])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
      })

      const response = await fetch(`/api/admin/inventory?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data: InventoryResponse = await response.json()
        setProducts(data.products)
        setPagination(data.pagination)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la récupération de l\'inventaire',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateStock = async (productId: number) => {
    try {
      setIsUpdating(true)
      const token = localStorage.getItem('token')

      const response = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          quantityChange: stockForm.quantityChange,
          reason: stockForm.reason,
          notes: stockForm.notes,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Stock mis à jour avec succès',
        })
        fetchInventory()
        setSelectedProduct(null)
        setStockForm({
          quantityChange: 0,
          reason: 'adjustment',
          notes: '',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Erreur',
          description: error.error || 'Erreur lors de la mise à jour du stock',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating stock:', error)
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la mise à jour du stock',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const updateThreshold = async (productId: number) => {
    try {
      setIsUpdating(true)
      const token = localStorage.getItem('token')

      const response = await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          lowStockThreshold: thresholdForm.lowStockThreshold,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Seuil mis à jour avec succès',
        })
        fetchInventory()
        setSelectedProduct(null)
      } else {
        const error = await response.json()
        toast({
          title: 'Erreur',
          description: error.error || 'Erreur lors de la mise à jour du seuil',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating threshold:', error)
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la mise à jour du seuil',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800'
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'En stock'
      case 'low_stock':
        return 'Stock faible'
      case 'out_of_stock':
        return 'Rupture'
      default:
        return status
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventaire</h1>
          <p className="text-muted-foreground">Gérez les stocks de vos produits</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En stock</p>
                <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock faible</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rupture</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par nom..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Statut du stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="in_stock">En stock</SelectItem>
                <SelectItem value="low_stock">Stock faible</SelectItem>
                <SelectItem value="out_of_stock">Rupture</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg">Produits ({pagination.total})</CardTitle>
            <CardDescription>Liste de tous les produits avec leurs stocks</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-muted rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="font-semibold">Produit</TableHead>
                      <TableHead className="font-semibold">Prix</TableHead>
                      <TableHead className="font-semibold">Stock</TableHead>
                      <TableHead className="font-semibold">Seuil</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="font-semibold w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id} className="border-border hover:bg-secondary/30">
                        <TableCell>
                          <p className="font-medium">{product.name}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{parseInt(product.price).toLocaleString()} GNF</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-bold text-lg">{product.stock}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground">{product.low_stock_threshold}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(product.stock_status)}>
                            {getStatusLabel(product.stock_status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => {
                                    e.preventDefault()
                                    setSelectedProduct(product)
                                    setStockForm({
                                      quantityChange: 0,
                                      reason: 'adjustment',
                                      notes: '',
                                    })
                                  }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter stock
                                  </DropdownMenuItem>
                                </DialogTrigger>
                                {selectedProduct?.id === product.id && (
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Ajouter du stock</DialogTitle>
                                      <DialogDescription>
                                        Ajouter du stock pour {product.name}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label>Quantité</Label>
                                        <Input
                                          type="number"
                                          value={stockForm.quantityChange}
                                          onChange={(e) => setStockForm(prev => ({
                                            ...prev,
                                            quantityChange: parseInt(e.target.value) || 0,
                                          }))}
                                          placeholder="0"
                                        />
                                      </div>
                                      <div>
                                        <Label>Raison</Label>
                                        <Select
                                          value={stockForm.reason}
                                          onValueChange={(value) => setStockForm(prev => ({
                                            ...prev,
                                            reason: value as any,
                                          }))}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="restock">Réapprovisionnement</SelectItem>
                                            <SelectItem value="adjustment">Ajustement</SelectItem>
                                            <SelectItem value="return">Retour</SelectItem>
                                            <SelectItem value="damage">Dommage</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label>Notes</Label>
                                        <Textarea
                                          value={stockForm.notes}
                                          onChange={(e) => setStockForm(prev => ({
                                            ...prev,
                                            notes: e.target.value,
                                          }))}
                                          placeholder="Notes optionnelles..."
                                        />
                                      </div>
                                      <Button
                                        onClick={() => updateStock(product.id)}
                                        disabled={isUpdating || stockForm.quantityChange === 0}
                                        className="w-full"
                                      >
                                        {isUpdating ? (
                                          <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Mise à jour...
                                          </>
                                        ) : (
                                          <>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Ajouter
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </DialogContent>
                                )}
                              </Dialog>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => {
                                    e.preventDefault()
                                    setSelectedProduct(product)
                                    setThresholdForm({
                                      lowStockThreshold: product.low_stock_threshold,
                                    })
                                  }}>
                                    <Settings className="h-4 w-4 mr-2" />
                                    Seuil d'alerte
                                  </DropdownMenuItem>
                                </DialogTrigger>
                                {selectedProduct?.id === product.id && (
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Seuil de stock faible</DialogTitle>
                                      <DialogDescription>
                                        Définir le seuil d'alerte pour {product.name}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label>Seuil (unités)</Label>
                                        <Input
                                          type="number"
                                          value={thresholdForm.lowStockThreshold}
                                          onChange={(e) => setThresholdForm({
                                            lowStockThreshold: parseInt(e.target.value) || 0,
                                          })}
                                          placeholder="10"
                                          min="0"
                                        />
                                      </div>
                                      <Button
                                        onClick={() => updateThreshold(product.id)}
                                        disabled={isUpdating}
                                        className="w-full"
                                      >
                                        {isUpdating ? (
                                          <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Mise à jour...
                                          </>
                                        ) : (
                                          'Mettre à jour'
                                        )}
                                      </Button>
                                    </div>
                                  </DialogContent>
                                )}
                              </Dialog>

                              <DropdownMenuItem onClick={() => setShowHistory(true)}>
                                <History className="h-4 w-4 mr-2" />
                                Historique
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Affichage de {((pagination.page - 1) * pagination.limit) + 1} à{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} sur{' '}
                  {pagination.total} produits
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page <= 1}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>

                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">
                      Page {pagination.page} sur {pagination.pages}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.pages}
                    className="gap-1"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
