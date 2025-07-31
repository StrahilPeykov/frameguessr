import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://frameguessr.com'
  
  // Get all available dates from the database
  const { data: dates } = await supabase
    .from('daily_movies')
    .select('date')
    .order('date', { ascending: false })
  
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  
  const sitemapEntries: MetadataRoute.Sitemap = [
    // Homepage - highest priority
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
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
      
      // Determine priority and change frequency based on recency
      let priority = 0.8
      let changeFrequency: 'daily' | 'weekly' | 'monthly' | 'never' = 'never'
      
      if (date === today) {
        // Today's challenge - highest priority
        priority = 1
        changeFrequency = 'daily'
      } else if (daysDiff <= 7) {
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
        lastModified: date === today ? now : dateObj,
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

// ================================================================
// Additional SEO utility functions

export const SEO_CONFIG = {
  defaultTitle: 'FrameGuessr - #1 Daily Movie & TV Guessing Game',
  titleTemplate: '%s | FrameGuessr',
  defaultDescription: 'Can you guess the movie from one frame? Play FrameGuessr - the ultimate daily movie guessing game with progressive hints and audio clues.',
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://frameguessr.com',
  twitterHandle: '@frameguessr',
  
  // Core keywords that should appear on every page
  coreKeywords: [
    'frameguessr',
    'movie guessing game', 
    'daily movie challenge',
    'guess the movie',
    'frame quiz',
    'movie stills game',
    'film identification',
    'cinema challenge',
    'framed alternative',
    'movie wordle'
  ],
  
  // Competitive keywords
  competitiveKeywords: [
    'better than framed',
    'framed game alternative', 
    'frame quiz alternative',
    'movie game like wordle',
    'daily movie puzzle game',
    'movie screenshot quiz'
  ],
  
  // Long-tail keywords people search for
  longTailKeywords: [
    'guess movie from single frame',
    'movie identification game online',
    'daily film challenge game',
    'can you name this movie game',
    'movie frame guessing game',
    'film still quiz game',
    'movie scene identification',
    'hollywood movie quiz daily'
  ]
}

// Helper function to generate optimized meta descriptions
export function generateMetaDescription(
  pageType: 'home' | 'daily' | 'archive' | 'about',
  context?: { date?: string; isToday?: boolean; movieTitle?: string }
): string {
  const base = 'FrameGuessr - the ultimate movie guessing game'
  
  switch (pageType) {
    case 'home':
      return 'Can you guess the movie from one frame? Play FrameGuessr - the #1 daily movie guessing game. Progressive hints, audio clues, and new challenges every day. Beat Framed, Frame Quiz, and more!'
      
    case 'daily':
      if (context?.isToday) {
        return 'Play today\'s FrameGuessr challenge! Can you identify today\'s featured movie or TV show from just one frame? Progressive hints and audio clues available. Free daily movie puzzle!'
      } else if (context?.date) {
        const dateObj = new Date(context.date + 'T00:00:00.000Z')
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })
        return `Play the FrameGuessr challenge from ${formattedDate}! Test your movie knowledge with this classic film puzzle. Can you guess the movie from one frame?`
      }
      return 'Daily movie guessing challenge! Can you identify the featured film from a single frame? Progressive hints and audio clues available.'
      
    case 'archive':
      return 'Browse all FrameGuessr challenges! Play past daily movie puzzles, test your film knowledge, and discover classic cinema. Complete archive of movie guessing games.'
      
    case 'about':
      return 'About FrameGuessr - the premier daily movie guessing game. Learn how to play, discover our features, and join thousands of film enthusiasts in the ultimate cinema challenge.'
      
    default:
      return SEO_CONFIG.defaultDescription
  }
}

// Helper function to generate optimal page titles
export function generatePageTitle(
  pageType: 'home' | 'daily' | 'archive' | 'about',
  context?: { date?: string; isToday?: boolean; movieTitle?: string }
): string {
  switch (pageType) {
    case 'home':
      return 'FrameGuessr - #1 Daily Movie & TV Guessing Game | Beat Framed & Frame Quiz'
      
    case 'daily':
      if (context?.isToday) {
        return 'FrameGuessr Today - Can You Guess Today\'s Movie? Daily Film Challenge'
      } else if (context?.date) {
        const dateObj = new Date(context.date + 'T00:00:00.000Z')
        const shortDate = dateObj.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })
        return `FrameGuessr ${shortDate} - Daily Movie Challenge Archive`
      }
      return 'FrameGuessr Daily Challenge - Guess Today\'s Movie'
      
    case 'archive':
      return 'FrameGuessr Archive - All Daily Movie Challenges | Play Past Games'
      
    case 'about':
      return 'About FrameGuessr - How to Play the Ultimate Movie Guessing Game'
      
    default:
      return SEO_CONFIG.defaultTitle
  }
}

// Schema.org structured data templates
export const STRUCTURED_DATA_TEMPLATES = {
  game: {
    '@context': 'https://schema.org',
    '@type': 'Game',
    'name': 'FrameGuessr',
    'genre': 'Puzzle',
    'playMode': 'SinglePlayer',
    'applicationCategory': 'Game',
    'isAccessibleForFree': true,
  },
  
  faq: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'How do you play FrameGuessr?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Each day features a blurred movie frame. You have 3 attempts to guess correctly, with progressive hints (less blur, taglines, audio) unlocking after each guess.'
        }
      }
    ]
  },
  
  breadcrumb: {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': []
  }
}