import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Créer le client Supabase avec les bonnes variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items } = body

    if (!items || items.length === 0) {
      return NextResponse.json({
        available: false,
        message: 'Aucun article à vérifier',
      })
    }

    // Get all product IDs
    const productIds = items.map((item: any) => item.productId)

    // Fetch products from database
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, stock')
      .in('id', productIds)

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json({
        available: false,
        message: 'Erreur lors de la vérification du stock',
      }, { status: 500 })
    }

    // Check stock for each item
    const insufficientItems: any[] = []
    const availableItems: any[] = []

    for (const item of items) {
      const product = products?.find((p: any) => p.id === item.productId)
      
      if (!product) {
        insufficientItems.push({
          productId: item.productId,
          productName: 'Produit inconnu',
          requested: item.quantity,
          available: 0,
        })
        continue
      }

      if (product.stock < item.quantity) {
        insufficientItems.push({
          productId: product.id,
          productName: product.name,
          requested: item.quantity,
          available: product.stock,
        })
      } else {
        availableItems.push({
          productId: product.id,
          productName: product.name,
          requested: item.quantity,
          available: product.stock,
        })
      }
    }

    // Return result
    return NextResponse.json({
      available: insufficientItems.length === 0,
      items: availableItems,
      insufficientItems,
      message: insufficientItems.length > 0 
        ? 'Stock insuffisant pour certains articles'
        : 'Tous les articles sont disponibles',
    })
  } catch (error) {
    console.error('Stock verification error:', error)
    return NextResponse.json({
      available: false,
      message: 'Erreur lors de la vérification du stock',
    }, { status: 500 })
  }
}
