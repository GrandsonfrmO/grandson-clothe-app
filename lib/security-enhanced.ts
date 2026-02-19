/**
 * ENHANCED SECURITY MIDDLEWARE
 * Corrections des vulnérabilités critiques identifiées
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from './simple-auth'
import crypto from 'crypto'

// ============================================
// RATE LIMITING AMÉLIORÉ
// ============================================

interface RateLimitRecord {
  count: number
  resetTime: number
  blocked: boolean
  blockUntil?: number
}

// En production, utiliser Redis
const rateLimitStore = new Map<string, RateLimitRecord>()

export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000,
  blockDuration: number = 900000 // 15 minutes de blocage
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  // Vérifier si bloqué
  if (record?.blocked && record.blockUntil && now < record.blockUntil) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.blockUntil - now) / 1000),
    }
  }

  // Réinitialiser si fenêtre expirée
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
      blocked: false,
    })
    return { allowed: true }
  }

  // Incrémenter le compteur
  record.count++

  // Bloquer si limite dépassée
  if (record.count > limit) {
    record.blocked = true
    record.blockUntil = now + blockDuration
    auditLog('RATE_LIMIT_EXCEEDED', identifier, {
      count: record.count,
      limit,
      blockUntil: new Date(record.blockUntil).toISOString(),
    })
    return {
      allowed: false,
      retryAfter: Math.ceil(blockDuration / 1000),
    }
  }

  return { allowed: true }
}

// ============================================
// PROTECTION CSRF
// ============================================

const csrfTokens = new Map<string, { token: string; expires: number }>()

export function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = Date.now() + 3600000 // 1 heure

  csrfTokens.set(sessionId, { token, expires })

  // Nettoyer les tokens expirés
  cleanupExpiredTokens()

  return token
}

export function verifyCSRFToken(sessionId: string, token: string): boolean {
  const record = csrfTokens.get(sessionId)

  if (!record) {
    return false
  }

  if (Date.now() > record.expires) {
    csrfTokens.delete(sessionId)
    return false
  }

  return crypto.timingSafeEqual(
    Buffer.from(record.token),
    Buffer.from(token)
  )
}

function cleanupExpiredTokens() {
  const now = Date.now()
  for (const [sessionId, record] of csrfTokens.entries()) {
    if (now > record.expires) {
      csrfTokens.delete(sessionId)
    }
  }
}

// ============================================
// VALIDATION RENFORCÉE
// ============================================

export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return ''

  return input
    .replace(/[<>]/g, '') // Supprimer < et >
    .replace(/javascript:/gi, '') // Supprimer javascript:
    .replace(/on\w+=/gi, '') // Supprimer les event handlers
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
    .substring(0, maxLength)
}

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false

  // RFC 5322 simplifié
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  if (!emailRegex.test(email)) return false
  if (email.length > 255) return false

  // Vérifier les domaines suspects
  const suspiciousDomains = ['tempmail', 'throwaway', 'guerrillamail']
  const domain = email.split('@')[1]?.toLowerCase()
  if (suspiciousDomains.some(sus => domain?.includes(sus))) {
    return false
  }

  return true
}

export function isValidPhoneNumber(phone: string, countryCode: string = 'GN'): boolean {
  if (!phone || typeof phone !== 'string') return false

  const cleaned = phone.replace(/[\s\-\(\)]/g, '')

  if (countryCode === 'GN') {
    // Guinée: +224 suivi de 8-9 chiffres
    return /^(\+224|00224)?[0-9]{8,9}$/.test(cleaned)
  }

  // Format international générique
  return /^\+?[1-9]\d{1,14}$/.test(cleaned)
}

export function isValidPrice(price: number | string): boolean {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price

  if (isNaN(numPrice)) return false
  if (numPrice < 0) return false
  if (numPrice > 999999999) return false // 999 millions max
  if (!isFinite(numPrice)) return false

  // Vérifier les décimales (max 2)
  const decimals = numPrice.toString().split('.')[1]
  if (decimals && decimals.length > 2) return false

  return true
}

export function isValidQuantity(quantity: number): boolean {
  return (
    Number.isInteger(quantity) &&
    quantity > 0 &&
    quantity <= 1000 // Max 1000 articles par commande
  )
}

export function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

// ============================================
// VÉRIFICATION DES WEBHOOKS
// ============================================

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: 'sha256' | 'sha512' = 'sha256'
): boolean {
  if (!signature || !secret) {
    return false
  }

  try {
    const expectedSignature = crypto
      .createHmac(algorithm, secret)
      .update(payload)
      .digest('hex')

    // Utiliser timingSafeEqual pour éviter les timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch (error) {
    console.error('Webhook signature verification error:', error)
    return false
  }
}

export function verifyOrangeMoneyWebhook(
  body: any,
  signature: string
): boolean {
  const secret = process.env.ORANGE_MONEY_SECRET
  if (!secret) {
    console.error('ORANGE_MONEY_SECRET not configured')
    return false
  }

  const payload = JSON.stringify(body)
  return verifyWebhookSignature(payload, signature, secret, 'sha256')
}

export function verifyMTNMoneyWebhook(
  body: any,
  signature: string
): boolean {
  const secret = process.env.MTN_MONEY_SECRET
  if (!secret) {
    console.error('MTN_MONEY_SECRET not configured')
    return false
  }

  const payload = JSON.stringify(body)
  return verifyWebhookSignature(payload, signature, secret, 'sha256')
}

// ============================================
// AUTORISATION RENFORCÉE
// ============================================

export async function requireAdmin(request: NextRequest) {
  const user = await authenticateRequest(request)

  if (!user) {
    auditLog('UNAUTHORIZED_ADMIN_ACCESS', 'anonymous', {
      path: request.nextUrl.pathname,
      ip: getClientIP(request),
    })
    return null
  }

  if (user.role !== 'admin') {
    auditLog('FORBIDDEN_ADMIN_ACCESS', user.id, {
      path: request.nextUrl.pathname,
      role: user.role,
    })
    return null
  }

  return user
}

export async function requireAuth(request: NextRequest) {
  const user = await authenticateRequest(request)

  if (!user) {
    auditLog('UNAUTHORIZED_ACCESS', 'anonymous', {
      path: request.nextUrl.pathname,
      ip: getClientIP(request),
    })
    return null
  }

  return user
}

// ============================================
// HEADERS DE SÉCURITÉ
// ============================================

export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Empêcher le sniffing MIME
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Empêcher le clickjacking
  response.headers.set('X-Frame-Options', 'DENY')

  // Protection XSS (legacy)
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Politique de référent
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
    ].join('; ')
  )

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  )

  // HSTS (en production uniquement)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  return response
}

// ============================================
// AUDIT & LOGGING
// ============================================

interface AuditLogEntry {
  timestamp: string
  action: string
  userId: string
  ip?: string
  userAgent?: string
  details: any
  severity: 'info' | 'warning' | 'error' | 'critical'
}

const auditLogs: AuditLogEntry[] = []

export function auditLog(
  action: string,
  userId: string,
  details: any,
  severity: 'info' | 'warning' | 'error' | 'critical' = 'info'
): void {
  const entry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    details: sanitizeLogData(details),
    severity,
  }

  // Stocker en mémoire (en production, utiliser une DB)
  auditLogs.push(entry)

  // Limiter la taille en mémoire
  if (auditLogs.length > 10000) {
    auditLogs.shift()
  }

  // Log selon la sévérité
  const logMessage = `[AUDIT][${severity.toUpperCase()}] ${action} - User: ${userId}`

  switch (severity) {
    case 'critical':
    case 'error':
      console.error(logMessage, details)
      break
    case 'warning':
      console.warn(logMessage, details)
      break
    default:
      console.log(logMessage, details)
  }

  // En production, envoyer à un service de monitoring
  if (process.env.NODE_ENV === 'production' && severity === 'critical') {
    // TODO: Envoyer à Sentry, DataDog, etc.
  }
}

function sanitizeLogData(data: any): any {
  if (!data) return data

  const sanitized = { ...data }

  // Supprimer les données sensibles
  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'apiKey',
    'creditCard',
    'ssn',
    'pin',
  ]

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]'
    }
  }

  return sanitized
}

// ============================================
// UTILITAIRES
// ============================================

export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown'
}

// ============================================
// DÉTECTION D'ANOMALIES
// ============================================

interface AnomalyDetectionConfig {
  maxOrderValue: number
  maxItemsPerOrder: number
  maxOrdersPerHour: number
  suspiciousCountries: string[]
}

const anomalyConfig: AnomalyDetectionConfig = {
  maxOrderValue: 10000000, // 10 millions GNF
  maxItemsPerOrder: 50,
  maxOrdersPerHour: 10,
  suspiciousCountries: [], // À configurer selon vos besoins
}

export function detectOrderAnomaly(order: any, userId: string): {
  isAnomalous: boolean
  reasons: string[]
} {
  const reasons: string[] = []

  // Vérifier la valeur de la commande
  if (order.total > anomalyConfig.maxOrderValue) {
    reasons.push(`Order value too high: ${order.total}`)
  }

  // Vérifier le nombre d'articles
  const itemCount = order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
  if (itemCount > anomalyConfig.maxItemsPerOrder) {
    reasons.push(`Too many items: ${itemCount}`)
  }

  // Vérifier les prix à 0
  const hasZeroPrice = order.items?.some((item: any) => item.price <= 0)
  if (hasZeroPrice) {
    reasons.push('Items with zero or negative price detected')
  }

  if (reasons.length > 0) {
    auditLog('ORDER_ANOMALY_DETECTED', userId, { order, reasons }, 'warning')
  }

  return {
    isAnomalous: reasons.length > 0,
    reasons,
  }
}

// ============================================
// VALIDATION DES FICHIERS UPLOADÉS
// ============================================

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export function validateUploadedFile(file: File): {
  valid: boolean
  error?: string
} {
  // Vérifier le type MIME
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Type de fichier non autorisé: ${file.type}`,
    }
  }

  // Vérifier la taille
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(2)} MB (max: 10 MB)`,
    }
  }

  // Vérifier l'extension
  const extension = file.name.split('.').pop()?.toLowerCase()
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif']
  if (!extension || !allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Extension non autorisée: ${extension}`,
    }
  }

  return { valid: true }
}

export default {
  checkRateLimit,
  generateCSRFToken,
  verifyCSRFToken,
  sanitizeInput,
  isValidEmail,
  isValidPhoneNumber,
  isValidPrice,
  isValidQuantity,
  isValidURL,
  verifyWebhookSignature,
  verifyOrangeMoneyWebhook,
  verifyMTNMoneyWebhook,
  requireAdmin,
  requireAuth,
  addSecurityHeaders,
  auditLog,
  getClientIP,
  getUserAgent,
  detectOrderAnomaly,
  validateUploadedFile,
}
