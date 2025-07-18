import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FrameGuessr - Daily Movie & TV Show Guessing Game',
  description: 'Guess the movie or TV show from a still image. A new challenge every day!',
  keywords: ['movie game', 'tv show game', 'guessing game', 'daily puzzle', 'wordle for movies'],
  authors: [{ name: 'FrameGuessr' }],
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FrameGuessr',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'FrameGuessr',
    description: 'Can you guess today\'s movie or TV show?',
    url: 'https://frameguessr.vercel.app',
    siteName: 'FrameGuessr',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FrameGuessr - Daily Movie & TV Show Guessing Game',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FrameGuessr',
    description: 'Can you guess today\'s movie or TV show?',
    images: ['/og-image.png'],
    creator: '@frameguessr',
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
      { url: '/favicon.ico' },
      { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}