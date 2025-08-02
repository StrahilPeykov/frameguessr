// hooks/useAuth.ts - Updated with data sync integration
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

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, !!session?.user)
        
        const user = session?.user || null
        const wasAuthenticated = authState.isAuthenticated
        
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

  const handleSignIn = async (user: any) => {
    if (!user) return

    try {
      // Check if there are data conflicts that need user attention
      const dataSummary = await gameStorage.getDataSummary()
      
      if (dataSummary.conflicts > 0) {
        setAuthState(prev => ({
          ...prev,
          hasPendingDataMerge: true
        }))
        
        // The data merge modal will be shown by the GameStorage event
        // We don't need to do anything else here
      } else {
        // No conflicts, proceed with normal sync
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
  }
}

export default useAuth