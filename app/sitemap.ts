import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { getTodayLocal } from '@/utils/dateUtils'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://frameguessr.com'
  const today = getTodayLocal()
  
  // Get all available dates from the database
  const { data: dates } = await supabase
    .from('daily_movies')
    .select('date')
    .order('date', { ascending: false })
  
  const now = new Date()
  
  const sitemapEntries: MetadataRoute.Sitemap = [
    // Homepage - highest priority (now shows today's challenge directly)
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    // Archive page - high priority
    {
      url: `${baseUrl}/archive`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // Static pages
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date('2025-01-17'), // Update this when you modify privacy policy
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date('2025-01-17'), // Update this when you modify terms
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // Add all daily challenge pages
  if (dates) {
    for (const { date } of dates) {
      const dateObj = new Date(date)
      const daysDiff = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24))
      
      // Skip today's date since it's now served from the homepage
      if (date === today) {
        continue
      }
      
      // Determine priority and change frequency based on recency
      let priority = 0.8
      let changeFrequency: 'daily' | 'weekly' | 'monthly' | 'never' = 'never'
      
      if (daysDiff <= 7) {
        // Recent challenges - high priority
        priority = 0.9
        changeFrequency = 'weekly'
      } else if (daysDiff <= 30) {
        // Monthly challenges - medium priority
        priority = 0.7
        changeFrequency = 'monthly'
      } else {
        // Older challenges - lower priority
        priority = 0.5
        changeFrequency = 'never'
      }
      
      sitemapEntries.push({
        url: `${baseUrl}/day/${date}`,
        lastModified: dateObj,
        changeFrequency,
        priority,
      })
    }
  }

  // Sort by priority (descending) then by date (descending)
  sitemapEntries.sort((a, b) => {
    if (a.priority !== b.priority) {
      return (b.priority || 0) - (a.priority || 0)
    }
    return new Date(b.lastModified || 0).getTime() - new Date(a.lastModified || 0).getTime()
  })

  return sitemapEntries
}