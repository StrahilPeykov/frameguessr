'use client'

import { useEffect, useState } from 'react'
import { preloadAudio } from '@/utils/audio'

interface AudioPreloaderProps {
  previewUrls: string[]
  onPreloadComplete?: (loadedCount: number, totalCount: number) => void
  onPreloadError?: (errors: string[]) => void
}

export function AudioPreloader({ 
  previewUrls, 
  onPreloadComplete, 
  onPreloadError 
}: AudioPreloaderProps) {
  const [loadingState, setLoadingState] = useState<{
    loaded: number
    total: number
    errors: string[]
  }>({
    loaded: 0,
    total: 0,
    errors: []
  })

  useEffect(() => {
    if (previewUrls.length === 0) return

    const loadAudio = async () => {
      setLoadingState({
        loaded: 0,
        total: previewUrls.length,
        errors: []
      })

      try {
        const results = await preloadAudio(previewUrls)
        
        const loadedCount = results.filter(result => result !== null).length
        const errors = previewUrls
          .map((url, index) => results[index] === null ? url : null)
          .filter((url): url is string => url !== null)

        const finalState = {
          loaded: loadedCount,
          total: previewUrls.length,
          errors
        }

        setLoadingState(finalState)
        onPreloadComplete?.(loadedCount, previewUrls.length)
        
        if (errors.length > 0) {
          onPreloadError?.(errors)
        }
      } catch (error) {
        console.error('Audio preloading failed:', error)
        onPreloadError?.(['Failed to preload audio files'])
      }
    }

    loadAudio()
  }, [previewUrls, onPreloadComplete, onPreloadError])

  // This component doesn't render anything visible
  return null
}

// Hook version for more flexible usage
export function useAudioPreloader(previewUrls: string[]) {
  const [loadingState, setLoadingState] = useState<{
    isLoading: boolean
    loaded: number
    total: number
    errors: string[]
    progress: number
  }>({
    isLoading: false,
    loaded: 0,
    total: 0,
    errors: [],
    progress: 0
  })

  useEffect(() => {
    if (previewUrls.length === 0) {
      setLoadingState(prev => ({ ...prev, isLoading: false }))
      return
    }

    const loadAudio = async () => {
      setLoadingState({
        isLoading: true,
        loaded: 0,
        total: previewUrls.length,
        errors: [],
        progress: 0
      })

      try {
        const results = await preloadAudio(previewUrls)
        
        const loadedCount = results.filter(result => result !== null).length
        const errors = previewUrls
          .map((url, index) => results[index] === null ? url : null)
          .filter((url): url is string => url !== null)

        setLoadingState({
          isLoading: false,
          loaded: loadedCount,
          total: previewUrls.length,
          errors,
          progress: (loadedCount / previewUrls.length) * 100
        })
      } catch (error) {
        console.error('Audio preloading failed:', error)
        setLoadingState(prev => ({
          ...prev,
          isLoading: false,
          errors: ['Failed to preload audio files']
        }))
      }
    }

    loadAudio()
  }, [previewUrls])

  return loadingState
}

// Audio preloader with visual feedback
export function AudioPreloaderWithProgress({ 
  previewUrls, 
  onPreloadComplete,
  showProgress = false,
  className = ""
}: AudioPreloaderProps & { 
  showProgress?: boolean
  className?: string 
}) {
  const { isLoading, loaded, total, progress, errors } = useAudioPreloader(previewUrls)

  useEffect(() => {
    if (!isLoading && loaded > 0) {
      onPreloadComplete?.(loaded, total)
    }
  }, [isLoading, loaded, total, onPreloadComplete])

  if (!showProgress || !isLoading) {
    return null
  }

  return (
    <div className={`audio-preloader ${className}`}>
      <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <div className="flex-1">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Loading audio hints... ({loaded}/{total})
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      
      {errors.length > 0 && (
        <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded text-xs text-yellow-800 dark:text-yellow-200">
          {errors.length} audio file(s) failed to load
        </div>
      )}
    </div>
  )
}

export default AudioPreloader