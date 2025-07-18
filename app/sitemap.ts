import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://frameguessr.vercel.app'
  
  // Get all available dates from the database
  const { data: dates } = await supabase
    .from('daily_movies')
    .select('date')
    .order('date', { ascending: false })
  
  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  // Add all daily challenge pages
  if (dates) {
    for (const { date } of dates) {
      sitemapEntries.push({
        url: `${baseUrl}/day/${date}`,
        lastModified: new Date(date),
        changeFrequency: 'never', // Past challenges don't change
        priority: date === new Date().toISOString().split('T')[0] ? 1 : 0.8,
      })
    }
  }

  return sitemapEntries
}