import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { authenticateRequest } from '@/lib/simple-auth'
import { z } from 'zod'

const reviewSchema = z.object({
  productId: z.number(),
  orderId: z.string().optional(),
  rating: z.number().min(1).max(5),
  title: z.string().max(255).optional(),
  comment: z.string().optional(),
  images: z.array(z.string()).default([]),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const rating = searchParams.get('rating')

    const offset = (page - 1) * limit

    // Build query
    let query = supabaseAdmin
      .from('reviews')
      .select(`
        id,
        rating,
        title,
        comment,
        images,
        created_at,
        users (
          first_name,
          last_name,
          avatar
        ),
        products (
          id,
          name,
          images
        )
      `, { count: 'exact' })
      .eq('is_verified', true)

    if (productId) {
      query = query.eq('product_id', parseInt(productId))
    }

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (rating) {
      query = query.eq('rating', parseInt(rating))
    }

    const { data: productReviews, count: total, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    // Get rating statistics if productId is provided
    let ratingStats = null
    if (productId) {
      const { data: stats } = await supabaseAdmin
        .from('reviews')
        .select('rating', { count: 'exact' })
        .eq('product_id', parseInt(productId))
        .eq('is_verified', true)

      if (stats && stats.length > 0) {
        const avgRating = stats.reduce((sum, r) => sum + r.rating, 0) / stats.length
        
        // Get rating distribution
        const distribution = [1, 2, 3, 4, 5].map(r => ({
          rating: r,
          count: stats.filter(s => s.rating === r).length
        }))

        ratingStats = {
          average: avgRating,
          total: stats.length,
          distribution,
        }
      }
    }

    return NextResponse.json({
      reviews: productReviews || [],
      pagination: {
        page,
        limit,
        total: total || 0,
        pages: Math.ceil((total || 0) / limit),
      },
      ratingStats,
    })
  } catch (error) {
    console.error('Reviews fetch error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des avis' },
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
    const validatedData = reviewSchema.parse(body)

    // Check if product exists
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('id', validatedData.productId)
      .single()

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      )
    }

    // Check if user has already reviewed this product
    const { data: existingReview } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', validatedData.productId)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: 'Vous avez déjà laissé un avis pour ce produit' },
        { status: 400 }
      )
    }

    // Create review
    const { data: newReview, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        user_id: user.id,
        product_id: validatedData.productId,
        rating: validatedData.rating,
        title: validatedData.title,
        comment: validatedData.comment,
        images: validatedData.images,
        is_verified: validatedData.orderId ? true : false,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Update product rating and review count
    const { data: stats } = await supabaseAdmin
      .from('reviews')
      .select('rating', { count: 'exact' })
      .eq('product_id', validatedData.productId)
      .eq('is_verified', true)

    if (stats && stats.length > 0) {
      const avgRating = stats.reduce((sum, r) => sum + r.rating, 0) / stats.length
      
      await supabaseAdmin
        .from('products')
        .update({
          rating: avgRating.toFixed(1),
          review_count: stats.length,
        })
        .eq('id', validatedData.productId)
    }

    return NextResponse.json({
      message: 'Avis ajouté avec succès',
      review: newReview,
    })
  } catch (error) {
    console.error('Add review error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout de l\'avis' },
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
    const reviewId = searchParams.get('id')

    if (!reviewId) {
      return NextResponse.json(
        { error: 'ID avis requis' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = reviewSchema.parse(body)

    // Update review (only if user owns it)
    const { data: updatedReview, error } = await supabaseAdmin
      .from('reviews')
      .update({
        rating: validatedData.rating,
        title: validatedData.title,
        comment: validatedData.comment,
        images: validatedData.images,
        is_verified: false,
      })
      .eq('id', parseInt(reviewId))
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !updatedReview) {
      return NextResponse.json(
        { error: 'Avis non trouvé' },
        { status: 404 }
      )
    }

    // Update product rating and review count
    const { data: stats } = await supabaseAdmin
      .from('reviews')
      .select('rating', { count: 'exact' })
      .eq('product_id', validatedData.productId)
      .eq('is_verified', true)

    if (stats && stats.length > 0) {
      const avgRating = stats.reduce((sum, r) => sum + r.rating, 0) / stats.length
      
      await supabaseAdmin
        .from('products')
        .update({
          rating: avgRating.toFixed(1),
          review_count: stats.length,
        })
        .eq('id', validatedData.productId)
    }

    return NextResponse.json({
      message: 'Avis mis à jour avec succès',
      review: updatedReview,
    })
  } catch (error) {
    console.error('Update review error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'avis' },
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
    const reviewId = searchParams.get('id')

    if (!reviewId) {
      return NextResponse.json(
        { error: 'ID avis requis' },
        { status: 400 }
      )
    }

    // Get review to update product stats after deletion
    const { data: reviewToDelete } = await supabaseAdmin
      .from('reviews')
      .select('product_id')
      .eq('id', parseInt(reviewId))
      .eq('user_id', user.id)
      .single()

    if (!reviewToDelete) {
      return NextResponse.json(
        { error: 'Avis non trouvé' },
        { status: 404 }
      )
    }

    // Delete review
    await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', parseInt(reviewId))
      .eq('user_id', user.id)

    // Update product rating and review count
    const { data: stats } = await supabaseAdmin
      .from('reviews')
      .select('rating', { count: 'exact' })
      .eq('product_id', reviewToDelete.product_id)
      .eq('is_verified', true)

    if (stats && stats.length > 0) {
      const avgRating = stats.reduce((sum, r) => sum + r.rating, 0) / stats.length
      
      await supabaseAdmin
        .from('products')
        .update({
          rating: avgRating.toFixed(1),
          review_count: stats.length,
        })
        .eq('id', reviewToDelete.product_id)
    } else {
      await supabaseAdmin
        .from('products')
        .update({
          rating: '0',
          review_count: 0,
        })
        .eq('id', reviewToDelete.product_id)
    }

    return NextResponse.json({
      message: 'Avis supprimé avec succès',
    })
  } catch (error) {
    console.error('Delete review error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'avis' },
      { status: 500 }
    )
  }
}
