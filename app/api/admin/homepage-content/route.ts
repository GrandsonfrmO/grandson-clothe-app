import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getApiCache, setApiCache } from '@/lib/api-cache'

const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

export async function GET(request: NextRequest) {
  try {
    const cacheKey = 'homepage_content:all'
    
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
      return NextResponse.json({ content: [] }, { status: 200 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('homepage_content')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error

    const result = { content: data || [] }
    setApiCache(cacheKey, result, CACHE_TTL)

    return NextResponse.json(result, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=1800, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error fetching homepage content:', error)
    return NextResponse.json({ content: [] }, { status: 200 })
  }
}

export async function PUT(request: NextRequest) {
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

    const { section_key, ...updateData } = body

    // Try to update existing record
    const { data: existingData } = await supabase
      .from('homepage_content')
      .select('id')
      .eq('section_key', section_key)
      .single()

    let result
    if (existingData) {
      result = await supabase
        .from('homepage_content')
        .update(updateData)
        .eq('section_key', section_key)
        .select()
    } else {
      result = await supabase
        .from('homepage_content')
        .insert([{ section_key, ...updateData }])
        .select()
    }

    if (result.error) throw result.error

    // Invalidate cache
    const cacheKey = 'homepage_content:all'
    const cached = getApiCache(cacheKey)
    if (cached) {
      // Refresh cache with new data
      const { data: freshData } = await supabase
        .from('homepage_content')
        .select('*')
        .order('created_at', { ascending: true })
      setApiCache(cacheKey, { content: freshData || [] }, CACHE_TTL)
    }

    return NextResponse.json({ content: result.data?.[0] })
  } catch (error) {
    console.error('Error saving homepage content:', error)
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 })
  }
}
