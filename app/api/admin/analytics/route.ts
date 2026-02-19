import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { authenticateRequest } from '@/lib/simple-auth'

// Simple in-memory cache with TTL
const analyticsCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCacheKey(period: string): string {
  return `analytics_${period}`
}

function getFromCache(key: string): any | null {
  const cached = analyticsCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  analyticsCache.delete(key)
  return null
}

function setCache(key: string, data: any): void {
  analyticsCache.set(key, { data, timestamp: Date.now() })
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin
    const user = await authenticateRequest(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'
    const cacheKey = getCacheKey(period)

    // Check cache first
    const cached = getFromCache(cacheKey)
    if (cached) {
      return NextResponse.json({ ...cached, cached: true })
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))
    const startDateStr = startDate.toISOString()

    // Fetch all data in parallel with optimized queries
    const [ordersRes, productsRes, orderItemsRes, usersRes] = await Promise.all([
      supabase
        .from('orders')
        .select('id, total, created_at, status, payment_status')
        .gte('created_at', startDateStr),
      supabase
        .from('products')
        .select('id, name, stock, price'),
      supabase
        .from('order_items')
        .select('product_id, quantity, price, products(name)')
        .gte('created_at', startDateStr),
      supabase
        .from('users')
        .select('id, created_at')
        .gte('created_at', startDateStr),
    ])

    const orders = ordersRes.data || []
    const products = productsRes.data || []
    const orderItems = orderItemsRes.data || []
    const users = usersRes.data || []

    // Calculate metrics efficiently
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Use database aggregation for status counts
    const statusCounts = {
      completed: orders.filter(o => o.status === 'completed').length,
      pending: orders.filter(o => o.status === 'pending').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    }

    const paymentCounts = {
      paid: orders.filter(o => o.payment_status === 'paid').length,
      pending: orders.filter(o => o.payment_status === 'pending').length,
      failed: orders.filter(o => o.payment_status === 'failed').length,
    }

    // Product performance - use joined data to avoid N+1
    const productMap = new Map(products.map(p => [p.id, p]))
    const productPerformance = (orderItems || []).reduce((acc: any, item: any) => {
      const existing = acc.find((p: any) => p.productId === item.product_id)
      const productName = item.products?.name || productMap.get(item.product_id)?.name || 'Unknown'
      
      if (existing) {
        existing.quantity += item.quantity
        existing.revenue += item.price * item.quantity
      } else {
        acc.push({
          productId: item.product_id,
          productName,
          quantity: item.quantity,
          revenue: item.price * item.quantity,
        })
      }
      return acc
    }, [])

    productPerformance.sort((a: any, b: any) => b.revenue - a.revenue)
    const topProducts = productPerformance.slice(0, 5)

    // Inventory status
    const inStock = products.filter(p => p.stock > 0).length
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length
    const outOfStock = products.filter(p => p.stock === 0).length

    // Daily sales aggregation
    const dailySalesMap = new Map<string, { orders: number; revenue: number }>()
    orders.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0]
      const existing = dailySalesMap.get(date) || { orders: 0, revenue: 0 }
      existing.orders += 1
      existing.revenue += order.total || 0
      dailySalesMap.set(date, existing)
    })

    const dailySalesArray = Array.from(dailySalesMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const result = {
      period,
      metrics: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        completedOrders: statusCounts.completed,
        pendingOrders: statusCounts.pending,
        paidOrders: paymentCounts.paid,
        newUsers: users.length,
      },
      inventory: {
        inStock,
        lowStock,
        outOfStock,
        total: products.length,
      },
      topProducts,
      dailySales: dailySalesArray,
      orderStatus: statusCounts,
      paymentStatus: paymentCounts,
    }

    // Cache the result
    setCache(cacheKey, result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des analytics' },
      { status: 500 }
    )
  }
}
