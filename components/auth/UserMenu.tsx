'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { User, LogOut, BarChart3, ChevronDown } from 'lucide-react'

interface UserMenuProps {
  onStatsClick?: () => void
}

export default function UserMenu({ onStatsClick }: UserMenuProps) {
  const [user, setUser] = useState<any>(null)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setShowMenu(false)
  }

  const handleStatsClick = () => {
    onStatsClick?.()
    setShowMenu(false)
  }

  if (!user) return null

  const userEmail = user.email || ''
  const displayName = userEmail.split('@')[0] || 'User'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors text-sm"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <span className="hidden sm:block text-stone-700 dark:text-stone-200 font-medium">
          {displayName}
        </span>
        <ChevronDown className={`w-4 h-4 text-stone-500 dark:text-stone-400 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
      </button>

      {showMenu && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-stone-800 rounded-lg shadow-xl border border-stone-200 dark:border-stone-700 py-1 z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50">
            <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
              {userEmail}
            </p>
          </div>
          
          <button 
            onClick={handleStatsClick}
            className="w-full text-left px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2 transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Statistics
          </button>
          
          <hr className="my-1 border-stone-200 dark:border-stone-700" />
          
          <button
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}