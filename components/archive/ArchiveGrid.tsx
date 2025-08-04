'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, Clock, Play, ChevronLeft, ChevronRight, Film, Tv } from 'lucide-react'
import { gameStorage } from '@/lib/gameStorage'
import { supabase } from '@/lib/supabase'
import { getTodayLocal, formatDateLocal } from '@/utils/dateUtils'
import { getGameStatus, hasProgress } from '@/utils/gameStateValidation'
import { useAuth } from '@/hooks/useAuth'
import { GameStatus } from '@/types'

interface DayChallenge {
  date: string
  dayNumber: number
  status: GameStatus
  title?: string
  mediaType?: 'movie' | 'tv'
  attempts?: number
  currentHintLevel?: number
  lastPlayed?: number
}

interface AvailableDate {
  date: string
  tmdb_id: number
  title: string
  media_type: 'movie' | 'tv'
}

export default function ArchiveGrid() {
  const { isAuthenticated } = useAuth()
  const [challenges, setChallenges] = useState<DayChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<'all' | 'completed'>('all')
  const itemsPerPage = 24 // Keep original 24 items per page
  const today = getTodayLocal()

  useEffect(() => {
    loadChallenges()
  }, [isAuthenticated])

  useEffect(() => {
    const handleDataChange = () => {
      console.log('[ArchiveGrid] Data change event received, reloading challenges...')
      loadChallenges()
    }

    const handleDataImported = () => {
      console.log('[ArchiveGrid] Data imported event received, reloading challenges...')
      loadChallenges()
    }

    window.addEventListener('game-data-changed', handleDataChange)
    window.addEventListener('game-data-imported', handleDataImported)
    
    return () => {
      window.removeEventListener('game-data-changed', handleDataChange)
      window.removeEventListener('game-data-imported', handleDataImported)
    }
  }, [])

  const loadChallenges = async () => {
    try {
      setLoading(true)
      console.log(`[ArchiveGrid] Loading challenges, auth: ${isAuthenticated}`)
      
      const { data: availableDates, error } = await supabase
        .from('daily_movies')
        .select('date, tmdb_id, title, media_type')
        .lte('date', today)
        .order('date', { ascending: false })

      if (error) throw error

      const challengeMap = new Map<string, DayChallenge>()
      
      // Load game states for all dates
      const gameStatePromises = availableDates?.map(async (movie: AvailableDate, index) => {
        try {
          const gameState = await gameStorage.loadGameState(movie.date)
          const status = getGameStatus(gameState)
          
          return {
            date: movie.date,
            dayNumber: availableDates.length - index,
            status,
            title: hasProgress(gameState) ? movie.title : undefined,
            mediaType: movie.media_type as 'movie' | 'tv',
            attempts: gameState?.attempts || 0,
            currentHintLevel: gameState?.currentHintLevel || 1,
            lastPlayed: gameState ? Date.now() : undefined
          }
        } catch (error) {
          console.error(`Failed to load game state for ${movie.date}:`, error)
          return {
            date: movie.date,
            dayNumber: availableDates.length - index,
            status: 'unplayed' as GameStatus,
            title: undefined,
            mediaType: movie.media_type as 'movie' | 'tv',
            attempts: 0,
            currentHintLevel: 1,
            lastPlayed: undefined
          }
        }
      }) || []

      const challengeResults = await Promise.all(gameStatePromises)
      
      challengeResults.forEach(challenge => {
        challengeMap.set(challenge.date, challenge)
      })
      
      const challengeArray = Array.from(challengeMap.values())
        .sort((a, b) => b.date.localeCompare(a.date))
      
      console.log(`[ArchiveGrid] Loaded ${challengeArray.length} challenges`)
      setChallenges(challengeArray)
    } catch (error) {
      console.error('Failed to load challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  // Simplified filter
  const filteredChallenges = challenges.filter(challenge => {
    if (filter === 'all') return true
    if (filter === 'completed') return challenge.status.startsWith('completed')
    return true
  })

  // Pagination
  const totalPages = Math.ceil(filteredChallenges.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedChallenges = filteredChallenges.slice(startIndex, startIndex + itemsPerPage)

  // Simple stats
  const completedCount = challenges.filter(c => c.status.startsWith('completed')).length
  const wonCount = challenges.filter(c => c.status === 'completed-won').length

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    const day = date.getDate()
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    return { day, month }
  }

  const isToday = (dateStr: string) => dateStr === today
  const isFuture = (dateStr: string) => dateStr > today

  const getStatusDisplay = (challenge: DayChallenge) => {
    switch (challenge.status) {
      case 'completed-won':
        return {
          icon: <Trophy className="w-3.5 h-3.5 text-amber-600" />,
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800/50',
          textColor: 'text-amber-800 dark:text-amber-200'
        }
      case 'completed-lost':
        return {
          icon: <div className="w-3.5 h-3.5 rounded-full bg-stone-400 dark:bg-stone-600" />,
          bgColor: 'bg-stone-50 dark:bg-stone-900/20',
          borderColor: 'border-stone-200 dark:border-stone-700',
          textColor: 'text-stone-600 dark:text-stone-400'
        }
      case 'in-progress':
        return {
          icon: <Clock className="w-3.5 h-3.5 text-blue-600" />,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800/50',
          textColor: 'text-blue-800 dark:text-blue-200'
        }
      default:
        return {
          icon: <Play className="w-3.5 h-3.5 text-stone-400" />,
          bgColor: 'bg-white dark:bg-stone-800/50',
          borderColor: 'border-stone-200 dark:border-stone-700',
          textColor: 'text-stone-600 dark:text-stone-400'
        }
    }
  }

  const getProgressText = (challenge: DayChallenge) => {
    switch (challenge.status) {
      case 'completed-won':
        return `✓ ${challenge.attempts}`
      case 'completed-lost':
        return '✗'
      case 'in-progress':
        return `${challenge.attempts}/3`
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-stone-200 dark:bg-stone-700 rounded animate-pulse" />
            <div className="h-4 w-32 bg-stone-200 dark:bg-stone-700 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-20 bg-stone-200 dark:bg-stone-700 rounded animate-pulse" />
            <div className="h-9 w-24 bg-stone-200 dark:bg-stone-700 rounded animate-pulse" />
          </div>
        </div>
        
        {/* Grid skeleton */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-8 gap-2">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="aspect-square bg-stone-200 dark:bg-stone-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Simplified Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-1">
            Your Progress
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-sm">
            {completedCount > 0 && (
              <span className="font-medium">{wonCount}/{completedCount} completed</span>
            )}
            {completedCount > 0 && filteredChallenges.length > completedCount && <span> • </span>}
            <span>{filteredChallenges.length} total challenges</span>
          </p>
        </div>
        
        {/* Simplified Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFilter('all')
              setCurrentPage(1)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'
            }`}
          >
            All Days
          </button>
          <button
            onClick={() => {
              setFilter('completed')
              setCurrentPage(1)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'completed'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Compact Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-8 gap-2">
        {paginatedChallenges.map((challenge) => {
          const { day, month } = formatDate(challenge.date)
          const todayChallenge = isToday(challenge.date)
          const futureChallenge = isFuture(challenge.date)
          const statusDisplay = getStatusDisplay(challenge)
          
          return (
            <Link
              key={challenge.date}
              href={`/day/${challenge.date}`}
              className={`
                relative group aspect-square rounded-lg p-2 flex flex-col justify-between
                transition-all duration-200 hover:scale-105
                ${statusDisplay.bgColor} ${statusDisplay.borderColor} ${statusDisplay.textColor}
                border-2 hover:shadow-lg
                ${futureChallenge ? 'opacity-50 pointer-events-none' : ''}
              `}
              aria-label={`Challenge ${challenge.dayNumber} - ${month} ${day} - ${challenge.status}`}
            >
              {/* Today indicator */}
              {todayChallenge && (
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
              )}
              
              {/* Date Display - Smaller */}
              <div className="text-center">
                <div className="text-lg font-bold leading-none">
                  {day}
                </div>
                <div className="text-xs opacity-75 mt-0.5">
                  {month}
                </div>
              </div>
              
              {/* Simple Status Icon - Smaller */}
              <div className="flex justify-center">
                {statusDisplay.icon}
              </div>
              
              {/* Minimal Progress Text */}
              {getProgressText(challenge) && (
                <div className="text-xs text-center opacity-75">
                  {getProgressText(challenge)}
                </div>
              )}

              {/* Simple hover effect - only show title for completed games */}
              {challenge.title && challenge.status.startsWith('completed') && (
                <div className="absolute inset-0 bg-black/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-1.5">
                  <div className="text-center">
                    <div className="flex justify-center mb-1">
                      {challenge.mediaType === 'tv' ? (
                        <Tv className="w-3 h-3 text-white/80" />
                      ) : (
                        <Film className="w-3 h-3 text-white/80" />
                      )}
                    </div>
                    <p className="text-white text-xs font-medium line-clamp-3 leading-relaxed">
                      {challenge.title}
                    </p>
                  </div>
                </div>
              )}
            </Link>
          )
        })}
      </div>
      
      {/* Simplified Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          </button>
          
          <span className="text-sm text-stone-600 dark:text-stone-400 font-medium px-4">
            {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          </button>
        </div>
      )}
      
      {/* Simple page info */}
      {totalPages > 1 && (
        <div className="text-center text-xs text-stone-500 dark:text-stone-400">
          Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredChallenges.length)} of {filteredChallenges.length} challenges
        </div>
      )}
    </div>
  )
}