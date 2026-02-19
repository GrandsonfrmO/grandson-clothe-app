/**
 * 🏥 HEALTH CHECK
 * Endpoint simple pour vérifier que le serveur est accessible
 */

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}
