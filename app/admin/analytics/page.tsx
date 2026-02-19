'use client'

import { useEffect, useState } from 'react'
import { MobileHeader } from '@/components/mobile-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart,
  Package, Users, AlertCircle, Download, Calendar
} from 'lucide-react'
import Link from 'next/link'

interface Analytics {
  period: string
  metrics: {
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    completedOrders: number
    pendingOrders: number
    paidOrders: number
    newUsers: number
  }
  inventory: {
    inStock: number
    lowStock: number
    outOfStock: number
    total: number
  }
  topProducts: Array<{
    productId: string
    productName: string
    quantity: number
    revenue: number
  }>
  dailySales: Array<{
    date: string
    orders: number
    revenue: number
  }>
  orderStatus: {
    pending: number
    completed: number
    cancelled: number
  }
  paymentStatus: {
    paid: number
    pending: number
    failed: number
  }
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/analytics?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader title="Analytics" showBack />
        <main className="px-4 py-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-full h-32 rounded-2xl" />
          ))}
        </main>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader title="Analytics" showBack />
        <main className="px-4 py-4">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Erreur</h3>
            <p className="text-sm text-muted-foreground">Impossible de charger les analytics</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Analytics" showBack />
      
      <main className="px-4 py-4 space-y-6">
        {/* Period Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['7', '30', '90', '365'].map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
              className="whitespace-nowrap"
            >
              {p === '7' ? '7 jours' : p === '30' ? '30 jours' : p === '90' ? '90 jours' : '1 an'}
            </Button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Revenue */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Revenus totaux</span>
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold">
              {(analytics.metrics.totalRevenue / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              GNF
            </p>
          </Card>

          {/* Total Orders */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Commandes</span>
              <ShoppingCart className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">
              {analytics.metrics.totalOrders}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.metrics.completedOrders} complétées
            </p>
          </Card>

          {/* Average Order Value */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Panier moyen</span>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold">
              {(analytics.metrics.averageOrderValue / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              GNF
            </p>
          </Card>

          {/* New Users */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Nouveaux clients</span>
              <Users className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold">
              {analytics.metrics.newUsers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              cette période
            </p>
          </Card>
        </div>

        {/* Daily Sales Chart */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Ventes quotidiennes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenus" />
              <Line type="monotone" dataKey="orders" stroke="#10b981" name="Commandes" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Order Status */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {analytics.orderStatus.pending}
              </div>
              <p className="text-xs text-muted-foreground mt-1">En attente</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analytics.orderStatus.completed}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Complétées</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {analytics.orderStatus.cancelled}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Annulées</p>
            </div>
          </Card>
        </div>

        {/* Inventory Status */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">État de l'inventaire</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">En stock</span>
              <Badge className="bg-green-100 text-green-800">
                {analytics.inventory.inStock}/{analytics.inventory.total}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Stock faible</span>
              <Badge className="bg-yellow-100 text-yellow-800">
                {analytics.inventory.lowStock}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Rupture de stock</span>
              <Badge className="bg-red-100 text-red-800">
                {analytics.inventory.outOfStock}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Top Products */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Produits les plus vendus</h3>
          <div className="space-y-3">
            {analytics.topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{product.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.quantity} unités vendues
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">
                    {(product.revenue / 1000000).toFixed(1)}M GNF
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Payment Status */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Statut des paiements</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Payés</span>
              <Badge className="bg-green-100 text-green-800">
                {analytics.paymentStatus.paid}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">En attente</span>
              <Badge className="bg-yellow-100 text-yellow-800">
                {analytics.paymentStatus.pending}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Échoués</span>
              <Badge className="bg-red-100 text-red-800">
                {analytics.paymentStatus.failed}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Export Button */}
        <Button className="w-full gap-2">
          <Download className="w-4 h-4" />
          Exporter le rapport
        </Button>

        {/* Links to Other Pages */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/admin/orders">
            <Button variant="outline" className="w-full">
              Voir les commandes
            </Button>
          </Link>
          <Link href="/admin/inventory">
            <Button variant="outline" className="w-full">
              Voir l'inventaire
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
