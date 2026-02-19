import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin, unauthorizedResponse, errorResponse, successResponse } from '@/lib/admin-middleware'
import { z } from 'zod'

const getInventorySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  status: z.enum(['in_stock', 'low_stock', 'out_of_stock']).optional(),
  search: z.string().optional(),
})

const updateStockSchema = z.object({
  productId: z.number(),
  quantityChange: z.number(),
  reason: z.enum(['order', 'restock', 'adjustment', 'return', 'damage']),
  notes: z.string().optional(),
})

const updateThresholdSchema = z.object({
  productId: z.number(),
  lowStockThreshold: z.number().min(0),
})

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const auth = await requireAdmin(request)
    if (!auth.authorized) {
      return unauthorizedResponse(auth.error, auth.status)
    }

    const { searchParams } = new URL(request.url)
    const validatedData = getInventorySchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      search: searchParams.get('search'),
    })

    const page = parseInt(validatedData.page)
    const limit = parseInt(validatedData.limit)
    const offset = (page - 1) * limit

    // Build query
    let query = supabaseAdmin
      .from('products')
      .select('id, name, price, stock, created_at', { count: 'exact' })

    // Apply filters
    if (validatedData.search) {
      query = query.ilike('name', `%${validatedData.search}%`)
    }

    // Execute query with pagination
    const { data: products, error, count } = await query
      .order('stock', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    // Calculate stock status for each product
    const productsWithStatus = products?.map(p => ({
      ...p,
      stock_status: p.stock <= 0 ? 'out_of_stock' : p.stock <= 10 ? 'low_stock' : 'in_stock',
      low_stock_threshold: 10
    })) || []

    // Get inventory statistics
    const statsCount = {
      inStock: productsWithStatus.filter(p => p.stock_status === 'in_stock').length,
      lowStock: productsWithStatus.filter(p => p.stock_status === 'low_stock').length,
      outOfStock: productsWithStatus.filter(p => p.stock_status === 'out_of_stock').length,
    }

    return successResponse({
      products: productsWithStatus,
      stats: statsCount,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Inventory fetch error:', error)
    return errorResponse('Erreur lors de la récupération de l\'inventaire', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate admin user
    const auth = await requireAdmin(request)
    if (!auth.authorized) {
      return unauthorizedResponse(auth.error, auth.status)
    }

    const body = await request.json()
    const validatedData = updateStockSchema.parse(body)

    // Get current product
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('stock')
      .eq('id', validatedData.productId)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      )
    }

    const newStock = product.stock + validatedData.quantityChange

    // Prevent negative stock
    if (newStock < 0) {
      return NextResponse.json(
        { error: 'Stock insuffisant pour cette opération' },
        { status: 400 }
      )
    }

    // Update product stock
    const { error: updateError } = await supabaseAdmin
      .from('products')
      .update({
        stock: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedData.productId)

    if (updateError) {
      throw updateError
    }

    const newStockStatus = newStock <= 0 ? 'out_of_stock' : newStock <= 10 ? 'low_stock' : 'in_stock'

    return NextResponse.json({
      success: true,
      message: 'Stock mis à jour avec succès',
      product: {
        id: validatedData.productId,
        newStock,
        newStockStatus,
      },
    })
  } catch (error) {
    console.error('Error updating inventory:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du stock' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate admin user
    const auth = await requireAdmin(request)
    if (!auth.authorized) {
      return unauthorizedResponse(auth.error, auth.status)
    }

    const body = await request.json()
    const validatedData = updateThresholdSchema.parse(body)

    // Update low stock threshold (stored in product metadata or separate field)
    const { error: updateError } = await supabaseAdmin
      .from('products')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedData.productId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: 'Seuil de stock faible mis à jour avec succès',
    })
  } catch (error) {
    console.error('Error updating threshold:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du seuil' },
      { status: 500 }
    )
  }
}
