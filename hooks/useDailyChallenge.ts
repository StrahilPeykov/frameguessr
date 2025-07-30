import { useState, useEffect } from 'react'
import { DailyChallenge } from '@/types'

export function useDailyChallenge(date: string) {
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const fetchDailyChallenge = async (selectedDate: string) => {
      try {
        setIsLoading(true)
        setError(null)
        setImageLoaded(false)
        setImageError(false)
        
        const response = await fetch(`/api/daily?date=${selectedDate}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`No challenge available for ${selectedDate}`)
          }
          throw new Error('Failed to load the challenge')
        }
        
        const data = await response.json()
        setDailyChallenge(data)
        
        // Preload image
        if (data.imageUrl) {
          const img = new Image()
          img.onload = () => setImageLoaded(true)
          img.onerror = () => setImageError(true)
          img.src = data.imageUrl
        }
      } catch (error) {
        console.error('Failed to fetch daily challenge:', error)
        setError(error instanceof Error ? error.message : 'Unable to load the challenge')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDailyChallenge(date)
  }, [date])

  const retry = () => {
    setError(null)
    // Trigger refetch by setting loading state
    setIsLoading(true)
    // The useEffect will run again due to the loading state change
  }

  return {
    dailyChallenge,
    isLoading,
    error,
    imageLoaded,
    imageError,
    retry,
  }
}

export default useDailyChallenge