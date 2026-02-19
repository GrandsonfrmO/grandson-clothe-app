import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, generateToken, getUserFromToken } from '@/lib/simple-auth'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    // Get fresh user data
    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 401 }
      )
    }

    // Generate new token with extended expiration for admins
    const isAdmin = user.role === 'admin'
    const newToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    }, isAdmin)

    const response = NextResponse.json({
      message: 'Token rafraîchi',
      token: newToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      }
    })

    // Update cookie
    const cookieMaxAge = isAdmin ? 90 * 24 * 60 * 60 : 7 * 24 * 60 * 60
    response.cookies.set('auth_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: cookieMaxAge,
    })

    return response
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du rafraîchissement du token' },
      { status: 500 }
    )
  }
}
