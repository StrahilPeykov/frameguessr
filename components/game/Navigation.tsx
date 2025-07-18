'use client'

import { BarChart3, Share2, Info, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface NavigationProps {
  onStatsClick: () => void
  onShareClick: () => void
  showShareButton: boolean
}

export default function Navigation({ onStatsClick, onShareClick, showShareButton }: NavigationProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20
      setScrolled(isScrolled)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50' 
        : 'backdrop-blur-sm bg-white/60 dark:bg-gray-900/60 border-b border-transparent'
    }`}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              FrameGuessr
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onStatsClick}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all backdrop-blur-sm"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm font-medium">Stats</span>
            </button>
            
            {showShareButton && (
              <button
                onClick={onShareClick}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all backdrop-blur-sm"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-medium">Share</span>
              </button>
            )}
            
            <button className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all backdrop-blur-sm">
              <Info className="w-5 h-5" />
              <span className="text-sm font-medium">How to Play</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all backdrop-blur-sm"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200/50 dark:border-gray-800/50 py-4 backdrop-blur-md bg-white/90 dark:bg-gray-900/90">
            <div className="space-y-2">
              <button
                onClick={() => {
                  onStatsClick()
                  setShowMobileMenu(false)
                }}
                className="flex items-center gap-3 w-full px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Statistics</span>
              </button>
              
              {showShareButton && (
                <button
                  onClick={() => {
                    onShareClick()
                    setShowMobileMenu(false)
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium">Share Result</span>
                </button>
              )}
              
              <button
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 w-full px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all"
              >
                <Info className="w-5 h-5" />
                <span className="font-medium">How to Play</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}