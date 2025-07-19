'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Film, 
  Trophy, 
  Lock,
  Sparkles,
  Home,
  Clock,
  CheckCircle,
  Circle,
  Star
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isAfter, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from 'date-fns'

interface DailyMovie {
  date: string
  title: string
  media_type: 'movie' | 'tv'
  has_audio: boolean
}

interface GameState {
  completed: boolean
  won: boolean
  attempts: number
}

export default function ArchiveCalendar() {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set())
  const [movieTitles, setMovieTitles] = useState<Map<string, DailyMovie>>(new Map())
  const [playedDates, setPlayedDates] = useState<Map<string, GameState>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnlyPlayed, setShowOnlyPlayed] = useState(false)
  
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')

  // Load available dates from Supabase
  useEffect(() => {
    loadAvailableDates()
    loadPlayedGames()
  }, [])

  const loadAvailableDates = async () => {
    try {
      const response = await fetch('/api/archive')
      
      if (!response.ok) {
        throw new Error('Failed to load archive data')
      }

      const { movies, stats } = await response.json()

      if (movies) {
        const dates = new Set<string>()
        const titles = new Map<string, DailyMovie>()
        
        movies.forEach((movie: DailyMovie) => {
          dates.add(movie.date)
          titles.set(movie.date, movie)
        })
        
        setAvailableDates(dates)
        setMovieTitles(titles)
        
        // Set current month to the first available date
        if (stats.firstDate) {
          const oldestDate = new Date(stats.firstDate)
          setCurrentMonth(oldestDate)
        }
      }
    } catch (error) {
      console.error('Failed to load available dates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadPlayedGames = () => {
    const played = new Map<string, GameState>()
    
    // Load all game states from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('frameguessr-20')) {
        const date = key.replace('frameguessr-', '')
        try {
          const gameData = localStorage.getItem(key)
          if (gameData) {
            const parsed = JSON.parse(gameData)
            if (parsed.completed !== undefined || parsed.won !== undefined) {
              played.set(date, {
                completed: parsed.completed || false,
                won: parsed.won || false,
                attempts: parsed.attempts || 0
              })
            }
          }
        } catch (e) {
          console.error('Error parsing game data:', e)
        }
      }
    }
    
    setPlayedDates(played)
  }

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    if (availableDates.has(dateStr) && !isAfter(date, today)) {
      router.push(`/day/${dateStr}`)
    }
  }

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth(direction === 'prev' 
      ? subMonths(currentMonth, 1) 
      : addMonths(currentMonth, 1)
    )
  }

  // Get all days to display in the calendar grid
  const getDaysInMonth = () => {
    const start = startOfWeek(startOfMonth(currentMonth))
    const end = endOfWeek(endOfMonth(currentMonth))
    return eachDayOfInterval({ start, end })
  }

  const getDateStatus = (date: Date): 'available' | 'future' | 'unavailable' | 'today' => {
    const dateStr = format(date, 'yyyy-MM-dd')
    
    if (isSameDay(date, today)) return 'today'
    if (isAfter(date, today)) return 'future'
    if (availableDates.has(dateStr)) return 'available'
    return 'unavailable'
  }

  const getGameStatus = (dateStr: string) => {
    return playedDates.get(dateStr)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-rose-50/20 dark:from-stone-950 dark:via-amber-950/20 dark:to-rose-950/10">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="cinema-spinner mx-auto mb-6" />
            <h2 className="text-xl font-bold cinema-gradient-text">Loading Archive</h2>
            <p className="text-stone-600 dark:text-stone-400">Accessing the film vault...</p>
          </div>
        </div>
      </div>
    )
  }

  const days = getDaysInMonth()
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Stats calculation
  const totalAvailable = availableDates.size
  const totalPlayed = playedDates.size
  const totalWon = Array.from(playedDates.values()).filter(game => game.won).length
  const winRate = totalPlayed > 0 ? Math.round((totalWon / totalPlayed) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-rose-50/20 dark:from-stone-950 dark:via-amber-950/20 dark:to-rose-950/10">
      {/* Header */}
      <header className="cinema-nav-blur bg-stone-950/80 border-b border-amber-900/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-stone-800/50 transition-all duration-300 cinema-touch group"
              >
                <Home className="w-5 h-5 text-amber-500 group-hover:text-amber-400" />
                <span className="text-stone-200 group-hover:text-amber-400">Back to Game</span>
              </Link>
            </div>
            
            <h1 className="text-xl font-bold cinema-gradient-title">
              Cinema Archive
            </h1>
            
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-stone-800/50 border border-amber-700/30">
                <span className="text-xs text-amber-400">{totalAvailable} Films</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="cinema-glass rounded-2xl p-4 text-center border border-stone-200/50 dark:border-stone-700/50">
            <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{totalAvailable}</div>
            <div className="text-sm text-stone-600 dark:text-stone-400 flex items-center justify-center gap-1">
              <Film className="w-3 h-3" />
              Total Films
            </div>
          </div>
          
          <div className="cinema-glass rounded-2xl p-4 text-center border border-stone-200/50 dark:border-stone-700/50">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{totalPlayed}</div>
            <div className="text-sm text-stone-600 dark:text-stone-400 flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Played
            </div>
          </div>
          
          <div className="cinema-glass rounded-2xl p-4 text-center border border-stone-200/50 dark:border-stone-700/50">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalWon}</div>
            <div className="text-sm text-stone-600 dark:text-stone-400 flex items-center justify-center gap-1">
              <Trophy className="w-3 h-3" />
              Solved
            </div>
          </div>
          
          <div className="cinema-glass rounded-2xl p-4 text-center border border-stone-200/50 dark:border-stone-700/50">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{winRate}%</div>
            <div className="text-sm text-stone-600 dark:text-stone-400 flex items-center justify-center gap-1">
              <Star className="w-3 h-3" />
              Success Rate
            </div>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="cinema-glass rounded-3xl p-6 md:p-8 shadow-2xl border border-stone-200/50 dark:border-stone-800/50">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => handleMonthChange('prev')}
              className="p-3 rounded-2xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-300 cinema-touch group"
            >
              <ChevronLeft className="w-6 h-6 text-stone-600 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
            </button>
            
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-amber-500" />
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            
            <button
              onClick={() => handleMonthChange('next')}
              className="p-3 rounded-2xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-300 cinema-touch group"
            >
              <ChevronRight className="w-6 h-6 text-stone-600 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
            </button>
          </div>

          {/* Week Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-bold text-stone-600 dark:text-stone-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const status = getDateStatus(day)
              const gameState = getGameStatus(dateStr)
              const movie = movieTitles.get(dateStr)
              const isCurrentMonth = isSameMonth(day, currentMonth)

              return (
                <div
                  key={idx}
                  className={`
                    relative aspect-square p-2 rounded-xl transition-all duration-300
                    ${!isCurrentMonth ? 'opacity-30' : ''}
                    ${status === 'available' || status === 'today' ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
                    ${status === 'today' ? 'ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-stone-900' : ''}
                    ${gameState?.won ? 'bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30' : 
                      gameState?.completed ? 'bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30' :
                      status === 'available' ? 'bg-stone-100 dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-amber-900/20' :
                      'bg-stone-50 dark:bg-stone-900/50'}
                  `}
                  onClick={() => handleDateClick(day)}
                  onMouseEnter={() => setHoveredDate(dateStr)}
                  onMouseLeave={() => setHoveredDate(null)}
                >
                  {/* Date Number */}
                  <div className={`
                    text-sm font-bold mb-1
                    ${status === 'today' ? 'text-amber-600 dark:text-amber-400' :
                      status === 'available' ? 'text-stone-700 dark:text-stone-200' :
                      'text-stone-400 dark:text-stone-600'}
                  `}>
                    {format(day, 'd')}
                  </div>

                  {/* Status Icons */}
                  <div className="absolute bottom-2 right-2">
                    {status === 'today' && (
                      <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    )}
                    {status === 'future' && (
                      <Lock className="w-3 h-3 text-stone-400 dark:text-stone-600" />
                    )}
                    {gameState?.won && (
                      <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    )}
                    {gameState?.completed && !gameState.won && (
                      <CheckCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                    {status === 'available' && !gameState && (
                      <Circle className="w-3 h-3 text-stone-400 dark:text-stone-600" />
                    )}
                  </div>

                  {/* Audio indicator */}
                  {movie?.has_audio && (
                    <div className="absolute top-2 right-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    </div>
                  )}

                  {/* Tooltip */}
                  {hoveredDate === dateStr && movie && (
                    <div className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-3 cinema-glass-dark rounded-xl shadow-2xl pointer-events-none">
                      <div className="text-xs font-bold text-amber-300 mb-1">
                        {movie.title}
                      </div>
                      <div className="text-xs text-stone-300 flex items-center gap-1">
                        {movie.media_type === 'tv' ? 'TV Series' : 'Film'}
                        {movie.has_audio && ' • 🎵 Audio'}
                      </div>
                      {gameState && (
                        <div className="text-xs text-stone-400 mt-1">
                          {gameState.won ? `Solved in ${gameState.attempts} tries` : 'Attempted'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 cinema-glass rounded-2xl p-6 border border-stone-200/50 dark:border-stone-800/50">
          <h3 className="font-bold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
            <Film className="w-5 h-5 text-amber-600" />
            Legend
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-sm text-stone-600 dark:text-stone-400">Solved</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-sm text-stone-600 dark:text-stone-400">Attempted</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                <Circle className="w-5 h-5 text-stone-400 dark:text-stone-600" />
              </div>
              <span className="text-sm text-stone-600 dark:text-stone-400">Available</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-stone-50 dark:bg-stone-900/50 flex items-center justify-center">
                <Lock className="w-5 h-5 text-stone-400 dark:text-stone-600" />
              </div>
              <span className="text-sm text-stone-600 dark:text-stone-400">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}