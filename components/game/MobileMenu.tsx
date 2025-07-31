'use client'

import { useState, useEffect } from 'react'
import { X, Sun, Moon, BarChart3, Share2, User, LogOut, Check, Archive } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  theme: 'light' | 'dark'
  onThemeToggle: () => void
  isAuthenticated: boolean
  gameCompleted: boolean
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error'
  onStatsClick: () => void
  onShareClick: () => void
  onSignInClick: () => void
  onSignUpClick: () => void
}

export default function MobileMenu({
  isOpen,
  onClose,
  theme,
  onThemeToggle,
  isAuthenticated,
  gameCompleted,
  syncStatus,
  onStatsClick,
  onShareClick,
  onSignInClick,
  onSignUpClick
}: MobileMenuProps) {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (isAuthenticated) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
      })
    }
  }, [isAuthenticated])

  // Handle body scroll locking
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [isOpen])

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    onClose()
    window.location.reload()
  }

  const userEmail = user?.email || ''
  const displayName = userEmail.split('@')[0] || 'User'

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[60] md:hidden"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-stone-900 shadow-2xl z-[70] transform transition-transform duration-300 ease-out md:hidden border-l border-stone-200 dark:border-stone-700 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-stone-600 dark:text-stone-400" />
          </button>
        </div>

        {/* User Section */}
        {isAuthenticated && user && (
          <div className="p-4 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-900 dark:text-stone-100 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                  {userEmail}
                </p>
              </div>
            </div>
            
            {/* Sync Status */}
            {syncStatus !== 'idle' && (
              <div className="text-xs">
                {syncStatus === 'syncing' && (
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Syncing progress...</span>
                  </div>
                )}
                {syncStatus === 'synced' && (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Check className="w-3 h-3" />
                    <span>Progress synced</span>
                  </div>
                )}
                {syncStatus === 'error' && (
                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <X className="w-3 h-3" />
                    <span>Sync failed</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Menu Items */}
        <div className="p-4 space-y-2">
          {/* Archive */}
          <Link
            href="/archive"
            onClick={onClose}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-left"
          >
            <Archive className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-stone-700 dark:text-stone-200">
              Browse Archive
            </span>
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-left"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-600" />
            ) : (
              <Moon className="w-5 h-5 text-amber-600" />
            )}
            <span className="font-medium text-stone-700 dark:text-stone-200">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {/* Statistics */}
          <button
            onClick={onStatsClick}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-left"
          >
            <BarChart3 className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-stone-700 dark:text-stone-200">
              Statistics
            </span>
          </button>

          {/* Share (only when game is completed) */}
          {gameCompleted && (
            <button
              onClick={onShareClick}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-left"
            >
              <Share2 className="w-5 h-5 text-amber-600" />
              <span className="font-medium text-stone-700 dark:text-stone-200">
                Share Result
              </span>
            </button>
          )}

          {/* Auth Actions */}
          {!isAuthenticated ? (
            <>
              <div className="pt-4 border-t border-stone-200 dark:border-stone-700 mt-4">
                <button
                  onClick={onSignInClick}
                  className="w-full px-4 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-lg font-medium transition-colors mb-2"
                >
                  Sign In
                </button>
                <button
                  onClick={onSignUpClick}
                  className="w-full px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-medium transition-colors"
                >
                  Create Account
                </button>
              </div>
              
              <p className="text-xs text-stone-500 dark:text-stone-400 text-center mt-3">
                Sign in to sync your progress across devices
              </p>
            </>
          ) : (
            <div className="pt-4 border-t border-stone-200 dark:border-stone-700 mt-4">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-left"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-center gap-4 text-xs">
            <Link 
              href="/privacy" 
              className="text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              onClick={onClose}
            >
              Privacy
            </Link>
            <span className="text-stone-300 dark:text-stone-600">•</span>
            <Link 
              href="/terms" 
              className="text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              onClick={onClose}
            >
              Terms
            </Link>
            <span className="text-stone-300 dark:text-stone-600">•</span>
            <a 
              href="mailto:strahil.peykov@gmail.com"
              className="text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              onClick={onClose}
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </>
  )
}