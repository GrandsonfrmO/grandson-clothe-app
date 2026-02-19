import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { authenticateRequest } from '@/lib/simple-auth'

// Middleware to check admin role
async function requireAdmin(request: NextRequest) {
  const user = await authenticateRequest(request)
  if (!user || user.role !== 'admin') {
    return null
  }
  return user
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from('models')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    return NextResponse.json({ model: data })
  } catch (error) {
    console.error('Error fetching model:', error)
    return NextResponse.json({ error: 'Failed to fetch model' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Accès administrateur requis' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('models')
      .update({
        name: body.name,
        image_url: body.image_url,
        bio: body.bio,
        instagram: body.instagram || body.instagram_handle,
        email: body.email,
        phone: body.phone,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ model: data })
  } catch (error) {
    console.error('Error updating model:', error)
    return NextResponse.json({ error: 'Failed to update model' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Accès administrateur requis' },
        { status: 403 }
      )
    }

    const { id } = await params

    const { error } = await supabaseAdmin
      .from('models')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Modèle supprimé avec succès' })
  } catch (error) {
    console.error('Error deleting model:', error)
    return NextResponse.json({ error: 'Failed to delete model' }, { status: 500 })
  }
}
