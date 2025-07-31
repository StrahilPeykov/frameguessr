import { notFound } from 'next/navigation'
import GameBoard from '@/components/game/GameBoard'

interface PageProps {
  params: Promise<{
    date: string
  }>
}

export default async function DayPage({ params }: PageProps) {
  const { date } = await params
  
  // Quick format check first
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    notFound()
  }
  
  // Parse date
  const dateObj = new Date(date + 'T00:00:00.000Z')
  
  // Manual date validation
  const [year, month, day] = date.split('-').map(Number)
  const isValidDate = !isNaN(dateObj.getTime()) && 
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  
  if (!isValidDate) {
    notFound()
  }
  
  // Check if date is too far in the past
  const gameStartDate = new Date('2025-07-01T00:00:00.000Z')
  if (dateObj < gameStartDate) {
    notFound()
  }
  
  return <GameBoard initialDate={date} />
}

// Metadata generation for each day
export async function generateMetadata({ params }: PageProps) {
  const { date } = await params
  
  // Quick validation for metadata
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return {
      title: 'Day Not Found - FrameGuessr',
      description: 'This FrameGuessr challenge could not be found.',
      robots: 'noindex,nofollow'
    }
  }
  
  const dateObj = new Date(date + 'T00:00:00.000Z')
  const isValidDate = !isNaN(dateObj.getTime())
  
  if (!isValidDate) {
    return {
      title: 'Invalid Date - FrameGuessr',
      description: 'This FrameGuessr challenge date is invalid.',
      robots: 'noindex,nofollow'
    }
  }
  
  // Format date for display
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  const formattedDate = `${months[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`
  const shortDate = `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`
  const dayName = dayNames[dateObj.getDay()]
  
  // Check if it's today in user's timezone (best effort server-side)
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const isTodayDate = date === today
  
  // Check if it's recent (within last 7 days) for SEO purposes
  const daysDiff = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24))
  const isRecent = daysDiff >= 0 && daysDiff <= 7
  const isFuture = daysDiff < 0
  
  // Create dynamic titles and descriptions based on date context
  let title: string
  let description: string
  let keywords: string[]
  
  if (isTodayDate) {
    title = 'FrameGuessr Today - Can You Guess Today\'s Movie? Daily Film Challenge'
    description = `Play today's FrameGuessr challenge! Can you identify today's featured movie or TV show from a single frame? Progressive hints, audio clues, and unlimited fun. Better than Framed or any movie quiz game!`
    keywords = [
      'frameguessr today',
      'today movie game',
      'daily movie challenge today',
      'guess today movie',
      'movie game today',
      'frame quiz today',
      'daily film puzzle',
      'today\'s movie quiz'
    ]
  } else if (isFuture) {
    title = `FrameGuessr ${formattedDate} - Future Movie Challenge Coming Soon`
    description = `Get ready for the FrameGuessr challenge on ${formattedDate}! A new movie or TV show guessing game will be available. Bookmark this page and come back to play!`
    keywords = [
      'frameguessr future',
      'upcoming movie game',
      'movie challenge coming soon',
      `frameguessr ${date}`,
      'future frame quiz'
    ]
  } else if (isRecent) {
    title = `FrameGuessr ${shortDate} - ${dayName}'s Movie Challenge | Play Past Games`
    description = `Play the FrameGuessr challenge from ${formattedDate}! Test your movie knowledge with this ${dayName} puzzle. Can you guess the featured film from just one frame? Progressive hints available!`
    keywords = [
      `frameguessr ${date}`,
      `movie game ${shortDate}`,
      `${dayName} movie challenge`,
      'recent movie quiz',
      'past frameguessr games',
      'movie puzzle archive'
    ]
  } else {
    title = `FrameGuessr Archive ${shortDate} - Classic Movie Challenge from ${formattedDate}`
    description = `Revisit the FrameGuessr challenge from ${formattedDate}. Can you solve this classic movie puzzle? Guess the film from a single frame with progressive hints and audio clues.`
    keywords = [
      `frameguessr ${date}`,
      'frameguessr archive',
      'classic movie games',
      'movie puzzle archive',
      `${shortDate} movie challenge`,
      'past movie quiz games'
    ]
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://frameguessr.com'
  const pageUrl = `${baseUrl}/day/${date}`
  
  return {
    title,
    description,
    keywords: [
      ...keywords,
      // Always include these core keywords
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
    robots: isFuture ? 'noindex,follow' : 'index,follow',
    canonical: pageUrl,
    openGraph: {
      title: isTodayDate 
        ? 'FrameGuessr Today - Can You Guess Today\'s Movie?'
        : `FrameGuessr ${shortDate} - ${dayName}'s Movie Challenge`,
      description: isTodayDate
        ? 'Play today\'s movie guessing challenge! Progressive hints, audio clues, and cinematic fun.'
        : `Test your film knowledge with the ${formattedDate} FrameGuessr challenge.`,
      url: pageUrl,
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
      type: 'website',
      publishedTime: isTodayDate ? new Date().toISOString() : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: isTodayDate 
        ? 'Can You Guess Today\'s Movie? 🎬'
        : `FrameGuessr ${shortDate} Challenge 🎬`,
      description: isTodayDate
        ? 'New daily movie challenge is live! Progressive hints and audio clues available.'
        : `Movie guessing challenge from ${formattedDate}. Can you solve it?`,
      images: ['/images/og-daily-challenge.png'],
      creator: '@frameguessr',
    },
    alternates: {
      canonical: pageUrl,
    },
    other: {
      'article:published_time': isTodayDate ? new Date().toISOString() : dateObj.toISOString(),
      'article:modified_time': new Date().toISOString(),
      'article:section': 'Games',
      'article:tag': keywords.join(','),
      
      // Crawling directives
      'robots': isFuture ? 'noindex,follow' : 'index,follow,max-image-preview:large',
      'googlebot': isFuture ? 'noindex,follow' : 'index,follow,max-image-preview:large',
      
      // Date-specific meta
      'date': date,
      'challenge-date': formattedDate,
      'game-type': 'daily-movie-challenge',
      
      // Social sharing optimization
      'pinterest:description': description,
      'linkedin:description': description,
    }
  }
}