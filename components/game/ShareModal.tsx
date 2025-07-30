'use client'

import { useState } from 'react'
import { X, Copy, Check, Share } from 'lucide-react'
import { useGameContext } from '@/contexts/GameContext'
import { isToday } from '@/utils/dateUtils'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  currentDate: string
}

export default function ShareModal({ isOpen, onClose, currentDate }: ShareModalProps) {
  const { gameState, dailyChallenge } = useGameContext()
  const [copied, setCopied] = useState(false)

  if (!isOpen || !dailyChallenge) return null

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

    const isTodayDate = isToday(dateStr)
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-stone-900 max-w-sm w-full rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Share className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              Share Your Result
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-stone-500 dark:text-stone-400" />
          </button>
        </div>

        <div className="p-4">
          {/* Preview */}
          <div className="bg-stone-100 dark:bg-stone-800 rounded-lg p-4 mb-4 font-mono text-sm whitespace-pre-line text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            {shareText}
          </div>

          {/* Share Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied to Clipboard!
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
                className="w-full flex items-center justify-center gap-2 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 px-4 py-3 rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Share className="w-4 h-4" />
                Share via...
              </button>
            )}
          </div>

          {/* Movie Title */}
          {gameState.won && dailyChallenge.title && (
            <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700 text-center">
              <p className="text-sm text-stone-600 dark:text-stone-400">
                You correctly guessed: <span className="font-medium text-stone-900 dark:text-stone-100">{dailyChallenge.title}</span>
              </p>
            </div>
          )}

          {/* Social Links */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              onClick={() => {
                const tweetText = encodeURIComponent(shareText)
                window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank')
              }}
              className="text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              aria-label="Share on Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
            
            <button
              onClick={() => {
                const facebookUrl = encodeURIComponent(`https://frameguessr.com/day/${gameState.currentDate}`)
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${facebookUrl}`, '_blank')
              }}
              className="text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              aria-label="Share on Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}