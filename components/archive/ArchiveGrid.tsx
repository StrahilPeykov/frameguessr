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
  const itemsPerPage = 30
  const today = getTodayLocal()

  useEffect(() => {
    loadChallenges()
  }, [])

  const loadChallenges = async () => {
    try {
      setLoading(true)
      
      // Fetch all available dates from the database
      const { data: availableDates, error } = await supabase
        .from('daily_movies')
        .select('date, tmdb_id, title, media_type')
        .lte('date', today)
        .order('date', { ascending: false })

      if (error) throw error

      const challengeMap = new Map<string, DayChallenge>()
      
      // Process each available date
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
          dayNumber: availableDates.length - index, // Reverse numbering so day 1 is the oldest
          status,
          title: status !== 'not-played' ? movie.title : undefined,
          mediaType: movie.media_type as 'movie' | 'tv',
          attempts
        })
      })
      
      // Convert to array and sort by date descending (newest first)
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="aspect-square cinema-glass rounded-xl p-4 animate-pulse">
            <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded mb-2" />
            <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {(['all', 'played', 'won', 'lost'] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f)
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                filter === f
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg transform scale-105'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Stats summary */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span className="font-medium text-stone-700 dark:text-stone-300">
              {challenges.filter(c => c.status === 'won').length} Won
            </span>
          </div>
          <div className="flex items-center gap-1">
            <X className="w-4 h-4 text-red-600" />
            <span className="font-medium text-stone-700 dark:text-stone-300">
              {challenges.filter(c => c.status === 'lost').length} Lost
            </span>
          </div>
        </div>
      </div>

      {/* Challenge grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {paginatedChallenges.map((challenge) => {
          const { month, day, year } = formatDate(challenge.date)
          const todayChallenge = isToday(challenge.date)
          const futureChallenge = isFuture(challenge.date)
          
          return (
            <Link
              key={challenge.date}
              href={`/day/${challenge.date}`}
              className={`relative group aspect-square cinema-glass rounded-xl p-4 flex flex-col justify-between transition-all duration-300 hover:scale-105 hover:shadow-xl border ${
                challenge.status === 'won'
                  ? 'border-amber-500/50 dark:border-amber-400/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20'
                  : challenge.status === 'lost'
                  ? 'border-red-500/50 dark:border-red-400/50 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20'
                  : 'border-stone-200/50 dark:border-stone-700/50 hover:border-amber-500/50 dark:hover:border-amber-400/50'
              }`}
              aria-label={`Challenge ${challenge.dayNumber} - ${month} ${day}, ${year}`}
            >
              {/* Day number badge */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg z-10">
                {challenge.dayNumber}
              </div>
              
              {/* Today badge */}
              {todayChallenge && (
                <div className="absolute -top-2 -left-2 px-2 py-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full text-white text-xs font-bold shadow-lg z-10">
                  TODAY
                </div>
              )}
              
              {/* Date info */}
              <div>
                <div className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                  {day}
                </div>
                <div className="text-sm text-stone-600 dark:text-stone-400">
                  {month} {year}
                </div>
              </div>
              
              {/* Status */}
              <div className="space-y-2">
                {challenge.status === 'won' && (
                  <>
                    <div className="flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="text-xs text-center text-stone-600 dark:text-stone-400">
                      {challenge.attempts}/3 guesses
                    </div>
                  </>
                )}
                
                {challenge.status === 'lost' && (
                  <>
                    <div className="flex items-center justify-center">
                      <X className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="text-xs text-center text-stone-600 dark:text-stone-400">
                      Failed
                    </div>
                  </>
                )}
                
                {challenge.status === 'not-played' && (
                  <>
                    <div className="flex items-center justify-center">
                      {futureChallenge ? (
                        <Lock className="w-8 h-8 text-stone-400 dark:text-stone-500" />
                      ) : (
                        <Calendar className="w-8 h-8 text-stone-400 dark:text-stone-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
                      )}
                    </div>
                    <div className="text-xs text-center text-stone-500 dark:text-stone-500">
                      {futureChallenge ? 'Coming Soon' : 'Not Played'}
                    </div>
                  </>
                )}
                
                {/* Show title on hover for played games */}
                {challenge.title && challenge.status !== 'not-played' && (
                  <div className="absolute inset-0 bg-black/90 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-3">
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        {challenge.mediaType === 'tv' ? (
                          <Tv className="w-5 h-5 text-white/80" />
                        ) : (
                          <Film className="w-5 h-5 text-white/80" />
                        )}
                      </div>
                      <p className="text-white text-xs font-medium line-clamp-2">
                        {challenge.title}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
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
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    currentPage === pageNum
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                      : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-400'
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
            className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}