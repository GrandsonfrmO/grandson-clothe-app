import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getApiCache, setApiCache } from '@/lib/api-cache'

const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

export async function GET(request: NextRequest) {
  try {
    const cacheKey = 'special_offer:active'
    
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
      return NextResponse.json({ offer: null }, { status: 200 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('special_offers')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    const result = { offer: data || null }
    setApiCache(cacheKey, result, CACHE_TTL)

    return NextResponse.json(result, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=1800, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error fetching special offer:', error)
    return NextResponse.json({ offer: null }, { status: 200 })
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

    // First, deactivate all other offers
    await supabase
      .from('special_offers')
      .update({ is_active: false })
      .neq('id', body.id || 0)

    // Then update or create the offer
    let result
    if (body.id) {
      result = await supabase
        .from('special_offers')
        .update({
          title: body.title,
          description: body.description,
          image_url: body.image_url,
          discount_text: body.discount_text,
          cta_text: body.cta_text,
          cta_link: body.cta_link,
          is_active: true,
        })
        .eq('id', body.id)
        .select()
    } else {
      result = await supabase
        .from('special_offers')
        .insert([
          {
            title: body.title,
            description: body.description,
            image_url: body.image_url,
            discount_text: body.discount_text,
            cta_text: body.cta_text,
            cta_link: body.cta_link,
            is_active: true,
          },
        ])
        .select()
    }

    if (result.error) throw result.error

    // Invalidate cache
    const cacheKey = 'special_offer:active'
    setApiCache(cacheKey, { offer: result.data?.[0] }, CACHE_TTL)

    return NextResponse.json({ offer: result.data?.[0] })
  } catch (error) {
    console.error('Error saving special offer:', error)
    return NextResponse.json({ error: 'Failed to save offer' }, { status: 500 })
  }
}
