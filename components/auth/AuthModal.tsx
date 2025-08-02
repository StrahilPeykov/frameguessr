// components/auth/AuthModal.tsx - Updated with data import flow
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Mail, Lock, CheckCircle } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  initialMode?: 'signin' | 'signup'
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialMode = 'signin' 
}: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [justSignedIn, setJustSignedIn] = useState(false)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setError('')
      setSuccessMessage('')
      setJustSignedIn(false)
    }
  }, [isOpen, initialMode])

  // Listen for data merge modal events
  useEffect(() => {
    const handleDataMergeShown = () => {
      // Close this modal when data merge modal is shown
      onClose()
    }

    window.addEventListener('show-data-merge-modal', handleDataMergeShown)
    return () => window.removeEventListener('show-data-merge-modal', handleDataMergeShown)
  }, [onClose])

  if (!isOpen) return null

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    // Validation
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        
        setJustSignedIn(true)
        setSuccessMessage('Welcome back!')
        
        // The auth state change listener in GameStorage will handle showing
        // the data merge modal if needed. We don't close immediately here
        // because the user might need to make data decisions first.
        setTimeout(() => {
          if (!justSignedIn) return // Modal might have closed already
          onSuccess?.()
          // Don't close here - let the data merge flow handle it
        }, 1500)
        
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password
        })
        if (error) throw error
        
        setSuccessMessage('Check your email to verify your account!')
        setTimeout(() => {
          onClose()
        }, 3000)
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      setError(error.message || 'An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
      
      // OAuth will redirect, so we don't need to handle success here
    } catch (error: any) {
      console.error('Google auth error:', error)
      setError(error.message || 'Google sign in failed')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-sm w-full shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            {mode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-stone-500 dark:text-stone-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {successMessage}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Special message for first-time users */}
          {mode === 'signup' && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-lg">
              <h4 className="font-medium text-amber-900 dark:text-amber-100 text-sm mb-1">
                Save Your Progress
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-200">
                Create an account to sync your game progress across devices and compete on leaderboards.
              </p>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                  required
                  disabled={loading || !!successMessage}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  disabled={loading || !!successMessage}
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                    disabled={loading || !!successMessage}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!successMessage}
              className="w-full px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-amber-400 disabled:to-orange-400 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 shadow-lg disabled:opacity-50"
            >
              {loading ? 'Please wait...' : successMessage ? '✓ Success!' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Google Sign In */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-300 dark:border-stone-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400">or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading || !!successMessage}
              className="w-full mt-4 flex items-center justify-center gap-3 px-4 py-3 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Toggle Mode */}
          {!successMessage && (
            <div className="mt-6 text-center text-sm">
              {mode === 'signin' ? (
                <span className="text-stone-600 dark:text-stone-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    disabled={loading}
                    className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition-colors disabled:opacity-50"
                  >
                    Sign up
                  </button>
                </span>
              ) : (
                <span className="text-stone-600 dark:text-stone-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    disabled={loading}
                    className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition-colors disabled:opacity-50"
                  >
                    Sign in
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}