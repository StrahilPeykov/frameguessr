'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { X, User, UserCheck, Save, CheckCircle, Camera } from 'lucide-react'
import { PREDEFINED_AVATARS, getAvatarById, generateAvatarSVG, getInitials } from '@/utils/avatars'
import Avatar from '@/components/ui/Avatar'

interface ProfileSettingsProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface UserProfile {
  username: string
  display_name: string
  avatar_url?: string
}

export default function ProfileSettings({ isOpen, onClose, onSuccess }: ProfileSettingsProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [user, setUser] = useState<any>(null)
  const [showAvatarSelection, setShowAvatarSelection] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadUserProfile()
      setError('')
      setSuccessMessage('')
      setShowAvatarSelection(false)
    }
  }, [isOpen])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('You must be logged in to edit your profile')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('username, display_name, avatar_url')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Failed to load profile:', error)
        setError('Failed to load your profile')
        return
      }

      setProfile(data)
      setOriginalProfile(data)
    } catch (error) {
      console.error('Failed to load profile:', error)
      setError('Failed to load your profile')
    } finally {
      setLoading(false)
    }
  }

  const validateUsername = (username: string): string | null => {
    if (username.length < 3) return 'Username must be at least 3 characters'
    if (username.length > 20) return 'Username must be less than 20 characters'
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) return 'Username can only contain letters, numbers, hyphens, and underscores'
    return null
  }

  const validateDisplayName = (displayName: string): string | null => {
    if (displayName.trim().length < 2) return 'Display name must be at least 2 characters'
    if (displayName.trim().length > 50) return 'Display name must be less than 50 characters'
    return null
  }

  const checkUsernameAvailable = async (username: string): Promise<boolean> => {
    if (username === originalProfile?.username) {
      return true // Same as current username
    }

    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase().trim())
      .single()

    return !data // Available if no data returned
  }

  const handleAvatarSelect = (avatarId: string) => {
    if (profile) {
      setProfile({ ...profile, avatar_url: avatarId })
      setShowAvatarSelection(false)
    }
  }

  const handleSave = async () => {
    if (!profile || !user) return

    setError('')
    setSuccessMessage('')
    setSaving(true)

    try {
      // Validate inputs
      const usernameError = validateUsername(profile.username)
      if (usernameError) {
        setError(usernameError)
        return
      }

      const displayNameError = validateDisplayName(profile.display_name)
      if (displayNameError) {
        setError(displayNameError)
        return
      }

      // Check username availability
      const isUsernameAvailable = await checkUsernameAvailable(profile.username)
      if (!isUsernameAvailable) {
        setError('Username is already taken. Please choose a different one.')
        return
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username.toLowerCase().trim(),
          display_name: profile.display_name.trim(),
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Failed to update profile:', error)
        if (error.code === '23505') {
          setError('Username is already taken. Please choose a different one.')
        } else {
          setError('Failed to update profile. Please try again.')
        }
        return
      }

      setSuccessMessage('Profile updated successfully!')
      setOriginalProfile(profile)
      
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1500)

    } catch (error) {
      console.error('Failed to update profile:', error)
      setError('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = profile && originalProfile && (
    profile.username !== originalProfile.username ||
    profile.display_name !== originalProfile.display_name ||
    profile.avatar_url !== originalProfile.avatar_url
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-4 sm:pt-8 p-4 z-50">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Profile Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-stone-500 dark:text-stone-400" />
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="cinema-spinner mx-auto mb-4" />
              <p className="text-stone-600 dark:text-stone-400 text-sm">Loading your profile...</p>
            </div>
          ) : (
            <>
              {/* Success Message */}
              {successMessage && (
                <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  {successMessage}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-xs">
                  {error}
                </div>
              )}

              {profile && (
                <div className="space-y-4">
                  {/* Avatar Section */}
                  <div className="text-center">
                    <div className="relative inline-block">
                      <Avatar
                        avatarValue={profile.avatar_url}
                        displayName={profile.display_name}
                        size={64}
                        onClick={() => setShowAvatarSelection(true)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      />
                      <button 
                        onClick={() => setShowAvatarSelection(true)}
                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-600 hover:bg-amber-700 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
                      Click to change avatar
                    </p>
                  </div>

                  {/* Avatar Selection Grid */}
                  {showAvatarSelection && (
                    <div className="border border-stone-200 dark:border-stone-700 rounded-lg p-4 bg-stone-50 dark:bg-stone-800/50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300">
                          Choose an Avatar
                        </h3>
                        <button
                          onClick={() => setShowAvatarSelection(false)}
                          className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                        {PREDEFINED_AVATARS.map((avatarOption) => (
                          <button
                            key={avatarOption.id}
                            onClick={() => handleAvatarSelect(avatarOption.id)}
                            className={`relative p-2 rounded-lg transition-all hover:bg-stone-100 dark:hover:bg-stone-700 ${
                              profile.avatar_url === avatarOption.id 
                                ? 'bg-amber-50 dark:bg-amber-900/20 ring-2 ring-amber-500' 
                                : ''
                            }`}
                            title={avatarOption.name}
                          >
                            <div 
                              className="w-8 h-8 mx-auto"
                              dangerouslySetInnerHTML={{ __html: generateAvatarSVG(avatarOption, 32) }}
                            />
                            {profile.avatar_url === avatarOption.id && (
                              <div className="absolute top-0 right-0 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-2 h-2 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="space-y-3">
                    {/* Display Name */}
                    <div>
                      <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                        Display Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                        <input
                          type="text"
                          value={profile.display_name}
                          onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                          placeholder="Your display name"
                          disabled={saving}
                        />
                      </div>
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                        Username
                      </label>
                      <div className="relative">
                        <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                        <input
                          type="text"
                          value={profile.username}
                          onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                          placeholder="Choose a username"
                          disabled={saving}
                        />
                      </div>
                      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                        3-20 characters, letters, numbers, hyphens, and underscores only
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={onClose}
                      disabled={saving}
                      className="flex-1 px-3 py-2 text-sm border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-lg font-medium transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    
                    <button
                      onClick={handleSave}
                      disabled={saving || !hasChanges}
                      className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-amber-400 disabled:to-orange-400 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {saving ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-3 h-3" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}