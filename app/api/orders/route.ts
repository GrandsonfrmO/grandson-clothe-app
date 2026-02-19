/**
 * SECURED ORDERS API
 * Corrections des vulnérabilités critiques #7 (validation des prix)
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { authenticateRequest } from '@/lib/simple-auth'
import { sendOrderConfirmation } from '@/lib/email-service'
import {
  checkRateLimit,
  sanitizeInput,
  isValidPrice,
  isValidQuantity,
  auditLog,
  getClientIP,
  detectOrderAnomaly,
} from '@/lib/security-enhanced'
import { z } from 'zod'
import { calculateShippingCost as calculateShipping } from '@/lib/shipping-calculator'

// ============================================
// VALIDATION SCHEMA
// ============================================

const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().max(1000),
  size: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  // ⚠️ NE PAS accepter le prix du client !
})

const shippingAddressSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  address: z.string().min(1).max(500),
  city: z.string().min(1).max(100),
  commune: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  phone: z.string().min(1).max(20),
  email: z.string().email().optional().nullable(),
})

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1).max(50),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(['cash']), // Paiement à la livraison uniquement
  deliveryZoneId: z.string().optional().nullable(), // ID de la zone de livraison
  notes: z.string().max(1000).optional().nullable(),
  isGuest: z.boolean().optional(),
  guestEmail: z.string().email().optional().nullable(),
  guestPhone: z.string().optional().nullable(),
  // ⚠️ NE PAS accepter subtotal, shippingCost, total du client !
})

// ============================================
// GET ORDERS (avec authentification)
// ============================================

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request)
    const rateLimit = await checkRateLimit(`orders:get:${ip}`, 30, 60000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Réessayez plus tard.' },
        { status: 429, headers: { 'Retry-After': rateLimit.retryAfter?.toString() || '60' } }
      )
    }

    // Authenticate user
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const status = searchParams.get('status')
    const offset = (page - 1) * limit

    // Build query - TOUJOURS filtrer par utilisateur actuel
    let query = supabaseAdmin
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        subtotal,
        shipping_cost,
        total,
        payment_method,
        payment_status,
        shipping_address,
        notes,
        created_at,
        updated_at,
        order_items (
          id,
          quantity,
          size,
          color,
          price,
          total,
          products (
            id,
            name,
            images
          )
        )
      `)
      .eq('user_id', user.id) // ✅ CRITIQUE: Toujours filtrer par user_id

    // Apply filters
    if (status && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      query = query.eq('status', status)
    }

    // Execute query with pagination
    const { data: orders, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    // Transform data
    const transformedOrders = (orders as any[])?.map((order: any) => ({
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      subtotal: order.subtotal,
      shippingCost: order.shipping_cost,
      total: order.total,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      shippingAddress: typeof order.shipping_address === 'string'
        ? JSON.parse(order.shipping_address)
        : order.shipping_address,
      notes: order.notes,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: order.order_items?.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.price,
        total: item.total,
        product: item.products ? {
          id: item.products.id,
          name: item.products.name,
          images: typeof item.products.images === 'string'
            ? JSON.parse(item.products.images)
            : item.products.images,
        } : null,
      })) || [],
    })) || []

    return NextResponse.json({
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commandes' },
      { status: 500 }
    )
  }
}

// ============================================
// CREATE ORDER (SÉCURISÉ)
// ============================================

export async function POST(request: NextRequest) {
  try {
    // Rate limiting désactivé pour les tests
    // const ip = getClientIP(request)
    // const rateLimit = await checkRateLimit(`orders:create:${ip}`, 5, 300000) // 5 commandes par 5 minutes
    // if (!rateLimit.allowed) {
    //   auditLog('ORDER_RATE_LIMIT_EXCEEDED', 'unknown', { ip }, 'warning')
    //   return NextResponse.json(
    //     { error: 'Trop de commandes. Réessayez dans quelques minutes.' },
    //     { status: 429, headers: { 'Retry-After': rateLimit.retryAfter?.toString() || '300' } }
    //   )
    // }

    const body = await request.json()
    console.log('Order creation request received')

    // Valider les données
    const validatedData = createOrderSchema.parse(body)

    // Obtenir l'utilisateur (optionnel pour les invités)
    let userId: string | null = null
    if (!validatedData.isGuest) {
      const user = await authenticateRequest(request)
      if (user) {
        userId = user.id
      }
    }

    // ✅ CRITIQUE: Récupérer les VRAIS prix depuis la base de données
    const productIds = validatedData.items.map(item => item.productId)
    const { data: products, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, name, price, stock, is_active, image, images')
      .in('id', productIds)

    if (productError) {
      throw productError
    }

    if (!products || products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Certains produits sont introuvables' },
        { status: 404 }
      )
    }

    // Vérifier que tous les produits sont actifs
    const inactiveProducts = products.filter(p => !p.is_active)
    if (inactiveProducts.length > 0) {
      return NextResponse.json(
        { error: 'Certains produits ne sont plus disponibles' },
        { status: 400 }
      )
    }

    // ✅ CRITIQUE: Calculer les prix côté serveur
    let subtotal = 0
    const orderItemsWithPrices = []

    for (const item of validatedData.items) {
      const product = products.find(p => p.id === item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Produit ${item.productId} non trouvé` },
          { status: 404 }
        )
      }

      // Vérifier la quantité
      if (!isValidQuantity(item.quantity)) {
        return NextResponse.json(
          { error: `Quantité invalide pour ${product.name}` },
          { status: 400 }
        )
      }

      // Vérifier le stock
      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Stock insuffisant pour ${product.name}. Disponible: ${product.stock}, Demandé: ${item.quantity}`,
          },
          { status: 409 }
        )
      }

      // ✅ Utiliser le prix de la base de données
      const price = parseFloat(product.price)
      if (!isValidPrice(price)) {
        return NextResponse.json(
          { error: `Prix invalide pour ${product.name}` },
          { status: 500 }
        )
      }

      const itemTotal = price * item.quantity
      subtotal += itemTotal

      orderItemsWithPrices.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: price.toFixed(2),
        total: itemTotal.toFixed(2),
        image: product.images?.[0] || product.image || null,
      })
    }

    // ✅ Calculer les frais de livraison côté serveur
    const shippingCalculation = calculateShipping(subtotal, {
      city: validatedData.shippingAddress.city,
      commune: validatedData.shippingAddress.commune || undefined,
      address: validatedData.shippingAddress.address,
      deliveryZoneId: validatedData.deliveryZoneId || undefined,
    })
    
    const shippingCost = shippingCalculation.cost
    const total = subtotal + shippingCost

    // Vérifier les anomalies
    const anomalyCheck = detectOrderAnomaly(
      {
        total,
        items: orderItemsWithPrices,
      },
      userId || 'guest'
    )

    if (anomalyCheck.isAnomalous) {
      auditLog(
        'ORDER_ANOMALY_DETECTED',
        userId || 'guest',
        { reasons: anomalyCheck.reasons, order: orderItemsWithPrices },
        'warning'
      )
      // En production, vous pourriez bloquer ou demander une vérification manuelle
    }

    // Générer le numéro de commande
    const orderNumber = `GC-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`

    // Créer la commande
    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: userId,
        is_guest: validatedData.isGuest || false,
        guest_email: validatedData.guestEmail || null,
        guest_phone: validatedData.guestPhone || null,
        status: 'pending',
        subtotal: subtotal.toFixed(2),
        shipping_cost: shippingCost.toFixed(2),
        total: total.toFixed(2),
        payment_method: validatedData.paymentMethod,
        payment_status: 'pending',
        shipping_address: JSON.stringify(validatedData.shippingAddress),
        notes: validatedData.notes ? sanitizeInput(validatedData.notes, 1000) : null,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      throw orderError
    }

    // Créer les items de commande
    const orderItems = orderItemsWithPrices.map(item => ({
      order_id: newOrder.id,
      product_id: item.productId,
      quantity: item.quantity,
      size: item.size || null,
      color: item.color || null,
      price: item.price,
      total: item.total,
    }))

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Order items creation error:', itemsError)
      // Rollback
      await supabaseAdmin.from('orders').delete().eq('id', newOrder.id)
      throw itemsError
    }

    // Déduire le stock
    for (const item of orderItems) {
      try {
        const { data: product } = await supabaseAdmin
          .from('products')
          .select('stock, low_stock_threshold')
          .eq('id', item.product_id)
          .single()

        if (product) {
          const newStock = product.stock - item.quantity
          const newStockStatus =
            newStock <= 0 ? 'out_of_stock' :
            newStock <= product.low_stock_threshold ? 'low_stock' :
            'in_stock'

          await supabaseAdmin
            .from('products')
            .update({
              stock: newStock,
              stock_status: newStockStatus,
              updated_at: new Date().toISOString(),
            })
            .eq('id', item.product_id)

          // Historique d'inventaire (optionnel si la table n'existe pas)
          try {
            await supabaseAdmin
              .from('inventory_history')
              .insert({
                product_id: item.product_id,
                quantity_change: -item.quantity,
                reason: 'order',
                reference_id: newOrder.order_number,
              })
          } catch (historyError) {
            console.warn('Inventory history not available:', historyError)
            // Continue même si l'historique échoue
          }
        }
      } catch (stockError) {
        console.error('Error updating stock:', stockError)
      }
    }

    // Envoyer l'email de confirmation
    try {
      const customerEmail = validatedData.guestEmail || validatedData.shippingAddress.email
      if (customerEmail) {
        await sendOrderConfirmation({
          orderNumber: newOrder.order_number,
          email: customerEmail,
          firstName: validatedData.shippingAddress.firstName,
          lastName: validatedData.shippingAddress.lastName,
          items: orderItemsWithPrices.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            price: parseFloat(item.price),
            total: parseFloat(item.total),
            size: item.size || undefined,
            color: item.color || undefined,
            image: item.image || undefined,
          })),
          subtotal: parseFloat(subtotal.toFixed(2)),
          shippingCost: parseFloat(shippingCost.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
          shippingAddress: {
            firstName: validatedData.shippingAddress.firstName,
            lastName: validatedData.shippingAddress.lastName,
            address: validatedData.shippingAddress.address,
            city: validatedData.shippingAddress.city,
            commune: validatedData.shippingAddress.commune || undefined,
            phone: validatedData.shippingAddress.phone,
          },
          paymentMethod: validatedData.paymentMethod,
          estimatedDelivery: '2-5 jours',
        })
      }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError)
    }

    // Créer une notification pour l'utilisateur
    if (userId) {
      try {
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'order',
            title: 'Commande confirmée',
            message: `Votre commande ${newOrder.order_number} a été confirmée. Montant total: ${total.toFixed(0)} GNF`,
            data: JSON.stringify({
              orderId: newOrder.id,
              orderNumber: newOrder.order_number,
              total: total.toFixed(2)
            }),
            is_read: false
          })
      } catch (notifError) {
        console.error('Error creating notification:', notifError)
        // Continue même si la notification échoue
      }
    }

    // Audit log
    auditLog('ORDER_CREATED', userId || 'guest', {
      orderNumber: newOrder.order_number,
      total: total.toFixed(2),
      itemCount: orderItems.length,
    })

    return NextResponse.json({
      message: 'Commande créée avec succès',
      order: {
        id: newOrder.id,
        orderNumber: newOrder.order_number,
        status: newOrder.status,
        total: newOrder.total,
      },
    })
  } catch (error: any) {
    console.error('Order creation error:', error)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Erreur lors de la création de la commande',
        details: process.env.NODE_ENV === 'development' ? error?.message || String(error) : undefined
      },
      { status: 500 }
    )
  }
}
