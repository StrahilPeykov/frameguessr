'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Menu, X, BarChart3, Archive, HelpCircle } from 'lucide-react'
import { getTodayLocal } from '@/utils/dateUtils'
import UserMenu from '@/components/auth/UserMenu'
import FrameGuessrLogo from '@/components/ui/FrameGuessrLogo'
import MobileMenu from '@/components/game/MobileMenu'
import AuthModal from '@/components/auth/AuthModal'
import StatsModal from '@/components/game/StatsModal'
import { useAuth } from '@/hooks/useAuth'

export default function ArchiveHeader() {
  const today = getTodayLocal()
  const { isAuthenticated } = useAuth()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin')

  const handleSignInClick = () => {
    setAuthModalMode('signin')
    setShowAuthModal(true)
    setShowMobileMenu(false)
  }

  const handleSignUpClick = () => {
    setAuthModalMode('signup')
    setShowAuthModal(true)
    setShowMobileMenu(false)
  }

  const handleStatsClick = () => {
    setShowStatsModal(true)
    setShowMobileMenu(false)
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-stone-200/40 dark:border-amber-900/40">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back button and Logo */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link 
                href={`/day/${today}`}
                className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors group"
                aria-label="Back to today's challenge"
              >
                <ArrowLeft className="w-5 h-5 text-stone-600 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
              </Link>
              
              <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-all duration-300 group">
                <FrameGuessrLogo 
                  size={28}
                  className="text-amber-600 dark:text-amber-500 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors duration-300"
                />
                <div className="flex items-center">
                  <span className="text-base sm:text-lg font-bold text-stone-800 dark:text-stone-100">FrameGuessr</span>
                  <span className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 ml-2">Archive</span>
                </div>
              </Link>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Desktop controls */}
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href={`/day/${today}`}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all duration-200 text-sm shadow-lg hover:shadow-xl"
                >
                  <Calendar className="w-4 h-4" />
                  Play Today
                </Link>
                
                {isAuthenticated ? (
                  <UserMenu onStatsClick={handleStatsClick} />
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSignInClick}
                      className="px-3 py-2 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg font-medium transition-colors text-sm"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={handleSignUpClick}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile controls */}
              <div className="flex md:hidden items-center gap-2">
                <Link
                  href={`/day/${today}`}
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all duration-200 text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Play Today</span>
                </Link>
                
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-2.5 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-all duration-300"
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
        onClose={() => setShowMobileMenu(false)}
        isAuthenticated={isAuthenticated}
        gameCompleted={false}
        syncStatus="idle"
        onStatsClick={handleStatsClick}
        onShareClick={() => {}}
        onAboutClick={() => {}}
        onSignInClick={handleSignInClick}
        onSignUpClick={handleSignUpClick}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />

      {/* Stats Modal */}
      <StatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
      />
    </>
  )
}