'use client'

import { useState } from 'react'
import { X, Twitter, Copy, Check } from 'lucide-react'
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
    
    let grid = ''
    for (let i = 0; i < maxAttempts; i++) {
      if (i < gameState.guesses.length) {
        grid += gameState.guesses[i].correct ? '🟨' : '🟥'
      } else {
        grid += '⬜'
      }
    }

    const isToday = dateStr === format(new Date(), 'yyyy-MM-dd')
    const url = `frameguessr.vercel.app/day/${dateStr}`

    return `FrameGuessr ${dateStr}\n${
      gameState.won ? `Got it in ${attempts}/${maxAttempts}!` : `Failed ${attempts}/${maxAttempts}`
    }\n\n${grid}\n\n${isToday ? 'Play today:' : 'Try this challenge:'} ${url}`
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

  const handleTwitterShare = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
    window.open(tweetUrl, '_blank')
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FrameGuessr',
          text: shareText,
          url: `https://frameguessr.vercel.app/day/${gameState.currentDate}`,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-sm w-full p-6 relative border border-yellow-200/20 dark:border-yellow-700/20">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Share Your Result!</h2>
        
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 font-mono text-sm whitespace-pre-line border border-yellow-200/30 dark:border-yellow-700/30">
          {shareText}
        </div>

        <div className="space-y-2">
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
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

          <button
            onClick={handleTwitterShare}
            className="w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Twitter className="w-4 h-4" />
            Share on X
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Share...
            </button>
          )}
        </div>

        {gameState.won && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            You guessed "{movieTitle}" correctly! 🎬
          </p>
        )}
      </div>
    </div>
  )
}