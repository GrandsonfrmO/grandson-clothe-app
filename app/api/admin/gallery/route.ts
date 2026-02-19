import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getApiCache, setApiCache } from '@/lib/api-cache'

const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const cacheKey = 'gallery:all'
    
    // Check cache first
    const cached = getApiCache(cacheKey, CACHE_TTL)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=1800, s-maxage=3600',
        },
      })
    }

    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching gallery:', error)
      return NextResponse.json({ gallery: [] })
    }

    const result = { gallery: data || [] }
    setApiCache(cacheKey, result, CACHE_TTL)

    return NextResponse.json(result, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=1800, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error in gallery GET:', error)
    return NextResponse.json({ gallery: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { image, name, description, display_order } = body

    const { data, error } = await supabase
      .from('gallery')
      .insert([
        {
          image,
          name,
          description,
          display_order: display_order || 0,
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Invalidate cache
    const cacheKey = 'gallery:all'
    const cached = getApiCache(cacheKey)
    if (cached) {
      setApiCache(cacheKey, { gallery: [...cached.gallery, data[0]] }, CACHE_TTL)
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Error in gallery POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
