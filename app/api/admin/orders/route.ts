import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-middleware'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Simple cache for stats
const statsCache = new Map<string, { data: any; timestamp: number }>()
const STATS_CACHE_TTL = 1 * 60 * 1000 // 1 minute

function getStatsFromCache(): any | null {
  const cached = statsCache.get('orders_stats')
  if (cached && Date.now() - cached.timestamp < STATS_CACHE_TTL) {
    return cached.data
  }
  statsCache.delete('orders_stats')
  return null
}

function setStatsCache(data: any): void {
  statsCache.set('orders_stats', { data, timestamp: Date.now() })
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.authorized) {
      return unauthorizedResponse(auth.error, auth.status)
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    // Build query with user data join
    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        user:users(id, first_name, last_name, email, phone)
      `, { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.ilike('order_number', `%${search}%`)
    }
    
    if (status) {
      query = query.eq('status', status)
    }

    // Execute query with pagination
    const offset = (page - 1) * limit
    const { data: filteredOrders, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des commandes' },
        { status: 500 }
      )
    }

    // Transform orders to match expected format
    const transformedOrders = (filteredOrders || []).map(order => ({
      ...order,
      user: order.user ? {
        id: order.user.id,
        firstName: order.user.first_name,
        lastName: order.user.last_name,
        email: order.user.email,
        phone: order.user.phone,
      } : null
    }))

    // Get stats from cache or calculate
    let stats = getStatsFromCache()
    if (!stats) {
      const { data: allOrders } = await supabaseAdmin
        .from('orders')
        .select('status, total')
      
      stats = {
        total: allOrders?.length || 0,
        revenue: allOrders?.reduce((sum, order) => {
          const total = parseFloat(order.total as any)
          return sum + (isNaN(total) ? 0 : total)
        }, 0) || 0,
        byStatus: [
          { status: 'pending', count: allOrders?.filter(o => o.status === 'pending').length || 0 },
          { status: 'processing', count: allOrders?.filter(o => o.status === 'processing').length || 0 },
          { status: 'shipped', count: allOrders?.filter(o => o.status === 'shipped').length || 0 },
          { status: 'delivered', count: allOrders?.filter(o => o.status === 'delivered').length || 0 },
          { status: 'cancelled', count: allOrders?.filter(o => o.status === 'cancelled').length || 0 },
        ]
      }
      setStatsCache(stats)
    }

    return NextResponse.json({
      orders: transformedOrders,
      stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Admin orders fetch error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commandes' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Accès administrateur requis' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('id')
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'ID de la commande requis' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status, paymentStatus, notes } = body

    const updateData: any = {}
    if (status) updateData.status = status
    if (paymentStatus) updateData.payment_status = paymentStatus
    if (notes !== undefined) updateData.notes = notes
    updateData.updated_at = new Date().toISOString()

    const { data: updatedOrder, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (error || !updatedOrder) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Commande mise à jour avec succès',
      order: updatedOrder,
    })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la commande' },
      { status: 500 }
    )
  }
}
