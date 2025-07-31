import { Suspense } from 'react'
import ArchiveGrid from '@/components/archive/ArchiveGrid'
import ArchiveHeader from '@/components/archive/ArchiveHeader'

export const metadata = {
  title: 'Archive - Browse All Challenges | FrameGuessr',
  description: 'Browse through all past FrameGuessr daily movie challenges. See your progress and replay any day.',
  keywords: [
    'frameguessr archive',
    'past movie challenges',
    'movie quiz history',
    'daily challenge archive',
    'frameguessr all games',
    'movie puzzle collection'
  ],
  openGraph: {
    title: 'FrameGuessr Archive - All Daily Challenges',
    description: 'Browse and play any past FrameGuessr challenge. Track your progress across all daily movie puzzles.',
    url: 'https://frameguessr.com/archive',
  },
}

export default function ArchivePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-rose-50/20 dark:from-stone-950 dark:via-amber-950/20 dark:to-rose-950/10">
      <ArchiveHeader />
      
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Page Title */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold cinema-gradient-text mb-3">
              Challenge Archive
            </h1>
            <p className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              Browse through all past daily challenges. Green means you won, red means you tried but didn't guess it, 
              and gray means you haven't played that day yet.
            </p>
          </div>

          {/* Archive Grid */}
          <Suspense fallback={<ArchiveGridSkeleton />}>
            <ArchiveGrid />
          </Suspense>
        </div>
      </main>
    </div>
  )
}

function ArchiveGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="aspect-square cinema-glass rounded-xl p-4 animate-pulse">
          <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded mb-2" />
          <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4" />
        </div>
      ))}
    </div>
  )
}