'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getTodayLocal } from '@/utils/dateUtils'

export default function HomePage() {
  const router = useRouter()
  
  useEffect(() => {
    // Use client-side redirect to ensure user's timezone is used
    const today = getTodayLocal()
    router.replace(`/day/${today}`)
  }, [router])

  // Show a minimal loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-amber-50/30 to-rose-50/20 dark:from-stone-950 dark:via-amber-950/20 dark:to-rose-950/10">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-600 dark:text-stone-400 text-sm">
          Loading today's challenge...
        </p>
      </div>
    </div>
  )
}