'use client'

import Link from 'next/link'
import { ArrowLeft, Calendar, BarChart3, Search } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { getTodayLocal } from '@/utils/dateUtils'
import UserMenu from '@/components/auth/UserMenu'
import FrameGuessrLogo from '@/components/ui/FrameGuessrLogo'

export default function ArchiveHeader() {
  const { theme, toggleTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const today = getTodayLocal()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-stone-200/40 dark:border-amber-900/40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Back button and Logo */}
          <div className="flex items-center gap-4">
            <Link 
              href={`/day/${today}`}
              className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors group"
              aria-label="Back to today's challenge"
            >
              <ArrowLeft className="w-5 h-5 text-stone-600 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
            </Link>
            
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-all duration-300 group">
              <FrameGuessrLogo 
                size={28}
                className="text-amber-600 dark:text-amber-500 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors duration-300"
              />
              <span className="text-lg font-bold text-stone-800 dark:text-stone-100">Archive</span>
            </Link>
          </div>

          {/* Center - Search (hidden on mobile) */}
          <div className="hidden md:flex items-center max-w-md flex-1 mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search by date or month..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={`/day/${today}`}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg text-sm"
            >
              <Calendar className="w-4 h-4" />
              Today
            </Link>
            
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  )
}