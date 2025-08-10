'use client'

import { useEffect, useState } from 'react'
import GameBoard from '@/components/game/GameBoard'
import { getTodayLocal } from '@/utils/dateUtils'

export default function HomePage() {
  const [today, setToday] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Calculate date on client-side to avoid timezone issues between server and client
    setToday(getTodayLocal())
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-rose-50/20 dark:from-stone-950 dark:via-amber-950/20 dark:to-rose-950/10 flex items-center justify-center">
        <div className="text-center">
          <div className="cinema-spinner mx-auto mb-4" />
          <p className="text-stone-600 dark:text-stone-400 text-sm">Loading today's challenge...</p>
        </div>
      </div>
    )
  }

  return <GameBoard initialDate={today} />
}