'use server'

/**
 * 🚀 SERVER ACTIONS OPTIMISÉES
 * 
 * Actions serveur pour fetch de données avec cache intégré
 */

import { supabaseAdmin } from './supabase-admin'
import { unstable_cache } from 'next/cache'

// ============================================
// PRODUCTS
// ============================================

export async function getProducts(params: {
  search?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  isNew?: boolean
  limit?: number
  page?: number
}) {
  const { search, category, minPrice, maxPrice, isNew, limit = 20, page = 1 } = params
  const offset = (page - 1) * limit

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
      stock,
      is_new,
      rating,
      review_count,
      categories (id, name, slug)
    `, { count: 'exact' })
    .eq('is_active', true)

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  if (category && category !== 'Tous') {
    const { data: categoryData } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('name', category)
      .single()
    
    if (categoryData) {
      query = query.eq('category_id', categoryData.id)
    }
  }

  if (minPrice) query = query.gte('price', minPrice)
  if (maxPrice) query = query.lte('price', maxPrice)
  if (isNew) query = query.eq('is_new', true)

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error

  return {
    products: data?.map(p => ({
      ...p,
      images: Array.isArray(p.images) ? p.images : JSON.parse(p.images || '[]'),
      sizes: Array.isArray(p.sizes) ? p.sizes : JSON.parse(p.sizes || '[]'),
      colors: Array.isArray(p.colors) ? p.colors : JSON.parse(p.colors || '[]'),
    })) || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    }
  }
}

// Cache la fonction avec revalidation de 5 minutes
export const getCachedProducts = unstable_cache(
  getProducts,
  ['products'],
  { revalidate: 300, tags: ['products'] }
)

// ============================================
// SINGLE PRODUCT
// ============================================

export async function getProduct(id: number) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      categories (id, name, slug)
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) throw error
  if (!data) return null

  return {
    ...data,
    images: Array.isArray(data.images) ? data.images : JSON.parse(data.images || '[]'),
    sizes: Array.isArray(data.sizes) ? data.sizes : JSON.parse(data.sizes || '[]'),
    colors: Array.isArray(data.colors) ? data.colors : JSON.parse(data.colors || '[]'),
    features: Array.isArray(data.features) ? data.features : JSON.parse(data.features || '[]'),
  }
}

// Cache avec revalidation de 10 minutes
export const getCachedProduct = unstable_cache(
  getProduct,
  ['product'],
  { revalidate: 600, tags: ['products'] }
)

// ============================================
// FEATURED PRODUCTS
// ============================================

export async function getFeaturedProducts(limit: number = 10) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      id,
      name,
      slug,
      price,
      original_price,
      images,
      is_new,
      rating,
      categories (name)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return data?.map(p => ({
    ...p,
    images: Array.isArray(p.images) ? p.images : JSON.parse(p.images || '[]'),
  })) || []
}

export const getCachedFeaturedProducts = unstable_cache(
  getFeaturedProducts,
  ['featured-products'],
  { revalidate: 600, tags: ['products'] }
)

// ============================================
// CATEGORIES
// ============================================

export async function getCategories() {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

export const getCachedCategories = unstable_cache(
  getCategories,
  ['categories'],
  { revalidate: 3600, tags: ['categories'] }
)

// ============================================
// HOMEPAGE CONTENT
// ============================================

export async function getHomePageContent() {
  const [specialOffer, gallery, videos, models] = await Promise.all([
    // Special Offer
    supabaseAdmin
      .from('special_offers')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => data),
    
    // Gallery
    supabaseAdmin
      .from('gallery')
      .select('*')
      .eq('is_active', true)
      .order('order_index')
      .limit(6)
      .then(({ data }) => data || []),
    
    // Videos
    supabaseAdmin
      .from('videos')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => data || []),
    
    // Models
    supabaseAdmin
      .from('models')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => data || []),
  ])

  return {
    specialOffer,
    gallery,
    videos,
    models,
  }
}

export const getCachedHomePageContent = unstable_cache(
  getHomePageContent,
  ['homepage-content'],
  { revalidate: 600, tags: ['homepage'] }
)
