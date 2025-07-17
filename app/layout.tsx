import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FrameGuessr - Daily Movie & TV Show Guessing Game',
  description: 'Guess the movie or TV show from a still image. A new challenge every day!',
  keywords: ['movie game', 'tv show game', 'guessing game', 'daily puzzle'],
  authors: [{ name: 'FrameGuessr' }],
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
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
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