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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Truck,
  Mail,
  Send,
  Loader2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod: string
  subtotal: string
  shippingCost: string
  total: string
  shippingAddress: any
  notes?: string
  createdAt: string
  updatedAt: string
  user: {
    id: number
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  items: Array<{
    id: number
    quantity: number
    size?: string
    color?: string
    price: string
    total: string
    product: {
      id: number
      name: string
      images: string[]
    }
  }>
}

interface OrdersResponse {
  orders: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  stats: {
    total: number
    revenue: string
    byStatus: Array<{ status: string; count: number }>
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailForm, setEmailForm] = useState({
    emailType: 'status' as 'status' | 'shipping',
    status: '',
    trackingNumber: '',
    carrier: '',
    estimatedDelivery: '2-5 jours',
  })
  const { toast } = useToast()
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [stats, setStats] = useState({
    total: 0,
    revenue: '0',
    byStatus: [] as Array<{ status: string; count: number }>
  })
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    paymentStatus: ''
  })

  useEffect(() => {
    fetchOrders()
  }, [pagination.page, filters])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
      })

      const response = await fetch(`/api/admin/orders?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data: OrdersResponse = await response.json()
        setOrders(data.orders)
        setPagination(data.pagination)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/orders`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, status: newStatus })
      })

      if (response.ok) {
        fetchOrders()
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null)
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const sendOrderEmail = async (orderId: string) => {
    try {
      setSendingEmail(true)
      const token = localStorage.getItem('token')

      const response = await fetch('/api/admin/orders/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId,
          emailType: emailForm.emailType,
          status: emailForm.status || undefined,
          trackingNumber: emailForm.trackingNumber || undefined,
          carrier: emailForm.carrier || undefined,
          estimatedDelivery: emailForm.estimatedDelivery,
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Email envoyé',
          description: `Email ${emailForm.emailType === 'status' ? 'de mise à jour' : 'de livraison'} envoyé avec succès`,
        })
        // Reset form
        setEmailForm({
          emailType: 'status',
          status: '',
          trackingNumber: '',
          carrier: '',
          estimatedDelivery: '2-5 jours',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Erreur',
          description: error.error || 'Erreur lors de l\'envoi de l\'email',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error sending email:', error)
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'envoi de l\'email',
        variant: 'destructive',
      })
    } finally {
      setSendingEmail(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'shipped':
        return <TrendingUp className="h-4 w-4 text-purple-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      processing: 'En traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    }
    return labels[status] || status
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'default'
      case 'cancelled':
        return 'destructive'
      case 'processing':
        return 'secondary'
      case 'shipped':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default'
      case 'failed':
      case 'refunded':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
          <p className="text-muted-foreground">Gérez toutes les commandes de votre boutique</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Package className="h-3 w-3" />
            {stats.total} commandes
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus</p>
                <p className="text-2xl font-bold text-green-600">
                  {parseInt(stats.revenue).toLocaleString()} GNF
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En traitement</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.byStatus.find(s => s.status === 'processing')?.count || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Livrées</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.byStatus.find(s => s.status === 'delivered')?.count || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par numéro ou client..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => handleFilterChange('status', value === "all" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Statut commande" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="processing">En traitement</SelectItem>
                <SelectItem value="shipped">Expédiée</SelectItem>
                <SelectItem value="delivered">Livrée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.paymentStatus || "all"}
              onValueChange={(value) => handleFilterChange('paymentStatus', value === "all" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Statut paiement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="paid">Payé</SelectItem>
                <SelectItem value="failed">Échoué</SelectItem>
                <SelectItem value="refunded">Remboursé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg">
              Commandes ({pagination.total})
            </CardTitle>
            <CardDescription>
              Liste de toutes les commandes avec leurs détails
            </CardDescription>
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
                      <TableHead className="font-semibold">Commande</TableHead>
                      <TableHead className="font-semibold">Client</TableHead>
                      <TableHead className="font-semibold">Total</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="font-semibold">Paiement</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="border-border hover:bg-secondary/30">
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.orderNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.items.length} article{order.items.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {order.user?.firstName || 'Client'} {order.user?.lastName || ''}
                            </p>
                            <p className="text-sm text-muted-foreground">{order.user?.email || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-bold">
                            {parseInt(order.total).toLocaleString()} GNF
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <Badge variant={getStatusVariant(order.status) as any}>
                              {getStatusLabel(order.status)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPaymentStatusVariant(order.paymentStatus) as any}>
                            {order.paymentStatus === 'paid' ? 'Payé' : 
                             order.paymentStatus === 'pending' ? 'En attente' :
                             order.paymentStatus === 'failed' ? 'Échoué' : 'Remboursé'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                          </p>
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
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Voir détails
                                  </DropdownMenuItem>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Commande {order.orderNumber}</DialogTitle>
                                    <DialogDescription>
                                      Détails de la commande et gestion du statut
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <div className="space-y-6">
                                    {/* Order Status Update */}
                                    <div className="flex items-center gap-4">
                                      <label className="text-sm font-medium">Statut :</label>
                                      <Select
                                        value={order.status}
                                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                                      >
                                        <SelectTrigger className="w-48">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">En attente</SelectItem>
                                          <SelectItem value="processing">En traitement</SelectItem>
                                          <SelectItem value="shipped">Expédiée</SelectItem>
                                          <SelectItem value="delivered">Livrée</SelectItem>
                                          <SelectItem value="cancelled">Annulée</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Email Notification Section */}
                                    <Card className="border-border bg-blue-50/50 dark:bg-blue-950/20">
                                      <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                          <Mail className="h-5 w-5" />
                                          Envoyer une notification
                                        </CardTitle>
                                        <CardDescription>
                                          Notifiez le client par email
                                        </CardDescription>
                                      </CardHeader>
                                      <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                          <label className="text-sm font-medium">Type de notification :</label>
                                          <Select
                                            value={emailForm.emailType}
                                            onValueChange={(value) => setEmailForm(prev => ({ ...prev, emailType: value as 'status' | 'shipping' }))}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="status">Mise à jour de statut</SelectItem>
                                              <SelectItem value="shipping">Notification de livraison</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        {emailForm.emailType === 'status' && (
                                          <div className="space-y-3">
                                            <label className="text-sm font-medium">Nouveau statut :</label>
                                            <Select
                                              value={emailForm.status}
                                              onValueChange={(value) => setEmailForm(prev => ({ ...prev, status: value }))}
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un statut" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="processing">En traitement</SelectItem>
                                                <SelectItem value="shipped">Expédiée</SelectItem>
                                                <SelectItem value="delivered">Livrée</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        )}

                                        {emailForm.emailType === 'shipping' && (
                                          <>
                                            <div className="space-y-3">
                                              <label className="text-sm font-medium">Numéro de suivi :</label>
                                              <Input
                                                placeholder="Ex: TRK123456789"
                                                value={emailForm.trackingNumber}
                                                onChange={(e) => setEmailForm(prev => ({ ...prev, trackingNumber: e.target.value }))}
                                              />
                                            </div>
                                            <div className="space-y-3">
                                              <label className="text-sm font-medium">Transporteur :</label>
                                              <Input
                                                placeholder="Ex: DHL, FedEx, UPS"
                                                value={emailForm.carrier}
                                                onChange={(e) => setEmailForm(prev => ({ ...prev, carrier: e.target.value }))}
                                              />
                                            </div>
                                          </>
                                        )}

                                        <div className="space-y-3">
                                          <label className="text-sm font-medium">Livraison estimée :</label>
                                          <Input
                                            placeholder="Ex: 2-5 jours"
                                            value={emailForm.estimatedDelivery}
                                            onChange={(e) => setEmailForm(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                                          />
                                        </div>

                                        <Button
                                          onClick={() => sendOrderEmail(order.id)}
                                          disabled={sendingEmail || (emailForm.emailType === 'status' && !emailForm.status) || (emailForm.emailType === 'shipping' && (!emailForm.trackingNumber || !emailForm.carrier))}
                                          className="w-full gap-2"
                                        >
                                          {sendingEmail ? (
                                            <>
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                              Envoi en cours...
                                            </>
                                          ) : (
                                            <>
                                              <Send className="h-4 w-4" />
                                              Envoyer l'email
                                            </>
                                          )}
                                        </Button>
                                      </CardContent>
                                    </Card>

                                    {/* Customer Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <Card className="border-border">
                                        <CardHeader>
                                          <CardTitle className="text-lg">Client</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="space-y-2">
                                            <p><strong>Nom :</strong> {order.user?.firstName || 'Client'} {order.user?.lastName || ''}</p>
                                            <p><strong>Email :</strong> {order.user?.email || 'N/A'}</p>
                                            {order.user?.phone && (
                                              <p><strong>Téléphone :</strong> {order.user.phone}</p>
                                            )}
                                          </div>
                                        </CardContent>
                                      </Card>

                                      <Card className="border-border">
                                        <CardHeader>
                                          <CardTitle className="text-lg">Livraison</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="space-y-2">
                                            <p><strong>Adresse :</strong></p>
                                            <div className="text-sm text-muted-foreground">
                                              {order.shippingAddress?.street}<br />
                                              {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br />
                                              {order.shippingAddress?.country}
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>

                                    {/* Order Items */}
                                    <Card className="border-border">
                                      <CardHeader>
                                        <CardTitle className="text-lg">Articles commandés</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-4">
                                          {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4 p-4 border border-border rounded-xl">
                                              <div className="w-16 h-16 bg-secondary rounded-xl flex-shrink-0 overflow-hidden">
                                                {item.product.images[0] ? (
                                                  <img
                                                    src={item.product.images[0]}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                  />
                                                ) : (
                                                  <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="h-6 w-6 text-muted-foreground" />
                                                  </div>
                                                )}
                                              </div>
                                              <div className="flex-1">
                                                <p className="font-medium">{item.product.name}</p>
                                                <div className="text-sm text-muted-foreground flex gap-4">
                                                  <span>Quantité: {item.quantity}</span>
                                                  {item.size && <span>Taille: {item.size}</span>}
                                                  {item.color && <span>Couleur: {item.color}</span>}
                                                </div>
                                              </div>
                                              <div className="text-right">
                                                <p className="font-medium">
                                                  {parseInt(item.total).toLocaleString()} GNF
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                  {parseInt(item.price).toLocaleString()} GNF × {item.quantity}
                                                </p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </CardContent>
                                    </Card>

                                    {/* Order Summary */}
                                    <Card className="border-border">
                                      <CardHeader>
                                        <CardTitle className="text-lg">Résumé</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-2">
                                          <div className="flex justify-between">
                                            <span>Sous-total :</span>
                                            <span>{parseInt(order.subtotal).toLocaleString()} GNF</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Livraison :</span>
                                            <span>{parseInt(order.shippingCost).toLocaleString()} GNF</span>
                                          </div>
                                          <div className="flex justify-between font-bold text-lg border-t pt-2">
                                            <span>Total :</span>
                                            <span>{parseInt(order.total).toLocaleString()} GNF</span>
                                          </div>
                                          <div className="flex justify-between text-sm">
                                            <span>Méthode de paiement :</span>
                                            <span className="capitalize">{order.paymentMethod}</span>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'processing')}>
                                <Clock className="h-4 w-4 mr-2" />
                                Marquer en traitement
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'shipped')}>
                                <Truck className="h-4 w-4 mr-2" />
                                Marquer expédiée
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'delivered')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Marquer livrée
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
                  {pagination.total} commandes
                </p>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
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
                    onClick={() => handlePageChange(pagination.page + 1)}
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