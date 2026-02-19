'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  Eye,
  Plus,
  BarChart3,
  Activity,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts'

// Mock data for charts
const chartData = [
  { name: 'Lun', ventes: 4000, revenus: 2400, commandes: 24 },
  { name: 'Mar', ventes: 3000, revenus: 1398, commandes: 18 },
  { name: 'Mer', ventes: 2000, revenus: 9800, commandes: 32 },
  { name: 'Jeu', ventes: 2780, revenus: 3908, commandes: 28 },
  { name: 'Ven', ventes: 1890, revenus: 4800, commandes: 22 },
  { name: 'Sam', ventes: 2390, revenus: 3800, commandes: 26 },
  { name: 'Dim', ventes: 3490, revenus: 4300, commandes: 30 },
]

const categoryData = [
  { name: 'T-shirts', value: 35, color: '#3b82f6' },
  { name: 'Hoodies', value: 25, color: '#10b981' },
  { name: 'Pantalons', value: 20, color: '#f59e0b' },
  { name: 'Accessoires', value: 15, color: '#8b5cf6' },
  { name: 'Autres', value: 5, color: '#ef4444' },
]

const topProductsData = [
  { name: 'Hoodie Noir', ventes: 450, revenus: 22500 },
  { name: 'T-shirt Graphic', ventes: 380, revenus: 11400 },
  { name: 'Cargo Pants', ventes: 320, revenus: 16000 },
  { name: 'Bomber Jacket', ventes: 280, revenus: 28000 },
  { name: 'Cap Classic', ventes: 220, revenus: 6600 },
]

interface DashboardStats {
  products: {
    total: number
    active: number
    inactive: number
    lowStock: number
  }
  orders: {
    total: number
    revenue: string
    byStatus: Array<{ status: string; count: number }>
  }
  recentOrders: Array<{
    id: string
    orderNumber: string
    status: string
    total: string
    user: {
      firstName: string
      lastName: string
    }
    createdAt: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch products stats
      const productsResponse = await fetch('/api/admin/products?limit=1000', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const productsData = await productsResponse.json()

      // Fetch orders stats
      const ordersResponse = await fetch('/api/admin/orders?limit=10', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const ordersData = await ordersResponse.json()

      const dashboardStats: DashboardStats = {
        products: {
          total: productsData.products?.length || 0,
          active: productsData.products?.filter((p: any) => p.isActive).length || 0,
          inactive: productsData.products?.filter((p: any) => !p.isActive).length || 0,
          lowStock: productsData.products?.filter((p: any) => p.stock < 10).length || 0,
        },
        orders: {
          total: ordersData.stats?.total || 0,
          revenue: ordersData.stats?.revenue || '0',
          byStatus: ordersData.stats?.byStatus || [],
        },
        recentOrders: ordersData.orders?.slice(0, 5) || [],
      }

      setStats(dashboardStats)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre boutique</p>
        </div>
        <Link href="/admin/products/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau Produit
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Produits Total</p>
                <p className="text-3xl font-bold mt-2">{stats?.products.total}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats?.products.active} actifs
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Commandes</p>
                <p className="text-3xl font-bold mt-2">{stats?.orders.total}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Revenus: {parseInt(stats?.orders.revenue || '0').toLocaleString()} GNF
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Faible</p>
                <p className="text-3xl font-bold mt-2 text-orange-600">{stats?.products.lowStock}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Moins de 10 unités
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux de Conversion</p>
                <p className="text-3xl font-bold mt-2">12.5%</p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  +2.5% ce mois
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Ventes cette semaine
            </CardTitle>
            <CardDescription>
              Nombre de ventes et revenus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="ventes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Revenus cette semaine
            </CardTitle>
            <CardDescription>
              Tendance des revenus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenus" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Distribution par Catégorie
            </CardTitle>
            <CardDescription>
              Répartition des produits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top 5 Produits
            </CardTitle>
            <CardDescription>
              Produits les plus vendus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" stroke="var(--muted-foreground)" />
                <YAxis dataKey="name" type="category" width={120} stroke="var(--muted-foreground)" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="ventes" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg">Commandes Récentes</CardTitle>
              <CardDescription>Les 5 dernières commandes</CardDescription>
            </div>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                Voir tout
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentOrders?.filter(order => order != null).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(order.status)}
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {(order.user && order.user.firstName) ? `${order.user.firstName} ${order.user.lastName || ''}` : 'Client'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{parseInt(order.total).toLocaleString()} GNF</p>
                    <Badge variant={getStatusVariant(order.status) as any} className="text-xs mt-1">
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg">Statuts des Commandes</CardTitle>
              <CardDescription>Répartition par statut</CardDescription>
            </div>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.orders.byStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <span className="font-medium text-sm">{getStatusLabel(item.status)}</span>
                  </div>
                  <Badge variant="outline" className="font-semibold">
                    {item.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-border bg-gradient-to-r from-accent/5 to-accent/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Actions Rapides
          </CardTitle>
          <CardDescription>Accès rapide aux fonctionnalités principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link href="/admin/products/new">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 hover:bg-accent/10">
                <Plus className="h-5 w-5" />
                Ajouter un produit
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 hover:bg-accent/10">
                <ShoppingCart className="h-5 w-5" />
                Gérer les commandes
              </Button>
            </Link>
            <Link href="/admin/products">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 hover:bg-accent/10">
                <Package className="h-5 w-5" />
                Inventaire
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}