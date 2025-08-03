import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { gameStorage } from '@/lib/gameStorage'

export interface AuthState {
  isAuthenticated: boolean
  currentUser: any
  loading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    currentUser: null,
    loading: true
  })

  useEffect(() => {
    const initAuth = async () => {
      try {
        await gameStorage.init()
        const user = gameStorage.getCurrentUser()
        
        console.log('[useAuth] Initialized:', { user: !!user })
        
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: !!user,
          currentUser: user,
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
        
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: !!user,
          currentUser: user
        }))
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const getUserStats = useCallback(async () => {
    return await gameStorage.getUserStats()
  }, [])

  const canAccessCloudFeatures = useCallback(() => {
    return authState.isAuthenticated
  }, [authState.isAuthenticated])

  const getDataSource = useCallback((): 'local' | 'cloud' | 'mixed' => {
    return authState.isAuthenticated ? 'cloud' : 'local'
  }, [authState.isAuthenticated])

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
      return dataSummary.mergeableGames > 0
    } catch (error) {
      console.error('Error checking unsaved changes:', error)
      return false
    }
  }, [authState.isAuthenticated])

  const reloadAuthState = useCallback(async () => {
    console.log('[useAuth] Force reloading auth state')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: !!user,
        currentUser: user
      }))
      
      return { user: !!user }
    } catch (error) {
      console.error('Failed to reload auth state:', error)
      throw error
    }
  }, [])

  return {
    isAuthenticated: authState.isAuthenticated,
    currentUser: authState.currentUser,
    loading: authState.loading,
    
    // Utility functions
    canAccessCloudFeatures,
    getDataSource,
    hasUnsavedChanges,
    
    // Actions
    signOut,
    getUserStats,
    reloadAuthState,
  }
}

export default useAuth