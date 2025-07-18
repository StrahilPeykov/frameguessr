'use client'

import { useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, subDays, isAfter, isBefore, startOfDay } from 'date-fns'

interface DatePickerProps {
  currentDate: string
  onDateSelect: (date: string) => void
  minDate?: string
}

export default function DatePicker({ currentDate, onDateSelect, minDate = '2025-07-01' }: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false)
  
  const today = format(new Date(), 'yyyy-MM-dd')
  const current = new Date(currentDate)
  const min = new Date(minDate)
  
  const canGoBack = isAfter(current, min)
  const canGoForward = isBefore(current, startOfDay(new Date()))
  
  const handlePreviousDay = () => {
    if (canGoBack) {
      const prevDay = format(subDays(current, 1), 'yyyy-MM-dd')
      onDateSelect(prevDay)
    }
  }
  
  const handleNextDay = () => {
    if (canGoForward) {
      const nextDay = format(new Date(current.getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      onDateSelect(nextDay)
    }
  }
  
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
      <button
        onClick={handlePreviousDay}
        disabled={!canGoBack}
        className={`p-2 rounded-lg transition-all ${
          canGoBack 
            ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400' 
            : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
        }`}
        aria-label="Previous day"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
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
      
      <button
        onClick={handleNextDay}
        disabled={!canGoForward}
        className={`p-2 rounded-lg transition-all ${
          canGoForward 
            ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400' 
            : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
        }`}
        aria-label="Next day"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}