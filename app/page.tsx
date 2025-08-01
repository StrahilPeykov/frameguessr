import { Metadata } from 'next'
import GameBoard from '@/components/game/GameBoard'
import { getTodayLocal } from '@/utils/dateUtils'

// Dynamic metadata for today's challenge
export async function generateMetadata(): Promise<Metadata> {
  const today = getTodayLocal()
  
  return {
    title: 'FrameGuessr - Can You Guess Today\'s Movie? Daily Film Challenge',
    description: 'Play today\'s FrameGuessr challenge! Can you identify today\'s featured movie or TV show from a single frame? Progressive hints, audio clues, and unlimited fun.',
    keywords: [
      'frameguessr today',
      'today movie game',
      'daily movie challenge today',
      'guess today movie',
      'movie game today',
      'frame quiz today',
      'daily film puzzle',
      'today\'s movie quiz',
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
    openGraph: {
      title: 'FrameGuessr Today - Can You Guess Today\'s Movie?',
      description: 'Play today\'s movie guessing challenge! Progressive hints, audio clues, and cinematic fun.',
      url: 'https://frameguessr.com',
      siteName: 'FrameGuessr',
      images: [
        {
          url: '/images/og-daily-challenge.png',
          width: 1200,
          height: 630,
          alt: 'FrameGuessr Today - Daily Movie Guessing Challenge',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Can You Guess Today\'s Movie? 🎬',
      description: 'New daily movie challenge is live! Progressive hints and audio clues available.',
      images: ['/images/og-daily-challenge.png'],
      creator: '@frameguessr',
    },
    alternates: {
      canonical: 'https://frameguessr.com',
    },
    other: {
      'date': today,
      'challenge-date': new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      'game-type': 'daily-movie-challenge',
    }
  }
}

export default function HomePage() {
  const today = getTodayLocal()
  
  return <GameBoard initialDate={today} />
}