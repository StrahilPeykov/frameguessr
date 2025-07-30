'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Film, Sun, Moon, BarChart3, Share2, Menu, Check, X } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useNavigation } from '@/hooks/useNavigation'
import { useGameContext } from '@/contexts/GameContext'
import DatePicker from './DatePicker'
import UserMenu from '@/components/auth/UserMenu'
import MobileMenu from './MobileMenu'
import AuthModal from '@/components/auth/AuthModal'

interface GameHeaderProps {
  currentDate: string
  onDateSelect: (date: string) => void
  onStatsClick: () => void
  onShareClick: () => void
}

function GameHeader({ 
  currentDate, 
  onDateSelect, 
  onStatsClick, 
  onShareClick 
}: GameHeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const { isScrolled, showMobileMenu, openMobileMenu, closeMobileMenu } = useNavigation()
  const { gameState, syncStatus, isAuthenticated } = useGameContext()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin')

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-white/75 dark:bg-stone-950/75 backdrop-blur-xl border-stone-200/40 dark:border-amber-900/40 shadow-lg' 
          : 'bg-white/50 dark:bg-stone-950/50 backdrop-blur-md border-stone-200/20 dark:border-amber-900/20'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo only */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-red-700 flex items-center justify-center">
                  <Film className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold cinema-gradient-title">
                  FrameGuessr
                </h1>
              </Link>
            </div>
            
            {/* Right side - All controls */}
            <div className="flex items-center gap-3">
              {/* Desktop Date Picker */}
              <div className="hidden md:block">
                <DatePicker 
                  currentDate={currentDate}
                  onDateSelect={onDateSelect}
                  compact
                />
              </div>
              
              {/* Sync Status */}
              {isAuthenticated && syncStatus !== 'idle' && (
                <div className="hidden sm:flex items-center gap-2">
                  {syncStatus === 'syncing' && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                      <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Syncing...</span>
                    </div>
                  )}
                  {syncStatus === 'synced' && (
                    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <Check className="w-3 h-3" />
                      <span>Synced</span>
                    </div>
                  )}
                  {syncStatus === 'error' && (
                    <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                      <X className="w-3 h-3" />
                      <span>Sync failed</span>
                    </div>
                  )}
                </div>
              )}

              {/* Desktop Controls */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-2.5 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800/50 rounded-xl transition-all duration-300 cinema-touch"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
                
                <button
                  onClick={onStatsClick}
                  className="p-2.5 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800/50 rounded-xl transition-all duration-300 cinema-touch"
                  aria-label="View statistics"
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
                
                {gameState.completed && (
                  <button
                    onClick={onShareClick}
                    className="p-2.5 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800/50 rounded-xl transition-all duration-300 cinema-touch"
                    aria-label="Share result"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                )}
                
                {isAuthenticated ? (
                  <div className="hidden md:block">
                    <UserMenu onStatsClick={onStatsClick} />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowAuthModal(true)
                        setAuthModalMode('signin')
                      }}
                      className="px-3 py-2 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg font-medium transition-colors text-sm"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setShowAuthModal(true)
                        setAuthModalMode('signup')
                      }}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile controls */}
              <div className="flex md:hidden items-center gap-2">
                {/* Mobile Date Picker */}
                <DatePicker 
                  currentDate={currentDate}
                  onDateSelect={onDateSelect}
                  mobile
                />
                
                {/* Hamburger Menu Button */}
                <button
                  onClick={openMobileMenu}
                  className="p-2.5 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800/50 rounded-xl transition-all duration-300 cinema-touch"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={showMobileMenu}
        onClose={closeMobileMenu}
        theme={theme}
        onThemeToggle={toggleTheme}
        isAuthenticated={isAuthenticated}
        gameCompleted={gameState.completed}
        syncStatus={syncStatus}
        onStatsClick={() => {
          closeMobileMenu()
          onStatsClick()
        }}
        onShareClick={() => {
          closeMobileMenu()
          onShareClick()
        }}
        onSignInClick={() => {
          closeMobileMenu()
          setShowAuthModal(true)
          setAuthModalMode('signin')
        }}
        onSignUpClick={() => {
          closeMobileMenu()
          setShowAuthModal(true)
          setAuthModalMode('signup')
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />
    </>
  )
}

export default GameHeader