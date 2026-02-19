import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseInt(id)
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'ID produit invalide' },
        { status: 400 }
      )
    }

    // Get product with category
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        name,
        slug,
        description,
        price,
        original_price,
        images,
        sizes,
        colors,
        features,
        stock,
        is_new,
        rating,
        review_count,
        created_at,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('id', productId)
      .eq('is_active', true)
      .single()

    if (productError) {
      if (productError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Produit non trouvé' },
          { status: 404 }
        )
      }
      throw productError
    }

    // Get product reviews
    const { data: productReviews, error: reviewsError } = await supabaseAdmin
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        images,
        is_verified,
        created_at,
        users (
          first_name,
          last_name,
          avatar
        )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (reviewsError) {
      console.error('Reviews fetch error:', reviewsError)
      // Continue without reviews if there's an error
    }

    // Transform data to match expected format
    const safeParseJSON = (value: any, fallback: any = []) => {
      if (Array.isArray(value)) return value
      if (typeof value === 'string') {
        try {
          return JSON.parse(value || JSON.stringify(fallback))
        } catch (e) {
          console.warn('Failed to parse JSON:', value)
          return fallback
        }
      }
      return fallback
    }

    const transformedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      originalPrice: product.original_price,
      images: safeParseJSON(product.images, []),
      sizes: safeParseJSON(product.sizes, []),
      colors: safeParseJSON(product.colors, []),
      features: safeParseJSON(product.features, []),
      stock: product.stock,
      isNew: product.is_new,
      rating: product.rating,
      reviewCount: product.review_count,
      createdAt: product.created_at,
      category: product.categories
    }

    const transformedReviews = productReviews?.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      images: safeParseJSON(review.images, []),
      isVerified: review.is_verified,
      createdAt: review.created_at,
      user: {
        firstName: review.users?.first_name,
        lastName: review.users?.last_name,
        avatar: review.users?.avatar,
      }
    })) || []

    return NextResponse.json({
      product: transformedProduct,
      reviews: transformedReviews,
    })
  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du produit' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // This would be admin-only - add authentication check
    const { id } = await params
    const productId = parseInt(id)
    const body = await request.json()
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'ID produit invalide' },
        { status: 400 }
      )
    }

    const { data: updatedProduct, error } = await supabaseAdmin
      .from('products')
      .update({
        name: body.name,
        description: body.description,
        price: body.price,
        original_price: body.originalPrice,
        category_id: body.categoryId,
        images: typeof body.images === 'string' ? body.images : JSON.stringify(body.images || []),
        sizes: typeof body.sizes === 'string' ? body.sizes : JSON.stringify(body.sizes || []),
        colors: typeof body.colors === 'string' ? body.colors : JSON.stringify(body.colors || []),
        features: typeof body.features === 'string' ? body.features : JSON.stringify(body.features || []),
        stock: body.stock,
        is_new: body.isNew,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Produit mis à jour avec succès',
      product: updatedProduct,
    })
  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du produit' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // This would be admin-only - add authentication check
    const { id } = await params
    const productId = parseInt(id)
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'ID produit invalide' },
        { status: 400 }
      )
    }

    // Soft delete - set is_active to false
    const { error } = await supabaseAdmin
      .from('products')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Produit supprimé avec succès',
    })
  } catch (error) {
    console.error('Product deletion error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du produit' },
      { status: 500 }
    )
  }
}