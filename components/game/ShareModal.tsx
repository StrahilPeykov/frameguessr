'use client'

import { useState } from 'react'
import { X, Twitter, Copy, Check, Share, Film, Sparkles, Award } from 'lucide-react'
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
    
    // Cinema-themed emojis for results
    let grid = ''
    for (let i = 0; i < maxAttempts; i++) {
      if (i < gameState.guesses.length) {
        grid += gameState.guesses[i].correct ? '🎬' : '🎭'
      } else {
        grid += '🎪'
      }
    }

    const isToday = dateStr === format(new Date(), 'yyyy-MM-dd')
    const url = `frameguessr.vercel.app/day/${dateStr}`

    return `🎬 FrameGuessr ${dateStr}
${gameState.won ? `🏆 Solved in ${attempts}/${maxAttempts} guesses!` : `🎭 Final curtain ${attempts}/${maxAttempts}`}

${grid}

${isToday ? '🎥 Tonight\'s feature:' : '🎞️ Catch this classic:'} ${url}

#FrameGuessr #MovieGame #Cinema`
  }

  const shareText = generateShareText()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
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
          title: 'FrameGuessr - Cinema Challenge',
          text: shareText,
          url: `https://frameguessr.vercel.app/day/${gameState.currentDate}`,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="cinema-glass max-w-md w-full rounded-3xl shadow-2xl border border-amber-200/30 dark:border-amber-700/30 overflow-hidden">
        {/* Theater Header */}
        <div className="bg-gradient-to-r from-amber-900 via-red-900 to-amber-900 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 via-red-400/10 to-amber-400/10 animate-marquee" />
          
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-amber-200 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 cinema-touch"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
              {gameState.won ? (
                <Award className="w-6 h-6 text-white" />
              ) : (
                <Film className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Share Your Performance</h2>
              <p className="text-amber-200 text-sm">
                {gameState.won ? 'Outstanding performance!' : 'Better luck next show'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Cinema Preview */}
          <div className="bg-stone-100 dark:bg-stone-800 rounded-2xl p-4 mb-6 font-mono text-sm whitespace-pre-line border border-amber-200/30 dark:border-amber-700/30 shadow-inner">
            <div className="text-stone-700 dark:text-stone-300">
              {shareText}
            </div>
          </div>

          {/* Share Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-4 rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-xl cinema-btn group"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Copy to Clipboard
                </>
              )}
            </button>

            <button
              onClick={handleTwitterShare}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-slate-800 to-black hover:from-slate-700 hover:to-slate-900 text-white px-6 py-4 rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-xl cinema-btn group"
            >
              <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Share on X (Twitter)
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-3 cinema-glass hover:bg-stone-100/80 dark:hover:bg-stone-700/80 text-stone-700 dark:text-stone-200 px-6 py-4 rounded-2xl transition-all duration-300 font-bold border border-amber-200/50 dark:border-amber-700/50 cinema-btn group"
              >
                <Share className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Share with Others
              </button>
            )}
          </div>

          {/* Movie Credit */}
          {gameState.won && movieTitle && (
            <div className="mt-6 pt-6 border-t border-stone-200 dark:border-stone-700">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">Featured Film</span>
                  <Sparkles className="w-4 h-4" />
                </div>
                <p className="text-stone-600 dark:text-stone-400 text-sm">
                  You correctly identified <span className="font-bold text-stone-900 dark:text-stone-100">"{movieTitle}"</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Theater Footer */}
        <div className="bg-gradient-to-r from-stone-100 to-amber-50 dark:from-stone-800 dark:to-amber-900/20 p-4 text-center border-t border-stone-200/50 dark:border-stone-700/50">
          <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center justify-center gap-2">
            <Film className="w-3 h-3" />
            FrameGuessr - Daily Cinema Challenge
            <Film className="w-3 h-3" />
          </p>
        </div>
      </div>
    </div>
  )
}