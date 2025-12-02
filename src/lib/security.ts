import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { sign, verify } from 'jsonwebtoken'

// Security configuration
export const SECURITY_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-key',
  SESSION_SECRET: process.env.SESSION_SECRET || 'fallback-session-key',
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  CORS_OPTIONS: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://your-domain.com']
      : ['http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
} as const

// Authentication utilities
export function createJWTToken(payload: object, expiresIn: string = '1h'): string {
  return sign(payload, SECURITY_CONFIG.JWT_SECRET as string, { expiresIn })
}

export function verifyJWTToken(token: string): unknown {
  try {
    return verify(token, SECURITY_CONFIG.JWT_SECRET as string, {})
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex')
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err)
      resolve(salt + ':' + derivedKey.toString('hex'))
    })
  })
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve) => {
    const [salt, key] = hash.split(':')
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      resolve(key === derivedKey.toString('hex'))
    })
  })
}

// CSRF protection
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function validateCSRFToken(storedToken: string, submittedToken: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(storedToken),
    Buffer.from(submittedToken)
  )
}

// Security middleware
export function securityMiddleware() {
  return async function middleware(request: Request) {
    // CORS handling
    const response = NextResponse.next()

    // Set security headers
    setSecurityHeaders(response)

    // Check content security
    if (request.method === 'POST' || request.method === 'PUT') {
      const contentType = request.headers.get('content-type')
      if (contentType && !contentType.includes('application/json')) {
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 415 }
        )
      }
    }

    return response
  }
}

// Set security headers
function setSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('Content-Security-Policy', getContentSecurityPolicy())
  response.headers.set('Permissions-Policy', getPermissionsPolicy())
}

// Get Content Security Policy
function getContentSecurityPolicy(): string {
  const basePolicy = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https://cdn.your-domain.com",
    "font-src 'self' https://fonts.gstatic.com",
    "object-src 'none'",
    "frame-src 'none'",
    "connect-src 'self' https://api.your-domain.com",
    "base-uri 'self'",
    "form-action 'self'",
  ]

  if (process.env.NODE_ENV === 'development') {
    basePolicy.push("script-src 'self' 'unsafe-eval' http://localhost:*")
    basePolicy.push("connect-src 'self' http://localhost:*")
  }

  return basePolicy.join('; ')
}

// Get Permissions Policy
function getPermissionsPolicy(): string {
  return [
    'geolocation=()',
    'midi=()',
    'notifications=()',
    'push=()',
    'sync-xhr=()',
    'microphone=()',
    'camera=()',
    'magnetometer=()',
    'gyroscope=()',
    'speaker=()',
    'vibrate=()',
    'fullscreen=(self)',
    'payment=()',
  ].join(', ')
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, "''")
    .trim()
}

// Rate limiting
export function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests = new Map<string, { count: number; lastReset: number }>()

  return function rateLimit(ip: string): boolean {
    const now = Date.now()
    const window = requests.get(ip)

    if (!window || now - window.lastReset > windowMs) {
      requests.set(ip, { count: 1, lastReset: now })
      return true
    }

    window.count++
    if (window.count > maxRequests) {
      return false
    }

    return true
  }
}

// Security audit utilities
export function runSecurityAudit() {
  const issues: string[] = []

  // Check environment variables
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback-secret-key') {
    issues.push('JWT_SECRET is not properly configured')
  }

  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === 'fallback-session-key') {
    issues.push('SESSION_SECRET is not properly configured')
  }

  // Check Node.js version
  const nodeVersion = process.version
  if (nodeVersion < 'v18.0.0') {
    issues.push(`Node.js version ${nodeVersion} is outdated. Minimum required: v18.0.0`)
  }

  return {
    secure: issues.length === 0,
    issues,
    timestamp: new Date().toISOString(),
  }
}

// Secure cookie utilities
export function createSecureCookie(name: string, value: string, options: Record<string, unknown> = {}) {
  const cookieOptions = {
    ...SECURITY_CONFIG.COOKIE_OPTIONS,
    ...options,
  }

  return `${name}=${value}; ${Object.entries(cookieOptions)
    .map(([key, val]) => `${key}=${val}`)
    .join('; ')}`
}

// Session management
export function createSessionManager() {
  // This would be implemented with proper session handling
  return {
    // Session management implementation
  }
}