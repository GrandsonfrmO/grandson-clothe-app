import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, sanitizeInput, isValidPrice, auditLog } from '@/lib/security-middleware'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'

// Product validation schema with security checks
const productSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255),
  slug: z.string().max(255).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  price: z.union([z.string(), z.number()]).refine(val => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    return !isNaN(num) && num > 0
  }, 'Le prix doit être un nombre positif'),
  originalPrice: z.union([z.string(), z.number()]).optional().nullable(),
  categoryId: z.number().int().positive('La catégorie est requise'),
  images: z.array(z.string().url()).min(1, 'Au moins une image est requise'),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  stock: z.number().int().min(0, 'Le stock doit être positif').default(0),
  isNew: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Accès administrateur requis' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')
    const categoryId = searchParams.get('categoryId')

    const sanitizedSearch = search ? sanitizeInput(search) : null
    const offset = (page - 1) * limit

    // Build query
    let query = supabaseAdmin
      .from('products')
      .select('*', { count: 'exact' })

    // Apply filters
    if (sanitizedSearch) {
      query = query.or(`name.ilike.%${sanitizedSearch}%,description.ilike.%${sanitizedSearch}%`)
    }

    if (isActive !== null && isActive !== undefined && isActive !== '') {
      query = query.eq('is_active', isActive === 'true')
    }

    if (categoryId) {
      const catId = parseInt(categoryId)
      if (!isNaN(catId)) {
        query = query.eq('category_id', catId)
      }
    }

    // Execute query with pagination
    const { data: filteredProducts, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des produits' },
        { status: 500 }
      )
    }

    auditLog('ADMIN_PRODUCTS_LIST', user.id, { page, limit, search: sanitizedSearch })

    return NextResponse.json({
      products: filteredProducts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Admin products fetch error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 POST /api/admin/products - Starting product creation')
    
    const user = await requireAdmin(request)
    if (!user) {
      console.log('❌ Admin access denied')
      return NextResponse.json(
        { error: 'Accès administrateur requis' },
        { status: 403 }
      )
    }
    console.log('✅ Admin authenticated:', user.email)

    const body = await request.json()
    console.log('📦 Request body received:', {
      name: body.name,
      price: body.price,
      categoryId: body.categoryId,
      imagesCount: body.images?.length || 0,
    })
    
    // Validate the product data
    let validatedData
    try {
      validatedData = productSchema.parse(body)
      console.log('✅ Data validation passed')
    } catch (validationError) {
      console.error('❌ Validation error:', validationError)
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Données invalides', 
            details: validationError.errors.map(e => `${e.path.join('.')}: ${e.message}`)
          },
          { status: 400 }
        )
      }
      throw validationError
    }
    
    // Validate prices
    const priceValue = parseFloat(validatedData.price.toString())
    const originalPriceValue = validatedData.originalPrice ? parseFloat(validatedData.originalPrice.toString()) : null
    
    if (!isValidPrice(priceValue)) {
      return NextResponse.json({ error: 'Prix invalide' }, { status: 400 })
    }
    
    if (originalPriceValue !== null && !isValidPrice(originalPriceValue)) {
      return NextResponse.json({ error: 'Prix original invalide' }, { status: 400 })
    }

    // Generate slug if not provided
    let slug = validatedData.slug
    if (!slug && validatedData.name) {
      slug = validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()
    }

    const productData = {
      name: sanitizeInput(validatedData.name),
      slug: slug || '',
      description: validatedData.description ? sanitizeInput(validatedData.description) : null,
      price: priceValue,
      original_price: originalPriceValue,
      category_id: validatedData.categoryId,
      images: validatedData.images,
      sizes: validatedData.sizes,
      colors: validatedData.colors,
      features: validatedData.features,
      stock: validatedData.stock,
      is_new: validatedData.isNew,
      is_active: validatedData.isActive,
    }
    
    console.log('💾 Inserting product into Supabase...')
    
    const { data: newProduct, error } = await supabaseAdmin
      .from('products')
      .insert(productData)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Supabase error:', error)
      throw error
    }
    
    console.log('✅ Product created successfully:', newProduct.id)

    auditLog('ADMIN_PRODUCT_CREATED', user.id, { productId: newProduct.id, name: validatedData.name })

    return NextResponse.json({
      message: 'Produit créé avec succès',
      product: newProduct,
    })
  } catch (error) {
    console.error('❌ Create product error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Données invalides',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      )
    }
    
    // Check for database-specific errors
    if ((error as any)?.code === '23505') {
      return NextResponse.json(
        { error: 'Un produit avec ce slug existe déjà' },
        { status: 409 }
      )
    }
    
    if ((error as any)?.code === '23503') {
      return NextResponse.json(
        { error: 'Catégorie invalide' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création du produit',
        message: (error as any)?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Accès administrateur requis' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('id')
    
    if (!productId || isNaN(parseInt(productId))) {
      return NextResponse.json(
        { error: 'ID du produit invalide' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = productSchema.partial().parse(body)

    const updateData: any = {}
    if (validatedData.name) updateData.name = sanitizeInput(validatedData.name)
    if (validatedData.slug) updateData.slug = validatedData.slug
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description ? sanitizeInput(validatedData.description) : null
    }
    if (validatedData.price !== undefined) {
      const price = parseFloat(validatedData.price.toString())
      if (!isValidPrice(price)) {
        return NextResponse.json({ error: 'Prix invalide' }, { status: 400 })
      }
      updateData.price = price
    }
    if (validatedData.originalPrice !== undefined) {
      if (validatedData.originalPrice !== null) {
        const originalPrice = parseFloat(validatedData.originalPrice.toString())
        if (!isValidPrice(originalPrice)) {
          return NextResponse.json({ error: 'Prix original invalide' }, { status: 400 })
        }
        updateData.original_price = originalPrice
      } else {
        updateData.original_price = null
      }
    }
    if (validatedData.categoryId !== undefined) updateData.category_id = validatedData.categoryId
    if (validatedData.images !== undefined) updateData.images = validatedData.images
    if (validatedData.sizes !== undefined) updateData.sizes = validatedData.sizes
    if (validatedData.colors !== undefined) updateData.colors = validatedData.colors
    if (validatedData.features !== undefined) updateData.features = validatedData.features
    if (validatedData.stock !== undefined) updateData.stock = validatedData.stock
    if (validatedData.isNew !== undefined) updateData.is_new = validatedData.isNew
    if (validatedData.isActive !== undefined) updateData.is_active = validatedData.isActive
    updateData.updated_at = new Date().toISOString()

    const { data: updatedProduct, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', parseInt(productId))
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      )
    }

    auditLog('ADMIN_PRODUCT_UPDATED', user.id, { productId: parseInt(productId) })

    return NextResponse.json({
      message: 'Produit mis à jour avec succès',
      product: updatedProduct,
    })
  } catch (error) {
    console.error('Update product error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Données invalides',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du produit' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Accès administrateur requis' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('id')
    
    if (!productId || isNaN(parseInt(productId))) {
      return NextResponse.json(
        { error: 'ID du produit invalide' },
        { status: 400 }
      )
    }

    // Instead of deleting, we deactivate the product
    const { data: result, error } = await supabaseAdmin
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', parseInt(productId))
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      )
    }

    auditLog('ADMIN_PRODUCT_DELETED', user.id, { productId: parseInt(productId) })

    return NextResponse.json({
      message: 'Produit désactivé avec succès',
    })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du produit' },
      { status: 500 }
    )
  }
}
