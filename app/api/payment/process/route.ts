/**
 * PAYMENT PROCESSING - CASH ON DELIVERY ONLY
 * Orange Money et MTN Money ont été supprimés
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Paiement en ligne désactivé. Utilisez le paiement à la livraison.',
      message: 'Seul le paiement à la livraison est disponible.'
    },
    { status: 400 }
  )
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Paiement en ligne désactivé',
      message: 'Seul le paiement à la livraison est disponible.'
    },
    { status: 400 }
  )
}
