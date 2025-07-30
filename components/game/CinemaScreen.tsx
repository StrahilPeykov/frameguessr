'use client'

import { Film } from 'lucide-react'
import { useBlur, type HintLevel } from '@/utils/blur'
import { useGameContext } from '@/contexts/GameContext'

export default function CinemaScreen() {
  const { gameState, dailyChallenge, imageLoaded, imageError } = useGameContext()
  
  const blur = useBlur(
    gameState.currentHintLevel as HintLevel, 
    gameState.completed || gameState.won
  )

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden shadow-xl border-2 border-stone-200/20 dark:border-amber-700/30 mb-4">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-900/10 via-transparent to-amber-900/10 pointer-events-none z-10" />
      
      {/* Cinema Screen - Responsive sizing */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[28rem]">
        {dailyChallenge?.imageUrl && !imageError ? (
          <>
            <img
              src={dailyChallenge.imageUrl}
              alt={blur.description}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } ${blur.className}`}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-white/80 text-xs">Loading projection...</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
            <div className="text-center text-white/60">
              <Film className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">
                {imageError ? 'Failed to load film reel' : 'No film available'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}