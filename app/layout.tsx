import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/hooks/useTheme'

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
    url: 'https://frameguessr.strahil.dev',
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
    { media: '(prefers-color-scheme: light)', color: '#FFFBF7' },
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
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
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
        <meta name="theme-color" content="#FFFBF7" media="(prefers-color-scheme: light)" />
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
              "url": "https://frameguessr.strahil.dev",
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
        
        {/* Script to prevent FOUC for theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('frameguessr-theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.add(theme);
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          {/* BEAUTIFUL Cinema Theater Background */}
          <div className="fixed inset-0 transition-all duration-700">
            {/* Light Mode: Luxury Cinema Lobby */}
            <div className="absolute inset-0 pointer-events-none light:block dark:hidden">
              {/* Rich gradient background */}
              <div 
                className="absolute inset-0"
                style={{
                  background: `
                    linear-gradient(135deg, 
                      #FFF8F0 0%, 
                      #FEF5E7 20%, 
                      #FDF2E0 40%, 
                      #FCF0DD 60%, 
                      #FBEEDA 80%, 
                      #FAECD7 100%
                    )
                  `
                }}
              />
              
              {/* Vintage theater lighting from above */}
              <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-amber-200/12 via-orange-100/8 via-yellow-100/6 to-transparent" />
              
              {/* Warm base lighting */}
              <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-amber-100/10 via-orange-50/6 to-transparent" />
              
              {/* Art Deco pattern overlay */}
              <div 
                className="absolute inset-0 opacity-[0.025]"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 20% 20%, rgba(154, 30, 63, 0.08) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(212, 167, 107, 0.06) 0%, transparent 50%),
                    radial-gradient(circle at 40% 70%, rgba(230, 126, 0, 0.04) 0%, transparent 50%),
                    repeating-linear-gradient(45deg, 
                      transparent 0px, 
                      transparent 2px, 
                      rgba(154, 30, 63, 0.02) 2px, 
                      rgba(154, 30, 63, 0.02) 4px
                    ),
                    repeating-linear-gradient(-45deg, 
                      transparent 0px, 
                      transparent 3px, 
                      rgba(212, 167, 107, 0.015) 3px, 
                      rgba(212, 167, 107, 0.015) 6px
                    )
                  `,
                  backgroundSize: '200px 200px, 300px 300px, 250px 250px, 8px 8px, 12px 12px',
                  backgroundPosition: '0 0, 100px 100px, 50px 150px, 0 0, 0 0'
                }}
              />
              
              {/* Subtle texture overlay */}
              <div 
                className="absolute inset-0 opacity-[0.015]"
                style={{
                  backgroundImage: `
                    repeating-conic-gradient(
                      from 0deg at 50% 50%, 
                      transparent 0deg, 
                      rgba(154, 30, 63, 0.02) 2deg, 
                      transparent 4deg, 
                      rgba(212, 167, 107, 0.01) 6deg, 
                      transparent 8deg
                    )
                  `,
                  backgroundSize: '60px 60px'
                }}
              />
            </div>
            
            {/* Dark Mode: Theater atmosphere (unchanged) */}
            <div className="absolute inset-0 pointer-events-none dark:block light:hidden bg-gradient-to-br from-stone-950 via-amber-950/20 to-rose-950/10">
              <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-amber-900/5 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-stone-900/5 to-transparent" />
            </div>
            
            {/* Enhanced Ambient Lighting */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Light mode: Rich, warm ambiance */}
              <div className="light:block dark:hidden">
                {/* Top right warm glow */}
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full filter blur-3xl animate-blob" 
                     style={{
                       background: 'radial-gradient(circle, rgba(212, 167, 107, 0.15) 0%, rgba(230, 126, 0, 0.08) 50%, transparent 100%)'
                     }} />
                
                {/* Bottom left golden ambiance */}
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full filter blur-3xl animate-blob animation-delay-2000"
                     style={{
                       background: 'radial-gradient(circle, rgba(154, 30, 63, 0.12) 0%, rgba(212, 167, 107, 0.06) 50%, transparent 100%)'
                     }} />
                
                {/* Center soft glow */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full filter blur-3xl animate-blob animation-delay-4000"
                     style={{
                       background: 'radial-gradient(circle, rgba(230, 126, 0, 0.08) 0%, rgba(212, 167, 107, 0.04) 40%, transparent 100%)'
                     }} />
                
                {/* Additional accent lights */}
                <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full filter blur-2xl"
                     style={{
                       background: 'radial-gradient(circle, rgba(154, 30, 63, 0.1) 0%, transparent 70%)',
                       animation: 'cinemaBlob 12s infinite ease-in-out reverse'
                     }} />
              </div>
              
              {/* Dark mode: Keep existing */}
              <div className="dark:block light:hidden">
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-400/8 rounded-full filter blur-3xl animate-blob" />
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-rose-400/8 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
              </div>
            </div>
          </div>
          
          {/* Main Content - Scrollable */}
          <div className="relative z-10 min-h-screen">
            {children}
          </div>
        </ThemeProvider>
        
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