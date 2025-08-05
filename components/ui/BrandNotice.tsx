'use client'

import { useSearchParams } from 'next/navigation'
import { X, Film, Info } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function BrandNotice() {
  const searchParams = useSearchParams()
  const [show, setShow] = useState(false)
  const [hasShownBefore, setHasShownBefore] = useState(false)
  
  useEffect(() => {
    // Check if we've shown this before in this session
    const shownInSession = sessionStorage.getItem('frameguessr-brand-notice-shown')
    if (shownInSession) {
      setHasShownBefore(true)
      return
    }
    
    // Check various conditions for showing the notice
    const ref = searchParams.get('ref')
    const fromSearch = searchParams.get('utm_source') === 'google'
    const query = searchParams.get('q')
    
    // Show if:
    // 1. Coming from brand correction redirect
    // 2. Coming from Google search
    // 3. Query parameter suggests confusion (e.g., contains "free")
    if (
      ref === 'brand-correction' || 
      fromSearch || 
      (query && query.toLowerCase().includes('free'))
    ) {
      setShow(true)
      sessionStorage.setItem('frameguessr-brand-notice-shown', 'true')
    }
    
    // Also check document referrer for search engines
    if (typeof window !== 'undefined' && document.referrer) {
      const referrer = document.referrer.toLowerCase()
      if (
        referrer.includes('google.com') ||
        referrer.includes('bing.com') ||
        referrer.includes('duckduckgo.com')
      ) {
        // Check if we haven't shown it yet
        if (!shownInSession) {
          setShow(true)
          sessionStorage.setItem('frameguessr-brand-notice-shown', 'true')
        }
      }
    }
  }, [searchParams])
  
  // Auto-hide after 10 seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setShow(false)
      }, 10000)
      
      return () => clearTimeout(timer)
    }
  }, [show])
  
  if (!show || hasShownBefore) return null
  
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-fadeIn">
      <div className="cinema-glass bg-amber-50/95 dark:bg-amber-900/30 backdrop-blur-lg border border-amber-200 dark:border-amber-700 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white">Welcome to FrameGuessr!</span>
          </div>
          <button
            onClick={() => setShow(false)}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Close notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center">
              <Info className="w-4 h-4 text-amber-700 dark:text-amber-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                You've found the original <strong>FrameGuessr</strong>! 
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                The daily movie guessing game with frame-based puzzles, audio hints, and progressive clues. 
                Not affiliated with any similar-sounding games.
              </p>
              <div className="mt-2 flex items-center gap-4">
                <a 
                  href="/about"
                  className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                >
                  Learn more →
                </a>
                <button
                  onClick={() => {
                    setShow(false)
                    // Set a longer-term cookie to not show again for a while
                    localStorage.setItem('frameguessr-brand-notice-dismissed', Date.now().toString())
                  }}
                  className="text-xs text-amber-600/70 dark:text-amber-400/70 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}