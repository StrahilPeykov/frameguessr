'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useBlur, type HintLevel } from '@/utils/blur'

interface MovieStillImageProps {
  src: string
  alt: string
  hintLevel: HintLevel
  completed?: boolean
  className?: string
  showUnblurToggle?: boolean // For debugging/accessibility
}

export default function MovieStillImage({ 
  src, 
  alt, 
  hintLevel, 
  completed = false,
  className = '', 
  showUnblurToggle = false 
}: MovieStillImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [showUnblurred, setShowUnblurred] = useState(false)

  // Get blur configuration using the consolidated system
  const blur = useBlur(hintLevel, completed || showUnblurred)

  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    setShowUnblurred(false)
  }, [src])

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const toggleBlur = () => {
    setShowUnblurred(!showUnblurred)
  }

  return (
    <div className={`relative bg-gray-900 ${className}`}>
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="cinema-spinner mb-4" />
            <p className="text-white text-sm">Loading cinema reel...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-lg mb-2">Failed to load image</p>
            <p className="text-sm text-gray-400">Please refresh the page</p>
          </div>
        </div>
      )}

      {/* Movie still image */}
      {!hasError && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-800 ${blur.className} ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ 
            filter: blur.filter,
            transition: 'filter 0.8s ease-in-out, opacity 1s ease-in-out'
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {/* Hint level indicator */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-yellow-500/20">
        <span className="text-yellow-400">🎬</span> Hint {hintLevel}/3
      </div>

      {/* Blur intensity indicator */}
      {!completed && !showUnblurred && (
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-amber-500/20">
          <span className="text-amber-400 capitalize">{blur.intensity}</span> blur
        </div>
      )}

      {/* Toggle blur button (for debugging/accessibility) */}
      {showUnblurToggle && !hasError && !isLoading && !completed && (
        <button
          onClick={toggleBlur}
          className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors border border-yellow-500/20 hover:border-yellow-500/40 cinema-touch"
          aria-label={showUnblurred ? 'Show blurred' : 'Show unblurred'}
          title={showUnblurred ? 'Apply blur effect' : 'Remove blur effect'}
        >
          {showUnblurred ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}

      {/* Completion indicator */}
      {completed && (
        <div className="absolute bottom-4 left-4 bg-green-500/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-green-400/30">
          <span className="text-green-100">✓</span> Revealed
        </div>
      )}

      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

      {/* Accessibility: Screen reader description of blur state */}
      <div className="sr-only" aria-live="polite">
        {blur.description}
      </div>
    </div>
  )
}