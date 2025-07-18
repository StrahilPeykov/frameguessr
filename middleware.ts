import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function middleware(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1'
    const key = `${ip}:${request.nextUrl.pathname}`
    
    const now = Date.now()
    const windowMs = 60 * 1000 // 1 minute
    const maxRequests = 30 // 30 requests per minute
    
    const rateLimit = rateLimitMap.get(key)
    
    if (!rateLimit || now > rateLimit.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    } else {
      rateLimit.count++
      
      if (rateLimit.count > maxRequests) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { 
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((rateLimit.resetTime - now) / 1000)),
              'X-RateLimit-Limit': String(maxRequests),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
            }
          }
        )
      }
    }
    
    // Add CORS headers for API routes
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', String(maxRequests))
    response.headers.set('X-RateLimit-Remaining', String(maxRequests - (rateLimit?.count || 1)))
    
    // Protect cron endpoint
    if (request.nextUrl.pathname === '/api/cron') {
      const authHeader = request.headers.get('authorization')
      const cronSecret = process.env.CRON_SECRET
      
      if (process.env.NODE_ENV === 'production' && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
    
    return response
  }
  
  // Clean up old rate limit entries periodically
  if (rateLimitMap.size > 1000) {
    const now = Date.now()
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key)
      }
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}