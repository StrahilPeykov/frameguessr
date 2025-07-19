'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Home, RefreshCw, AlertCircle } from 'lucide-react'

export default function ArchiveError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Archive error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-rose-50/20 dark:from-stone-950 dark:via-amber-950/20 dark:to-rose-950/10">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full">
          <div className="cinema-glass rounded-3xl p-8 shadow-2xl border border-stone-200/50 dark:border-stone-800/50 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold mb-3 text-stone-900 dark:text-stone-100">
              Archive Access Failed
            </h2>
            
            <p className="text-stone-600 dark:text-stone-400 mb-6">
              The film vault is temporarily unavailable. Please try again.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl cinema-btn"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
              
              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 cinema-glass hover:bg-stone-100/80 dark:hover:bg-stone-800/80 text-stone-700 dark:text-stone-200 rounded-xl transition-all duration-300 font-medium border border-amber-200/50 dark:border-amber-700/50 cinema-btn"
              >
                <Home className="w-5 h-5" />
                Return to Game
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}