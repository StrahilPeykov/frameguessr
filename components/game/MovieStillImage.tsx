'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { blurFilters } from '@/utils/imageProcessing'

interface MovieStillImageProps {
  src: string
  alt: string
  hintLevel: number
  className?: string
}

export default function MovieStillImage({ src, alt, hintLevel, className = '' }: MovieStillImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [showUnblurred, setShowUnblurred] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    setShowUnblurred(false)
  }, [src])

  const getBlurClass = () => {
    if (showUnblurred) return ''
    
    switch (hintLevel) {
      case 1:
        return 'blur-heavy'
      case 2:
        return 'blur-medium'
      case 3:
        return 'blur-light'
      default:
        return ''
    }
  }

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  return (
    <div className={`relative bg-gray-900 ${className}`}>
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-white rounded-full animate-spin mb-4" />
            <p className="text-white text-sm">Loading image...</p>
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
          className={`w-full h-full object-cover transition-all duration-500 ${getBlurClass()} ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {/* Hint level indicator */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
        Hint {hintLevel}/3
      </div>

      {/* Toggle blur button (for debugging/accessibility) */}
      {!hasError && !isLoading && hintLevel < 4 && (
        <button
          onClick={() => setShowUnblurred(!showUnblurred)}
          className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          aria-label={showUnblurred ? 'Show blurred' : 'Show unblurred'}
        >
          {showUnblurred ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}

      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  )
}