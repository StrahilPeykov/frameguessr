'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Trophy, Check, AlertCircle, Database, Smartphone, Cloud, Clock, Zap } from 'lucide-react'
import { DataConflict, SyncDecision, gameStorage } from '@/lib/gameStorage'
import { getGameStatus } from '@/types'

interface DataMergeModalProps {
  isOpen: boolean
  onClose: () => void
  conflicts: DataConflict[]
  isAccountEmpty?: boolean
  onDecision: (decision: SyncDecision) => void
}

interface DataSummary {
  localGames: number
  localCompleted: number
  localInProgress: number
  cloudGames: number
  conflicts: number
}

export default function DataMergeModal({ 
  isOpen, 
  onClose, 
  conflicts, 
  isAccountEmpty = false,
  onDecision 
}: DataMergeModalProps) {
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary')
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadDataSummary()
      
      // Pre-select all local-only items
      const localOnlyDates = conflicts
        .filter(c => c.type === 'local-only')
        .map(c => c.date)
      setSelectedDates(new Set(localOnlyDates))
      
      // Reset view mode
      setViewMode('summary')
    }
  }, [isOpen, conflicts])

  const loadDataSummary = async () => {
    try {
      const summary = await gameStorage.getDataSummary()
      setDataSummary(summary)
    } catch (error) {
      console.error('Failed to load data summary:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const handleDecision = (decision: SyncDecision) => {
    onDecision(decision)
    onClose()
  }

  const handleImportAll = () => {
    handleDecision({ 
      type: 'import-all', 
      clearLocalOnLogout: true 
    })
  }

  const handleMergeSelected = () => {
    handleDecision({ 
      type: 'merge-selected', 
      selectedDates: Array.from(selectedDates),
      clearLocalOnLogout: selectedDates.size > 0
    })
  }

  const handleCleanStart = () => {
    handleDecision({ 
      type: 'clean-start', 
      clearLocalOnLogout: false 
    })
  }

  const handleKeepAccountOnly = () => {
    handleDecision({ 
      type: 'keep-account-only', 
      clearLocalOnLogout: false 
    })
  }

  const toggleDateSelection = (date: string) => {
    const newSelected = new Set(selectedDates)
    if (newSelected.has(date)) {
      newSelected.delete(date)
    } else {
      newSelected.add(date)
    }
    setSelectedDates(newSelected)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getConflictIcon = (conflict: DataConflict) => {
    const localStatus = getGameStatus(conflict.localData)
    
    if (localStatus === 'completed-won') {
      return <Trophy className="w-4 h-4 text-green-600" />
    } else if (localStatus === 'completed-lost') {
      return <X className="w-4 h-4 text-red-600" />
    } else if (localStatus === 'in-progress') {
      return <Clock className="w-4 h-4 text-amber-600" />
    } else {
      return <Calendar className="w-4 h-4 text-stone-500" />
    }
  }

  const getConflictDescription = (conflict: DataConflict) => {
    const localData = conflict.localData
    const localStatus = getGameStatus(localData)
    
    if (localStatus === 'completed-won') {
      return `Won in ${localData.attempts} attempt${localData.attempts !== 1 ? 's' : ''}`
    } else if (localStatus === 'completed-lost') {
      return `Lost after ${localData.attempts} attempts`
    } else if (localStatus === 'in-progress') {
      return `In progress - Scene ${localData.currentHintLevel}, ${localData.attempts} attempt${localData.attempts !== 1 ? 's' : ''}`
    }
    
    return 'Not started'
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="cinema-spinner mx-auto mb-4" />
            <p className="text-stone-600 dark:text-stone-400">Analyzing your game data...</p>
          </div>
        </div>
      </div>
    )
  }

  // Empty account scenario
  if (isAccountEmpty) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  Save Your Streak!
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-stone-500 dark:text-stone-400" />
            </button>
          </div>

          <div className="p-6">
            {/* Stats Summary */}
            {dataSummary && (
              <div className="text-center mb-6">
                <div className="mb-4">
                  <div className="text-4xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                    {dataSummary.localGames}
                  </div>
                  <div className="text-stone-600 dark:text-stone-400">
                    puzzle{dataSummary.localGames !== 1 ? 's' : ''} found on this device
                  </div>
                </div>
                
                {dataSummary.localCompleted > 0 && (
                  <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-green-600" />
                      <span className="text-stone-700 dark:text-stone-300">
                        {dataSummary.localCompleted} completed
                      </span>
                    </div>
                    {dataSummary.localInProgress > 0 && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span className="text-stone-700 dark:text-stone-300">
                          {dataSummary.localInProgress} in progress
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Main Message */}
            <div className="text-center mb-6">
              <p className="text-stone-600 dark:text-stone-400">
                Create a free account and we'll back up today's game, plus every puzzle you've finished on this device.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleImportAll}
                className="w-full p-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-3"
              >
                <Cloud className="w-5 h-5" />
                Save All Progress to Account
              </button>

              <button
                onClick={handleCleanStart}
                className="w-full p-4 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Database className="w-5 h-5" />
                Start Fresh Account
              </button>
            </div>

            {/* Info note */}
            <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">What happens next:</p>
                  <ul className="text-xs space-y-1 text-blue-700 dark:text-blue-300">
                    <li>• Your progress syncs across all devices</li>
                    <li>• When you log out, local data is cleared to avoid duplicates</li>
                    <li>• You can always play as guest when logged out</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Account with existing data scenario
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                Merge Found Data
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                We found games on your device
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-stone-500 dark:text-stone-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Data Summary */}
          {dataSummary && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700/30">
                <Smartphone className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {dataSummary.localGames}
                </div>
                <div className="text-sm text-amber-700 dark:text-amber-300">
                  On This Device
                </div>
                {dataSummary.localInProgress > 0 && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    {dataSummary.localInProgress} in progress
                  </div>
                )}
              </div>
              
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700/30">
                <Cloud className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {dataSummary.cloudGames}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  In Your Account
                </div>
              </div>
            </div>
          )}

          {/* Main Message */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
              We noticed you solved {conflicts.length} puzzle{conflicts.length !== 1 ? 's' : ''} on this device
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Choose what to do with your device progress:
            </p>
          </div>

          {/* Tabs for detailed view */}
          <div className="flex border-b border-stone-200 dark:border-stone-700 mb-4">
            <button
              onClick={() => setViewMode('summary')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'summary'
                  ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-600 dark:border-amber-400'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Quick Actions
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'detailed'
                  ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-600 dark:border-amber-400'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Choose Specific Days ({conflicts.length})
            </button>
          </div>

          {/* Content based on view mode */}
          {viewMode === 'summary' ? (
            <div className="space-y-3">
              <button
                onClick={handleImportAll}
                className="w-full p-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-3"
              >
                <Database className="w-5 h-5" />
                Merge All Device Progress
                <span className="text-sm opacity-90">({conflicts.length} puzzles)</span>
              </button>

              <button
                onClick={handleKeepAccountOnly}
                className="w-full p-4 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Cloud className="w-5 h-5" />
                Keep Account Progress Only
              </button>

              <button
                onClick={handleCleanStart}
                className="w-full p-4 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Smartphone className="w-5 h-5" />
                Keep Separate (Play as Guest When Logged Out)
              </button>
            </div>
          ) : (
            <div>
              {/* Detailed selection */}
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {conflicts.map((conflict) => (
                  <div
                    key={conflict.date}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedDates.has(conflict.date)
                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-600'
                        : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                    }`}
                    onClick={() => toggleDateSelection(conflict.date)}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedDates.has(conflict.date)
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : 'border-stone-300 dark:border-stone-600'
                    }`}>
                      {selectedDates.has(conflict.date) && (
                        <Check className="w-3 h-3" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getConflictIcon(conflict)}
                        <span className="font-medium text-stone-900 dark:text-stone-100">
                          {formatDate(conflict.date)}
                        </span>
                      </div>
                      <p className="text-sm text-stone-600 dark:text-stone-400">
                        {getConflictDescription(conflict)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons for detailed view */}
              <div className="space-y-2">
                <button
                  onClick={handleMergeSelected}
                  disabled={selectedDates.size === 0}
                  className="w-full p-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-stone-400 disabled:to-stone-500 text-white rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed"
                >
                  Merge Selected ({selectedDates.size})
                </button>
                
                <button
                  onClick={handleCleanStart}
                  className="w-full p-3 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl font-medium transition-all duration-300"
                >
                  Don't Merge - Keep Separate
                </button>
              </div>
            </div>
          )}

          {/* Info note */}
          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">About data handling:</p>
                <ul className="text-xs space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• Merged progress syncs across all your devices</li>
                  <li>• "Keep Separate" lets you play as guest when logged out</li>
                  <li>• In-progress games are preserved and can be continued</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}