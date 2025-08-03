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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-4 sm:pt-8 p-2 sm:p-4 z-50">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Import Local Progress
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Sync games from this device
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

        <div className="p-4">
          {dataSummary && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700/30">
                <Smartphone className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-amber-900 dark:text-amber-100">
                  {dataSummary.localGames}
                </div>
                <div className="text-xs text-amber-700 dark:text-amber-300">
                  On Device
                </div>
              </div>
              
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700/30">
                <Cloud className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {dataSummary.cloudGames}
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  In Account
                </div>
              </div>
            </div>
          )}

          {mergeableConflicts.length > 0 ? (
            <>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Available to Import ({mergeableConflicts.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {mergeableConflicts.map((conflict) => (
                    <div
                      key={conflict.date}
                      className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer ${
                        selectedDates.has(conflict.date)
                          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-600'
                          : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                      }`}
                      onClick={() => toggleDateSelection(conflict.date)}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        selectedDates.has(conflict.date)
                          ? 'bg-amber-600 border-amber-600 text-white'
                          : 'border-stone-300 dark:border-stone-600'
                      }`}>
                        {selectedDates.has(conflict.date) && (
                          <Check className="w-2.5 h-2.5" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getConflictIcon(conflict)}
                          <span className="font-medium text-stone-900 dark:text-stone-100 text-sm">
                            {formatDate(conflict.date)}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400">
                          {getConflictDescription(conflict)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleMergeSelected}
                  disabled={selectedDates.size === 0 || merging}
                  className="w-full p-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-stone-400 disabled:to-stone-500 text-white rounded-lg font-semibold transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {merging ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Cloud className="w-4 h-4" />
                      Import Selected ({selectedDates.size})
                    </>
                  )}
                </button>
                
                <button
                  onClick={onClose}
                  disabled={merging}
                  className="w-full p-2 text-stone-600 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-medium text-stone-900 dark:text-stone-100 mb-1">All Synced!</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
                No local games to import
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}