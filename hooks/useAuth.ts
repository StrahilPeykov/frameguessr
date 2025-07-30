import { useState, useEffect } from 'react'
import { gameStorage } from '@/lib/gameStorage'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const initAuth = async () => {
      await gameStorage.init()
      setIsAuthenticated(gameStorage.isAuthenticated())
      setCurrentUser(gameStorage.getCurrentUser())
    }

    initAuth()
  }, [])

  return {
    isAuthenticated,
    currentUser,
  }
}

export default useAuth