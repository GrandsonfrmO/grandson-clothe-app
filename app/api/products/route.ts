import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Cache simple en mémoire avec nettoyage automatique
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // ✅ 5 minutes au lieu de 30

// ✅ Nettoyer le cache toutes les 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        cache.delete(key)
      }
    }
  }, 10 * 60 * 1000)
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    
    // Query parameters
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const isNew = searchParams.get('isNew')
    const featured = searchParams.get('featured')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // ✅ Clé de cache optimisée
    const cacheKey = `products:${search}:${category}:${minPrice}:${maxPrice}:${isNew}:${featured}:${sortBy}:${sortOrder}:${page}:${limit}`
    
    // ✅ Vérifier le cache avec TTL réduit à 5 minutes
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        ...cached.data,
        cached: true,
        responseTime: Date.now() - startTime
      }, {
        headers: {
          'X-Cache': 'HIT',
          'X-Response-Time': `${Date.now() - startTime}ms`,
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'CDN-Cache-Control': 'public, s-maxage=600',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=600'
        }
      })
    }

    // Build query
    let query = supabaseAdmin
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
      .eq('is_active', true)

    // Search by name
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    
    // Filter by category
    if (category && category !== 'Tous') {
      // First get category ID
      const { data: categoryData } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('name', category)
        .single()
      
      if (categoryData) {
        query = query.eq('category_id', categoryData.id)
      }
    }
    
    // Price range
    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice))
    }
    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice))
    }
    
    // New products only
    if (isNew === 'true') {
      query = query.eq('is_new', true)
    }

    // Sort options
    const ascending = sortOrder === 'asc'
    switch (sortBy) {
      case 'price':
        query = query.order('price', { ascending })
        break
      case 'name':
        query = query.order('name', { ascending })
        break
      case 'rating':
        query = query.order('rating', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Execute query with pagination
    const { data: productsData, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('supabaseAdmin query error:', error)
      throw error
    }

    // Transform products data - parse JSON fields safely
    const transformedProducts = (productsData || []).map(product => {
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

      return {
        ...product,
        images: safeParseJSON(product.images, []),
        sizes: safeParseJSON(product.sizes, []),
        colors: safeParseJSON(product.colors, []),
        features: safeParseJSON(product.features, []),
      }
    })

    const result = {
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      responseTime: Date.now() - startTime
    }

    // Mettre en cache
    cache.set(cacheKey, { data: result, timestamp: Date.now() })

    return NextResponse.json(result, {
      headers: {
        'X-Cache': 'MISS',
        'X-Response-Time': `${Date.now() - startTime}ms`,
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, s-maxage=600',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=600'
      }
    })
  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // This would be admin-only - add authentication check
    const body = await request.json()
    
    const { data: newProduct, error } = await supabaseAdmin
      .from('products')
      .insert({
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: body.price,
        original_price: body.originalPrice,
        category_id: body.categoryId,
        images: body.images || '[]',
        sizes: body.sizes || '[]',
        colors: body.colors || '[]',
        features: body.features || '[]',
        stock: body.stock || 0,
        is_new: body.isNew || false,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Produit créé avec succès',
      product: newProduct,
    })
  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du produit' },
      { status: 500 }
    )
  }
}
