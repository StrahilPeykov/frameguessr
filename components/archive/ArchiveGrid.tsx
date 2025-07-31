'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, X, Calendar, ChevronLeft, ChevronRight, Film, Tv, Lock } from 'lucide-react'
import { gameStorage } from '@/lib/gameStorage'
import { supabase } from '@/lib/supabase'
import { getTodayLocal, formatDateLocal } from '@/utils/dateUtils'

interface DayChallenge {
  date: string
  dayNumber: number
  status: 'won' | 'lost' | 'not-played'
  title?: string
  mediaType?: 'movie' | 'tv'
  attempts?: number
}

interface AvailableDate {
  date: string
  tmdb_id: number
  title: string
  media_type: 'movie' | 'tv'
}

export default function ArchiveGrid() {
  const [challenges, setChallenges] = useState<DayChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<'all' | 'played' | 'won' | 'lost'>('all')
  const itemsPerPage = 36 // 6x6 grid
  const today = getTodayLocal()

  useEffect(() => {
    loadChallenges()
  }, [])

  const loadChallenges = async () => {
    try {
      setLoading(true)
      
      const { data: availableDates, error } = await supabase
        .from('daily_movies')
        .select('date, tmdb_id, title, media_type')
        .lte('date', today)
        .order('date', { ascending: false })

      if (error) throw error

      const challengeMap = new Map<string, DayChallenge>()
      
      availableDates?.forEach((movie: AvailableDate, index) => {
        const gameState = gameStorage.loadFromLocalStorage(movie.date)
        
        let status: 'won' | 'lost' | 'not-played' = 'not-played'
        let attempts = 0
        
        if (gameState) {
          if (gameState.won) {
            status = 'won'
          } else if (gameState.completed) {
            status = 'lost'
          }
          attempts = gameState.attempts
        }
        
        challengeMap.set(movie.date, {
          date: movie.date,
          dayNumber: availableDates.length - index,
          status,
          title: status !== 'not-played' ? movie.title : undefined,
          mediaType: movie.media_type as 'movie' | 'tv',
          attempts
        })
      })
      
      const challengeArray = Array.from(challengeMap.values())
        .sort((a, b) => b.date.localeCompare(a.date))
      
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
    if (filter === 'played') return challenge.status !== 'not-played'
    if (filter === 'won') return challenge.status === 'won'
    if (filter === 'lost') return challenge.status === 'lost'
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
      {/* Clean filter buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 cinema-glass p-1 rounded-lg border border-stone-200/50 dark:border-amber-700/30">
          {(['all', 'played', 'won', 'lost'] as const).map((f) => (
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
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Simple stats */}
        <div className="text-sm text-stone-500 dark:text-stone-400">
          <span className="text-green-600 dark:text-green-400 font-medium">
            {challenges.filter(c => c.status === 'won').length}
          </span>
          <span className="mx-1">/</span>
          <span>{challenges.filter(c => c.status !== 'not-played').length} played</span>
        </div>
      </div>

      {/* Clean challenge grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
        {paginatedChallenges.map((challenge) => {
          const { month, day, year } = formatDate(challenge.date)
          const todayChallenge = isToday(challenge.date)
          const futureChallenge = isFuture(challenge.date)
          
          return (
            <Link
              key={challenge.date}
              href={`/day/${challenge.date}`}
              className={`relative group aspect-square rounded-xl p-4 flex flex-col justify-between transition-all duration-200 hover:scale-[1.02] cinema-glass border overflow-hidden ${
                challenge.status === 'won'
                  ? 'border-green-300/50 dark:border-green-600/50 bg-gradient-to-br from-green-50/80 to-emerald-50/60 dark:from-green-900/30 dark:to-emerald-900/20 hover:border-green-400/60 dark:hover:border-green-500/60'
                  : challenge.status === 'lost'
                  ? 'border-red-300/50 dark:border-red-600/50 bg-gradient-to-br from-red-50/80 to-rose-50/60 dark:from-red-900/30 dark:to-rose-900/20 hover:border-red-400/60 dark:hover:border-red-500/60'
                  : futureChallenge
                  ? 'border-stone-200/50 dark:border-stone-700/50 bg-stone-50/50 dark:bg-stone-900/30 opacity-60'
                  : 'border-stone-200/50 dark:border-stone-700/50 hover:border-amber-300/50 dark:hover:border-amber-600/50'
              }`}
              aria-label={`Challenge ${challenge.dayNumber} - ${month} ${day}, ${year}`}
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
                {challenge.status === 'won' && (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-sm">
                      <div className="w-3 h-3 rounded-full bg-white" />
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                      {challenge.attempts}/3
                    </div>
                  </div>
                )}
                
                {challenge.status === 'lost' && (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-red-500 to-rose-500 flex items-center justify-center shadow-sm">
                      <X className="w-3 h-3 text-white" />
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400">
                      Lost
                    </div>
                  </div>
                )}
                
                {challenge.status === 'not-played' && (
                  <div className="flex flex-col items-center gap-1">
                    {futureChallenge ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-stone-300 dark:bg-stone-600 flex items-center justify-center">
                          <Lock className="w-3 h-3 text-stone-500 dark:text-stone-400" />
                        </div>
                        <div className="text-xs text-stone-400">
                          Soon
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-6 h-6 rounded-full border-2 border-amber-300 dark:border-amber-600 border-dashed group-hover:border-amber-400 dark:group-hover:border-amber-500 transition-colors" />
                        <div className="text-xs text-stone-500 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          Play
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* Movie title overlay on hover */}
              {challenge.title && challenge.status !== 'not-played' && (
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
                  </div>
                </div>
              )}
            </Link>
          )
        })}
      </div>
      
      {/* Clean pagination */}
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