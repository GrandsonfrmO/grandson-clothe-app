import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getApiCache, setApiCache } from '@/lib/api-cache'

const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

export async function GET(request: NextRequest) {
  try {
    const cacheKey = 'videos:all'
    
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
      return NextResponse.json({ videos: [] }, { status: 200 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) throw error

    const result = { videos: data }
    setApiCache(cacheKey, result, CACHE_TTL)

    return NextResponse.json(result, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=1800, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json({ videos: [] }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const body = await request.json()
    const { title, description, thumbnail_url, video_url, duration } = body

    if (!title || !thumbnail_url || !video_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the highest order_index
    const { data: maxData } = await supabase
      .from('videos')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)

    const nextOrder = (maxData?.[0]?.order_index ?? -1) + 1

    const { data, error } = await supabase
      .from('videos')
      .insert([
        {
          title,
          description,
          thumbnail_url,
          video_url,
          duration,
          order_index: nextOrder,
          is_active: true,
        },
      ])
      .select()

    if (error) throw error

    // Invalidate cache
    const cacheKey = 'videos:all'
    const cached = getApiCache(cacheKey)
    if (cached) {
      setApiCache(cacheKey, { videos: [...cached.videos, data[0]] }, CACHE_TTL)
    }

    return NextResponse.json({ video: data[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    )
  }
}
