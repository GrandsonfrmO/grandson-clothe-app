import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmailWithPassword, verifyPassword, generateToken } from '@/lib/simple-auth'
import { checkRateLimit, isValidEmail, auditLog } from '@/lib/security-middleware'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email invalide').max(255),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').max(255),
})

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Rate limiting by IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitKey = `login:${ip}`
    
    const rateLimitResult = await checkRateLimit(rateLimitKey, 5, 900000) // 5 attempts per 15 minutes
    if (!rateLimitResult.allowed) {
      auditLog('LOGIN_RATE_LIMIT_EXCEEDED', 'unknown', { ip })
      return NextResponse.json(
        { error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // SECURITY: Validate email format
    if (!isValidEmail(validatedData.email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      )
    }

    // Find user with password (for auth only)
    const user = await findUserByEmailWithPassword(validatedData.email)

    if (!user) {
      // SECURITY: Generic error message to prevent user enumeration
      auditLog('LOGIN_FAILED_USER_NOT_FOUND', 'unknown', { email: validatedData.email })
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, user.password)
    if (!isValidPassword) {
      auditLog('LOGIN_FAILED_INVALID_PASSWORD', user.id, { email: user.email })
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // SECURITY: Generate token with extended expiration for admin users
    // Admin users get 90 days, regular users get 7 days
    const isAdmin = user.role === 'admin'
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role || 'customer',
    }, isAdmin) // Extended session for admins

    // SECURITY: Return user data without password
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      loyaltyPoints: user.loyaltyPoints,
      isVerified: user.isVerified,
    }

    auditLog('LOGIN_SUCCESS', user.id, { email: user.email, role: user.role })

    const response = NextResponse.json({
      message: 'Connexion réussie',
      user: userResponse,
      token,
    })

    // SECURITY: Set secure cookie with extended expiration for admins
    const cookieMaxAge = isAdmin ? 90 * 24 * 60 * 60 : 7 * 24 * 60 * 60 // 90 days for admin, 7 days for others
    
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: cookieMaxAge,
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    )
  }
}