// Enhanced sync system for cross-device progress synchronization

// 1. Enhanced Sync Hook
// hooks/useDeviceSync.ts
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { gameStorage } from '@/lib/gameStorage'
import { useAuth } from '@/hooks/useAuth'

interface SyncStatus {
  status: 'idle' | 'syncing' | 'synced' | 'conflict' | 'error'
  lastSync?: Date
  conflictCount?: number
  deviceId?: string
  errorMessage?: string
}

export function useDeviceSync() {
  const { isAuthenticated, currentUser } = useAuth()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: 'idle' })
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const conflictResolverRef = useRef<AbortController | null>(null)

  // Device identification for sync tracking
  const deviceId = useCallback(() => {
    let id = localStorage.getItem('frameguessr-device-id')
    if (!id) {
      id = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('frameguessr-device-id', id)
    }
    return id
  }, [])

  // Listen for online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Real-time sync subscription
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return

    const subscription = supabase
      .channel('user-progress-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${currentUser.id}`
        },
        (payload) => {
          console.log('[DeviceSync] Real-time update received:', payload)
          handleRealtimeUpdate(payload)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [isAuthenticated, currentUser])

  // Handle real-time updates from other devices
  const handleRealtimeUpdate = useCallback(async (payload: any) => {
    if (!payload.new) return

    try {
      setSyncStatus(prev => ({ ...prev, status: 'syncing' }))
      
      // Check if this update came from current device
      const currentDeviceId = deviceId()
      if (payload.new.device_id === currentDeviceId) {
        return // Ignore updates from current device
      }

      const date = payload.new.date
      const localState = await gameStorage.loadGameState(date)
      
      if (localState) {
        // Conflict detected - trigger resolution
        await handleSyncConflict(date, localState, payload.new)
      } else {
        // No local data - safe to sync down
        window.dispatchEvent(new CustomEvent('game-data-changed', {
          detail: { date, source: 'remote' }
        }))
      }

      setSyncStatus(prev => ({ 
        ...prev, 
        status: 'synced', 
        lastSync: new Date() 
      }))
    } catch (error) {
      console.error('[DeviceSync] Real-time sync error:', error)
      setSyncStatus(prev => ({ 
        ...prev, 
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Sync failed'
      }))
    }
  }, [deviceId])

  // Handle sync conflicts intelligently
  const handleSyncConflict = useCallback(async (
    date: string, 
    localState: any, 
    remoteState: any
  ) => {
    // Abort any ongoing conflict resolution
    if (conflictResolverRef.current) {
      conflictResolverRef.current.abort()
    }
    
    conflictResolverRef.current = new AbortController()
    
    try {
      setSyncStatus(prev => ({ 
        ...prev, 
        status: 'conflict',
        conflictCount: (prev.conflictCount || 0) + 1
      }))

      // Smart conflict resolution strategies
      const resolution = await resolveConflictAutomatically(localState, remoteState)
      
      if (resolution.canAutoResolve) {
        // Auto-resolve if one is clearly better
        await gameStorage.saveGameState(date, resolution.resolvedState)
        setSyncStatus(prev => ({ 
          ...prev, 
          status: 'synced',
          lastSync: new Date()
        }))
      } else {
        // Show user conflict resolution UI
        window.dispatchEvent(new CustomEvent('show-sync-conflict', {
          detail: { date, localState, remoteState }
        }))
      }
    } catch (error) {
      if (!conflictResolverRef.current?.signal.aborted) {
        console.error('[DeviceSync] Conflict resolution error:', error)
        setSyncStatus(prev => ({ 
          ...prev, 
          status: 'error',
          errorMessage: 'Failed to resolve sync conflict'
        }))
      }
    }
  }, [])

  // Smart conflict resolution
  const resolveConflictAutomatically = useCallback(async (
    localState: any, 
    remoteState: any
  ): Promise<{ canAutoResolve: boolean; resolvedState?: any }> => {
    // Strategy 1: If one is completed and won, prefer that
    if (localState.won && !remoteState.won) {
      return { canAutoResolve: true, resolvedState: localState }
    }
    if (remoteState.won && !localState.won) {
      return { canAutoResolve: true, resolvedState: remoteState }
    }

    // Strategy 2: If one has significantly more progress
    const localProgress = localState.attempts + (localState.currentHintLevel - 1) * 0.5
    const remoteProgress = remoteState.attempts + (remoteState.current_hint_level - 1) * 0.5
    
    if (Math.abs(localProgress - remoteProgress) >= 1.5) {
      return { 
        canAutoResolve: true, 
        resolvedState: localProgress > remoteProgress ? localState : remoteState 
      }
    }

    // Strategy 3: If timestamps are far apart (>1 hour), prefer more recent
    const localTime = localState.lastModified || 0
    const remoteTime = new Date(remoteState.last_modified || 0).getTime()
    const timeDiff = Math.abs(localTime - remoteTime)
    
    if (timeDiff > 60 * 60 * 1000) { // 1 hour
      return {
        canAutoResolve: true,
        resolvedState: localTime > remoteTime ? localState : remoteState
      }
    }

    // Can't auto-resolve - needs user input
    return { canAutoResolve: false }
  }, [])

  // Manual sync trigger
  const triggerSync = useCallback(async (force: boolean = false) => {
    if (!isAuthenticated || !isOnline) return

    try {
      setSyncStatus(prev => ({ ...prev, status: 'syncing' }))
      
      // Get conflicts and handle them
      const conflicts = await gameStorage.getMergeableConflicts()
      
      if (conflicts.length > 0 && !force) {
        setSyncStatus(prev => ({ 
          ...prev, 
          status: 'conflict',
          conflictCount: conflicts.length
        }))
        
        // Show conflict resolution UI
        window.dispatchEvent(new CustomEvent('show-data-merge-modal', {
          detail: { conflicts, trigger: 'manual-sync' }
        }))
        return
      }

      // Perform full sync
      await gameStorage.performFullSync()
      
      setSyncStatus(prev => ({ 
        ...prev, 
        status: 'synced',
        lastSync: new Date(),
        conflictCount: 0
      }))
    } catch (error) {
      console.error('[DeviceSync] Manual sync error:', error)
      setSyncStatus(prev => ({ 
        ...prev, 
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Sync failed'
      }))
    }
  }, [isAuthenticated, isOnline])

  // Background sync every 5 minutes when online and authenticated
  useEffect(() => {
    if (!isAuthenticated || !isOnline) {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
        syncIntervalRef.current = null
      }
      return
    }

    syncIntervalRef.current = setInterval(() => {
      triggerSync(false)
    }, 5 * 60 * 1000) // 5 minutes

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [isAuthenticated, isOnline, triggerSync])

  // Sync on focus (when returning to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated && isOnline) {
        triggerSync(false)
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [isAuthenticated, isOnline, triggerSync])

  return {
    syncStatus,
    isOnline,
    triggerSync,
    deviceId: deviceId(),
    canSync: isAuthenticated && isOnline
  }
}

// 2. Enhanced Game Storage with Device Tracking
// lib/gameStorage.ts additions
export class EnhancedGameStorage extends GameStorage {
  async performFullSync(): Promise<void> {
    if (!this.user) return

    try {
      // Get all local and cloud data
      const localDates = this.getAllLocalDates()
      const { data: cloudData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', this.user.id)

      const cloudMap = new Map(cloudData?.map(item => [item.date, item]) || [])
      
      // Sync each date
      for (const date of localDates) {
        const localState = this.loadFromLocalStorage(date)
        const cloudState = cloudMap.get(date)
        
        if (localState && (!cloudState || this.shouldUpdateCloud(localState, cloudState))) {
          await this.saveToDatabase(date, localState)
        }
      }

      // Pull down any cloud data not present locally
      for (const [date, cloudItem] of cloudMap) {
        const localState = this.loadFromLocalStorage(date)
        if (!localState) {
          const gameState = this.cloudRowToGameState(cloudItem, date)
          this.saveToLocalStorage(date, gameState)
        }
      }
    } catch (error) {
      console.error('[GameStorage] Full sync failed:', error)
      throw error
    }
  }

  private shouldUpdateCloud(localState: any, cloudState: any): boolean {
    // Compare modification times and progress
    const localTime = localState.lastModified || 0
    const cloudTime = new Date(cloudState.last_modified || 0).getTime()
    
    // Local is newer
    if (localTime > cloudTime + 5000) return true // 5 second buffer
    
    // Local has more progress
    if (localState.attempts > cloudState.attempts) return true
    if (localState.won && !cloudState.won) return true
    
    return false
  }

  async saveGameStateWithDevice(date: string, state: any): Promise<void> {
    // Add device tracking to saves
    const deviceId = localStorage.getItem('frameguessr-device-id')
    const stateWithDevice = {
      ...state,
      device_id: deviceId,
      last_modified: new Date().toISOString()
    }
    
    return this.saveGameState(date, stateWithDevice)
  }
}

// 3. Sync Status Component
// components/ui/SyncStatus.tsx
import React from 'react'
import { Cloud, CloudOff, RefreshCw, AlertTriangle, Check, Wifi, WifiOff } from 'lucide-react'
import { useDeviceSync } from '@/hooks/useDeviceSync'

export function SyncStatus() {
  const { syncStatus, isOnline, triggerSync, canSync } = useDeviceSync()

  const getSyncIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4 text-stone-400" />
    if (!canSync) return <CloudOff className="w-4 h-4 text-stone-400" />
    
    switch (syncStatus.status) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
      case 'synced':
        return <Check className="w-4 h-4 text-green-600" />
      case 'conflict':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <Cloud className="w-4 h-4 text-stone-600" />
    }
  }

  const getSyncText = () => {
    if (!isOnline) return 'Offline'
    if (!canSync) return 'Sign in to sync'
    
    switch (syncStatus.status) {
      case 'syncing':
        return 'Syncing...'
      case 'synced':
        return syncStatus.lastSync ? 
          `Synced ${formatTimeAgo(syncStatus.lastSync)}` : 'Synced'
      case 'conflict':
        return `${syncStatus.conflictCount || 1} conflict${syncStatus.conflictCount !== 1 ? 's' : ''}`
      case 'error':
        return 'Sync failed'
      default:
        return 'Ready to sync'
    }
  }

  return (
    <button
      onClick={() => canSync && triggerSync(false)}
      disabled={!canSync || syncStatus.status === 'syncing'}
      className="flex items-center gap-2 px-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title={syncStatus.errorMessage || getSyncText()}
    >
      {getSyncIcon()}
      <span className="hidden sm:inline">{getSyncText()}</span>
    </button>
  )
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  return date.toLocaleDateString()
}

// 4. Conflict Resolution Modal
// components/sync/ConflictResolutionModal.tsx
import { useState } from 'react'
import { X, Smartphone, Cloud, ArrowRight } from 'lucide-react'

interface ConflictResolutionModalProps {
  isOpen: boolean
  onClose: () => void
  conflicts: Array<{
    date: string
    localState: any
    remoteState: any
  }>
  onResolve: (resolutions: Record<string, 'local' | 'remote' | 'merge'>) => void
}

export function ConflictResolutionModal({ 
  isOpen, 
  onClose, 
  conflicts, 
  onResolve 
}: ConflictResolutionModalProps) {
  const [resolutions, setResolutions] = useState<Record<string, 'local' | 'remote' | 'merge'>>({})

  if (!isOpen) return null

  const handleResolve = () => {
    onResolve(resolutions)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                Sync Conflicts Detected
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                Choose which version to keep for each date
              </p>
            </div>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {conflicts.map((conflict) => (
            <div key={conflict.date} className="border border-stone-200 dark:border-stone-700 rounded-lg p-4">
              <h3 className="font-semibold mb-3">{conflict.date}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-amber-600" />
                    <span className="font-medium">This Device</span>
                  </div>
                  <div className="text-sm text-stone-600 dark:text-stone-400">
                    {formatGameStateForConflict(conflict.localState)}
                  </div>
                  <button
                    onClick={() => setResolutions(prev => ({ ...prev, [conflict.date]: 'local' }))}
                    className={`w-full p-2 rounded text-sm transition-colors ${
                      resolutions[conflict.date] === 'local'
                        ? 'bg-amber-600 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    Keep This Version
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Other Device</span>
                  </div>
                  <div className="text-sm text-stone-600 dark:text-stone-400">
                    {formatGameStateForConflict(conflict.remoteState)}
                  </div>
                  <button
                    onClick={() => setResolutions(prev => ({ ...prev, [conflict.date]: 'remote' }))}
                    className={`w-full p-2 rounded text-sm transition-colors ${
                      resolutions[conflict.date] === 'remote'
                        ? 'bg-blue-600 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    Keep Other Version
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleResolve}
              disabled={Object.keys(resolutions).length !== conflicts.length}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Resolve Conflicts
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatGameStateForConflict(state: any): string {
  if (state.won) return `Won in ${state.attempts} attempts`
  if (state.completed) return `Lost after ${state.attempts} attempts`
  if (state.attempts > 0) return `In progress - ${state.attempts} attempts`
  return 'Not started'
}