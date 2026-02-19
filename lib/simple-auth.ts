import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { supabaseAdmin } from './supabase-admin'

// SECURITY: Validate JWT_SECRET is set and strong
const JWT_SECRET = process.env.JWT_SECRET || ''
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('CRITICAL: JWT_SECRET must be set and at least 32 characters long. Set it in your .env file.')
  // Use a fallback for development only
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Using fallback JWT_SECRET for development. DO NOT use in production!')
  } else {
    throw new Error('JWT_SECRET is required in production')
  }
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  phone?: string
  loyaltyPoints?: number
  isVerified?: boolean
  // SECURITY: Never include password in User object
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Generate JWT token with extended expiration for admin sessions
export function generateToken(payload: JWTPayload, rememberMe: boolean = true): string {
  // For admin users who want to stay logged in, use 90 days
  // For regular sessions, use 7 days
  const expiresIn = rememberMe ? '90d' : '7d'
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

// Find user by email using Supabase (returns password hash for auth only)
export async function findUserByEmailWithPassword(email: string): Promise<(User & { password: string }) | null> {
  try {
    // Use admin client to bypass RLS for authentication
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, password, first_name, last_name, role, phone, loyalty_points, is_verified')
      .eq('email', email)
      .single()

    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role || 'customer',
      phone: user.phone,
      loyaltyPoints: user.loyalty_points || 0,
      isVerified: user.is_verified || false,
    }
  } catch (error) {
    console.error('Error finding user by email:', error)
    return null
  }
}

// Find user by email (without password - safe for API responses)
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, role, phone, loyalty_points, is_verified')
      .eq('email', email)
      .single()

    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role || 'customer',
      phone: user.phone,
      loyaltyPoints: user.loyalty_points || 0,
      isVerified: user.is_verified || false,
    }
  } catch (error) {
    console.error('Error finding user by email:', error)
    return null
  }
}

// Create new user using Supabase
export async function createUser(userData: {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}): Promise<User | null> {
  try {
    const hashedPassword = await hashPassword(userData.password)

    // SECURITY: Role is always 'customer' on registration. Admins must be created manually.
    const role = 'customer'

    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        email: userData.email,
        password: hashedPassword,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        role: role,
        loyalty_points: 0,
        is_verified: false,
      })
      .select('id, email, first_name, last_name, role, phone, loyalty_points, is_verified')
      .single()

    if (error || !newUser) {
      console.error('Error creating user:', error)
      return null
    }

    return {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      role: newUser.role || 'customer',
      phone: newUser.phone,
      loyaltyPoints: newUser.loyalty_points || 0,
      isVerified: newUser.is_verified || false,
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

// Get user from token (without password)
export async function getUserFromToken(token: string): Promise<User | null> {
  const payload = verifyToken(token)
  if (!payload) return null

  try {
    // Use admin client to bypass RLS
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, role, phone, loyalty_points, is_verified')
      .eq('id', payload.userId)
      .single()

    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role || 'customer',
      phone: user.phone,
      loyaltyPoints: user.loyalty_points || 0,
      isVerified: user.is_verified || false,
    }
  } catch (error) {
    console.error('Error getting user from token:', error)
    return null
  }
}

// Middleware to authenticate requests
export async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return getUserFromToken(token)
}