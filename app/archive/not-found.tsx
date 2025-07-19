import Link from 'next/link'
import { Home, Film } from 'lucide-react'

export default function ArchiveNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-rose-50/20 dark:from-stone-950 dark:via-amber-950/20 dark:to-rose-950/10">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full text-center">
          <div className="cinema-glass rounded-3xl p-8 shadow-2xl border border-stone-200/50 dark:border-stone-800/50">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-stone-500 to-stone-600 flex items-center justify-center mx-auto mb-4">
              <Film className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold mb-3 text-stone-900 dark:text-stone-100">
              Archive Not Found
            </h1>
            
            <p className="text-stone-600 dark:text-stone-400 mb-6">
              This section of the film vault doesn't exist yet.
            </p>
            
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl cinema-btn"
            >
              <Home className="w-5 h-5" />
              Return to Game
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}