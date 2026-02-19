import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { authenticateRequest } from '@/lib/simple-auth'
import { eq, and, desc } from 'drizzle-orm'
import { z } from 'zod'

const addressSchema = z.object({
  type: z.enum(['home', 'work', 'other']).optional().default('home'),
  label: z.string().optional(),
  fullName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('Email invalide').optional(),
  phone: z.string().min(1, 'Téléphone requis').max(20),
  street: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional().default('Conakry'),
  postalCode: z.string().optional(),
  country: z.string().optional().default('Guinée'),
  commune: z.string().optional(),
  landmark: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
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

    const { data: userAddresses, error } = await supabaseAdmin
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Transform data to match expected format
    const transformedAddresses = userAddresses?.map(addr => ({
      id: addr.id,
      type: addr.type,
      label: addr.label,
      firstName: addr.first_name,
      lastName: addr.last_name,
      email: addr.email,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      commune: addr.commune,
      landmark: addr.landmark,
      isDefault: addr.is_default,
    })) || []

    return NextResponse.json({
      addresses: transformedAddresses,
      total: transformedAddresses.length,
    })
  } catch (error) {
    console.error('Addresses fetch error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des adresses' },
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
    const validatedData = addressSchema.parse(body)

    // Gérer fullName si fourni
    let firstName = validatedData.firstName
    let lastName = validatedData.lastName
    
    if (validatedData.fullName && !firstName && !lastName) {
      const parts = validatedData.fullName.split(' ')
      firstName = parts[0] || 'Client'
      lastName = parts.slice(1).join(' ') || ''
    }
    
    // Valeurs par défaut
    firstName = firstName || 'Client'
    lastName = lastName || ''

    // If this is set as default, remove default from other addresses
    if (validatedData.isDefault) {
      await supabaseAdmin
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)
    }

    const { data: newAddress, error } = await supabaseAdmin
      .from('addresses')
      .insert({
        user_id: user.id,
        type: validatedData.type,
        label: validatedData.label,
        first_name: firstName,
        last_name: lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.street || validatedData.address || '',
        city: validatedData.city,
        commune: validatedData.commune,
        landmark: validatedData.landmark,
        is_default: validatedData.isDefault,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Adresse ajoutée avec succès',
      address: {
        id: newAddress.id,
        type: newAddress.type,
        label: newAddress.label,
        firstName: newAddress.first_name,
        lastName: newAddress.last_name,
        email: newAddress.email,
        phone: newAddress.phone,
        address: newAddress.address,
        city: newAddress.city,
        commune: newAddress.commune,
        landmark: newAddress.landmark,
        isDefault: newAddress.is_default,
      },
    })
  } catch (error) {
    console.error('Add address error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout de l\'adresse' },
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
    const addressId = searchParams.get('id')

    if (!addressId) {
      return NextResponse.json(
        { error: 'ID adresse requis' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = addressSchema.parse(body)

    // If this is set as default, remove default from other addresses
    if (validatedData.isDefault) {
      await supabaseAdmin
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)
    }

    const { data: updatedAddress, error } = await supabaseAdmin
      .from('addresses')
      .update({
        type: validatedData.type,
        label: validatedData.label,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address,
        city: validatedData.city,
        commune: validatedData.commune,
        landmark: validatedData.landmark,
        is_default: validatedData.isDefault,
      })
      .eq('id', parseInt(addressId))
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !updatedAddress) {
      return NextResponse.json(
        { error: 'Adresse non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Adresse mise à jour avec succès',
      address: {
        id: updatedAddress.id,
        type: updatedAddress.type,
        label: updatedAddress.label,
        firstName: updatedAddress.first_name,
        lastName: updatedAddress.last_name,
        email: updatedAddress.email,
        phone: updatedAddress.phone,
        address: updatedAddress.address,
        city: updatedAddress.city,
        commune: updatedAddress.commune,
        landmark: updatedAddress.landmark,
        isDefault: updatedAddress.is_default,
      },
    })
  } catch (error) {
    console.error('Update address error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'adresse' },
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
    const addressId = searchParams.get('id')

    if (!addressId) {
      return NextResponse.json(
        { error: 'ID adresse requis' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('addresses')
      .delete()
      .eq('id', parseInt(addressId))
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Adresse supprimée avec succès',
    })
  } catch (error) {
    console.error('Delete address error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'adresse' },
      { status: 500 }
    )
  }
}