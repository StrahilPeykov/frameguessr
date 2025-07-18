'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, subDays, addDays, isAfter, isBefore, startOfDay } from 'date-fns'

interface DatePickerProps {
  currentDate: string
  onDateSelect: (date: string) => void
  minDate?: string
}

export default function DatePicker({ 
  currentDate, 
  onDateSelect, 
  minDate = '2025-07-01' 
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false)
  const router = useRouter()
  
  const today = format(new Date(), 'yyyy-MM-dd')
  const current = new Date(currentDate)
  const min = new Date(minDate)
  
  const canGoBack = isAfter(current, min)
  const canGoForward = isBefore(current, startOfDay(new Date()))
  
  const prevDay = canGoBack ? format(subDays(current, 1), 'yyyy-MM-dd') : null
  const nextDay = canGoForward ? format(addDays(current, 1), 'yyyy-MM-dd') : null
  
  // Prefetch adjacent days for faster navigation
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
  
  return (
    <div className="flex items-center justify-center gap-4 mb-6">
      {/* Previous Day Button with Link prefetching */}
      {prevDay ? (
        <Link
          href={`/day/${prevDay}`}
          className="p-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
      ) : (
        <div className="p-2 text-gray-300 dark:text-gray-600 cursor-not-allowed">
          <ChevronLeft className="w-5 h-5" />
        </div>
      )}
      
      {/* Date Display */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          <span className="font-medium">
            {isToday ? 'Today' : format(current, 'MMM d, yyyy')}
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
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Next Day Button with Link prefetching */}
      {nextDay ? (
        <Link
          href={`/day/${nextDay}`}
          className="p-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
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