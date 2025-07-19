'use client'

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, VolumeX } from 'lucide-react'

interface AudioErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface AudioErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class AudioErrorBoundary extends Component<AudioErrorBoundaryProps, AudioErrorBoundaryState> {
  constructor(props: AudioErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): AudioErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to console
    console.error('Audio Error Boundary caught an error:', error, errorInfo)

    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    // Send to error reporting service if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: `Audio Error: ${error.message}`,
        fatal: false
      })
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="audio-error-boundary bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                Audio Hint Unavailable
              </h3>
              <p className="text-xs text-red-700 dark:text-red-300 mb-3">
                {this.getErrorMessage()}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={this.handleRetry}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry
                </button>
                <button
                  onClick={() => this.setState({ hasError: false })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded-lg transition-colors"
                >
                  <VolumeX className="w-3 h-3" />
                  Continue without audio
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }

  private getErrorMessage(): string {
    const error = this.state.error

    if (!error) return 'An unknown error occurred'

    // Handle specific audio error types
    if (error.name === 'AudioPlaybackError') {
      switch ((error as any).code) {
        case 'USER_INTERACTION_REQUIRED':
          return 'Click the play button to enable audio'
        case 'FORMAT_NOT_SUPPORTED':
          return 'Audio format not supported by your browser'
        case 'NETWORK_ERROR':
          return 'Failed to load audio due to network issues'
        default:
          return 'Audio playback failed'
      }
    }

    if (error instanceof DOMException) {
      switch (error.name) {
        case 'NotAllowedError':
          return 'Audio blocked by browser settings'
        case 'NotSupportedError':
          return 'Audio not supported'
        case 'AbortError':
          return 'Audio loading was interrupted'
        default:
          return 'Browser audio error occurred'
      }
    }

    return error.message || 'Audio error occurred'
  }
}

// Hook version for functional components
export function useAudioErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error) => {
    console.error('Audio error:', error)
    setError(error)

    // Track error
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: `Audio Error: ${error.message}`,
        fatal: false
      })
    }
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    hasError: error !== null,
    handleError,
    clearError
  }
}

// Simple audio error fallback component
export function AudioErrorFallback({ 
  error, 
  onRetry, 
  onDismiss 
}: { 
  error: Error
  onRetry?: () => void
  onDismiss?: () => void 
}) {
  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 text-white border border-gray-600/50">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
          <VolumeX className="w-6 h-6 text-gray-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-300 mb-1">Audio hint unavailable</p>
          <p className="text-xs text-gray-500">{error.message}</p>
          
          {(onRetry || onDismiss) && (
            <div className="flex gap-2 mt-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded transition-colors"
                >
                  Retry
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AudioErrorBoundary