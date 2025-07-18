// This is optional - you can skip this file if you don't need day-specific layout

export default function DayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

// Alternative: If you want to add day-specific analytics or layout
/*
'use client'

import { useParams } from 'next/navigation'
import { useEffect } from 'react'

export default function DayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const date = params.date as string

  useEffect(() => {
    // Track day-specific analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: `FrameGuessr Day ${date}`,
        page_location: window.location.href,
        custom_parameter: { challenge_date: date }
      })
    }
  }, [date])

  return children
}
*/