'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerProps {
  currentDate: string
  onDateSelect: (date: string) => void
  minDate?: string
  compact?: boolean
  mobile?: boolean
}

export default function DatePicker({ 
  currentDate, 
  onDateSelect, 
  minDate = '2025-07-01',
  compact = false,
  mobile = false
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false)
  const router = useRouter()
  
  const today = new Date().toISOString().split('T')[0]
  const current = new Date(currentDate)
  const min = new Date(minDate)
  
  // Helper to format date
  const formatDate = (date: Date, format: string): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    
    if (format === 'MMM d') {
      return `${months[date.getMonth()]} ${date.getDate()}`
    } else if (format === 'MMM d, yyyy') {
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
    } else if (format === 'MMMM d, yyyy') {
      return `${fullMonths[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
    }
    return date.toLocaleDateString()
  }
  
  // Helper to add/subtract days
  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }
  
  const canGoBack = current > min
  const canGoForward = currentDate < today
  
  const prevDay = canGoBack ? addDays(current, -1).toISOString().split('T')[0] : null
  const nextDay = canGoForward ? addDays(current, 1).toISOString().split('T')[0] : null
  
  // Prefetch adjacent days
  useEffect(() => {
    if (prevDay) {
      router.prefetch(`/day/${prevDay}`)
    }
    if (nextDay) {
      router.prefetch(`/day/${nextDay}`)
    }
  }, [router, prevDay, nextDay])
  
  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.value
    const selectedDate = new Date(selected)
    
    if (selectedDate >= min && selectedDate <= new Date()) {
      onDateSelect(selected)
      setShowPicker(false)
    }
  }
  
  const isToday = currentDate === today

  // Mobile compact version
  if (mobile) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={prevDay ? `/day/${prevDay}` : '#'}
          className={`p-1.5 rounded-lg ${
            prevDay 
              ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-yellow-600 dark:hover:text-yellow-400' 
              : 'text-gray-300 dark:text-gray-600 pointer-events-none'
          }`}
          aria-label="Previous day"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
        
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="text-sm font-medium px-2 py-1 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
        >
          {isToday ? 'Today' : formatDate(current, 'MMM d')}
        </button>
        
        <Link
          href={nextDay ? `/day/${nextDay}` : '#'}
          className={`p-1.5 rounded-lg ${
            nextDay
              ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-yellow-600 dark:hover:text-yellow-400'
              : 'text-gray-300 dark:text-gray-600 pointer-events-none'
          }`}
          aria-label="Next day"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
        
        {showPicker && (
          <div className="absolute top-full mt-1 right-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3">
              <input
                type="date"
                value={currentDate}
                min={minDate}
                max={today}
                onChange={handleDateInput}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:border-yellow-500 dark:focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 dark:focus:ring-yellow-400"
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  // Compact version for desktop nav
  if (compact) {
    return (
      <div className="flex items-center">
        {prevDay ? (
          <Link
            href={`/day/${prevDay}`}
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
        ) : (
          <div className="p-1.5 text-gray-300 dark:text-gray-600">
            <ChevronLeft className="w-4 h-4" />
          </div>
        )}
        
        <div className="relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-yellow-600 dark:hover:text-yellow-400 rounded-lg transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>{isToday ? 'Today' : formatDate(current, 'MMM d, yyyy')}</span>
          </button>
          
          {showPicker && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
                <input
                  type="date"
                  value={currentDate}
                  min={minDate}
                  max={today}
                  onChange={handleDateInput}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-yellow-500 dark:focus:border-yellow-400 focus:ring-2 focus:ring-yellow-500/20 dark:focus:ring-yellow-400/20"
                />
              </div>
            </div>
          )}
        </div>
        
        {nextDay ? (
          <Link
            href={`/day/${nextDay}`}
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Next day"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <div className="p-1.5 text-gray-300 dark:text-gray-600">
            <ChevronRight className="w-4 h-4" />
          </div>
        )}
      </div>
    )
  }

  // Original full version
  return (
    <div className="flex items-center justify-center gap-4 mb-6">
      {prevDay ? (
        <Link
          href={`/day/${prevDay}`}
          className="p-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
      ) : (
        <div className="p-2 text-gray-300 dark:text-gray-600 cursor-not-allowed">
          <ChevronLeft className="w-5 h-5" />
        </div>
      )}
      
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 hover:border-yellow-500/50 dark:hover:border-yellow-400/50 transition-colors border border-transparent"
        >
          <Calendar className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <span className="font-medium">
            {isToday ? 'Today' : formatDate(current, 'MMM d, yyyy')}
          </span>
        </button>
        
        {showPicker && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
              <input
                type="date"
                value={currentDate}
                min={minDate}
                max={today}
                onChange={handleDateInput}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-yellow-500 dark:focus:border-yellow-400 focus:ring-2 focus:ring-yellow-500/20 dark:focus:ring-yellow-400/20"
              />
            </div>
          </div>
        )}
      </div>
      
      {nextDay ? (
        <Link
          href={`/day/${nextDay}`}
          className="p-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
          aria-label="Next day"
        >
          <ChevronRight className="w-5 h-5" />
        </Link>
      ) : (
        <div className="p-2 text-gray-300 dark:text-gray-600 cursor-not-allowed">
          <ChevronRight className="w-5 h-5" />
        </div>
      )}
    </div>
  )
}