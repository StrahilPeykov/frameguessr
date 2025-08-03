import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { gameStorage } from '@/lib/gameStorage'

export interface AuthState {
  isAuthenticated: boolean
  currentUser: any
  loading: boolean
  syncDecision: any // SyncDecision type from gameStorage
  hasPendingDataMerge: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    currentUser: null,
    loading: true,
    syncDecision: null,
    hasPendingDataMerge: false
  })

  // Initialize auth and check for existing session
  useEffect(() => {
    const initAuth = async () => {
      try {
        await gameStorage.init()
        const user = gameStorage.getCurrentUser()
        const syncDecision = gameStorage.getSyncDecision()
        
        console.log('[useAuth] Initialized:', { user: !!user, syncDecision: syncDecision?.type })
        
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: !!user,
          currentUser: user,
          syncDecision,
          loading: false
        }))
      } catch (error) {
        console.error('Auth initialization error:', error)
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: false,
          currentUser: null,
          loading: false
        }))
      }
    }

    initAuth()
  }, [])

  // Listen for auth state changes from Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[useAuth] Auth state change:', event, !!session?.user)
        
        const user = session?.user || null
        const wasAuthenticated = authState.isAuthenticated
        
        // Update auth state immediately
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: !!user,
          currentUser: user
        }))
        
        // Handle specific auth events
        if (event === 'SIGNED_IN' && !wasAuthenticated) {
          await handleSignIn(user)
        } else if (event === 'SIGNED_OUT') {
          await handleSignOut()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [authState.isAuthenticated])

  // Listen for sync decision changes from GameStorage
  useEffect(() => {
    const handleSyncDecisionChange = (event: CustomEvent) => {
      const { decision } = event.detail
      console.log('[useAuth] Sync decision changed:', decision?.type)
      setAuthState(prev => ({
        ...prev,
        syncDecision: decision
      }))
    }

    window.addEventListener('sync-decision-changed', handleSyncDecisionChange as EventListener)
    
    return () => {
      window.removeEventListener('sync-decision-changed', handleSyncDecisionChange as EventListener)
    }
  }, [])

  const handleSignIn = async (user: any) => {
    if (!user) return

    console.log('[useAuth] Handling sign in for user:', user.email)

    try {
      // Check if there are data conflicts that need user attention
      const dataSummary = await gameStorage.getDataSummary()
      
      if (dataSummary.conflicts > 0) {
        console.log('[useAuth] Found data conflicts:', dataSummary.conflicts)
        setAuthState(prev => ({
          ...prev,
          hasPendingDataMerge: true
        }))
        
        // The data merge modal will be shown by the GameStorage event
        // We don't need to do anything else here
      } else {
        console.log('[useAuth] No conflicts found')
        setAuthState(prev => ({
          ...prev,
          hasPendingDataMerge: false
        }))
      }
    } catch (error) {
      console.error('Error handling sign in:', error)
    }
  }

  const handleSignOut = async () => {
    console.log('[useAuth] Handling sign out')
    
    setAuthState(prev => ({
      ...prev,
      isAuthenticated: false,
      currentUser: null,
      syncDecision: null,
      hasPendingDataMerge: false
    }))
  }

  // Callback for when data merge decision is made
  const onDataMergeComplete = useCallback((decision: any) => {
    console.log('[useAuth] Data merge complete:', decision?.type)
    setAuthState(prev => ({
      ...prev,
      syncDecision: decision,
      hasPendingDataMerge: false
    }))
  }, [])

  // Get user statistics (handles local vs cloud based on sync decision)
  const getUserStats = useCallback(async () => {
    return await gameStorage.getUserStats()
  }, [])

  // Check if user can access cloud features
  const canAccessCloudFeatures = useCallback(() => {
    return authState.isAuthenticated && 
           authState.syncDecision?.type !== 'clean-start'
  }, [authState.isAuthenticated, authState.syncDecision])

  // Check if local data should be preserved on sign out
  const shouldPreserveLocalData = useCallback(() => {
    return !authState.syncDecision?.clearLocalOnLogout
  }, [authState.syncDecision])

  // Get current data source (local, cloud, or mixed)
  const getDataSource = useCallback((): 'local' | 'cloud' | 'mixed' => {
    if (!authState.isAuthenticated) return 'local'
    
    switch (authState.syncDecision?.type) {
      case 'clean-start':
        return 'local'
      case 'import-all':
      case 'keep-account-only':
        return 'cloud'
      case 'merge-selected':
        return 'mixed'
      default:
        return authState.isAuthenticated ? 'cloud' : 'local'
    }
  }, [authState.isAuthenticated, authState.syncDecision])

  // Sign out with proper cleanup
  const signOut = useCallback(async () => {
    try {
      console.log('[useAuth] Starting sign out process')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        throw error
      }
    } catch (error) {
      console.error('Failed to sign out:', error)
      throw error
    }
  }, [])

  // Check if there are unsaved local changes
  const hasUnsavedChanges = useCallback(async () => {
    if (!authState.isAuthenticated) return false
    
    try {
      const dataSummary = await gameStorage.getDataSummary()
      return dataSummary.conflicts > 0
    } catch (error) {
      console.error('Error checking unsaved changes:', error)
      return false
    }
  }, [authState.isAuthenticated])

  // Force sync all local data (for emergency/manual sync)
  const forceSyncAllData = useCallback(async () => {
    if (!authState.isAuthenticated) {
      throw new Error('Must be authenticated to sync data')
    }
    
    try {
      console.log('[useAuth] Force syncing all data')
      const decision = {
        type: 'import-all' as const,
        clearLocalOnLogout: true
      }
      
      gameStorage.setSyncDecision(decision)
      
      setAuthState(prev => ({
        ...prev,
        syncDecision: decision,
        hasPendingDataMerge: false
      }))
      
      return { success: true }
    } catch (error) {
      console.error('Failed to force sync data:', error)
      throw error
    }
  }, [authState.isAuthenticated])

  // Force reload auth state (useful for debugging)
  const reloadAuthState = useCallback(async () => {
    console.log('[useAuth] Force reloading auth state')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const syncDecision = gameStorage.getSyncDecision()
      
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: !!user,
        currentUser: user,
        syncDecision,
        hasPendingDataMerge: false
      }))
      
      return { user: !!user, syncDecision: syncDecision?.type }
    } catch (error) {
      console.error('Failed to reload auth state:', error)
      throw error
    }
  }, [])

  return {
    // Basic auth state
    isAuthenticated: authState.isAuthenticated,
    currentUser: authState.currentUser,
    loading: authState.loading,
    
    // Data sync state
    syncDecision: authState.syncDecision,
    hasPendingDataMerge: authState.hasPendingDataMerge,
    
    // Utility functions
    canAccessCloudFeatures,
    shouldPreserveLocalData,
    getDataSource,
    hasUnsavedChanges,
    
    // Actions
    signOut,
    forceSyncAllData,
    getUserStats,
    onDataMergeComplete,
    reloadAuthState, // Added for debugging
  }
}

export default useAuth