'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { gameStorage } from '@/lib/gameStorage'
import { 
  User, 
  LogOut, 
  BarChart3, 
  ChevronDown, 
  Settings,
  Database,
  Cloud,
  CloudOff,
  Smartphone,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Upload
} from 'lucide-react'
import DataMergeModal from './DataMergeModal'

interface UserMenuProps {
  onStatsClick?: () => void
}

export default function UserMenu({ onStatsClick }: UserMenuProps) {
  const [user, setUser] = useState<any>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [dataSummary, setDataSummary] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [showDataMergeModal, setShowDataMergeModal] = useState(false)
  const [conflicts, setConflicts] = useState<any[]>([])
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        loadUserData()
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      
      if (event === 'SIGNED_OUT') {
        setShowMenu(false)
        setSigningOut(false)
        setDataSummary(null)
      } else if (event === 'SIGNED_IN' && session?.user) {
        loadUserData()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserData = async () => {
    try {
      setLoadingData(true)
      const summary = await gameStorage.getDataSummary()
      setDataSummary(summary)
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setLoadingData(false)
    }
  }

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
    if (signingOut) return
    
    setSigningOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        setSigningOut(false)
      }
    } catch (error) {
      console.error('Sign out error:', error)
      setSigningOut(false)
    }
  }

  const handleStatsClick = () => {
    onStatsClick?.()
    setShowMenu(false)
  }

  const handleSyncData = async () => {
    setShowMenu(false)
    const mergeableConflicts = await gameStorage.getMergeableConflicts()
    setConflicts(mergeableConflicts)
    setShowDataMergeModal(true)
  }

  if (!user) return null

  const userEmail = user.email || ''
  const displayName = userEmail.split('@')[0] || 'User'

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={signingOut}
          className="flex items-center gap-2 px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors text-sm disabled:opacity-50"
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
          <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-stone-800 rounded-lg shadow-xl border border-stone-200 dark:border-stone-700 py-1 z-50 overflow-hidden">
            <div className="px-3 py-2 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50">
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                {userEmail}
              </p>
            </div>

            {dataSummary && (
              <div className="px-3 py-2 border-b border-stone-200 dark:border-stone-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600 dark:text-stone-400">Cloud Progress:</span>
                  <span className="font-medium text-stone-900 dark:text-stone-100">
                    {dataSummary.cloudGames} games
                  </span>
                </div>
                {dataSummary.localGames > 0 && (
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-stone-600 dark:text-stone-400">Local Progress:</span>
                    <span className="font-medium text-stone-900 dark:text-stone-100">
                      {dataSummary.localGames} games
                    </span>
                  </div>
                )}
                {dataSummary.mergeableGames > 0 && (
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-orange-600 dark:text-orange-400">Can Import:</span>
                    <span className="font-medium text-orange-600 dark:text-orange-400">
                      {dataSummary.mergeableGames} games
                    </span>
                  </div>
                )}
              </div>
            )}
            
            <button 
              onClick={handleStatsClick}
              className="w-full text-left px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Statistics
            </button>

            <button
              onClick={handleSyncData}
              className="w-full text-left px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Import Local Progress
              {dataSummary?.mergeableGames > 0 && (
                <span className="ml-auto text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded">
                  {dataSummary.mergeableGames}
                </span>
              )}
            </button>

            <div className="px-3 py-2 border-t border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                <Smartphone className="w-3 h-3" />
                <span>Local data preserved</span>
              </div>
            </div>
            
            <hr className="my-1 border-stone-200 dark:border-stone-700" />
            
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span>
                {signingOut ? 'Signing out...' : 'Sign Out'}
              </span>
            </button>
          </div>
        )}
      </div>

      <DataMergeModal
        isOpen={showDataMergeModal}
        onClose={() => {
          setShowDataMergeModal(false)
          loadUserData()
        }}
        conflicts={conflicts}
      />
    </>
  )
}