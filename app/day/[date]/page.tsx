import { notFound, redirect } from 'next/navigation'
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
  
  // Get today's date in the same format
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  
  // Check if date is in the future
  if (date > todayStr) {
    redirect(`/day/${todayStr}`)
  }
  
  // Check if date is too far in the past
  const gameStartDate = new Date('2025-07-01T00:00:00.000Z')
  if (dateObj < gameStartDate) {
    notFound()
  }
  
  return <GameBoard initialDate={date} />
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
  const isValidDate = !isNaN(dateObj.getTime())
  
  if (!isValidDate) {
    return {
      title: 'Day Not Found - FrameGuessr'
    }
  }
  
  // Format date for display
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const formattedDate = `${months[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`
  
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
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
          url: '/images/og-image.jpg',
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
      images: ['/images/og-image.jpg'],
      creator: '@frameguessr',
    }
  }
}