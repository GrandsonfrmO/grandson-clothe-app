/**
 * ADMIN MIDDLEWARE - Centralized
 * Single source of truth for admin authorization
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from './simple-auth'

/**
 * Require admin role for API routes
 * Centralized implementation to avoid duplication
 */
export async function requireAdmin(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)

    if (!user) {
      return {
        authorized: false,
        user: null,
        error: 'Authentification requise',
        status: 401,
      }
    }

    if (user.role !== 'admin') {
      return {
        authorized: false,
        user: null,
        error: 'Accès administrateur requis',
        status: 403,
      }
    }

    return {
      authorized: true,
      user,
      error: null,
      status: 200,
    }
  } catch (error) {
    console.error('Admin middleware error:', error)
    return {
      authorized: false,
      user: null,
      error: 'Erreur d\'authentification',
      status: 500,
    }
  }
}

/**
 * Helper to return unauthorized response
 */
export function unauthorizedResponse(message: string | null, status: number = 403) {
  return NextResponse.json(
    { error: message || 'Unauthorized' },
    { status }
  )
}

/**
 * Helper to return error response
 */
export function errorResponse(message: string, status: number = 500, details?: any) {
  return NextResponse.json(
    { error: message, ...(details && { details }) },
    { status }
  )
}

/**
 * Helper to return success response
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status })
}
