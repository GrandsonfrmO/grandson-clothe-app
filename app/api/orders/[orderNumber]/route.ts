import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { authenticateRequest } from '@/lib/simple-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { orderNumber } = await params
    
    // Try to authenticate user (optional for guest orders)
    const user = await authenticateRequest(request)
    
    // Get email from query params for guest order verification
    const { searchParams } = new URL(request.url)
    const guestEmail = searchParams.get('email')

    // First, fetch the order without filters
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            images,
            price
          )
        )
      `)
      .eq('order_number', orderNumber)
      .single()

    if (error || !order) {
      console.error('Order not found:', error)
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      )
    }

    // Now verify access rights
    if (user) {
      // Authenticated user - verify they own the order
      if (order.user_id !== user.id) {
        return NextResponse.json(
          { error: 'Non autorisé - cette commande ne vous appartient pas' },
          { status: 403 }
        )
      }
    } else if (guestEmail && order.is_guest) {
      // Guest order - verify email matches
      const shippingAddress = JSON.parse(order.shipping_address || '{}')
      const orderEmail = order.guest_email || shippingAddress.email
      
      if (orderEmail !== guestEmail) {
        console.error('Email mismatch:', { provided: guestEmail, expected: orderEmail })
        return NextResponse.json(
          { error: 'Email ne correspond pas à la commande' },
          { status: 403 }
        )
      }
    } else {
      // No valid authentication method
      return NextResponse.json(
        { error: 'Non autorisé - authentification ou email requis' },
        { status: 401 }
      )
    }

    // Transform order data
    const transformedOrder = {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      paymentStatus: order.payment_status,
      subtotal: order.subtotal,
      shippingCost: order.shipping_cost,
      total: order.total,
      paymentMethod: order.payment_method,
      shippingAddress: JSON.parse(order.shipping_address || '{}'),
      notes: order.notes,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: (order.order_items || []).map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.price,
        total: item.total,
        product: {
          id: item.products?.id,
          name: item.products?.name,
          images: typeof item.products?.images === 'string' 
            ? JSON.parse(item.products.images || '[]')
            : item.products?.images || [],
          price: item.products?.price,
        },
      })),
    }

    return NextResponse.json({
      order: transformedOrder,
    })
  } catch (error) {
    console.error('Order fetch error:', error)
    
    // Log more details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la commande' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { orderNumber } = await params
    
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { notes } = body

    if (!notes || typeof notes !== 'string') {
      return NextResponse.json(
        { error: 'Notes invalides' },
        { status: 400 }
      )
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update({
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('order_number', orderNumber)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Commande mise à jour avec succès',
      order,
    })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la commande' },
      { status: 500 }
    )
  }
}
