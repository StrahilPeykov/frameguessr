'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, ChevronLeft, ChevronRight, Clock, Film } from 'lucide-react'

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
      <div className="flex items-center">
        <Link
          href={prevDay ? `/day/${prevDay}` : '#'}
          className={`p-1.5 rounded-lg transition-all duration-300 cinema-touch ${
            prevDay 
              ? 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/50 hover:text-amber-600 dark:hover:text-amber-400' 
              : 'text-stone-300 dark:text-stone-600 pointer-events-none opacity-50'
          }`}
          aria-label="Previous screening"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
        
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="text-sm font-medium px-2 py-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800/50 cinema-touch min-w-[80px] text-center"
        >
          {isToday ? 'Today' : formatDate(current, 'MMM d')}
        </button>
        
        <Link
          href={nextDay ? `/day/${nextDay}` : '#'}
          className={`p-1.5 rounded-lg transition-all duration-300 cinema-touch ${
            nextDay
              ? 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/50 hover:text-amber-600 dark:hover:text-amber-400'
              : 'text-stone-300 dark:text-stone-600 pointer-events-none opacity-50'
          }`}
          aria-label="Next screening"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
        
        {showPicker && (
          <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50">
            <div className="cinema-glass rounded-xl shadow-2xl border border-stone-200 dark:border-amber-700/30 p-4">
              <input
                type="date"
                value={currentDate}
                min={minDate}
                max={today}
                onChange={handleDateInput}
                className="px-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 cinema-focus"
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
            className="p-2 rounded-xl text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800/50 transition-all duration-300 cinema-touch"
            aria-label="Previous screening"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
        ) : (
          <div className="p-2 text-stone-300 dark:text-stone-600">
            <ChevronLeft className="w-4 h-4" />
          </div>
        )}
        
        <div className="relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800/50 hover:text-amber-600 dark:hover:text-amber-400 rounded-xl transition-all duration-300 cinema-touch group"
          >
            <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-500 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors" />
            <span className="text-stone-700 dark:text-stone-200">{isToday ? 'Today' : formatDate(current, 'MMM d, yyyy')}</span>
          </button>
          
          {showPicker && (
            <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 z-50">
              <div className="cinema-glass rounded-2xl shadow-2xl border border-stone-200 dark:border-amber-700/30 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Film className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-200">Select Date</span>
                </div>
                <input
                  type="date"
                  value={currentDate}
                  min={minDate}
                  max={today}
                  onChange={handleDateInput}
                  className="px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-xl bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 cinema-focus w-full"
                />
              </div>
            </div>
          )}
        </div>
        
        {nextDay ? (
          <Link
            href={`/day/${nextDay}`}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800/50 transition-all duration-300 cinema-touch"
            aria-label="Next screening"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <div className="p-2 text-stone-300 dark:text-stone-600">
            <ChevronRight className="w-4 h-4" />
          </div>
        )}
      </div>
    )
  }

  // Original full version with cinema styling
  return (
    <div className="flex items-center justify-center gap-6 mb-8">
      {prevDay ? (
        <Link
          href={`/day/${prevDay}`}
          className="p-3 rounded-2xl transition-all duration-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 cinema-btn group shadow-lg hover:shadow-xl"
          aria-label="Previous screening"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </Link>
      ) : (
        <div className="p-3 text-stone-300 dark:text-stone-600 cursor-not-allowed">
          <ChevronLeft className="w-6 h-6" />
        </div>
      )}
      
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-3 px-6 py-4 cinema-glass rounded-2xl hover:bg-stone-100/80 dark:hover:bg-stone-800/80 border border-stone-200/50 dark:border-amber-700/50 transition-all duration-300 cinema-btn group shadow-lg hover:shadow-xl"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            {isToday ? (
              <Clock className="w-5 h-5 text-white" />
            ) : (
              <Calendar className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="text-left">
            <div className="font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
              {isToday ? 'Tonight\'s Feature' : 'Past Screening'}
            </div>
            <div className="text-sm text-stone-600 dark:text-stone-400">
              {formatDate(current, 'MMMM d, yyyy')}
            </div>
          </div>
        </button>
        
        {showPicker && (
          <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 z-50">
            <div className="cinema-glass rounded-2xl shadow-2xl border border-stone-200/50 dark:border-amber-700/50 p-6 min-w-[280px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Film className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-stone-900 dark:text-stone-100">
                  Choose Screening Date
                </span>
              </div>
              <input
                type="date"
                value={currentDate}
                min={minDate}
                max={today}
                onChange={handleDateInput}
                className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-xl bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 cinema-focus"
              />
              <div className="mt-3 text-xs text-stone-500 dark:text-stone-400 text-center">
                Available from {formatDate(min, 'MMM d, yyyy')} to today
              </div>
            </div>
          </div>
        )}
      </div>
      
      {nextDay ? (
        <Link
          href={`/day/${nextDay}`}
          className="p-3 rounded-2xl transition-all duration-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 cinema-btn group shadow-lg hover:shadow-xl"
          aria-label="Next screening"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </Link>
      ) : (
        <div className="p-3 text-stone-300 dark:text-stone-600 cursor-not-allowed">
          <ChevronRight className="w-6 h-6" />
        </div>
      )}
    </div>
  )
}