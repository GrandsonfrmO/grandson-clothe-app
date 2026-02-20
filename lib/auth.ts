import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { db } from './database'
import { users } from './schema'
import { eq } from 'drizzle-orm'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

// Get user from token
export async function getUserFromToken(token: string) {
  const payload = verifyToken(token)
  if (!payload) return null

  const user = await db!.select().from(users).where(eq(users.id, payload.userId)).limit(1)
  return user[0] || null
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

// Generate verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate order number
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `CMD-2026-${timestamp}${random}`
}