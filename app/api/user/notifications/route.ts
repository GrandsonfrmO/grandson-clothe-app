import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { authenticateRequest } from '@/lib/simple-auth'
import { z } from 'zod'

const markReadSchema = z.object({
  notificationIds: z.array(z.number()).optional(),
  markAll: z.boolean().default(false),
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const offset = (page - 1) * limit

    // Build query
    let query = supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    if (type) {
      query = query.eq('type', type)
    }

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data: userNotifications, count: total, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    // Get unread count
    const { count: unreadCount } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_read', false)

    return NextResponse.json({
      notifications: userNotifications || [],
      pagination: {
        page,
        limit,
        total: total || 0,
        pages: Math.ceil((total || 0) / limit),
      },
      unreadCount: unreadCount || 0,
    })
  } catch (error) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = markReadSchema.parse(body)

    if (validatedData.markAll) {
      // Mark all notifications as read
      await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)

      return NextResponse.json({
        message: 'Toutes les notifications ont été marquées comme lues',
      })
    } else if (validatedData.notificationIds && validatedData.notificationIds.length > 0) {
      // Mark specific notifications as read
      await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .in('id', validatedData.notificationIds)

      return NextResponse.json({
        message: `${validatedData.notificationIds.length} notification(s) marquée(s) comme lue(s)`,
      })
    } else {
      return NextResponse.json(
        { error: 'Aucune notification spécifiée' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Mark notifications read error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des notifications' },
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
    const notificationId = searchParams.get('id')
    const deleteAll = searchParams.get('deleteAll') === 'true'

    if (deleteAll) {
      // Delete all notifications for user
      await supabaseAdmin
        .from('notifications')
        .delete()
        .eq('user_id', user.id)

      return NextResponse.json({
        message: 'Toutes les notifications ont été supprimées',
      })
    } else if (notificationId) {
      // Delete specific notification
      const { error } = await supabaseAdmin
        .from('notifications')
        .delete()
        .eq('id', parseInt(notificationId))
        .eq('user_id', user.id)

      if (error) {
        return NextResponse.json(
          { error: 'Notification non trouvée' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        message: 'Notification supprimée avec succès',
      })
    } else {
      return NextResponse.json(
        { error: 'ID notification requis' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la notification' },
      { status: 500 }
    )
  }
}

// Helper function to create notifications (used by other API routes)
export async function createNotification(
  userId: string,
  type: 'order' | 'promo' | 'general' | 'favorite',
  title: string,
  message: string,
  data?: any
) {
  try {
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data,
      })
  } catch (error) {
    console.error('Create notification error:', error)
  }
}