'use client'

import { useState, useEffect } from 'react'
import { GameState, DailyChallenge, SearchResult } from '@/types/game'
import { Search, SkipForward, Check, X, Share2, BarChart3, RefreshCw } from 'lucide-react'
import ShareModal from './ShareModal'
import StatsModal from './StatsModal'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [currentImage, setCurrentImage] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)

  // Load game state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(`frameguessr-${gameState.currentDate}`)
    if (savedState) {
      setGameState(JSON.parse(savedState))
    }
    
    // Fetch today's challenge
    fetchDailyChallenge()
  }, [])

  // Save game state to localStorage
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
      
      // Set initial image based on current hint level
      if (data) {
        setCurrentImage(getImageForHintLevel(data, gameState.currentHintLevel))
      }
    } catch (error) {
      console.error('Failed to fetch daily challenge:', error)
      setError('Unable to load today\'s challenge. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getImageForHintLevel = (challenge: DailyChallenge, level: number): string => {
    switch (level) {
      case 1:
        return challenge.blurLevels.heavy
      case 2:
        return challenge.blurLevels.medium
      case 3:
        return challenge.blurLevels.light
      default:
        return challenge.imageUrl
    }
  }

  const searchMovies = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const results = await response.json()
      setSearchResults(results)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchMovies(query)
    }, 300)

    return () => clearTimeout(timeoutId)
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

    setGameState({
      ...gameState,
      attempts: newAttempts,
      guesses: [...gameState.guesses, newGuess],
      completed: isCorrect || newAttempts >= gameState.maxAttempts,
      won: isCorrect,
      currentHintLevel: newHintLevel,
    })

    // Update image for next hint level
    if (!isCorrect && dailyChallenge) {
      setCurrentImage(getImageForHintLevel(dailyChallenge, newHintLevel))
    }

    // Clear search
    setSearchQuery('')
    setSearchResults([])

    // Log to backend if authenticated
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
    if (gameState.completed || gameState.attempts >= gameState.maxAttempts) {
      return
    }

    const newHintLevel = Math.min(gameState.currentHintLevel + 1, 3)
    
    setGameState({
      ...gameState,
      currentHintLevel: newHintLevel,
    })

    if (dailyChallenge) {
      setCurrentImage(getImageForHintLevel(dailyChallenge, newHintLevel))
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
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">FrameGuessr</h1>
          <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg mb-4">
            <p className="mb-2">{error}</p>
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
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowStatsModal(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="View statistics"
            >
              <BarChart3 className="w-6 h-6" />
            </button>
            
            <h1 className="text-4xl font-bold">FrameGuessr</h1>
            
            {gameState.completed && (
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors share-button"
                aria-label="Share result"
              >
                <Share2 className="w-6 h-6" />
              </button>
            )}
            {!gameState.completed && <div className="w-10" />}
          </div>
          <p className="text-gray-600 dark:text-gray-400">Guess the movie or TV show from the still!</p>
        </div>

      {/* Game Status */}
      <div className="mb-6 text-center">
        <div className="flex justify-center gap-2 mb-2">
          {Array.from({ length: gameState.maxAttempts }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < gameState.attempts
                  ? gameState.guesses[i]?.correct
                    ? 'bg-green-500'
                    : 'bg-red-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600">
          {gameState.completed
            ? gameState.won
              ? '🎉 Congratulations!'
              : `The answer was: ${dailyChallenge?.title}`
            : `${getRemainingAttempts()} attempts remaining`}
        </p>
      </div>

      {/* Movie Still */}
      <div className="mb-8 bg-gray-900 rounded-lg overflow-hidden shadow-lg">
        <div className="relative aspect-video">
          {currentImage ? (
            <img
              src={currentImage}
              alt="Movie still"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 animate-pulse" />
          )}
          
          {/* Hint Level Indicator */}
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            Hint {gameState.currentHintLevel}/3
          </div>
        </div>
      </div>

      {/* Additional Hints */}
      {gameState.currentHintLevel >= 2 && dailyChallenge && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Additional Hints:</h3>
          <div className="space-y-1 text-sm">
            {dailyChallenge.year && <p>Year: {dailyChallenge.year}</p>}
            {gameState.currentHintLevel >= 3 && dailyChallenge.hints.level3.data.tagline && (
              <p>Tagline: "{dailyChallenge.hints.level3.data.tagline}"</p>
            )}
          </div>
        </div>
      )}

      {/* Search Input */}
      {!gameState.completed && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search for a movie or TV show..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={gameState.completed}
            />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={`${result.mediaType}-${result.id}`}
                  onClick={() => handleGuess(result)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{result.title}</p>
                      <p className="text-sm text-gray-500">
                        {result.year && `${result.year} • `}
                        {result.mediaType === 'tv' ? 'TV Show' : 'Movie'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Skip Button */}
      {!gameState.completed && gameState.currentHintLevel < 3 && (
        <div className="text-center">
          <button
            onClick={handleSkip}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            <SkipForward className="w-4 h-4" />
            Skip to next hint
          </button>
        </div>
      )}

      {/* Previous Guesses */}
      {gameState.guesses.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold mb-3">Your Guesses:</h3>
          <div className="space-y-2">
            {gameState.guesses.map((guess) => (
              <div
                key={guess.id}
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  guess.correct ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                {guess.correct ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <X className="w-5 h-5 text-red-600" />
                )}
                <span>{guess.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
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