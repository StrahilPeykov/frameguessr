'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, X, Shield, Info } from 'lucide-react'

const COOKIE_CONSENT_KEY = 'frameguessr-cookie-consent'

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!hasConsented) {
      // Small delay to avoid layout shift on page load
      setTimeout(() => setShowBanner(true), 1000)
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
    if (type === 'all' && typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      })
    }
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-fadeIn">
      <div className="max-w-6xl mx-auto">
        <div className="cinema-glass rounded-2xl shadow-2xl border border-stone-200/30 dark:border-amber-700/30 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 px-6 py-4 border-b border-stone-200/30 dark:border-stone-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Cookie className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">
                  Cookie Settings
                </h3>
              </div>
              <button
                onClick={() => setShowBanner(false)}
                className="p-2 hover:bg-white/20 dark:hover:bg-black/20 rounded-lg transition-colors cinema-touch"
                aria-label="Close cookie banner"
              >
                <X className="w-5 h-5 text-stone-600 dark:text-stone-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 bg-white/95 dark:bg-stone-950/95">
            <p className="text-stone-700 dark:text-stone-300 mb-4">
              We use cookies to save your game progress and improve your experience. 
              Your data stays in your browser and is never sent to our servers.
            </p>

            {/* Cookie Types */}
            <div className="space-y-3 mb-6">
              {/* Necessary Cookies */}
              <div className="flex items-start gap-3 p-3 bg-stone-50 dark:bg-stone-900/50 rounded-xl">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-stone-800 dark:text-stone-200 text-sm">
                    Necessary Cookies (Always Active)
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                    Essential for game functionality. Stores your progress, theme preference, and game statistics locally.
                  </p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start gap-3 p-3 bg-stone-50 dark:bg-stone-900/50 rounded-xl">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-stone-800 dark:text-stone-200 text-sm">
                    Analytics Cookies (Optional)
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                    Help us understand how players use FrameGuessr to improve the game. No personal data is collected.
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Information Toggle */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium mb-4 transition-colors"
            >
              {showDetails ? 'Hide' : 'Show'} Cookie Details
            </button>

            {showDetails && (
              <div className="mb-6 p-4 bg-stone-100 dark:bg-stone-800 rounded-xl text-sm">
                <h5 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">
                  What we store locally:
                </h5>
                <ul className="space-y-1 text-stone-600 dark:text-stone-400 text-xs">
                  <li>• Game progress for each day (localStorage)</li>
                  <li>• Your game statistics and streaks (localStorage)</li>
                  <li>• Theme preference - light/dark mode (localStorage)</li>
                  <li>• Audio volume settings (localStorage)</li>
                  <li>• Cookie consent preferences (localStorage)</li>
                </ul>
                <p className="mt-3 text-xs text-stone-500 dark:text-stone-500">
                  All data is stored in your browser only. We cannot access this data.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => acceptCookies('necessary')}
                className="flex-1 px-6 py-3 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 rounded-xl font-semibold transition-all duration-300 cinema-btn"
              >
                Accept Necessary Only
              </button>
              <button
                onClick={() => acceptCookies('all')}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl cinema-btn"
              >
                Accept All Cookies
              </button>
            </div>

            {/* Links */}
            <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700 flex items-center justify-center gap-4 text-xs">
              <Link 
                href="/privacy" 
                className="text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-stone-300 dark:text-stone-600">•</span>
              <Link 
                href="/terms" 
                className="text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}