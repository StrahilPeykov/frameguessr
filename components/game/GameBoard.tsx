'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { GameState, DailyChallenge, SearchResult } from '@/types/game'
import { Search, SkipForward, Check, X, Share2, BarChart3, RefreshCw, Eye, EyeOff, Calendar, Clock, Trophy, Info, Film, Tv, Star } from 'lucide-react'
import Navigation from './Navigation'
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
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

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
    setImageLoaded(false)
    setImageError(false)
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
        img.onload = () => setImageLoaded(true)
        img.onerror = () => setImageError(true)
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
    if (gameState.won || gameState.completed) return ''
    
    switch (gameState.currentHintLevel) {
      case 1:
        return 'blur-[20px] brightness-75'
      case 2:
        return 'blur-[8px] brightness-90'
      case 3:
        return 'blur-[3px]'
      default:
        return ''
    }
  }

  const getRemainingAttempts = () => {
    return gameState.maxAttempts - gameState.attempts
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <>
        <Navigation 
          onStatsClick={() => setShowStatsModal(true)}
          onShareClick={() => setShowShareModal(true)}
          showShareButton={false}
        />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-red-600 dark:text-red-400 mb-6">
                <p className="mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError(null)
                    fetchDailyChallenge(selectedDate)
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation 
        onStatsClick={() => setShowStatsModal(true)}
        onShareClick={() => setShowShareModal(true)}
        showShareButton={gameState.completed}
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto p-4">
          {/* Tagline */}
          <div className="text-center mb-6 pt-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Guess the movie or TV show from the image
            </p>
          </div>

          {/* Date Picker */}
          <div className="mb-6">
            <DatePicker 
              currentDate={selectedDate}
              onDateSelect={handleDateSelect}
              minDate="2025-07-01"
            />
          </div>

          {/* Game Status - Fixed Height Container */}
          <div className="mb-6 text-center min-h-[80px] flex flex-col justify-center">
            {/* Attempt Indicators */}
            <div className="flex justify-center gap-2 mb-3">
              {Array.from({ length: gameState.maxAttempts }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    i < gameState.attempts
                      ? gameState.guesses[i]?.correct
                        ? 'bg-green-500 scale-110'
                        : 'bg-red-500 scale-110'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            {/* Status Message */}
            <div className="space-y-2">
              {gameState.completed ? (
                <div className="animate-fadeIn">
                  {gameState.won ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                        <Trophy className="w-5 h-5" />
                        <span className="text-lg font-bold">Congratulations!</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        You got it in {gameState.attempts} {gameState.attempts === 1 ? 'guess' : 'guesses'}!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-gray-600 dark:text-gray-400 font-medium">Better luck next time!</p>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 inline-block">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">The answer was:</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
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
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{getRemainingAttempts()} {getRemainingAttempts() === 1 ? 'attempt' : 'attempts'} remaining</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Info className="w-4 h-4" />
                    <span>Hint Level {gameState.currentHintLevel}/3</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Movie Still - Fixed Aspect Ratio Container */}
          <div className="mb-6">
            <div className="relative bg-black rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
              {/* Fixed aspect ratio container */}
              <div className="relative w-full aspect-video">
                {dailyChallenge?.imageUrl && !imageError ? (
                  <>
                    <img
                      src={dailyChallenge.imageUrl}
                      alt="Movie still"
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      } ${getBlurClass()}`}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageError(true)}
                    />
                    
                    {/* Loading overlay */}
                    {!imageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                        <div className="text-center">
                          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-3" />
                          <p className="text-white text-sm">Loading...</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center text-white">
                      <Film className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm opacity-70">Image unavailable</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hints Section - Fixed Height */}
          {gameState.currentHintLevel >= 2 && dailyChallenge && (
            <div className="mb-6 min-h-[160px]">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  Hints
                </h3>
                <div className="grid gap-3">
                  {/* Level 2 Hints */}
                  {dailyChallenge.hints.level2.data.year && (
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-700 rounded-lg p-3">
                      <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-sm text-gray-600 dark:text-gray-400">Released</span>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{dailyChallenge.hints.level2.data.year}</p>
                      </div>
                    </div>
                  )}
                  
                  {dailyChallenge.hints.level2.data.genre && (
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-700 rounded-lg p-3">
                      <Film className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-sm text-gray-600 dark:text-gray-400">Genre</span>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{dailyChallenge.hints.level2.data.genre}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Level 3 Hints */}
                  {gameState.currentHintLevel >= 3 && (
                    <>
                      {dailyChallenge.hints.level3.data.actors && dailyChallenge.hints.level3.data.actors.length > 0 && (
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                          <span className="font-medium text-sm text-gray-600 dark:text-gray-400">Stars</span>
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {dailyChallenge.hints.level3.data.actors.join(', ')}
                          </p>
                        </div>
                      )}
                      
                      {dailyChallenge.hints.level3.data.director && (
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                          <span className="font-medium text-sm text-gray-600 dark:text-gray-400">
                            {dailyChallenge.mediaType === 'tv' ? 'Created by' : 'Directed by'}
                          </span>
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{dailyChallenge.hints.level3.data.director}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Search Input */}
          {!gameState.completed && (
            <div className="mb-6">
              <SearchBox 
                onSelect={handleGuess} 
                disabled={gameState.completed}
                placeholder="Search for a movie or TV show..."
              />
            </div>
          )}

          {/* Skip Button */}
          {!gameState.completed && gameState.currentHintLevel < 3 && (
            <div className="text-center mb-6">
              <button
                onClick={handleSkip}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl transition-colors border border-gray-200 dark:border-gray-700 font-medium"
              >
                <SkipForward className="w-5 h-5" />
                Skip for a hint
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                No penalty • Get more clues
              </p>
            </div>
          )}

          {/* Previous Guesses */}
          {gameState.guesses.length > 0 && (
            <div className="mt-8">
              <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">Your Guesses</h3>
              <div className="space-y-3">
                {gameState.guesses.map((guess, index) => (
                  <div
                    key={guess.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                      guess.correct 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 shadow-sm' 
                        : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      guess.correct 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {guess.correct ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
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