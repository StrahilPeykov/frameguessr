'use client'

import Link from 'next/link'
import { Film, Heart, ExternalLink } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative z-20 mt-auto">
      {/* Main Footer */}
      <div className="cinema-glass border-t border-stone-200/30 dark:border-amber-900/30">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About */}
            <div>
              <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-3 flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-600" />
                About FrameGuessr
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                A daily movie and TV show guessing game for film enthusiasts. 
                Test your cinema knowledge with carefully selected stills from classic and modern productions.
              </p>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-3">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/privacy" 
                    className="text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/terms" 
                    className="text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <a 
                    href="mailto:dmca@frameguessr.com"
                    className="text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    DMCA/Copyright
                  </a>
                </li>
              </ul>
            </div>

            {/* Credits */}
            <div>
              <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-3">
                Credits
              </h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="https://www.themoviedb.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1"
                  >
                    Movie data from TMDB
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.deezer.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1"
                  >
                    Audio previews by Deezer
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a 
                    href="mailto:hello@frameguessr.com"
                    className="text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t border-stone-200/20 dark:border-stone-700/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-stone-500 dark:text-stone-500 text-center md:text-left">
                © {currentYear} FrameGuessr. Made with{' '}
                <Heart className="inline-block w-4 h-4 text-red-500 mx-1" fill="currentColor" />
                for movie lovers.
              </div>
              
              {/* Fair Use Notice */}
              <div className="text-xs text-stone-400 dark:text-stone-600 text-center md:text-right max-w-md">
                All movie and TV content used under Fair Use for educational purposes. 
                FrameGuessr is not affiliated with any movie studios or distributors.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attribution Bar */}
      <div className="bg-stone-100 dark:bg-stone-900 border-t border-stone-200/20 dark:border-stone-800/20">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <p className="text-xs text-stone-500 dark:text-stone-500 text-center">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
            Audio previews provided by Deezer.
          </p>
        </div>
      </div>
    </footer>
  )
}