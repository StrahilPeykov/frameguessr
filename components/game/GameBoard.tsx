'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GameState, DailyChallenge, SearchResult, AudioHintData } from '@/types/game'
import { Search, SkipForward, Check, X, Share2, BarChart3, RefreshCw, Calendar, Clock, Trophy, Film, Tv, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import ShareModal from './ShareModal'
import StatsModal from './StatsModal'
import SearchBox from './SearchBox'
import DatePicker from './DatePicker'
import AudioHint from './AudioHint'

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
  const [audioHints, setAudioHints] = useState<AudioHintData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [audioLoading, setAudioLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showGuesses, setShowGuesses] = useState(false)

  // Handle date selection
  const handleDateSelect = (date: string) => {
    router.push(`/day/${date}`)
  }

  // Load game state
  useEffect(() => {
    const savedState = localStorage.getItem(`frameguessr-${selectedDate}`)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        setGameState(parsed)
        setShowGuesses(parsed.guesses.length > 0)
      } catch (error) {
        console.error('Error parsing saved state:', error)
      }
    } else {
      setGameState({
        currentDate: selectedDate,
        attempts: 0,
        maxAttempts: 3,
        guesses: [],
        completed: false,
        won: false,
        currentHintLevel: 1,
      })
      setShowGuesses(false)
    }
    fetchDailyChallenge(selectedDate)
    setImageLoaded(false)
    setImageError(false)
    setAudioHints(null)
  }, [selectedDate])

  // Save game state
  useEffect(() => {
    if (gameState.attempts > 0 || gameState.completed) {
      localStorage.setItem(
        `frameguessr-${selectedDate}`,
        JSON.stringify(gameState)
      )
    }
  }, [gameState, selectedDate])

  // Fetch audio hints using Deezer track ID
  const fetchAudioHints = async (trackId: number) => {
    try {
      setAudioLoading(true)
      console.log(`[GameBoard] Fetching audio for track ID: ${trackId}`)
      
      const response = await fetch(`/api/audio/${trackId}`)
      
      console.log(`[GameBoard] Audio API response status: ${response.status}`)
      
      if (response.ok) {
        const audioData = await response.json()
        setAudioHints(audioData)
        console.log('[GameBoard] Audio hints loaded:', audioData.track.title)
      } else {
        const errorData = await response.text()
        console.error(`[GameBoard] Audio API error ${response.status}:`, errorData)
        console.log(`[GameBoard] No audio hints available for track ID: ${trackId}`)
        setAudioHints(null)
      }
    } catch (error) {
      console.error('[GameBoard] Failed to fetch audio hints:', error)
      setAudioHints(null)
    } finally {
      setAudioLoading(false)
    }
  }

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
      
      // Fetch audio hints if Deezer track ID is available
      if (data.deezerTrackId) {
        fetchAudioHints(data.deezerTrackId)
      } else {
        setAudioHints(null)
      }
      
      if (data.imageUrl) {
        const img = new Image()
        img.onload = () => setImageLoaded(true)
        img.onerror = () => setImageError(true)
        img.src = data.imageUrl
      }
    } catch (error) {
      console.error('Failed to fetch daily challenge:', error)
      setError(error instanceof Error ? error.message : 'Unable to load the challenge')
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

    setShowGuesses(true)

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

    const newAttempts = gameState.attempts + 1
    const newHintLevel = Math.min(newAttempts + 1, 3)

    setGameState(prev => ({
      ...prev,
      attempts: newAttempts,
      currentHintLevel: newHintLevel,
      completed: newAttempts >= gameState.maxAttempts,
    }))
  }

  const getBlurClass = () => {
    if (gameState.won || gameState.completed) return ''
    
    switch (gameState.currentHintLevel) {
      case 1:
        return 'blur-xl brightness-75'
      case 2:
        return 'blur-md brightness-90'
      case 3:
        return 'blur-sm'
      default:
        return ''
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading challenge...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
            <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
            <button
              onClick={() => {
                setError(null)
                fetchDailyChallenge(selectedDate)
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
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
      {/* Compact Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                FrameGuessr
              </h1>
              <DatePicker 
                currentDate={selectedDate}
                onDateSelect={handleDateSelect}
                compact
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStatsModal(true)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="View statistics"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              {gameState.completed && (
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Share result"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Game Area - Centralized Layout */}
      <div className="min-h-screen pt-14 pb-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-3xl mx-auto px-4">
          {/* Compact Game Header */}
          <div className="flex items-center justify-between mb-4 mt-4">
            <div className="flex items-center gap-4">
              {/* Attempt dots */}
              <div className="flex gap-2">
                {Array.from({ length: gameState.maxAttempts }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                      i < gameState.attempts
                        ? gameState.guesses[i]?.correct
                          ? 'bg-green-500 scale-110 shadow-lg shadow-green-500/50'
                          : 'bg-red-500 scale-110 shadow-lg shadow-red-500/50'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Hint {gameState.currentHintLevel}/3
              </span>
            </div>
            
            {gameState.completed && (
              <div className="text-sm font-medium">
                {gameState.won ? (
                  <span className="text-green-600 dark:text-green-400 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" />
                    Won in {gameState.attempts}!
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">Game Over</span>
                )}
              </div>
            )}
          </div>

          {/* Movie Still with integrated hints */}
          <div className="relative mb-4">
            <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
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
                    {!imageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <Film className="w-12 h-12 text-gray-600" />
                  </div>
                )}
              </div>
              
              {/* Overlay hints on image when available */}
              {gameState.currentHintLevel >= 2 && dailyChallenge && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                  <div className="flex flex-wrap gap-3 text-white">
                    {dailyChallenge.hints.level2.data.year && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="font-medium">{dailyChallenge.hints.level2.data.year}</span>
                      </div>
                    )}
                    {dailyChallenge.hints.level2.data.genre && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <Film className="w-3.5 h-3.5" />
                        <span className="font-medium">{dailyChallenge.hints.level2.data.genre}</span>
                      </div>
                    )}
                    {gameState.currentHintLevel >= 3 && (
                      <>
                        {dailyChallenge.hints.level3.data.director && (
                          <div className="flex items-center gap-1.5 text-sm">
                            <Star className="w-3.5 h-3.5" />
                            <span className="font-medium">{dailyChallenge.hints.level3.data.director}</span>
                          </div>
                        )}
                        {dailyChallenge.hints.level3.data.actors && dailyChallenge.hints.level3.data.actors.length > 0 && (
                          <div className="text-sm">
                            <span className="opacity-75">Stars:</span> <span className="font-medium">{dailyChallenge.hints.level3.data.actors.slice(0, 2).join(', ')}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Audio Hint Section - Improved */}
          {audioHints && (
            <div className="mb-4">
              <AudioHint
                previewUrl={audioHints.track.previewUrl}
                duration={audioHints.durations[`level${gameState.currentHintLevel}` as keyof typeof audioHints.durations]}
                trackTitle={audioHints.track.title}
                artistName={audioHints.track.artist}
                hintLevel={gameState.currentHintLevel}
              />
            </div>
          )}

          {/* Loading state for audio - Simplified */}
          {audioLoading && (
            <div className="mb-4 bg-gray-900/90 backdrop-blur-sm rounded-xl p-4 text-white animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded mb-2" />
                  <div className="h-3 bg-gray-700 rounded w-2/3" />
                </div>
              </div>
            </div>
          )}

          {/* Game Controls */}
          {!gameState.completed ? (
            <div className="space-y-3 mb-6">
              <SearchBox 
                onSelect={handleGuess} 
                disabled={gameState.completed}
                placeholder="Search for a movie or TV show..."
              />
              
              {gameState.currentHintLevel < 3 && (
                <button
                  onClick={handleSkip}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-700/90 text-gray-700 dark:text-gray-200 rounded-xl transition-all border border-gray-200/50 dark:border-gray-700/50 font-medium"
                >
                  <SkipForward className="w-5 h-5" />
                  Skip for more hints
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 text-center mb-6">
              {gameState.won ? (
                <>
                  <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-3 animate-bounce" />
                  <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    You guessed <span className="font-bold text-gray-900 dark:text-gray-100">"{dailyChallenge?.title}"</span> correctly!
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    {gameState.attempts} {gameState.attempts === 1 ? 'guess' : 'guesses'}
                  </p>
                </>
              ) : (
                <>
                  <X className="w-16 h-16 text-red-500 mx-auto mb-3" />
                  <h3 className="text-2xl font-bold mb-2">Game Over</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">The answer was:</p>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 inline-block">
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{dailyChallenge?.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2 mt-1">
                      {dailyChallenge?.mediaType === 'tv' ? <Tv className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                      {dailyChallenge?.year}
                    </p>
                  </div>
                </>
              )}
              
              {selectedDate === today && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Next puzzle in: <CountdownTimer />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Previous Guesses - Collapsible on mobile */}
          {gameState.guesses.length > 0 && (
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4">
              <button
                onClick={() => setShowGuesses(!showGuesses)}
                className="flex items-center justify-between w-full text-left mb-3"
              >
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Your Guesses ({gameState.guesses.length})
                </h3>
                <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${showGuesses ? 'rotate-90' : ''}`} />
              </button>
              
              {showGuesses && (
                <div className="space-y-2">
                  {gameState.guesses.map((guess, index) => (
                    <div
                      key={guess.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border backdrop-blur-sm transition-all ${
                        guess.correct 
                          ? 'bg-green-50/80 dark:bg-green-900/20 border-green-300 dark:border-green-700' 
                          : 'bg-red-50/80 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                      }`}
                    >
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {guess.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          {guess.mediaType === 'tv' ? <Tv className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                          {guess.mediaType === 'tv' ? 'TV Show' : 'Movie'}
                        </p>
                      </div>
                      {guess.correct ? (
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
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

// Inline CountdownTimer component
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      const difference = tomorrow.getTime() - now.getTime()
      
      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)
      
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    setTimeLeft(calculateTimeLeft())

    return () => clearInterval(timer)
  }, [])

  return <span className="font-mono">{timeLeft}</span>
}