import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/hooks/useTheme'
import CookieBanner from '@/components/legal/CookieBanner'
import Footer from '@/components/layout/Footer'
import BrandNotice from '@/components/ui/BrandNotice'

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
  title: 'FrameGuessr - Daily Movie & TV Guessing Game',
  description: 'Can you guess the movie from one frame? Play FrameGuessr - the ultimate daily movie guessing game. New movie stills every day, progressive hints, and audio clues.',
  keywords: [
    // Primary target keywords
    'frameguessr',
    'frame guessr', 
    'FrameGuessr game',
    'FrameGuessr movie game',
    'movie guessing game',
    'daily movie game',
    'guess the movie',
    'movie frame quiz',
    
    // Brand differentiation
    'frameguessr not freeguessr',
    'frame guessr official',
    'original frameguessr',
    
    // Competitive keywords
    'framed game alternative',
    'better than framed',
    'frame quiz game',
    'movie wordle',
    'cinematic wordle',
    
    // Long-tail keywords people actually search
    'guess movie from screenshot',
    'daily movie puzzle',
    'movie identification game',
    'film still quiz',
    'movie frame challenge',
    'tv show guessing game',
    
    // Semantic keywords
    'cinema challenge',
    'film knowledge test',
    'movie trivia daily',
    'film buff game',
    'movie stills game',
    'hollywood game',
    'movie scene quiz',
    
    // User intent keywords
    'free movie game',
    'play movie quiz online',
    'daily brain teaser',
    'movie game app',
    'film guessing challenge'
  ],
  authors: [{ name: 'FrameGuessr Team' }],
  creator: 'FrameGuessr',
  publisher: 'FrameGuessr',
  applicationName: 'FrameGuessr',
  manifest: '/manifest.json',
  category: 'Games & Entertainment',
  classification: 'Movie Guessing Game',
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
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    // yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: 'https://frameguessr.com',
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
    title: 'FrameGuessr - The Ultimate Daily Movie Guessing Game',
    description: 'Think you know movies? Guess the film from a single frame! Progressive hints, audio clues, and new challenges daily. More fun than Framed or any movie quiz!',
    url: 'https://frameguessr.com',
    siteName: 'FrameGuessr',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FrameGuessr - Daily Movie Guessing Game - Guess the movie from one frame',
        type: 'image/png',
      },
      {
        url: '/images/og-game-screenshot.png',
        width: 1200,
        height: 630,
        alt: 'FrameGuessr gameplay showing blurred movie frame with guess interface',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FrameGuessr - Can You Guess The Movie From One Frame?',
    description: 'Daily movie guessing game with progressive hints. More challenging than Framed! New movie every day',
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
    'msapplication-tooltip': 'FrameGuessr - Daily Movie Guessing Game',
    'theme-color': '#8B1538',
    
    // SEO meta tags
    'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
    'msvalidate.01': process.env.BING_SITE_VERIFICATION || '',
    'yandex-verification': process.env.YANDEX_VERIFICATION || '',
    
    // Additional semantic markup
    'subject': 'Daily Movie Guessing Game - FrameGuessr',
    'abstract': 'FrameGuessr - Guess movies and TV shows from single frames with progressive hints',
    'topic': 'Movie Games, Film Quiz, Entertainment, FrameGuessr',
    'summary': 'FrameGuessr - Daily movie guessing game with blurred frames, progressive hints, and audio clues',
    'classification': 'Entertainment, Games, Movies, Trivia',
    'owner': 'FrameGuessr Team',
    'url': 'https://frameguessr.com',
    'identifier-URL': 'https://frameguessr.com',
    'directory': 'submission',
    'category': 'Games & Entertainment',
    'coverage': 'Worldwide',
    'distribution': 'Global',
    'rating': 'General',
    'revisit-after': '1 days',
    
    // Social and sharing optimization
    'pinterest-rich-pin': 'true',
    'format-detection': 'telephone=no',
    
    // Performance and crawling hints
    'preload': 'https://api.themoviedb.org',
    'dns-prefetch': 'https://image.tmdb.org',
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
        <meta name="application-name" content="FrameGuessr" />
        <meta property="og:site_name" content="FrameGuessr" />
        <meta name="apple-mobile-web-app-title" content="FrameGuessr" />
        
        {/* Schema.org structured data for the WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "FrameGuessr",
              "alternateName": ["Frame Guessr", "FrameGuessr Game", "Frame Guessr Game"],
              "description": "FrameGuessr is a daily movie and TV show guessing game where players identify films from single frames. Not to be confused with freeguessr or other similar games.",
              "url": "https://frameguessr.com",
              "applicationCategory": "GameApplication",
              "operatingSystem": "All",
              "browserRequirements": "Requires JavaScript. Works on all modern browsers.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "FrameGuessr Team",
                "url": "https://frameguessr.com"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "513",
                "bestRating": "5",
                "worstRating": "1"
              },
              "genre": ["Puzzle Game", "Movie Trivia", "Daily Challenge"],
              "gamePlatform": ["Web Browser", "Mobile Web", "Desktop"],
              "playMode": "SinglePlayer",
              "publisher": {
                "@type": "Organization",
                "name": "FrameGuessr",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://frameguessr.com/icon-512.png"
                }
              },
              "screenshot": [
                "https://frameguessr.com/images/screenshot-desktop.png",
                "https://frameguessr.com/images/screenshot-mobile.png"
              ],
              "featureList": [
                "Daily new movie challenges",
                "Progressive hint system", 
                "Audio soundtrack clues",
                "Movie and TV show database",
                "Statistics tracking",
                "Mobile optimized",
                "No registration required"
              ],
              "audience": {
                "@type": "Audience",
                "audienceType": "Movie enthusiasts, puzzle game players, film buffs"
              },
              "isAccessibleForFree": true,
              "hasPart": [
                {
                  "@type": "Game",
                  "name": "Daily Movie Challenge",
                  "description": "Guess today's featured movie from a blurred frame"
                }
              ]
            })
          }}
        />
        
        {/* Brand Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Brand",
              "name": "FrameGuessr",
              "alternateName": "Frame Guessr",
              "description": "FrameGuessr is the original frame-based movie guessing game. Not to be confused with freeguessr.",
              "url": "https://frameguessr.com",
              "logo": "https://frameguessr.com/icon-512.png",
              "slogan": "Guess the movie from one frame",
              "sameAs": [
                "https://twitter.com/frameguessr",
                "https://www.facebook.com/frameguessr",
                "https://www.instagram.com/frameguessr",
                "https://www.reddit.com/r/frameguessr"
              ]
            })
          }}
        />
        
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "FrameGuessr",
              "url": "https://frameguessr.com",
              "logo": "https://frameguessr.com/icon-512.png",
              "description": "FrameGuessr - The original daily movie frame guessing game",
              "email": "frameguessr@gmail.com",
              "foundingDate": "2025",
              "founders": [{
                "@type": "Person",
                "name": "Strahil Peykov"
              }]
            })
          }}
        />
        
        {/* Game-specific structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Game",
              "name": "FrameGuessr Daily Challenge",
              "description": "Daily movie guessing game where players identify films from single frames",
              "genre": "Puzzle",
              "playMode": "SinglePlayer",
              "gamePlatform": "Web Browser",
              "numberOfPlayers": "1",
              "quest": {
                "@type": "Thing",
                "name": "Guess the Movie",
                "description": "Identify the movie or TV show from a single frame with progressive hints"
              }
            })
          }}
        />
        
        {/* FAQ Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is FrameGuessr?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "FrameGuessr is a daily movie and TV show guessing game where you identify films from single frames. It features progressive hints, audio clues, and new challenges every day. Note: FrameGuessr is not affiliated with freeguessr or any other similar-sounding games."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is it FrameGuessr or FreeGuessr?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "It's FrameGuessr - a frame-based movie guessing game. We are not affiliated with freeguessr or any other similar-sounding games. FrameGuessr is the original daily movie frame puzzle game."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do you play FrameGuessr?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Each day, we show you a blurred frame from a movie or TV show. You have 3 attempts to guess correctly, with progressive hints unlocking after each wrong guess. Hints include less blur, taglines, year, genre, and audio clips."
                  }
                },
                {
                  "@type": "Question", 
                  "name": "Is FrameGuessr better than Framed?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "FrameGuessr offers more features than Framed including audio soundtrack hints, progressive blur reduction, detailed movie information, and a more cinematic interface. Plus we have both movies AND TV shows!"
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is FrameGuessr free to play?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! FrameGuessr is completely free to play. No registration required, though you can create an account to sync your progress across devices."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How often do you get new movies on FrameGuessr?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "FrameGuessr releases a brand new movie or TV show challenge every single day at midnight. Each challenge features carefully selected stills from popular and classic entertainment."
                  }
                }
              ]
            })
          }}
        />
        
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/cinematic.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* Preconnects for performance */}
        <link rel="preconnect" href="https://api.deezer.com" />
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://api.themoviedb.org" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://frameguessr.com" />
        
        {/* Alternate languages (if you plan to support them) */}
        <link rel="alternate" hrefLang="en" href="https://frameguessr.com" />
        <link rel="alternate" hrefLang="x-default" href="https://frameguessr.com" />
        
        {/* Theme colors for different platforms */}
        <meta name="theme-color" content="#8B1538" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0F0F0F" media="(prefers-color-scheme: dark)" />
        <meta name="msapplication-navbutton-color" content="#8B1538" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* PWA support */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="FrameGuessr" />
        
        {/* Format detection */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="format-detection" content="address=no" />
        <meta name="format-detection" content="email=no" />
        
        {/* Copyright and author info */}
        <meta name="copyright" content="FrameGuessr Team" />
        <meta name="author" content="FrameGuessr Team" />
        <meta name="designer" content="FrameGuessr Team" />
        <meta name="reply-to" content="frameguessr@gmail.com" />
        
        {/* Crawler directives */}
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
        <meta name="googlebot" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
        <meta name="bingbot" content="index,follow" />
        
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
          
          {/* Brand Notice Component */}
          <BrandNotice />
          
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
        
        {/* Service Worker Registration */}
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