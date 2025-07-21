import Link from 'next/link'
import { ArrowLeft, Shield, Database, Globe, Cookie, Users, FileText } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-rose-50/20 dark:from-stone-950 dark:via-amber-950/20 dark:to-rose-950/10">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 cinema-nav-blur bg-white/80 dark:bg-stone-950/80 border-b border-stone-200/30 dark:border-amber-900/30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Game</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="cinema-glass rounded-3xl p-8 md:p-12 shadow-2xl border border-stone-200/30 dark:border-amber-700/30">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-2">
              Privacy Policy
            </h1>
            <p className="text-stone-600 dark:text-stone-400">
              Last updated: January 2025
            </p>
          </div>

          {/* Quick Summary */}
          <div className="bg-stone-100 dark:bg-stone-800/50 rounded-xl p-6 mb-8">
            <h2 className="font-bold text-stone-900 dark:text-stone-100 mb-3">
              Quick Summary
            </h2>
            <ul className="space-y-2 text-stone-700 dark:text-stone-300 text-sm">
              <li>• We don't collect personal information</li>
              <li>• Game progress is stored locally in your browser</li>
              <li>• No user accounts or registration required</li>
              <li>• We use minimal cookies for functionality</li>
              <li>• Third-party services (TMDB, Deezer) may collect limited data</li>
            </ul>
          </div>

          {/* Sections */}
          <div className="space-y-8 text-stone-700 dark:text-stone-300">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                Information We Collect
              </h2>
              
              <h3 className="text-lg font-semibold mt-6 mb-3 text-stone-800 dark:text-stone-200">Local Storage Only</h3>
              <p className="mb-3">
                FrameGuessr stores all game data locally in your browser. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your daily game progress and guesses</li>
                <li>Game statistics (wins, streaks, etc.)</li>
                <li>Theme preference (light/dark mode)</li>
                <li>Audio volume settings</li>
                <li>Cookie consent preferences</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-6 mb-3 text-stone-800 dark:text-stone-200">No Personal Data Collection</h3>
              <p className="mb-3">
                We do not collect, store, or process any personal information such as:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Names or email addresses</li>
                <li>IP addresses or location data</li>
                <li>Device identifiers</li>
                <li>Payment information</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                Third-Party Services
              </h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h4 className="font-semibold text-stone-800 dark:text-stone-200">
                    The Movie Database (TMDB)
                  </h4>
                  <p className="text-sm mt-1">
                    Used for movie/TV show search functionality. TMDB may collect technical data.
                  </p>
                </div>
                
                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h4 className="font-semibold text-stone-800 dark:text-stone-200">
                    Deezer
                  </h4>
                  <p className="text-sm mt-1">
                    Provides audio previews for hints. Deezer may collect playback analytics.
                  </p>
                </div>
                
                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h4 className="font-semibold text-stone-800 dark:text-stone-200">
                    Vercel
                  </h4>
                  <p className="text-sm mt-1">
                    Hosts our website. May collect anonymous usage metrics and technical data.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                Cookies & Local Storage
              </h2>
              
              <p className="mb-4">
                We use browser storage technologies for essential functionality:
              </p>
              
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-700">
                    <th className="text-left py-2 text-stone-800 dark:text-stone-200">Type</th>
                    <th className="text-left py-2 text-stone-800 dark:text-stone-200">Purpose</th>
                    <th className="text-left py-2 text-stone-800 dark:text-stone-200">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-stone-200 dark:border-stone-700">
                    <td className="py-2">localStorage</td>
                    <td className="py-2">Game progress & settings</td>
                    <td className="py-2">Permanent</td>
                  </tr>
                  <tr className="border-b border-stone-200 dark:border-stone-700">
                    <td className="py-2">sessionStorage</td>
                    <td className="py-2">Temporary game state</td>
                    <td className="py-2">Session only</td>
                  </tr>
                  <tr className="border-b border-stone-200 dark:border-stone-700">
                    <td className="py-2">Cookies</td>
                    <td className="py-2">Security & preferences</td>
                    <td className="py-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                Your Rights
              </h2>
              
              <p className="mb-4">
                You have complete control over your data:
              </p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> View your data in browser developer tools</li>
                <li><strong>Export:</strong> Download your game history anytime</li>
                <li><strong>Delete:</strong> Clear browser data to remove everything</li>
                <li><strong>Control:</strong> Manage cookies in browser settings</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                Children's Privacy
              </h2>
              <p>
                FrameGuessr is not directed to children under 13. We do not knowingly collect 
                personal information from children. If you are a parent and believe your child 
                has provided us with personal information, please contact us immediately.
              </p>
            </section>

            {/* Contact */}
            <section className="pt-8 border-t border-stone-200 dark:border-stone-700">
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-xl">
                <p className="font-mono text-sm">privacy@frameguessr.com</p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <Link href="/terms" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium">
            View Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  )
}