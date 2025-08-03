'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Trophy, Check, AlertCircle, Database, Smartphone, Cloud, Clock, Info } from 'lucide-react'
import { DataConflict, SyncDecision, gameStorage } from '@/lib/gameStorage'
import { getGameStatus } from '@/types'

interface DataMergeModalProps {
  isOpen: boolean
  onClose: () => void
  conflicts: DataConflict[]
}

interface DataSummary {
  localGames: number
  localCompleted: number
  localInProgress: number
  cloudGames: number
  mergeableGames: number
}

export default function DataMergeModal({ 
  isOpen, 
  onClose, 
  conflicts
}: DataMergeModalProps) {
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set())
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [merging, setMerging] = useState(false)

  const mergeableConflicts = conflicts.filter(c => c.type === 'mergeable')
  const nonMergeableConflicts = conflicts.filter(c => c.type === 'not-mergeable')

  useEffect(() => {
    if (isOpen) {
      loadDataSummary()
      const mergeableDates = mergeableConflicts.map(c => c.date)
      setSelectedDates(new Set(mergeableDates))
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

  const handleMergeSelected = async () => {
    if (selectedDates.size === 0) return
    
    setMerging(true)
    try {
      await gameStorage.mergeSelectedDates(Array.from(selectedDates))
      onClose()
    } catch (error) {
      console.error('Failed to merge data:', error)
    } finally {
      setMerging(false)
    }
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
                Sync Local Progress
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                Import games from this device
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

          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">How syncing works:</p>
                <ul className="text-xs space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• Only days you haven't played online can be imported</li>
                  <li>• Days with any online progress are protected</li>
                  <li>• Your local progress is never affected</li>
                </ul>
              </div>
            </div>
          </div>

          {mergeableConflicts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                Available to Import ({mergeableConflicts.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {mergeableConflicts.map((conflict) => (
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
            </div>
          )}

          {nonMergeableConflicts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3 flex items-center gap-2">
                <X className="w-4 h-4 text-red-600" />
                Already Have Online Progress ({nonMergeableConflicts.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto opacity-60">
                {nonMergeableConflicts.map((conflict) => (
                  <div
                    key={conflict.date}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getConflictIcon(conflict)}
                        <span className="font-medium text-stone-900 dark:text-stone-100">
                          {formatDate(conflict.date)}
                        </span>
                      </div>
                      <p className="text-sm text-stone-600 dark:text-stone-400">
                        Local: {getConflictDescription(conflict)}
                      </p>
                      {conflict.cloudData && (
                        <p className="text-xs text-stone-500 dark:text-stone-500">
                          Online: {getGameStatus(conflict.cloudData) === 'completed-won' ? 'Won' :
                                  getGameStatus(conflict.cloudData) === 'completed-lost' ? 'Lost' :
                                  `Scene ${conflict.cloudData.currentHintLevel}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {mergeableConflicts.length > 0 && (
              <button
                onClick={handleMergeSelected}
                disabled={selectedDates.size === 0 || merging}
                className="w-full p-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-stone-400 disabled:to-stone-500 text-white rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {merging ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Cloud className="w-5 h-5" />
                    Import Selected ({selectedDates.size})
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={onClose}
              disabled={merging}
              className="w-full p-3 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl font-medium transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}