'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, X, Settings } from 'lucide-react'

const COOKIE_CONSENT_KEY = 'frameguessr-cookie-consent'

// Type guard for gtag
function hasGtag(): boolean {
  return typeof window !== 'undefined' && 'gtag' in window && typeof window.gtag === 'function'
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!hasConsented) {
      // Small delay to avoid layout shift on page load
      setTimeout(() => setShowBanner(true), 2000)
    }
  }, [])

  const acceptCookies = (type: 'all' | 'necessary') => {
    const consent = {
      necessary: true,
      analytics: type === 'all',
      timestamp: Date.now(),
      version: '1.0'
    }
    
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent))
    setShowBanner(false)
    
    // Enable/disable analytics based on consent
    if (type === 'all' && hasGtag()) {
      try {
        window.gtag('consent', 'update', {
          'analytics_storage': 'granted'
        })
      } catch (error) {
        console.error('Failed to update gtag consent:', error)
      }
    }
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-fadeIn max-w-sm mx-auto sm:max-w-md sm:left-auto">
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
        {/* Compact Main Content */}
        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
              <Cookie className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-stone-800 dark:text-stone-100 text-sm mb-1">
                Cookie Settings
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                We use cookies to save your game progress locally. 
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 ml-1 underline transition-colors"
                >
                  Learn more
                </button>
              </p>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors flex-shrink-0"
              aria-label="Close cookie banner"
            >
              <X className="w-4 h-4 text-stone-500 dark:text-stone-400" />
            </button>
          </div>

          {/* Expanded Details */}
          {showDetails && (
            <div className="mb-3 p-3 bg-stone-50 dark:bg-stone-800 rounded-lg text-xs space-y-2 animate-fadeIn border border-stone-200 dark:border-stone-700">
              <div>
                <strong className="text-stone-700 dark:text-stone-300">Essential cookies:</strong>
                <span className="text-stone-600 dark:text-stone-400"> Game progress, settings, theme preference (always active)</span>
              </div>
              <div>
                <strong className="text-stone-700 dark:text-stone-300">Analytics (optional):</strong>
                <span className="text-stone-600 dark:text-stone-400"> Anonymous usage data to improve the game</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => acceptCookies('necessary')}
              className="flex-1 px-3 py-2 text-xs font-medium bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 rounded-lg transition-all duration-300 shadow-sm"
            >
              Essential Only
            </button>
            <button
              onClick={() => acceptCookies('all')}
              className="flex-1 px-3 py-2 text-xs font-medium bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
            >
              Accept All
            </button>
          </div>

          {/* Legal Links */}
          <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700 flex items-center justify-center gap-3 text-xs">
            <Link 
              href="/privacy" 
              className="text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              Privacy
            </Link>
            <span className="text-stone-300 dark:text-stone-600">•</span>
            <Link 
              href="/terms" 
              className="text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}