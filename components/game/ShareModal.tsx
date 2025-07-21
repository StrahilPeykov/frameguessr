// components/game/ShareModal.tsx
'use client'

import { useState } from 'react'
import { X, Copy, Check, Share } from 'lucide-react'
import { GameState } from '@/types/game'
import { format } from 'date-fns'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  gameState: GameState
  movieTitle: string
}

export default function ShareModal({ isOpen, onClose, gameState, movieTitle }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const generateShareText = () => {
    const dateStr = gameState.currentDate
    const attempts = gameState.attempts
    const maxAttempts = gameState.maxAttempts
    
    // Simple emojis for results
    let grid = ''
    for (let i = 0; i < maxAttempts; i++) {
      if (i < gameState.guesses.length) {
        grid += gameState.guesses[i].correct ? '🟩' : '🟥'
      } else {
        grid += '⬜'
      }
    }

    const isToday = dateStr === format(new Date(), 'yyyy-MM-dd')
    const url = `frameguessr.com/day/${dateStr}`

    return `FrameGuessr ${dateStr}
${gameState.won ? `Solved in ${attempts}/${maxAttempts}!` : `${attempts}/${maxAttempts}`}

${grid}

${url}`
  }

  const shareText = generateShareText()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FrameGuessr',
          text: shareText,
          url: `https://frameguessr.com/day/${gameState.currentDate}`,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-stone-900 max-w-sm w-full rounded-xl shadow-xl border border-stone-200 dark:border-stone-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-3">
            <Share className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              Share Result
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Preview */}
          <div className="bg-stone-100 dark:bg-stone-800 rounded-lg p-3 mb-4 font-mono text-sm whitespace-pre-line text-stone-700 dark:text-stone-300">
            {shareText}
          </div>

          {/* Share Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-3 rounded-lg font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy to Clipboard
                </>
              )}
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-2 border border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 px-4 py-3 rounded-lg font-medium"
              >
                <Share className="w-4 h-4" />
                Share
              </button>
            )}
          </div>

          {/* Movie Title */}
          {gameState.won && movieTitle && (
            <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700 text-center">
              <p className="text-sm text-stone-600 dark:text-stone-400">
                Today's movie: <span className="font-medium text-stone-900 dark:text-stone-100">{movieTitle}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}