import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { authenticateRequest } from '@/lib/simple-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('order_number', params.orderNumber)
      .eq('user_id', user.id)
      .single()

    if (error || !order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      )
    }

    // Generate PDF invoice
    // This is a placeholder - in production, use a library like pdfkit or puppeteer
    const invoiceData = {
      orderNumber: order.order_number,
      date: new Date(order.created_at).toLocaleDateString('fr-FR'),
      customer: {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        phone: user.phone,
      },
      items: order.order_items.map((item: any) => ({
        name: item.products.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),
      subtotal: order.subtotal,
      shippingCost: order.shipping_cost,
      total: order.total,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      shippingAddress: JSON.parse(order.shipping_address),
    }

    // Return invoice data as JSON (can be converted to PDF on client side)
    return NextResponse.json({
      invoice: invoiceData,
      message: 'Facture générée avec succès',
    })
  } catch (error) {
    console.error('Invoice generation error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération de la facture' },
      { status: 500 }
    )
  }
}
