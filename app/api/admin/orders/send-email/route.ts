import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { authenticateRequest } from '@/lib/simple-auth'
import { sendOrderStatusUpdate, sendShippingNotification } from '@/lib/email-service'
import { z } from 'zod'

const sendEmailSchema = z.object({
  orderId: z.string(),
  emailType: z.enum(['status', 'shipping']),
  status: z.string().optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  estimatedDelivery: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate admin user
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = sendEmailSchema.parse(body)

    // Fetch order with user details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        guest_email,
        is_guest,
        users (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', validatedData.orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      )
    }

    const customerEmail = order.is_guest ? order.guest_email : order.users?.email
    const customerName = order.is_guest ? 'Client' : order.users?.first_name || 'Client'

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Email client non trouvé' },
        { status: 400 }
      )
    }

    let result

    if (validatedData.emailType === 'status') {
      // Send status update email
      if (!validatedData.status) {
        return NextResponse.json(
          { error: 'Statut requis pour l\'email de mise à jour' },
          { status: 400 }
        )
      }

      result = await sendOrderStatusUpdate({
        orderNumber: order.order_number,
        email: customerEmail,
        firstName: customerName,
        status: validatedData.status,
        trackingNumber: validatedData.trackingNumber,
        estimatedDelivery: validatedData.estimatedDelivery,
      })
    } else if (validatedData.emailType === 'shipping') {
      // Send shipping notification email
      if (!validatedData.trackingNumber || !validatedData.carrier) {
        return NextResponse.json(
          { error: 'Numéro de suivi et transporteur requis' },
          { status: 400 }
        )
      }

      result = await sendShippingNotification({
        orderNumber: order.order_number,
        email: customerEmail,
        firstName: customerName,
        trackingNumber: validatedData.trackingNumber,
        carrier: validatedData.carrier,
        estimatedDelivery: validatedData.estimatedDelivery || '2-5 jours',
      })
    } else {
      return NextResponse.json(
        { error: 'Type d\'email invalide' },
        { status: 400 }
      )
    }

    if (result.error) {
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email', details: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email envoyé avec succès',
      emailId: result.data?.id,
    })
  } catch (error) {
    console.error('Error sending order email:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    )
  }
}
