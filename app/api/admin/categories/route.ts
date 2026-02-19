import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/simple-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getApiCache, setApiCache, createCachedResponse } from '@/lib/api-cache'

// Cache configuration
const CACHE_TTL = 60 * 60 * 1000 // 1 hour for categories (rarely change)

// Middleware to check admin role
async function requireAdmin(request: NextRequest) {
  const user = await authenticateRequest(request)
  if (!user || user.role !== 'admin') {
    return null
  }
  return user
}

export async function GET(request: NextRequest) {
  try {
    const cacheKey = 'categories:all'
    
    // Check cache first
    const cached = getApiCache(cacheKey, CACHE_TTL)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=3600, s-maxage=7200',
        },
      })
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('id', { ascending: true })

    if (error) throw error

    const result = { categories: data || [] }
    setApiCache(cacheKey, result, CACHE_TTL)

    return NextResponse.json(result, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=3600, s-maxage=7200',
      },
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ categories: [] }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Accès administrateur requis' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, slug, description, image, isActive } = body

    const categoryData: any = {
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description: description || null,
      image: image || null,
      is_active: isActive !== undefined ? isActive : true,
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert([categoryData])
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      throw error
    }

    // Invalidate cache
    const cacheKey = 'categories:all'
    const cached = getApiCache(cacheKey)
    if (cached) {
      setApiCache(cacheKey, { categories: [...cached.categories, data] }, CACHE_TTL)
    }

    return NextResponse.json({ category: data, id: data.id }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating category:', error)
    
    if (error?.code === '23505') {
      return NextResponse.json(
        { error: 'Une catégorie avec ce slug existe déjà' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de la catégorie' },
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
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID de catégorie requis' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', parseInt(id))

    if (error) {
      console.error('Error deleting category:', error)
      throw error
    }

    // Invalidate cache
    const cacheKey = 'categories:all'
    const cached = getApiCache(cacheKey)
    if (cached) {
      setApiCache(cacheKey, { categories: cached.categories.filter((c: any) => c.id !== parseInt(id)) }, CACHE_TTL)
    }

    return NextResponse.json({ success: true, message: 'Catégorie supprimée avec succès' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la catégorie' },
      { status: 500 }
    )
  }
}
