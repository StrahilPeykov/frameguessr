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
  Upload
} from 'lucide-react'
import DataMergeModal from './DataMergeModal'
import ProfileSettings from './ProfileSettings'
import Avatar from '@/components/ui/Avatar'

interface UserProfile {
  username: string
  display_name: string
  avatar_url?: string
}

interface UserMenuProps {
  onStatsClick?: () => void
}

export default function UserMenu({ onStatsClick }: UserMenuProps) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [showDataMergeModal, setShowDataMergeModal] = useState(false)
  const [showProfileSettings, setShowProfileSettings] = useState(false)
  const [conflicts, setConflicts] = useState<any[]>([])
  const [mergeableCount, setMergeableCount] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        loadUserProfile(user.id)
        checkMergeableData()
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      
      if (event === 'SIGNED_OUT') {
        setShowMenu(false)
        setSigningOut(false)
        setProfile(null)
        setMergeableCount(0)
      } else if (event === 'SIGNED_IN' && session?.user) {
        loadUserProfile(session.user.id)
        checkMergeableData()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, display_name, avatar_url')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Failed to load user profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Failed to load user profile:', error)
    }
  }

  const checkMergeableData = async () => {
    try {
      const summary = await gameStorage.getDataSummary()
      setMergeableCount(summary.mergeableGames)
    } catch (error) {
      console.error('Failed to check mergeable data:', error)
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

  const handleSettingsClick = () => {
    setShowProfileSettings(true)
    setShowMenu(false)
  }

  const handleSyncData = async () => {
    setShowMenu(false)
    const mergeableConflicts = await gameStorage.getMergeableConflicts()
    setConflicts(mergeableConflicts)
    setShowDataMergeModal(true)
  }

  const handleProfileUpdated = () => {
    // Reload profile data after successful update
    if (user) {
      loadUserProfile(user.id)
    }
  }

  if (!user) return null

  // Get display information - fix the flash by being more careful about what we show
  const userEmail = user.email || ''
  
  // Only show display name if profile is loaded, otherwise show nothing to avoid flash
  const displayName = profile?.display_name || null
  const username = profile?.username || null
  const avatarUrl = profile?.avatar_url || null
  
  // Don't show anything until profile loads to avoid flash
  const showDisplayName = displayName || username || userEmail.split('@')[0]

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={signingOut}
          className="flex items-center gap-2 px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors text-sm disabled:opacity-50 max-w-[180px]"
        >
          <Avatar
            avatarValue={avatarUrl}
            displayName={showDisplayName}
            size={28}
          />
          <span className="hidden sm:block text-stone-700 dark:text-stone-200 font-medium truncate min-w-0 flex-1">
            {showDisplayName}
          </span>
          <ChevronDown className={`w-4 h-4 text-stone-500 dark:text-stone-400 transition-transform flex-shrink-0 ${showMenu ? 'rotate-180' : ''}`} />
        </button>

        {showMenu && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-stone-800 rounded-lg shadow-xl border border-stone-200 dark:border-stone-700 py-1 z-50 overflow-hidden">
            {/* Simplified Header */}
            <div className="px-3 py-3 border-b border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-2">
                <Avatar
                  avatarValue={avatarUrl}
                  displayName={showDisplayName}
                  size={32}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                    {showDisplayName}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                    {userEmail}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Menu Items */}
            <button 
              onClick={handleStatsClick}
              className="w-full text-left px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Statistics
            </button>

            <button
              onClick={handleSettingsClick}
              className="w-full text-left px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2 transition-colors"
            >
              <Settings className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Profile Settings
            </button>

            {/* Only show import option if there's data to import */}
            {mergeableCount > 0 && (
              <button
                onClick={handleSyncData}
                className="w-full text-left px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Import Local Progress
                <span className="ml-auto text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded">
                  {mergeableCount}
                </span>
              </button>
            )}
            
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
          checkMergeableData()
        }}
        conflicts={conflicts}
      />

      <ProfileSettings
        isOpen={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
        onSuccess={handleProfileUpdated}
      />
    </>
  )
}