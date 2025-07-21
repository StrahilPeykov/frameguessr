import Link from 'next/link'
import { Film, Home, Calendar, Search } from 'lucide-react'

export default function NotFound() {
  const today = new Date().toISOString().split('T')[0]
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-stone-50 via-amber-50/30 to-rose-50/20 dark:from-stone-950 dark:via-amber-950/20 dark:to-rose-950/10">
      <div className="max-w-md w-full">
        <div className="cinema-glass rounded-3xl p-8 md:p-12 text-center shadow-2xl border border-stone-200/30 dark:border-amber-700/30">
          {/* 404 Icon */}
          <div className="mx-auto mb-6 relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center mx-auto">
              <Film className="w-16 h-16 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-red-500 flex items-center justify-center border-4 border-white dark:border-stone-900">
              <span className="text-white font-bold text-lg">?</span>
            </div>
          </div>
          
          {/* Error Message */}
          <h1 className="text-6xl font-bold mb-4 cinema-gradient-text">404</h1>
          <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-4">
            Scene Not Found
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mb-8">
            Looks like this reel got lost in the projection room. 
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href={`/day/${today}`}
              className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl cinema-btn group"
            >
              <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Play Today's Challenge
            </Link>
            
            <Link
              href="/"
              className="flex items-center justify-center gap-3 w-full px-6 py-4 cinema-glass hover:bg-stone-100/80 dark:hover:bg-stone-800/80 text-stone-700 dark:text-stone-200 rounded-2xl font-semibold transition-all duration-300 border border-stone-200/50 dark:border-amber-700/50 cinema-btn group"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Return to Homepage
            </Link>
          </div>
          
          {/* Fun Movie Quotes */}
          <div className="mt-8 pt-8 border-t border-stone-200 dark:border-stone-700">
            <p className="text-sm text-stone-500 dark:text-stone-500 italic">
              "You're gonna need a bigger search query."
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-600 mt-2">
              — Paraphrased from Jaws (1975)
            </p>
          </div>
        </div>
        
        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Looking for something specific?{' '}
            <a 
              href="mailto:support@frameguessr.com"
              className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}