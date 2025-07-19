import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Different rate limits for different endpoints
const RATE_LIMITS = {
  // General API endpoints
  '/api/search': { requests: 30, windowMs: 60 * 1000 }, // 30 requests per minute
  '/api/daily': { requests: 60, windowMs: 60 * 1000 },  // 60 requests per minute
  '/api/guess': { requests: 20, windowMs: 60 * 1000 },  // 20 requests per minute
  
  // Audio endpoints (more restrictive due to external API calls)
  '/api/audio': { requests: 15, windowMs: 60 * 1000 },  // 15 requests per minute
  
  // Cron and admin endpoints
  '/api/cron': { requests: 5, windowMs: 60 * 1000 },    // 5 requests per minute
  
  // Default for other API endpoints
  'default': { requests: 30, windowMs: 60 * 1000 }
}

function getRateLimit(pathname: string) {
  // Check for exact matches first
  for (const [path, limit] of Object.entries(RATE_LIMITS)) {
    if (pathname === path) {
      return limit
    }
  }
  
  // Check for path prefixes
  for (const [path, limit] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(path)) {
      return limit
    }
  }
  
  return RATE_LIMITS.default
}

export function middleware(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1'
    
    const pathname = request.nextUrl.pathname
    const rateLimit = getRateLimit(pathname)
    const key = `${ip}:${pathname}`
    
    const now = Date.now()
    const rateLimitData = rateLimitMap.get(key)
    
    if (!rateLimitData || now > rateLimitData.resetTime) {
      rateLimitMap.set(key, { 
        count: 1, 
        resetTime: now + rateLimit.windowMs 
      })
    } else {
      rateLimitData.count++
      
      if (rateLimitData.count > rateLimit.requests) {
        return NextResponse.json(
          { 
            error: 'Too many requests',
            message: `Rate limit exceeded. Maximum ${rateLimit.requests} requests per ${rateLimit.windowMs / 1000} seconds.`,
            retryAfter: Math.ceil((rateLimitData.resetTime - now) / 1000)
          },
          { 
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((rateLimitData.resetTime - now) / 1000)),
              'X-RateLimit-Limit': String(rateLimit.requests),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(rateLimitData.resetTime).toISOString(),
              'X-RateLimit-Window': String(rateLimit.windowMs / 1000),
            }
          }
        )
      }
    }
    
    // Add CORS headers for API routes
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', String(rateLimit.requests))
    response.headers.set('X-RateLimit-Remaining', String(rateLimit.requests - (rateLimitData?.count || 1)))
    response.headers.set('X-RateLimit-Window', String(rateLimit.windowMs / 1000))
    
    // Special handling for audio endpoints
    if (pathname.startsWith('/api/audio')) {
      // Add cache headers for audio responses
      response.headers.set('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
      
      // Add CORS headers specifically for audio
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    }
    
    // Protect cron endpoint
    if (pathname === '/api/cron') {
      const authHeader = request.headers.get('authorization')
      const cronSecret = process.env.CRON_SECRET
      
      if (process.env.NODE_ENV === 'production' && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
    
    // Handle preflight requests for CORS
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      })
    }
    
    return response
  }
  
  // Clean up old rate limit entries periodically to prevent memory leaks
  if (rateLimitMap.size > 1000) {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => rateLimitMap.delete(key))
    
    // Log cleanup for monitoring
    if (keysToDelete.length > 0) {
      console.log(`Cleaned up ${keysToDelete.length} expired rate limit entries`)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}