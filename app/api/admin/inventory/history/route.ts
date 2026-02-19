import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { authenticateRequest } from '@/lib/simple-auth'
import { z } from 'zod'

const getHistorySchema = z.object({
  productId: z.string().optional(),
  reason: z.string().optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
})

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const validatedData = getHistorySchema.parse({
      productId: searchParams.get('productId'),
      reason: searchParams.get('reason'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })

    const page = parseInt(validatedData.page)
    const limit = parseInt(validatedData.limit)
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('inventory_history')
      .select(`
        id,
        product_id,
        quantity_change,
        reason,
        reference_id,
        notes,
        created_at,
        products (
          id,
          name
        ),
        users (
          id,
          first_name,
          last_name
        )
      `, { count: 'exact' })

    // Apply filters
    if (validatedData.productId) {
      query = query.eq('product_id', parseInt(validatedData.productId))
    }

    if (validatedData.reason) {
      query = query.eq('reason', validatedData.reason)
    }

    // Execute query with pagination
    const { data: history, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      history: history || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching inventory history:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'historique' },
      { status: 500 }
    )
  }
}
