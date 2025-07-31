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

export default function CleanArchivePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-rose-50/20 dark:from-stone-950 dark:via-amber-950/20 dark:to-rose-950/10">
      <ArchiveHeader />
      
      <main className="pt-20 pb-12">
        <div className="max-w-5xl mx-auto px-4">
          {/* Simple page title */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold cinema-gradient-text mb-2">
              Challenge Archive
            </h1>
            <p className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              Browse your progress across all daily movie puzzles
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
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
      {Array.from({ length: 36 }).map((_, i) => (
        <div key={i} className="aspect-square bg-stone-100 dark:bg-stone-800/50 rounded-xl animate-pulse" />
      ))}
    </div>
  )
}