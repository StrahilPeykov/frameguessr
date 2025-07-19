import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'FrameGuessr - Classic Cinema Challenge',
  description: 'Test your film knowledge with our daily movie guessing game. Identify classic films from carefully selected stills - a cinematic challenge for true movie lovers.',
  keywords: [
    'movie game', 
    'film quiz', 
    'cinema challenge', 
    'daily puzzle', 
    'classic movies',
    'film buffs',
    'movie trivia',
    'Letterboxd style',
    'film identification',
    'movie stills'
  ],
  authors: [{ name: 'FrameGuessr Cinema' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FrameGuessr',
    startupImage: [
      {
        url: '/apple-startup-image.png',
        media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'FrameGuessr - Classic Cinema Challenge',
    description: 'Can you identify tonight\'s feature film? Test your cinema knowledge with our daily movie guessing game.',
    url: 'https://frameguessr.vercel.app',
    siteName: 'FrameGuessr',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FrameGuessr - Daily Cinema Challenge for Film Enthusiasts',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FrameGuessr - Classic Cinema Challenge',
    description: 'Can you identify tonight\'s feature film? Test your cinema knowledge daily.',
    images: ['/og-image.png'],
    creator: '@frameguessr',
    site: '@frameguessr',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  other: {
    'msapplication-TileColor': '#8B1538',
    'msapplication-config': '/browserconfig.xml',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F6F0' },
    { media: '(prefers-color-scheme: dark)', color: '#0F0F0F' },
  ],
  colorScheme: 'light dark',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/cinematic.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* Cinema theme color for status bars */}
        <meta name="theme-color" content="#8B1538" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0F0F0F" media="(prefers-color-scheme: dark)" />
        
        {/* Enhanced PWA support */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://api.deezer.com" />
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://api.themoviedb.org" />
        
        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Cinema-specific meta tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="format-detection" content="address=no" />
        <meta name="format-detection" content="email=no" />
        
        {/* Enhanced description for film enthusiasts */}
        <meta 
          name="description" 
          content="FrameGuessr is the ultimate daily cinema challenge for film lovers. Identify movies and TV shows from carefully curated stills. Perfect for movie buffs who love Letterboxd, IMDb, and classic cinema." 
        />
        
        {/* Structured data for rich snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "FrameGuessr",
              "description": "Daily movie and TV show guessing game from film stills",
              "url": "https://frameguessr.vercel.app",
              "applicationCategory": "GameApplication",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "FrameGuessr Cinema"
              },
              "genre": "Puzzle Game",
              "gamePlatform": "Web Browser",
              "playMode": "SinglePlayer"
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* Cinema Theater Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-stone-50 via-amber-50/30 to-rose-50/20 dark:from-stone-950 dark:via-amber-950/20 dark:to-rose-950/10 transition-colors duration-500">
          {/* Theater Curtain Effect */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Ambient theater lighting */}
            <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-amber-900/3 to-transparent dark:from-amber-900/5 dark:to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-stone-900/2 to-transparent dark:from-stone-900/5 dark:to-transparent" />
          </div>
          
          {/* Theater Lighting Effects */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Subtle ambient orbs */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-400/5 dark:bg-amber-400/8 rounded-full filter blur-3xl animate-blob" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-rose-400/5 dark:bg-rose-400/8 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
          </div>
        </div>
        
        {/* Main Content - Scrollable */}
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
        
        {/* Enhanced Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
        
        {/* Cinema Analytics */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Theater performance tracking
              if (typeof window !== 'undefined') {
                window.addEventListener('load', function() {
                  // Track app load time for cinema experience optimization
                  const loadTime = performance.now();
                  console.log('Cinema loaded in:', Math.round(loadTime), 'ms');
                  
                  // Track viewport for responsive cinema experience
                  const vh = window.innerHeight;
                  const vw = window.innerWidth;
                  console.log('Theater dimensions:', vw + 'x' + vh);
                });
                
                // Preload critical cinema assets
                const criticalImages = [
                  '/placeholder-movie.svg',
                  '/og-image.png'
                ];
                
                criticalImages.forEach(src => {
                  const link = document.createElement('link');
                  link.rel = 'preload';
                  link.as = 'image';
                  link.href = src;
                  document.head.appendChild(link);
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}