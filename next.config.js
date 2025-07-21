/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable eslint during builds (you should fix these in development)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript
  typescript: {
    // Only ignore TS errors during build if absolutely necessary
    ignoreBuildErrors: false,
  },
  
  // Images configuration
  images: {
    domains: [
      'image.tmdb.org',
      'api.themoviedb.org',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    // Image optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
  },
  
  // Enable strict mode for better error catching
  reactStrictMode: true,
  
  // Disable powered by header
  poweredByHeader: false,
  
  // Compress responses
  compress: true,
  
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Security headers
  async headers() {
    const ContentSecurityPolicy = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: blob: https://image.tmdb.org https://*.supabase.co https://www.google-analytics.com;
      font-src 'self' https://fonts.gstatic.com;
      media-src 'self' https://api.deezer.com https://*.dzcdn.net blob:;
      connect-src 'self' https://api.themoviedb.org https://api.deezer.com https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com;
      frame-src 'none';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      manifest-src 'self';
      worker-src 'self' blob:;
    `.replace(/\n/g, ' ').trim()

    return [
      {
        // Apply headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy,
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
      {
        // Cache static assets
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache images
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Service worker
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        // Manifest
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
    ]
  },
  
  // Redirects
  async redirects() {
    return [
      // Redirect home to today's challenge
      {
        source: '/',
        destination: `/day/${new Date().toISOString().split('T')[0]}`,
        permanent: false,
      },
      // Legacy routes (if any)
      {
        source: '/game',
        destination: '/',
        permanent: true,
      },
      {
        source: '/play',
        destination: '/',
        permanent: true,
      },
    ]
  },
  
  // Rewrites for cleaner URLs
  async rewrites() {
    return [
      // API rewrites if needed
    ]
  },
  
  // Environment variables validation
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://frameguessr.com',
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID || '',
  },
  
  // Experimental features
  experimental: {
    // Enable when stable
    // appDir: true,
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Optimizations
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    return config
  },
  
  // Output configuration
  output: 'standalone',
  
  // Base path (if deploying to subdirectory)
  // basePath: '/games/frameguessr',
  
  // Asset prefix for CDN
  // assetPrefix: 'https://cdn.frameguessr.com',
}

module.exports = nextConfig