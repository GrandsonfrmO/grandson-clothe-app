import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { authenticateRequest } from '@/lib/simple-auth'
import { z } from 'zod'

const paymentMethodSchema = z.object({
  type: z.enum(['orange', 'mtn', 'card']),
  name: z.string().min(1, 'Nom requis').max(100),
  number: z.string().min(1, 'Numéro requis').max(100),
  isDefault: z.boolean().default(false),
})

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { data: userPaymentMethods, error } = await supabaseAdmin
      .from('payment_methods')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Mask sensitive information
    const maskedPaymentMethods = userPaymentMethods?.map(pm => ({
      id: pm.id,
      type: pm.type,
      name: pm.name,
      number: pm.type === 'card' 
        ? `**** **** **** ${pm.number.slice(-4)}`
        : `***${pm.number.slice(-4)}`,
      isDefault: pm.is_default,
      isVerified: pm.is_verified,
    })) || []

    return NextResponse.json({
      paymentMethods: maskedPaymentMethods,
      total: maskedPaymentMethods.length,
    })
  } catch (error) {
    console.error('Payment methods fetch error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des moyens de paiement' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = paymentMethodSchema.parse(body)

    // Validate phone number format for mobile money
    if (validatedData.type === 'orange' || validatedData.type === 'mtn') {
      const phoneRegex = /^(\+224)?[0-9]{8,9}$/
      if (!phoneRegex.test(validatedData.number.replace(/\s/g, ''))) {
        return NextResponse.json(
          { error: 'Format de numéro de téléphone invalide' },
          { status: 400 }
        )
      }
    }

    // If this is set as default, remove default from other payment methods
    if (validatedData.isDefault) {
      await supabaseAdmin
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id)
    }

    const { data: newPaymentMethod, error } = await supabaseAdmin
      .from('payment_methods')
      .insert({
        user_id: user.id,
        type: validatedData.type,
        name: validatedData.name,
        number: validatedData.number,
        is_default: validatedData.isDefault,
        is_verified: false,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Mask the number in response
    const maskedPaymentMethod = {
      id: newPaymentMethod.id,
      type: newPaymentMethod.type,
      name: newPaymentMethod.name,
      number: validatedData.type === 'card' 
        ? `**** **** **** ${validatedData.number.slice(-4)}`
        : `***${validatedData.number.slice(-4)}`,
      isDefault: newPaymentMethod.is_default,
      isVerified: newPaymentMethod.is_verified,
    }

    return NextResponse.json({
      message: 'Moyen de paiement ajouté avec succès',
      paymentMethod: maskedPaymentMethod,
    })
  } catch (error) {
    console.error('Add payment method error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout du moyen de paiement' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const paymentMethodId = searchParams.get('id')

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'ID moyen de paiement requis' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = paymentMethodSchema.parse(body)

    // If this is set as default, remove default from other payment methods
    if (validatedData.isDefault) {
      await supabaseAdmin
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id)
    }

    const { data: updatedPaymentMethod, error } = await supabaseAdmin
      .from('payment_methods')
      .update({
        type: validatedData.type,
        name: validatedData.name,
        number: validatedData.number,
        is_default: validatedData.isDefault,
        is_verified: false,
      })
      .eq('id', parseInt(paymentMethodId))
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !updatedPaymentMethod) {
      return NextResponse.json(
        { error: 'Moyen de paiement non trouvé' },
        { status: 404 }
      )
    }

    // Mask the number in response
    const maskedPaymentMethod = {
      id: updatedPaymentMethod.id,
      type: updatedPaymentMethod.type,
      name: updatedPaymentMethod.name,
      number: validatedData.type === 'card' 
        ? `**** **** **** ${validatedData.number.slice(-4)}`
        : `***${validatedData.number.slice(-4)}`,
      isDefault: updatedPaymentMethod.is_default,
      isVerified: updatedPaymentMethod.is_verified,
    }

    return NextResponse.json({
      message: 'Moyen de paiement mis à jour avec succès',
      paymentMethod: maskedPaymentMethod,
    })
  } catch (error) {
    console.error('Update payment method error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du moyen de paiement' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const paymentMethodId = searchParams.get('id')

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'ID moyen de paiement requis' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('payment_methods')
      .delete()
      .eq('id', parseInt(paymentMethodId))
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Moyen de paiement supprimé avec succès',
    })
  } catch (error) {
    console.error('Delete payment method error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du moyen de paiement' },
      { status: 500 }
    )
  }
}