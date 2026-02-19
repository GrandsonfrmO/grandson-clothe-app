/**
 * MTN MONEY WEBHOOK - DÉSACTIVÉ
 * Le paiement MTN Money a été supprimé
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Webhook désactivé',
      message: 'Le paiement MTN Money n\'est plus disponible.'
    },
    { status: 410 } // 410 Gone
  )
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    service: 'MTN Money Webhook',
    status: 'disabled',
    message: 'Le paiement MTN Money a été désactivé. Seul le paiement à la livraison est disponible.',
    timestamp: new Date().toISOString(),
  })
}
