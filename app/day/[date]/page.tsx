import { notFound, redirect } from 'next/navigation'
import { format, isValid, isBefore, isAfter } from 'date-fns'
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
  const dateObj = new Date(date + 'T00:00:00.000Z') // Force UTC to avoid timezone issues
  if (!isValid(dateObj) || date !== format(dateObj, 'yyyy-MM-dd')) {
    notFound()
  }
  
  // Get today's date in the same format
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  
  // Check if date is in the future - redirect directly to today's URL
  if (date > todayStr) {
    redirect(`/day/${todayStr}`)
  }
  
  // Check if date is too far in the past (before game started)
  const gameStartDate = new Date('2025-07-01T00:00:00.000Z')
  if (dateObj < gameStartDate) {
    notFound()
  }
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
      <div className="container mx-auto py-4 sm:py-6 md:py-8">
        <GameBoard initialDate={date} />
      </div>
      
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:b-blue-900 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>
    </main>
  )
}

// Generate metadata for each day
export async function generateMetadata({ params }: PageProps) {
  const { date } = await params
  
  // Quick validation for metadata
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return {
      title: 'Day Not Found - FrameGuessr'
    }
  }
  
  const dateObj = new Date(date + 'T00:00:00.000Z')
  
  if (!isValid(dateObj)) {
    return {
      title: 'Day Not Found - FrameGuessr'
    }
  }
  
  const formattedDate = format(dateObj, 'MMMM d, yyyy')
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const isToday = date === todayStr
  
  return {
    title: isToday 
      ? 'FrameGuessr - Today\'s Movie & TV Challenge'
      : `FrameGuessr - ${formattedDate} Challenge`,
    description: isToday
      ? 'Can you guess today\'s movie or TV show from the image?'
      : `Take on the FrameGuessr challenge from ${formattedDate}`,
    openGraph: {
      title: isToday 
        ? 'FrameGuessr - Today\'s Challenge'
        : `FrameGuessr - ${formattedDate}`,
      description: isToday
        ? 'Can you guess today\'s movie or TV show?'
        : `Challenge from ${formattedDate}`,
      url: `/day/${date}`,
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
      title: isToday 
        ? 'FrameGuessr - Today\'s Challenge'
        : `FrameGuessr - ${formattedDate}`,
      description: isToday
        ? 'Can you guess today\'s movie or TV show?'
        : `Challenge from ${formattedDate}`,
      images: ['/og-image.png'],
      creator: '@frameguessr',
    }
  }
}