'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { GameState, DailyChallenge, SearchResult } from '@/types/game'
import { Search, SkipForward, Check, X, Share2, BarChart3, RefreshCw, Eye, EyeOff, Calendar, Clock, Trophy, Info, Film, Tv } from 'lucide-react'
import ShareModal from './ShareModal'
import StatsModal from './StatsModal'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'
import SearchBox from './SearchBox'
import CountdownTimer from './CountdownTimer'
import DatePicker from './DatePicker'

interface GameBoardProps {
  initialDate?: string
}

export default function GameBoard({ initialDate }: GameBoardProps) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const selectedDate = initialDate || today
  
  const [gameState, setGameState] = useState<GameState>({
    currentDate: selectedDate,
    attempts: 0,
    maxAttempts: 3,
    guesses: [],
    completed: false,
    won: false,
    currentHintLevel: 1,
  })

  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [showUnblurred, setShowUnblurred] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Handle date selection by navigating to new URL
  const handleDateSelect = (date: string) => {
    router.push(`/day/${date}`)
  }

  // Load game state from localStorage on mount and date change
  useEffect(() => {
    const savedState = localStorage.getItem(`frameguessr-${selectedDate}`)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        setGameState(parsed)
      } catch (error) {
        console.error('Error parsing saved state:', error)
      }
    } else {
      // Reset game state for new date
      setGameState({
        currentDate: selectedDate,
        attempts: 0,
        maxAttempts: 3,
        guesses: [],
        completed: false,
        won: false,
        currentHintLevel: 1,
      })
    }
    fetchDailyChallenge(selectedDate)
    setShowUnblurred(false)
    setImageLoaded(false)
  }, [selectedDate])

  // Save game state to localStorage when it changes
  useEffect(() => {
    if (gameState.attempts > 0 || gameState.completed) {
      localStorage.setItem(
        `frameguessr-${selectedDate}`,
        JSON.stringify(gameState)
      )
    }
  }, [gameState, selectedDate])

  const fetchDailyChallenge = async (date: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/daily?date=${date}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`No challenge available for ${date}`)
        }
        throw new Error('Failed to load the challenge')
      }
      
      const data = await response.json()
      setDailyChallenge(data)
      
      // Preload the image
      if (data.imageUrl) {
        const img = new Image()
        img.src = data.imageUrl
      }
    } catch (error) {
      console.error('Failed to fetch daily challenge:', error)
      setError(error instanceof Error ? error.message : 'Unable to load the challenge. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuess = async (result: SearchResult) => {
    if (gameState.completed || gameState.attempts >= gameState.maxAttempts) {
      return
    }

    const isCorrect = 
      dailyChallenge?.movieId === result.id && 
      dailyChallenge?.mediaType === result.mediaType

    const newGuess = {
      id: `${Date.now()}`,
      title: result.title,
      tmdbId: result.id,
      mediaType: result.mediaType,
      correct: isCorrect,
      timestamp: Date.now(),
    }

    const newAttempts = gameState.attempts + 1
    const newHintLevel = Math.min(newAttempts + 1, 3)

    setGameState(prev => ({
      ...prev,
      attempts: newAttempts,
      guesses: [...prev.guesses, newGuess],
      completed: isCorrect || newAttempts >= gameState.maxAttempts,
      won: isCorrect,
      currentHintLevel: newHintLevel,
    }))

    if (isCorrect) {
      // Show unblurred image on win
      setTimeout(() => setShowUnblurred(true), 500)
    }

    // Log to backend
    try {
      await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          guess: newGuess, 
          gameState: {
            ...gameState, 
            attempts: newAttempts,
            completed: isCorrect || newAttempts >= gameState.maxAttempts,
            won: isCorrect,
            currentHintLevel: newHintLevel
          } 
        }),
      })
    } catch (error) {
      console.error('Failed to log guess:', error)
    }
  }

  const handleSkip = () => {
    if (gameState.completed || gameState.currentHintLevel >= 3) {
      return
    }

    setGameState(prev => ({
      ...prev,
      currentHintLevel: prev.currentHintLevel + 1,
    }))
  }

  const getBlurClass = () => {
    if (showUnblurred || gameState.won || gameState.completed) return ''
    
    switch (gameState.currentHintLevel) {
      case 1:
        return 'blur-[12px] brightness-75'
      case 2:
        return 'blur-[5px] brightness-90'
      case 3:
        return 'blur-[2px]' // Just a tiny hint of blur
      default:
        return ''
    }
  }

  const getRemainingAttempts = () => {
    return gameState.maxAttempts - gameState.attempts
  }

  const getHintText = () => {
    if (gameState.currentHintLevel === 1) return "Blurred image"
    if (gameState.currentHintLevel === 2) return "Less blur + Year & Genre"
    if (gameState.currentHintLevel === 3) return "Almost clear + Cast & Director"
    return "Full image"
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            <h1 className="text-5xl font-bold mb-2">FrameGuessr</h1>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-6 rounded-2xl mb-4 shadow-lg">
            <p className="mb-4 text-lg">{error}</p>
            <button
              onClick={() => {
                setError(null)
                fetchDailyChallenge(selectedDate)
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all transform hover:scale-105 font-medium shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setShowStatsModal(true)}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all group relative"
              aria-label="View statistics"
            >
              <BarChart3 className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Statistics
              </span>
            </button>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                <h1 className="text-5xl font-bold mb-2 tracking-tight">FrameGuessr</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Guess the movie or TV show from the image
              </p>
            </div>
            
            {gameState.completed && (
              <button
                onClick={() => setShowShareModal(true)}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all group relative animate-fadeIn"
                aria-label="Share result"
              >
                <Share2 className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                <span className="absolute -bottom-8 right-1/2 translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Share
                </span>
              </button>
            )}
            {!gameState.completed && <div className="w-12" />}
          </div>
        </div>

        {/* Game Status */}
        <div className="mb-8 text-center">
          {/* Date Picker */}
          <DatePicker 
            currentDate={selectedDate}
            onDateSelect={handleDateSelect}
            minDate="2025-07-01"
          />
          
          <div className="flex justify-center gap-3 mb-4 mt-6">
            {Array.from({ length: gameState.maxAttempts }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-500 transform ${
                  i < gameState.attempts
                    ? gameState.guesses[i]?.correct
                      ? 'bg-gradient-to-r from-green-400 to-green-600 shadow-lg shadow-green-500/30 scale-110'
                      : 'bg-gradient-to-r from-red-400 to-red-600 shadow-lg shadow-red-500/30 scale-110'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          <div className="space-y-3">
            {gameState.completed ? (
              <div className="text-center animate-fadeIn">
                {gameState.won ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                      <Trophy className="w-6 h-6 animate-bounce" />
                      <span className="text-xl font-bold">Congratulations!</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You got it in {gameState.attempts} {gameState.attempts === 1 ? 'guess' : 'guesses'}!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Better luck next time!</p>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 inline-block">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">The answer was:</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {dailyChallenge?.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2 mt-1">
                        {dailyChallenge?.mediaType === 'tv' ? <Tv className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                        {dailyChallenge?.year}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{getRemainingAttempts()} {getRemainingAttempts() === 1 ? 'attempt' : 'attempts'} remaining</span>
              </div>
            )}
            
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{selectedDate === today ? 'Today\'s Challenge' : `Challenge #${selectedDate.split('-').join('')}`}</span>
            </div>
          </div>
        </div>

        {/* Movie Still */}
        <div className="mb-8 bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
          <div className="relative aspect-video bg-black">
            {dailyChallenge?.imageUrl ? (
              <>
                <img
                  src={dailyChallenge.imageUrl}
                  alt="Movie still"
                  className={`w-full h-full object-cover transition-all duration-1000 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  } ${getBlurClass()}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={(e) => {
                    console.error('Image failed to load')
                    e.currentTarget.src = '/placeholder-movie.svg'
                  }}
                />
                
                {/* Loading overlay */}
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-white text-sm animate-pulse">Loading image...</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center text-white">
                  <Film className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No image available</p>
                  <p className="text-sm text-gray-400">Please refresh the page</p>
                </div>
              </div>
            )}
            
            {/* Gradient overlays for better text readability */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            
            {/* Hint Level Indicator */}
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">Hint Level</span>
              <span className="font-bold">{gameState.currentHintLevel}/3</span>
            </div>
            
            {/* Hint Description */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg">
              <Eye className="w-4 h-4" />
              {getHintText()}
            </div>
            
            {/* Toggle Blur Button */}
            {imageLoaded && !gameState.completed && (
              <button
                onClick={() => setShowUnblurred(!showUnblurred)}
                className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/90 transition-all transform hover:scale-110 shadow-lg"
                aria-label={showUnblurred ? 'Show blurred' : 'Show unblurred'}
              >
                {showUnblurred ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Additional Hints */}
        {gameState.currentHintLevel >= 2 && dailyChallenge && (
          <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 shadow-lg animate-fadeIn">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <Info className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Additional Hints
            </h3>
            <div className="grid gap-3">
              {dailyChallenge.hints.level2.data.year && (
                <div className="flex items-center gap-3 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-sm text-gray-600 dark:text-gray-400">Release Year</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{dailyChallenge.hints.level2.data.year}</p>
                  </div>
                </div>
              )}
              
              {dailyChallenge.hints.level2.data.genre && (
                <div className="flex items-center gap-3 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <Film className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-sm text-gray-600 dark:text-gray-400">Genre</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{dailyChallenge.hints.level2.data.genre}</p>
                  </div>
                </div>
              )}
              
              {gameState.currentHintLevel >= 3 && (
                <>
                  {dailyChallenge.hints.level3.data.director && (
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                      <span className="font-semibold text-sm text-gray-600 dark:text-gray-400">
                        {dailyChallenge.mediaType === 'tv' ? 'Created by' : 'Directed by'}
                      </span>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{dailyChallenge.hints.level3.data.director}</p>
                    </div>
                  )}
                  
                  {dailyChallenge.hints.level3.data.actors && dailyChallenge.hints.level3.data.actors.length > 0 && (
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                      <span className="font-semibold text-sm text-gray-600 dark:text-gray-400">Main Cast</span>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {dailyChallenge.hints.level3.data.actors.join(', ')}
                      </p>
                    </div>
                  )}
                  
                  {dailyChallenge.hints.level3.data.tagline && (
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                      <span className="font-semibold text-sm text-gray-600 dark:text-gray-400">Tagline</span>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100 italic">
                        "{dailyChallenge.hints.level3.data.tagline}"
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Search Input */}
        {!gameState.completed && (
          <div className="mb-6 animate-fadeIn">
            <SearchBox 
              onSelect={handleGuess} 
              disabled={gameState.completed}
              placeholder="Type to search for movies or TV shows..."
            />
          </div>
        )}

        {/* Skip Button */}
        {!gameState.completed && gameState.currentHintLevel < 3 && (
          <div className="text-center mb-8 animate-fadeIn">
            <button
              onClick={handleSkip}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl transition-all transform hover:scale-105 font-medium shadow-lg"
            >
              <SkipForward className="w-5 h-5" />
              Skip to next hint
            </button>
            <p className="text-xs text-gray-500 mt-2">
              No penalty • Get more clues
            </p>
          </div>
        )}

        {/* Previous Guesses */}
        {gameState.guesses.length > 0 && (
          <div className="mt-8 animate-fadeIn">
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">Your Guesses</h3>
            <div className="space-y-3">
              {gameState.guesses.map((guess, index) => (
                <div
                  key={guess.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                    guess.correct 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700 shadow-lg shadow-green-200/50 dark:shadow-green-900/50' 
                      : 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-300 dark:border-red-700'
                  }`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg ${
                    guess.correct 
                      ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' 
                      : 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                  }`}>
                    {guess.correct ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate text-lg">
                      {guess.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      {guess.mediaType === 'tv' ? (
                        <>
                          <Tv className="w-4 h-4" />
                          TV Show
                        </>
                      ) : (
                        <>
                          <Film className="w-4 h-4" />
                          Movie
                        </>
                      )}
                    </p>
                  </div>
                  {guess.correct && (
                    <Trophy className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Countdown to next puzzle - only show for today */}
        {gameState.completed && selectedDate === today && <CountdownTimer />}
      </div>

      {/* Modals */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        gameState={gameState}
        movieTitle={dailyChallenge?.title || ''}
      />
      
      <StatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
      />
    </>
  )
}