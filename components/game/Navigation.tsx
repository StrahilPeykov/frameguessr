'use client'

import { BarChart3, Share2, Info, Menu, X } from 'lucide-react'
import { useState } from 'react'

interface NavigationProps {
  onStatsClick: () => void
  onShareClick: () => void
  showShareButton: boolean
}

export default function Navigation({ onStatsClick, onShareClick, showShareButton }: NavigationProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
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
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm font-medium">Stats</span>
            </button>
            
            {showShareButton && (
              <button
                onClick={onShareClick}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-medium">Share</span>
              </button>
            )}
            
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Info className="w-5 h-5" />
              <span className="text-sm font-medium">How to Play</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4">
            <div className="space-y-2">
              <button
                onClick={() => {
                  onStatsClick()
                  setShowMobileMenu(false)
                }}
                className="flex items-center gap-3 w-full px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
                  className="flex items-center gap-3 w-full px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium">Share Result</span>
                </button>
              )}
              
              <button
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 w-full px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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