'use client'

import { useState, useEffect } from 'react'
import { GameState, DailyChallenge, SearchResult } from '@/types/game'
import { Search, SkipForward, Check, X, Share2, BarChart3, RefreshCw, Eye, EyeOff, Calendar, Clock, Trophy } from 'lucide-react'
import ShareModal from './ShareModal'
import StatsModal from './StatsModal'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'
import SearchBox from './SearchBox'
import CountdownTimer from './CountdownTimer'

export default function GameBoard() {
  const [gameState, setGameState] = useState<GameState>({
    currentDate: new Date().toISOString().split('T')[0],
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

  // Load game state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(`frameguessr-${gameState.currentDate}`)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        setGameState(parsed)
      } catch (error) {
        console.error('Error parsing saved state:', error)
      }
    }
    fetchDailyChallenge()
  }, [])

  // Save game state to localStorage when it changes
  useEffect(() => {
    if (gameState.attempts > 0 || gameState.completed) {
      localStorage.setItem(
        `frameguessr-${gameState.currentDate}`,
        JSON.stringify(gameState)
      )
    }
  }, [gameState])

  const fetchDailyChallenge = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/daily')
      
      if (!response.ok) {
        throw new Error('Failed to load today\'s challenge')
      }
      
      const data = await response.json()
      setDailyChallenge(data)
    } catch (error) {
      console.error('Failed to fetch daily challenge:', error)
      setError('Unable to load today\'s challenge. Please try again.')
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
        body: JSON.stringify({ guess: newGuess }),
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
    if (showUnblurred) return ''
    
    switch (gameState.currentHintLevel) {
      case 1:
        return 'blur-[20px] brightness-75 saturate-50'
      case 2:
        return 'blur-[10px] brightness-90'
      case 3:
        return 'blur-[3px]'
      default:
        return ''
    }
  }

  const getRemainingAttempts = () => {
    return gameState.maxAttempts - gameState.attempts
  }

  const getHintText = () => {
    if (gameState.currentHintLevel === 1) return "Very blurred image"
    if (gameState.currentHintLevel === 2) return "Less blurred + basic info"
    if (gameState.currentHintLevel === 3) return "Lightly blurred + more info"
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
            <h1 className="text-4xl font-bold mb-2">FrameGuessr</h1>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-6 rounded-xl mb-4">
            <p className="mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null)
                fetchDailyChallenge()
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
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
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowStatsModal(true)}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors group"
              aria-label="View statistics"
            >
              <BarChart3 className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
            </button>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                <h1 className="text-4xl font-bold mb-1">FrameGuessr</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Daily Movie & TV Show Challenge
              </p>
            </div>
            
            {gameState.completed && (
              <button
                onClick={() => setShowShareModal(true)}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors group"
                aria-label="Share result"
              >
                <Share2 className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
              </button>
            )}
            {!gameState.completed && <div className="w-12" />}
          </div>
        </div>

        {/* Game Status */}
        <div className="mb-8 text-center">
          <div className="flex justify-center gap-3 mb-3">
            {Array.from({ length: gameState.maxAttempts }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  i < gameState.attempts
                    ? gameState.guesses[i]?.correct
                      ? 'bg-green-500 shadow-lg shadow-green-500/50'
                      : 'bg-red-500 shadow-lg shadow-red-500/50'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          <div className="space-y-2">
            {gameState.completed ? (
              <div className="text-center">
                {gameState.won ? (
                  <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                    <Trophy className="w-5 h-5" />
                    <span className="font-semibold">Congratulations!</span>
                  </div>
                ) : (
                  <div className="text-gray-600 dark:text-gray-400">
                    <p className="font-medium">The answer was:</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {dailyChallenge?.title} ({dailyChallenge?.year})
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{getRemainingAttempts()} attempts remaining</span>
              </div>
            )}
            
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>#{gameState.currentDate}</span>
            </div>
          </div>
        </div>

        {/* Movie Still */}
        <div className="mb-8 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative aspect-video">
            {dailyChallenge?.imageUrl ? (
              <>
                <img
                  src={dailyChallenge.imageUrl}
                  alt="Movie still"
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  } ${getBlurClass()}`}
                  onLoad={() => setImageLoaded(true)}
                />
                
                {/* Loading overlay */}
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-gray-600 border-t-white rounded-full animate-spin mb-4" />
                      <p className="text-white text-sm">Loading image...</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center text-white">
                  <p className="text-lg mb-2">No image available</p>
                  <p className="text-sm text-gray-400">Please try refreshing</p>
                </div>
              </div>
            )}
            
            {/* Hint Level Indicator */}
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
              <span className="hidden sm:inline">Hint </span>
              {gameState.currentHintLevel}/3
            </div>
            
            {/* Hint Description */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
              {getHintText()}
            </div>
            
            {/* Toggle Blur Button */}
            {imageLoaded && gameState.currentHintLevel < 4 && (
              <button
                onClick={() => setShowUnblurred(!showUnblurred)}
                className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/90 transition-colors"
                aria-label={showUnblurred ? 'Show blurred' : 'Show unblurred'}
              >
                {showUnblurred ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Additional Hints */}
        {gameState.currentHintLevel >= 2 && dailyChallenge && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <Trophy className="w-5 h-5" />
              Additional Hints
            </h3>
            <div className="space-y-2 text-sm">
              {dailyChallenge.year && (
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Year:</span> {dailyChallenge.year}
                </p>
              )}
              {gameState.currentHintLevel >= 3 && dailyChallenge.hints.level3.data.tagline && (
                <p className="flex items-start gap-2">
                  <span className="font-medium">Tagline:</span> 
                  <span className="italic">"{dailyChallenge.hints.level3.data.tagline}"</span>
                </p>
              )}
              {gameState.currentHintLevel >= 3 && dailyChallenge.hints.level3.data.actors && (
                <p className="flex items-start gap-2">
                  <span className="font-medium">Cast:</span>
                  <span>{dailyChallenge.hints.level3.data.actors.join(', ')}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Search Input */}
        {!gameState.completed && (
          <div className="mb-6">
            <SearchBox onSelect={handleGuess} disabled={gameState.completed} />
          </div>
        )}

        {/* Skip Button */}
        {!gameState.completed && gameState.currentHintLevel < 3 && (
          <div className="text-center mb-8">
            <button
              onClick={handleSkip}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl transition-colors font-medium"
            >
              <SkipForward className="w-4 h-4" />
              Skip to next hint
            </button>
            <p className="text-xs text-gray-500 mt-2">
              No penalty for skipping hints
            </p>
          </div>
        )}

        {/* Previous Guesses */}
        {gameState.guesses.length > 0 && (
          <div className="mt-8">
            <h3 className="font-semibold mb-4 text-lg">Your Guesses</h3>
            <div className="space-y-3">
              {gameState.guesses.map((guess, index) => (
                <div
                  key={guess.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                    guess.correct 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
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
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {guess.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Attempt #{index + 1} • {guess.mediaType === 'tv' ? 'TV Show' : 'Movie'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Countdown to next puzzle */}
        {gameState.completed && <CountdownTimer />}
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