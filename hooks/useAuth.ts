// hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { gameStorage } from '@/lib/gameStorage'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        await gameStorage.init()
        const user = gameStorage.getCurrentUser()
        setIsAuthenticated(!!user)
        setCurrentUser(user)
      } catch (error) {
        console.error('Auth initialization error:', error)
        setIsAuthenticated(false)
        setCurrentUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, !!session?.user)
        
        const user = session?.user || null
        setIsAuthenticated(!!user)
        setCurrentUser(user)
        
        // Update gameStorage
        if (gameStorage) {
          if (event === 'SIGNED_IN' && user) {
            await gameStorage.syncLegitimateDataToDatabase()
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    isAuthenticated,
    currentUser,
    loading,
  }
}

export default useAuth