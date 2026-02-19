import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse, errorResponse, successResponse } from '@/lib/admin-middleware'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.authorized) {
      return unauthorizedResponse(auth.error, auth.status)
    }

    const user = auth.user
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const role = searchParams.get('role')

    // Build query
    let query = supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
    }
    
    if (role) {
      query = query.eq('role', role)
    }

    // Execute query with pagination
    const offset = (page - 1) * limit
    const { data: filteredUsers, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching users:', error)
      return errorResponse('Erreur lors de la récupération des utilisateurs', 500)
    }

    // Get user statistics
    const { data: allUsers } = await supabaseAdmin
      .from('users')
      .select('role, is_verified')
    
    const stats = {
      total: allUsers?.length || 0,
      admins: allUsers?.filter(u => u.role === 'admin').length || 0,
      customers: allUsers?.filter(u => u.role === 'customer').length || 0,
      verified: allUsers?.filter(u => u.is_verified).length || 0,
    }

    return successResponse({
      users: filteredUsers || [],
      stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Admin users fetch error:', error)
    return errorResponse('Erreur lors de la récupération des utilisateurs', 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.authorized) {
      return unauthorizedResponse(auth.error, auth.status)
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { role, isVerified } = body

    const updateData: any = {}
    if (role) updateData.role = role
    if (isVerified !== undefined) updateData.is_verified = isVerified
    updateData.updated_at = new Date().toISOString()

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error || !updatedUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Utilisateur mis à jour avec succès',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    )
  }
}
