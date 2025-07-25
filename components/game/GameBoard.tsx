'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GameState, DailyChallenge, SearchResult, AudioHintData } from '@/types'
import { Search, SkipForward, Check, X, Share2, BarChart3, RefreshCw, Calendar, Clock, Trophy, Film, Tv, Star, User, Sun, Moon, Menu } from 'lucide-react'
import { useBlur, type HintLevel } from '@/utils/blur'
import ShareModal from './ShareModal'
import StatsModal from './StatsModal'
import SearchBox from './SearchBox'
import DatePicker from './DatePicker'
import AudioHint from './AudioHint'
import AuthModal from '@/components/auth/AuthModal'
import UserMenu from '@/components/auth/UserMenu'
import MobileMenu from './MobileMenu'
import { useTheme } from '@/hooks/useTheme'
import { gameStorage } from '@/lib/gameStorage'

interface GameBoardProps {
  initialDate?: string
}

export default function GameBoard({ initialDate }: GameBoardProps) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const selectedDate = initialDate || today
  const audioRef = useRef<{ stopAudio: () => void } | null>(null)
  const { theme, toggleTheme } = useTheme()
  
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
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showGuesses, setShowGuesses] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle')
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const blur = useBlur(
    gameState.currentHintLevel as HintLevel, 
    gameState.completed || gameState.won
  )

  useEffect(() => {
    gameStorage.init().then(() => {
      setIsAuthenticated(gameStorage.isAuthenticated())
    })
  }, [])

  const handleDateSelect = (date: string) => {
    router.push(`/day/${date}`)
  }

  useEffect(() => {
    const loadGameState = async () => {
      const savedState = await gameStorage.loadGameState(selectedDate)
      if (savedState) {
        setGameState(savedState)
        setShowGuesses(savedState.guesses.length > 0)
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
    }

    loadGameState()
    fetchDailyChallenge(selectedDate)
    setImageLoaded(false)
    setImageError(false)
    setAudioHints(null)
  }, [selectedDate])

  useEffect(() => {
    const saveGameState = async () => {
      if (gameState.attempts > 0 || gameState.completed) {
        setSyncStatus('syncing')
        try {
          await gameStorage.saveGameState(selectedDate, gameState)
          setSyncStatus('synced')
          setTimeout(() => setSyncStatus('idle'), 2000)
        } catch (error) {
          console.error('Failed to save game state:', error)
          setSyncStatus('error')
          setTimeout(() => setSyncStatus('idle'), 3000)
        }
      }
    }

    saveGameState()
  }, [gameState, selectedDate])

  useEffect(() => {
    if (gameState.completed && audioRef.current) {
      audioRef.current.stopAudio()
    }
  }, [gameState.completed])

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

    if (audioRef.current) {
      audioRef.current.stopAudio()
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

    const newGameState = {
      ...gameState,
      attempts: newAttempts,
      guesses: [...gameState.guesses, newGuess],
      completed: isCorrect || newAttempts >= gameState.maxAttempts,
      won: isCorrect,
      currentHintLevel: newHintLevel,
    }

    setGameState(newGameState)
    setShowGuesses(true)

    try {
      await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          guess: newGuess, 
          gameState: newGameState
        }),
      })
    } catch (error) {
      console.error('Failed to log guess:', error)
    }
  }

  const handleSkip = () => {
    if (gameState.completed) {
      return
    }

    if (audioRef.current) {
      audioRef.current.stopAudio()
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

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
    setShowAuthModal(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="cinema-spinner mx-auto mb-6" />
          <h2 className="text-xl font-bold mb-2 cinema-gradient-text">Loading</h2>
          <p className="text-slate-600 dark:text-slate-400">Preparing the projection room...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="cinema-glass rounded-3xl p-8 shadow-2xl border border-stone-200/50 dark:border-stone-800/50">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100">Show Cancelled</h3>
            <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
            <button
              onClick={() => {
                setError(null)
                fetchDailyChallenge(selectedDate)
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl cinema-btn"
            >
              <RefreshCw className="w-5 h-5" />
              Restart Projection
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 cinema-nav-blur bg-white/80 dark:bg-stone-950/80 border-b border-stone-200/30 dark:border-amber-900/30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Date (Desktop) */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-red-700 flex items-center justify-center">
                  <Film className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold cinema-gradient-title">
                  FrameGuessr
                </h1>
              </Link>
              
              {/* Desktop Date Picker */}
              <div className="hidden md:block">
                <DatePicker 
                  currentDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  compact
                />
              </div>
              
              {/* Sync Status */}
              {isAuthenticated && syncStatus !== 'idle' && (
                <div className="hidden sm:flex items-center gap-2">
                  {syncStatus === 'syncing' && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                      <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Syncing...</span>
                    </div>
                  )}
                  {syncStatus === 'synced' && (
                    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <Check className="w-3 h-3" />
                      <span>Synced</span>
                    </div>
                  )}
                  {syncStatus === 'error' && (
                    <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                      <X className="w-3 h-3" />
                      <span>Sync failed</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Right side - Desktop Controls */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2.5 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800/50 rounded-xl transition-all duration-300 cinema-touch"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              
              <button
                onClick={() => setShowStatsModal(true)}
                className="p-2.5 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800/50 rounded-xl transition-all duration-300 cinema-touch"
                aria-label="View statistics"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              
              {gameState.completed && (
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2.5 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800/50 rounded-xl transition-all duration-300 cinema-touch"
                  aria-label="Share result"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              )}
              
              {isAuthenticated ? (
                <div className="hidden md:block">
                  <UserMenu onStatsClick={() => setShowStatsModal(true)} />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowAuthModal(true)
                      setAuthModalMode('signin')
                    }}
                    className="px-3 py-2 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg font-medium transition-colors text-sm"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setShowAuthModal(true)
                      setAuthModalMode('signup')
                    }}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Mobile controls */}
            <div className="flex md:hidden items-center gap-2">
              {/* Mobile Date Picker */}
              <DatePicker 
                currentDate={selectedDate}
                onDateSelect={handleDateSelect}
                mobile
              />
              
              {/* Hamburger Menu Button */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className="p-2.5 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800/50 rounded-xl transition-all duration-300 cinema-touch"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        theme={theme}
        onThemeToggle={toggleTheme}
        isAuthenticated={isAuthenticated}
        gameCompleted={gameState.completed}
        syncStatus={syncStatus}
        onStatsClick={() => {
          setShowMobileMenu(false)
          setShowStatsModal(true)
        }}
        onShareClick={() => {
          setShowMobileMenu(false)
          setShowShareModal(true)
        }}
        onSignInClick={() => {
          setShowMobileMenu(false)
          setShowAuthModal(true)
          setAuthModalMode('signin')
        }}
        onSignUpClick={() => {
          setShowMobileMenu(false)
          setShowAuthModal(true)
          setAuthModalMode('signup')
        }}
      />

      {/* Optimized Single Column Layout */}
      <div className="min-h-screen pt-16 pb-6">
        <div className="max-w-4xl mx-auto px-4 py-4">
          
          {/* Game Progress Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="flex gap-3">
                {Array.from({ length: gameState.maxAttempts }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full transition-all duration-500 ${
                      i < gameState.attempts
                        ? gameState.guesses[i]?.correct
                          ? 'cinema-status-correct animate-cinema-success'
                          : 'cinema-status-incorrect animate-cinema-error'
                        : 'cinema-status-pending'
                    }`}
                  />
                ))}
              </div>
              
              <div className="px-3 py-1 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700">
                Scene {gameState.currentHintLevel}/3
              </div>
            </div>
            
            {gameState.completed && (
              <div className="text-right">
                {gameState.won ? (
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                    <Trophy className="w-5 h-5" />
                    <span className="hidden sm:inline">Standing Ovation!</span>
                    <span className="sm:hidden">Won!</span>
                  </div>
                ) : (
                  <div className="text-red-600 dark:text-red-400 font-medium">
                    <span className="hidden sm:inline">The Credits Roll</span>
                    <span className="sm:hidden">Game Over</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Smart Cinema Screen - Bigger but Smart */}
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-xl border-2 border-stone-200/20 dark:border-amber-700/30 mb-4">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-900/10 via-transparent to-amber-900/10 pointer-events-none z-10" />
            
            {/* Better image sizing - takes up more space but leaves room */}
            <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[28rem]">
              {dailyChallenge?.imageUrl && !imageError ? (
                <>
                  <img
                    src={dailyChallenge.imageUrl}
                    alt={blur.description}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    } ${blur.className}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-2" />
                        <p className="text-white/80 text-xs">Loading...</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                  <div className="text-center text-white/60">
                    <Film className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">No film available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Compact Cinema Audio Player */}
          {audioHints && (
            <div className="mb-4">
              <AudioHint
                ref={audioRef}
                previewUrl={audioHints.track.streamUrl || audioHints.track.previewUrl}
                duration={gameState.completed ? 15 : audioHints.durations[`level${gameState.currentHintLevel}` as keyof typeof audioHints.durations]}
                trackTitle={audioHints.track.title}
                artistName={audioHints.track.artist}
                hintLevel={gameState.currentHintLevel}
                gameCompleted={gameState.completed}
              />
            </div>
          )}

          {audioLoading && (
            <div className="mb-4">
              <div className="cinema-glass rounded-xl p-4 border border-stone-200/30 dark:border-amber-700/30">
                <div className="flex items-center gap-3">
                  <div className="cinema-spinner" />
                  <div className="flex-1">
                    <div className="h-4 bg-amber-800/30 rounded mb-2 skeleton" />
                    <div className="h-3 bg-amber-800/20 rounded w-2/3 skeleton" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compact Inline Hints */}
          {(gameState.currentHintLevel >= 2 || gameState.completed) && dailyChallenge && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-2 text-sm">
                {/* Tagline */}
                {gameState.currentHintLevel >= 2 && dailyChallenge.hints.level2.data.tagline && (
                  <div className="cinema-glass rounded-lg px-3 py-1.5 border border-stone-200/30 dark:border-amber-700/30">
                    <span className="text-stone-500 dark:text-stone-400 text-xs">Quote:</span>
                    <span className="text-stone-700 dark:text-stone-300 italic ml-2">
                      "{dailyChallenge.hints.level2.data.tagline}"
                    </span>
                  </div>
                )}

                {/* Year & Genre - Inline */}
                {gameState.currentHintLevel >= 3 && (
                  <div className="flex gap-2">
                    {dailyChallenge.hints.level3.data.year && (
                      <div className="cinema-glass rounded-lg px-3 py-1.5 border border-stone-200/30 dark:border-amber-700/30">
                        <span className="text-stone-500 dark:text-stone-400 text-xs mr-1">Year:</span>
                        <span className="text-stone-700 dark:text-stone-300 font-medium">
                          {dailyChallenge.hints.level3.data.year}
                        </span>
                      </div>
                    )}
                    
                    {dailyChallenge.hints.level3.data.genre && (
                      <div className="cinema-glass rounded-lg px-3 py-1.5 border border-stone-200/30 dark:border-amber-700/30">
                        <span className="text-stone-500 dark:text-stone-400 text-xs mr-1">Genre:</span>
                        <span className="text-stone-700 dark:text-stone-300 font-medium">
                          {dailyChallenge.hints.level3.data.genre}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Compact Game Controls */}
          {!gameState.completed ? (
            <div className="space-y-3 mb-6">
              <SearchBox 
                onSelect={handleGuess} 
                disabled={gameState.completed}
                placeholder="Search for the movie or show..."
              />
              
              <button
                onClick={handleSkip}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 cinema-glass hover:bg-stone-100/80 dark:hover:bg-stone-800/80 text-stone-700 dark:text-stone-200 rounded-xl transition-all duration-300 border border-stone-200/50 dark:border-amber-700/50 font-medium cinema-btn group"
              >
                <SkipForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                Skip to Next Scene
              </button>
            </div>
          ) : (
            <div className="cinema-glass rounded-3xl p-8 text-center mb-8 shadow-xl border border-stone-200/50 dark:border-stone-800/50">
              {gameState.won ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Trophy className="w-10 h-10 text-white animate-cinema-trophy" />
                  </div>
                  <h3 className="text-3xl font-bold mb-3 cinema-gradient-text">Bravo!</h3>
                  <p className="text-stone-600 dark:text-stone-400 text-lg mb-2">
                    You identified <span className="font-bold text-stone-900 dark:text-stone-100">"{dailyChallenge?.title}"</span>
                  </p>
                  <p className="text-sm text-stone-500 dark:text-stone-500">
                    Solved in {gameState.attempts} {gameState.attempts === 1 ? 'guess' : 'guesses'}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto mb-4">
                    <X className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold mb-3 text-stone-900 dark:text-stone-100">Final Credits</h3>
                  <p className="text-stone-600 dark:text-stone-400 text-lg mb-4">The answer was:</p>
                  <div className="cinema-glass bg-stone-100 dark:bg-stone-800 rounded-2xl px-6 py-4 inline-block">
                    <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{dailyChallenge?.title}</p>
                    <p className="text-sm text-stone-500 dark:text-stone-400 flex items-center justify-center gap-2 mt-2">
                      {dailyChallenge?.mediaType === 'tv' ? <Tv className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                      {dailyChallenge?.year}
                    </p>
                  </div>
                </>
              )}

              {dailyChallenge?.details && (
                <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-700">
                  <div className="text-left space-y-4">
                    {dailyChallenge.details.tagline && (
                      <div>
                        <h4 className="font-semibold text-stone-700 dark:text-stone-300 mb-1">Tagline</h4>
                        <p className="text-stone-600 dark:text-stone-400 italic">"{dailyChallenge.details.tagline}"</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dailyChallenge.details.director && (
                        <div>
                          <h4 className="font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            Director
                          </h4>
                          <p className="text-stone-600 dark:text-stone-400">{dailyChallenge.details.director}</p>
                        </div>
                      )}
                      
                      {dailyChallenge.details.genre && (
                        <div>
                          <h4 className="font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                            <Film className="w-4 h-4" />
                            Genre
                          </h4>
                          <p className="text-stone-600 dark:text-stone-400">{dailyChallenge.details.genre}</p>
                        </div>
                      )}
                    </div>

                    {dailyChallenge.details.actors && dailyChallenge.details.actors.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Cast
                        </h4>
                        <p className="text-stone-600 dark:text-stone-400">
                          {dailyChallenge.details.actors.slice(0, 3).join(', ')}
                        </p>
                      </div>
                    )}

                    {dailyChallenge.details.overview && (
                      <div>
                        <h4 className="font-semibold text-stone-700 dark:text-stone-300 mb-1">Overview</h4>
                        <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                          {dailyChallenge.details.overview}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {selectedDate === today && (
                <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-700">
                  <div className="text-sm text-stone-500 dark:text-stone-400 flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    Next show starts in: <CountdownTimer />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Guess History */}
          {gameState.guesses.length > 0 && (
            <div className="cinema-glass rounded-2xl p-6 border border-stone-200/50 dark:border-stone-800/50">
              <button
                onClick={() => setShowGuesses(!showGuesses)}
                className="flex items-center justify-between w-full text-left mb-4 group"
              >
                <h3 className="text-lg font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                  <Film className="w-5 h-5 text-amber-600" />
                  Your Guesses ({gameState.guesses.length})
                </h3>
                <div className={`w-5 h-5 text-stone-500 transition-transform duration-300 ${showGuesses ? 'rotate-90' : ''} group-hover:text-amber-600`}>
                  →
                </div>
              </button>
              
              {showGuesses && (
                <div className="space-y-3">
                  {gameState.guesses.map((guess, index) => (
                    <div
                      key={guess.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 cinema-touch ${
                        guess.correct 
                          ? 'bg-amber-50/80 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700' 
                          : 'bg-red-50/80 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                      } shadow-sm`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-700 text-sm font-bold text-stone-600 dark:text-stone-300">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-stone-900 dark:text-stone-100 truncate text-base">
                          {guess.title}
                        </p>
                        <p className="text-sm text-stone-600 dark:text-stone-400 flex items-center gap-1.5 mt-1">
                          {guess.mediaType === 'tv' ? <Tv className="w-3.5 h-3.5" /> : <Film className="w-3.5 h-3.5" />}
                          {guess.mediaType === 'tv' ? 'TV Series' : 'Feature Film'}
                        </p>
                      </div>
                      <div className={`p-2 rounded-full ${
                        guess.correct ? 'bg-amber-200 dark:bg-amber-800' : 'bg-red-200 dark:bg-red-800'
                      }`}>
                        {guess.correct ? (
                          <Check className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                        ) : (
                          <X className="w-5 h-5 text-red-700 dark:text-red-300" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />

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

  return <span className="font-mono text-amber-600 dark:text-amber-400">{timeLeft}</span>
}