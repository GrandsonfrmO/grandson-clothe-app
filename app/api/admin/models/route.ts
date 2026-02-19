import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getApiCache, setApiCache } from '@/lib/api-cache'

const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

export async function GET(request: NextRequest) {
  try {
    const cacheKey = 'models:active'
    
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials')
      return NextResponse.json({ models: [] }, { status: 200 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('models')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error

    const result = { models: data || [] }
    setApiCache(cacheKey, result, CACHE_TTL)

    return NextResponse.json(result, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=1800, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json({ models: [] }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const body = await request.json()

    const { data, error } = await supabase
      .from('models')
      .insert([
        {
          name: body.name,
          image_url: body.image_url,
          bio: body.bio,
          instagram_handle: body.instagram_handle,
          email: body.email,
          phone: body.phone,
          is_active: true,
          display_order: body.display_order || 0,
        },
      ])
      .select()

    if (error) throw error

    // Invalidate cache
    const cacheKey = 'models:active'
    const cached = getApiCache(cacheKey)
    if (cached) {
      setApiCache(cacheKey, { models: [...cached.models, data?.[0]] }, CACHE_TTL)
    }

    return NextResponse.json({ model: data?.[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating model:', error)
    return NextResponse.json({ error: 'Failed to create model' }, { status: 500 })
  }
}
