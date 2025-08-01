'use client'

import { useRef, useEffect } from 'react'
import { RefreshCw, X, SkipForward } from 'lucide-react'
import { useGameContext } from '@/contexts/GameContext'
import GameProgress from './GameProgress'
import CinemaScreen from './CinemaScreen'
import HintsPanel from './HintsPanel'
import GameControls from './GameControls'
import CompletionScreen from './CompletionScreen'
import GuessHistory from './GuessHistory'
import AudioHint from '@/components/game/AudioHint'

interface GameContentProps {
  currentDate: string
}

export default function GameContent({ currentDate }: GameContentProps) {
  const { 
    gameState, 
    isChallengeLoading, 
    challengeError, 
    retryChallenge,
    audioHints,
    audioLoading,
    setAudioRef,
    stopAudio,
    skipHint
  } = useGameContext()

  const audioRef = useRef<{ stopAudio: () => void } | null>(null)

  // Set audio ref for the context
  useEffect(() => {
    setAudioRef(audioRef.current)
  }, [setAudioRef])

  // Stop audio when game is completed
  useEffect(() => {
    if (gameState.completed && audioRef.current) {
      audioRef.current.stopAudio()
    }
  }, [gameState.completed])

  const handleSkip = () => {
    if (gameState.completed) return
    
    // Stop audio when skipping
    stopAudio()
    
    skipHint()
  }

  // Loading state
  if (isChallengeLoading) {
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

  // Error state
  if (challengeError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="cinema-glass rounded-3xl p-8 shadow-2xl border border-stone-200/50 dark:border-stone-800/50">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100">Show Cancelled</h3>
            <p className="text-red-600 dark:text-red-400 mb-6">{challengeError}</p>
            <button
              onClick={retryChallenge}
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
    <div className="min-h-screen pt-16 pb-6">
      <div className="max-w-5xl mx-auto px-4 py-4">
        
        {/* Game Progress Header - Full width for consistency */}
        <GameProgress />

        {/* Main Game Area */}
        <div className="space-y-4">
          {/* Cinema Screen - Hero element, stays prominent */}
          <CinemaScreen />

          {/* Secondary Elements Container - Narrower on desktop */}
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Compact Cinema Audio Player - Visually secondary */}
            {audioHints && (
              <div className="transform scale-95 md:scale-100 transition-transform">
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
              <div className="transform scale-95 md:scale-100 transition-transform">
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
            <HintsPanel />
          </div>

          {/* Game Controls - Centered with max width */}
          <div className="max-w-2xl mx-auto">
            <GameControls />
          </div>

          {/* Skip Button - Now floating/contextual instead of full-width */}
          {!gameState.completed && (
            <div className="flex justify-center">
              <button
                onClick={handleSkip}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm cinema-glass hover:bg-stone-100/80 dark:hover:bg-stone-800/80 text-stone-600 dark:text-stone-400 rounded-lg transition-all duration-300 border border-stone-200/30 dark:border-amber-700/30 font-medium cinema-btn group"
              >
                <SkipForward className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                Skip to Next Scene
              </button>
            </div>
          )}
        </div>

        {/* Completion Screen - Full width for impact */}
        <CompletionScreen currentDate={currentDate} />

        {/* Guess History - Narrower for better readability */}
        <div className="max-w-2xl mx-auto">
          <GuessHistory />
        </div>
      </div>
    </div>
  )
}