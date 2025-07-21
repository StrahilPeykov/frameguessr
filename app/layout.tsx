import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/hooks/useTheme'
import CookieBanner from '@/components/legal/CookieBanner'
import Footer from '@/components/layout/Footer'

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
  title: 'FrameGuessr - Daily Movie & TV Show Guessing Game',
  description: 'Test your film knowledge with our daily movie guessing game. Identify classic films and TV shows from carefully selected stills. A new cinematic challenge every day!',
  keywords: [
    'movie game', 
    'film quiz', 
    'cinema challenge', 
    'daily puzzle', 
    'classic movies',
    'film buffs',
    'movie trivia',
    'TV show quiz',
    'film identification',
    'movie stills',
    'daily game',
    'wordle for movies'
  ],
  authors: [{ name: 'FrameGuessr' }],
  creator: 'FrameGuessr',
  publisher: 'FrameGuessr',
  manifest: '/manifest.json',
  category: 'entertainment',
  classification: 'Game',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when you have them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: 'https://frameguessr.strahil.dev',
  },
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
    date: false,
    address: false,
    email: false,
  },
  openGraph: {
    title: 'FrameGuessr - Daily Movie & TV Show Guessing Game',
    description: 'Can you identify today\'s movie or TV show? Test your cinema knowledge with our daily challenge.',
    url: 'https://frameguessr.strahil.dev',
    siteName: 'FrameGuessr',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FrameGuessr - Daily Cinema Challenge',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FrameGuessr - Daily Movie & TV Show Guessing Game',
    description: 'Can you identify today\'s movie or TV show? Test your cinema knowledge daily.',
    images: ['/images/og-image.png'],
    creator: '@frameguessr',
    site: '@frameguessr',
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
    'apple-mobile-web-app-title': 'FrameGuessr',
    'application-name': 'FrameGuessr',
    'msapplication-tooltip': 'FrameGuessr - Daily Movie Game',
    'theme-color': '#8B1538',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
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
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        {/* Essential Meta Tags */}
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
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
        
        {/* Format detection */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="format-detection" content="address=no" />
        <meta name="format-detection" content="email=no" />
        
        {/* Copyright and author info */}
        <meta name="copyright" content="FrameGuessr" />
        <meta name="author" content="FrameGuessr Team" />
        
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
                "name": "FrameGuessr",
                "url": "https://frameguessr.strahil.dev"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1250",
                "bestRating": "5",
                "worstRating": "1"
              },
              "genre": "Puzzle Game",
              "gamePlatform": "Web Browser",
              "playMode": "SinglePlayer",
              "publisher": {
                "@type": "Organization",
                "name": "FrameGuessr"
              }
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
                
                // Initialize analytics consent based on cookie preferences
                try {
                  const cookieConsent = localStorage.getItem('frameguessr-cookie-consent');
                  if (cookieConsent) {
                    const consent = JSON.parse(cookieConsent);
                    if (typeof window.gtag === 'function' && consent.analytics === false) {
                      window.gtag('consent', 'default', {
                        'analytics_storage': 'denied'
                      });
                    }
                  } else if (typeof window.gtag === 'function') {
                    // Default to denied until consent given
                    window.gtag('consent', 'default', {
                      'analytics_storage': 'denied'
                    });
                  }
                } catch (e) {
                  console.error('Analytics consent error:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider>
          {/* Skip to content for accessibility */}
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-amber-600 text-white px-4 py-2 rounded-lg z-50">
            Skip to main content
          </a>
          
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
          <div className="relative z-10 flex-1 flex flex-col">
            {/* Main Content */}
            <main id="main-content" className="flex-1">
              {children}
            </main>
            
            {/* Footer */}
            <Footer />
          </div>
          
          {/* Cookie Banner */}
          <CookieBanner />
          
          {/* Noscript fallback */}
          <noscript>
            <div className="fixed inset-0 bg-white dark:bg-stone-900 z-50 flex items-center justify-center p-4">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">JavaScript Required</h1>
                <p className="text-stone-600 dark:text-stone-400">
                  FrameGuessr requires JavaScript to be enabled in your browser.
                  Please enable JavaScript and refresh the page.
                </p>
              </div>
            </div>
          </noscript>
        </ThemeProvider>
        
        {/* Enhanced Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('ServiceWorker registration successful');
                    })
                    .catch(function(err) {
                      console.log('ServiceWorker registration failed:', err);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}