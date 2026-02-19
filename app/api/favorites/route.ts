import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { authenticateRequest } from '@/lib/simple-auth'

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { data: favorites, error } = await supabaseAdmin
      .from('favorites')
      .select(`
        id,
        created_at,
        products (
          id,
          name,
          slug,
          description,
          price,
          original_price,
          images,
          sizes,
          colors,
          stock,
          is_new,
          rating,
          review_count,
          categories (
            id,
            name,
            slug
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Transform data to match expected format
    const transformedFavorites = favorites?.map((favorite: any) => ({
      id: favorite.id,
      createdAt: favorite.created_at,
      product: favorite.products ? {
        id: favorite.products.id,
        name: favorite.products.name,
        slug: favorite.products.slug,
        description: favorite.products.description,
        price: favorite.products.price,
        originalPrice: favorite.products.original_price,
        images: typeof favorite.products.images === 'string' 
          ? JSON.parse(favorite.products.images) 
          : favorite.products.images,
        sizes: typeof favorite.products.sizes === 'string' 
          ? JSON.parse(favorite.products.sizes) 
          : favorite.products.sizes,
        colors: typeof favorite.products.colors === 'string' 
          ? JSON.parse(favorite.products.colors) 
          : favorite.products.colors,
        stock: favorite.products.stock,
        isNew: favorite.products.is_new,
        rating: favorite.products.rating,
        reviewCount: favorite.products.review_count,
        category: favorite.products.categories
      } : null
    })) || []

    return NextResponse.json({
      favorites: transformedFavorites,
      total: transformedFavorites.length,
    })
  } catch (error) {
    console.error('Favorites fetch error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des favoris' },
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
    const { productId } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'ID produit requis' },
        { status: 400 }
      )
    }

    // Check if already in favorites
    const { data: existing } = await supabaseAdmin
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Produit déjà dans les favoris' },
        { status: 400 }
      )
    }

    // Add to favorites
    const { data: newFavorite, error } = await supabaseAdmin
      .from('favorites')
      .insert({
        user_id: user.id,
        product_id: productId,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Produit ajouté aux favoris',
      favorite: newFavorite,
    })
  } catch (error) {
    console.error('Add to favorites error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout aux favoris' },
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
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'ID produit requis' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId)

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Produit retiré des favoris',
    })
  } catch (error) {
    console.error('Remove from favorites error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression des favoris' },
      { status: 500 }
    )
  }
}