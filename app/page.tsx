import GameBoard from '@/components/game/GameBoard'
import { getTodayLocal } from '@/utils/dateUtils'
import type { Metadata } from 'next'

export default function HomePage() {
  const today = getTodayLocal()
  return <GameBoard initialDate={today} />
}

export async function generateMetadata(): Promise<Metadata> {
  const now = new Date()
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const formattedDate = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://frameguessr.com'

  return {
    title: 'FrameGuessr Today - Can You Guess Today\'s Movie? Daily Film Challenge',
    description: `Play today's FrameGuessr challenge! Can you identify today's featured movie or TV show from a single frame? Progressive hints, audio clues, and unlimited fun. Better than Framed or any movie quiz game!`,
    keywords: [
      'frameguessr today',
      'today movie game',
      'daily movie challenge today',
      'guess today movie',
      'movie game today',
      'frame quiz today',
      'daily film puzzle',
      "today's movie quiz",
      'frameguessr',
      'movie guessing game',
      'frame quiz',
      'daily movie puzzle',
      'film identification game',
      'movie stills quiz',
      'cinema challenge',
      'guess the movie',
      'framed alternative',
      'movie wordle'
    ],
    authors: [{ name: 'FrameGuessr Team' }],
    robots: 'index,follow',
    openGraph: {
      title: 'FrameGuessr Today - Can You Guess Today\'s Movie?',
      description: "Play today's movie guessing challenge! Progressive hints, audio clues, and cinematic fun.",
      url: baseUrl,
      siteName: 'FrameGuessr',
      images: [
        {
          url: '/images/og-daily-challenge.png',
          width: 1200,
          height: 630,
          alt: `FrameGuessr ${formattedDate} - Daily Movie Guessing Challenge`,
        },
      ],
      locale: 'en_US',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: "Can You Guess Today's Movie? 🎬",
      description: 'New daily movie challenge is live! Progressive hints and audio clues available.',
      images: ['/images/og-daily-challenge.png'],
      creator: '@frameguessr',
    },
    alternates: {
      canonical: baseUrl,
    },
    other: {
      'article:published_time': now.toISOString(),
      'article:modified_time': now.toISOString(),
      'article:section': 'Games',
      'article:tag': [
        'frameguessr today',
        'today movie game',
        'daily movie challenge today',
        'guess today movie',
        'movie game today',
        'frame quiz today',
        'daily film puzzle',
        "today's movie quiz"
      ].join(','),
      robots: 'index,follow,max-image-preview:large',
      googlebot: 'index,follow,max-image-preview:large',
      date: getTodayLocal(),
      'challenge-date': formattedDate,
      'game-type': 'daily-movie-challenge',
      'pinterest:description': "Play today's FrameGuessr challenge! Can you identify today's featured movie or TV show from a single frame? Progressive hints, audio clues, and unlimited fun.",
      'linkedin:description': "Play today's FrameGuessr challenge! Can you identify today's featured movie or TV show from a single frame? Progressive hints, audio clues, and unlimited fun."
    }
  }
}