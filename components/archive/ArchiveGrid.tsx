'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, X, Calendar, ChevronLeft, ChevronRight, Film, Tv, Lock, Clock, Play } from 'lucide-react'
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
  const { isAuthenticated, syncDecision } = useAuth()
  const [challenges, setChallenges] = useState<DayChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<'all' | 'played' | 'won' | 'lost' | 'in-progress'>('all')
  const itemsPerPage = 36 // 6x6 grid
  const today = getTodayLocal()

  useEffect(() => {
    loadChallenges()
  }, [isAuthenticated, syncDecision]) // React to auth changes

  // Listen for data change events from GameStorage
  useEffect(() => {
    const handleDataChange = () => {
      console.log('[ArchiveGrid] Data change event received, reloading challenges...')
      loadChallenges()
    }

    const handleDataCleared = () => {
      console.log('[ArchiveGrid] Data cleared event received, reloading challenges...')
      loadChallenges()
    }

    const handleDataImported = () => {
      console.log('[ArchiveGrid] Data imported event received, reloading challenges...')
      loadChallenges()
    }

    // Listen for GameStorage events
    window.addEventListener('game-data-changed', handleDataChange)
    window.addEventListener('auth-data-cleared', handleDataCleared)
    window.addEventListener('game-data-imported', handleDataImported)
    
    return () => {
      window.removeEventListener('game-data-changed', handleDataChange)
      window.removeEventListener('auth-data-cleared', handleDataCleared)
      window.removeEventListener('game-data-imported', handleDataImported)
    }
  }, [])

  const loadChallenges = async () => {
    try {
      setLoading(true)
      console.log(`[ArchiveGrid] Loading challenges, auth: ${isAuthenticated}, syncDecision: ${syncDecision?.type}`)
      
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
            lastPlayed: gameState ? Date.now() : undefined // Could track actual last played time
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

  // Filter challenges
  const filteredChallenges = challenges.filter(challenge => {
    if (filter === 'all') return true
    if (filter === 'played') return challenge.status !== 'unplayed'
    if (filter === 'won') return challenge.status === 'completed-won'
    if (filter === 'lost') return challenge.status === 'completed-lost'
    if (filter === 'in-progress') return challenge.status === 'in-progress'
    return true
  })

  // Pagination
  const totalPages = Math.ceil(filteredChallenges.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedChallenges = filteredChallenges.slice(startIndex, startIndex + itemsPerPage)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()
    const year = date.getFullYear()
    return { month, day, year }
  }

  const isToday = (dateStr: string) => dateStr === today
  const isFuture = (dateStr: string) => dateStr > today

  const getStatusIcon = (challenge: DayChallenge) => {
    switch (challenge.status) {
      case 'completed-won':
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-sm">
              <div className="w-3 h-3 rounded-full bg-white" />
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 font-medium">
              {challenge.attempts}/3
            </div>
          </div>
        )
      
      case 'completed-lost':
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-red-500 to-rose-500 flex items-center justify-center shadow-sm">
              <X className="w-3 h-3 text-white" />
            </div>
            <div className="text-xs text-red-600 dark:text-red-400">
              Lost
            </div>
          </div>
        )
      
      case 'in-progress':
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
              <Clock className="w-3 h-3 text-white" />
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400">
              Scene {challenge.currentHintLevel}
            </div>
          </div>
        )
      
      case 'unplayed':
        if (isFuture(challenge.date)) {
          return (
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-stone-300 dark:bg-stone-600 flex items-center justify-center">
                <Lock className="w-3 h-3 text-stone-500 dark:text-stone-400" />
              </div>
              <div className="text-xs text-stone-400">
                Soon
              </div>
            </div>
          )
        } else {
          return (
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 rounded-full border-2 border-amber-300 dark:border-amber-600 border-dashed group-hover:border-amber-400 dark:group-hover:border-amber-500 transition-colors flex items-center justify-center">
                <Play className="w-3 h-3 text-amber-600 dark:text-amber-400 group-hover:text-amber-500 dark:group-hover:text-amber-300" />
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Play
              </div>
            </div>
          )
        }
      
      default:
        return null
    }
  }

  const getChallengeCardStyle = (challenge: DayChallenge) => {
    const baseStyle = "relative group aspect-square rounded-xl p-4 flex flex-col justify-between transition-all duration-200 hover:scale-[1.02] cinema-glass border overflow-hidden"
    
    switch (challenge.status) {
      case 'completed-won':
        return `${baseStyle} border-green-300/50 dark:border-green-600/50 bg-gradient-to-br from-green-50/80 to-emerald-50/60 dark:from-green-900/30 dark:to-emerald-900/20 hover:border-green-400/60 dark:hover:border-green-500/60`
      
      case 'completed-lost':
        return `${baseStyle} border-red-300/50 dark:border-red-600/50 bg-gradient-to-br from-red-50/80 to-rose-50/60 dark:from-red-900/30 dark:to-rose-900/20 hover:border-red-400/60 dark:hover:border-red-500/60`
      
      case 'in-progress':
        return `${baseStyle} border-amber-300/50 dark:border-amber-600/50 bg-gradient-to-br from-amber-50/80 to-orange-50/60 dark:from-amber-900/30 dark:to-orange-900/20 hover:border-amber-400/60 dark:hover:border-amber-500/60`
      
      case 'unplayed':
        if (isFuture(challenge.date)) {
          return `${baseStyle} border-stone-200/50 dark:border-stone-700/50 bg-stone-50/50 dark:bg-stone-900/30 opacity-60`
        } else {
          return `${baseStyle} border-stone-200/50 dark:border-stone-700/50 hover:border-amber-300/50 dark:hover:border-amber-600/50`
        }
      
      default:
        return baseStyle
    }
  }

  const getProgressText = (challenge: DayChallenge) => {
    switch (challenge.status) {
      case 'in-progress':
        return `${challenge.attempts} attempt${challenge.attempts !== 1 ? 's' : ''}`
      case 'completed-won':
        return `Won in ${challenge.attempts}`
      case 'completed-lost':
        return `Lost`
      default:
        return null
    }
  }

  const getAuthIndicatorText = () => {
    if (!isAuthenticated) return null
    
    switch (syncDecision?.type) {
      case 'clean-start':
        return '🏠 Local'
      case 'import-all':
      case 'keep-account-only':
        return '☁️ Synced'
      case 'merge-selected':
        return '🔄 Mixed'
      default:
        return '☁️ Synced'
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
        {Array.from({ length: 36 }).map((_, i) => (
          <div key={i} className="aspect-square bg-stone-100 dark:bg-stone-800/50 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced filter buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 cinema-glass p-1 rounded-lg border border-stone-200/50 dark:border-amber-700/30">
          {(['all', 'played', 'won', 'lost', 'in-progress'] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f)
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                filter === f
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              {f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Enhanced stats */}
        <div className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-green-600 dark:text-green-400 font-medium">
              {challenges.filter(c => c.status === 'completed-won').length}
            </span>
            <span>won</span>
          </div>
          
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {challenges.filter(c => c.status === 'in-progress').length}
            </span>
            <span>in progress</span>
          </div>
          
          <div>
            <span className="font-medium">
              {challenges.filter(c => c.status !== 'unplayed').length}
            </span>
            <span className="mx-1">/</span>
            <span>{challenges.length} total</span>
          </div>
          
          {/* Auth indicator */}
          {isAuthenticated && (
            <div className="text-xs text-blue-600 dark:text-blue-400">
              {getAuthIndicatorText()}
            </div>
          )}
        </div>
      </div>

      {/* Challenge grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
        {paginatedChallenges.map((challenge) => {
          const { month, day, year } = formatDate(challenge.date)
          const todayChallenge = isToday(challenge.date)
          const futureChallenge = isFuture(challenge.date)
          
          return (
            <Link
              key={challenge.date}
              href={`/day/${challenge.date}`}
              className={getChallengeCardStyle(challenge)}
              aria-label={`Challenge ${challenge.dayNumber} - ${month} ${day}, ${year} - ${challenge.status}`}
            >
              {/* Today indicator */}
              {todayChallenge && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse shadow-lg" />
              )}
              
              {/* Date */}
              <div className="text-center">
                <div className="text-lg md:text-xl font-bold text-stone-900 dark:text-stone-100">
                  {day}
                </div>
                <div className="text-xs text-stone-500 dark:text-stone-400 leading-tight">
                  {month}
                </div>
              </div>
              
              {/* Status indicator */}
              <div className="flex items-center justify-center">
                {getStatusIcon(challenge)}
              </div>
              
              {/* Progress text */}
              {getProgressText(challenge) && (
                <div className="text-xs text-center text-stone-500 dark:text-stone-400 mt-1">
                  {getProgressText(challenge)}
                </div>
              )}
              
              {/* Movie title overlay on hover */}
              {challenge.title && challenge.status !== 'unplayed' && (
                <div className="absolute inset-0 bg-black/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-3">
                  <div className="text-center">
                    <div className="flex justify-center mb-1">
                      {challenge.mediaType === 'tv' ? (
                        <Tv className="w-4 h-4 text-white/80" />
                      ) : (
                        <Film className="w-4 h-4 text-white/80" />
                      )}
                    </div>
                    <p className="text-white text-xs font-medium line-clamp-3 leading-relaxed">
                      {challenge.title}
                    </p>
                    
                    {/* Status badge in overlay */}
                    <div className="mt-2">
                      {challenge.status === 'in-progress' && (
                        <span className="text-xs bg-amber-600 text-white px-2 py-1 rounded-full">
                          Continue Playing
                        </span>
                      )}
                      {challenge.status === 'completed-won' && (
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                          ✓ Completed
                        </span>
                      )}
                      {challenge.status === 'completed-lost' && (
                        <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full">
                          View Result
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Link>
          )
        })}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg cinema-glass border border-stone-200/50 dark:border-amber-700/30 hover:border-amber-300/50 dark:hover:border-amber-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          </button>
          
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    currentPage === pageNum
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm'
                      : 'cinema-glass border border-stone-200/50 dark:border-amber-700/30 hover:border-amber-300/50 dark:hover:border-amber-600/50 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg cinema-glass border border-stone-200/50 dark:border-amber-700/30 hover:border-amber-300/50 dark:hover:border-amber-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          </button>
        </div>
      )}
    </div>
  )
}