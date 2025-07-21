import Link from 'next/link'
import { ArrowLeft, Shield, Database, Globe, Cookie, Users, FileText, Cloud, Key } from 'lucide-react'

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
        <div className="cinema-glass rounded-3xl p-8 md:p-12 border border-stone-200/30 dark:border-amber-700/30">
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
              <li>• Game progress is stored locally by default</li>
              <li>• Optional user accounts sync progress to the cloud</li>
              <li>• No personal information is required to play</li>
              <li>• Google sign-in is available for account creation</li>
              <li>• Minimal cookies are used for functionality</li>
              <li>• Third-party services (TMDB, Deezer) may collect limited data</li>
            </ul>
          </div>

          {/* Sections */}
          <div className="space-y-8 text-stone-700 dark:text-stone-300">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Database className="w-6 h-6 text-amber-600" />
                Information We Collect
              </h2>
              
              <h3 className="text-lg font-semibold mt-6 mb-3 text-stone-800 dark:text-stone-200">Local Storage (No Account)</h3>
              <p className="mb-3">
                When playing without an account, all data is stored locally in your browser:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Daily game progress and guesses</li>
                <li>Game statistics (wins, streaks, etc.)</li>
                <li>Theme preference (light/dark mode)</li>
                <li>Audio volume settings</li>
                <li>Cookie consent preferences</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-6 mb-3 text-stone-800 dark:text-stone-200">User Accounts (Optional)</h3>
              <p className="mb-3">
                When you create an account, we collect and store:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Email address (for account identification)</li>
                <li>Display name (optional, for leaderboards)</li>
                <li>Game progress and statistics (synced from local storage)</li>
                <li>Account creation and last login timestamps</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-3 text-stone-800 dark:text-stone-200">Google OAuth Data</h3>
              <p className="mb-3">
                When signing in with Google, we receive:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Email address</li>
                <li>Profile name (used as display name)</li>
                <li>Google account ID (for authentication)</li>
              </ul>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
                We do not access your Google contacts, drive, or other services.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Cloud className="w-6 h-6 text-amber-600" />
                How We Use Your Information
              </h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h4 className="font-semibold text-stone-800 dark:text-stone-200">
                    Game Functionality
                  </h4>
                  <p className="text-sm mt-1">
                    Store your progress, maintain game statistics, and sync data across devices.
                  </p>
                </div>
                
                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h4 className="font-semibold text-stone-800 dark:text-stone-200">
                    Leaderboards & Competition
                  </h4>
                  <p className="text-sm mt-1">
                    Display anonymous or named rankings based on your preferences.
                  </p>
                </div>
                
                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h4 className="font-semibold text-stone-800 dark:text-stone-200">
                    Service Improvement
                  </h4>
                  <p className="text-sm mt-1">
                    Analyze anonymous usage patterns to improve game mechanics.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Globe className="w-6 h-6 text-amber-600" />
                Third-Party Services
              </h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h4 className="font-semibold text-stone-800 dark:text-stone-200">
                    Supabase (Database & Authentication)
                  </h4>
                  <p className="text-sm mt-1">
                    Securely stores user accounts and game data. Based in the US with GDPR compliance.
                  </p>
                </div>

                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h4 className="font-semibold text-stone-800 dark:text-stone-200">
                    Google OAuth
                  </h4>
                  <p className="text-sm mt-1">
                    Provides secure sign-in functionality. Subject to Google's privacy policy.
                  </p>
                </div>
                
                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h4 className="font-semibold text-stone-800 dark:text-stone-200">
                    The Movie Database (TMDB)
                  </h4>
                  <p className="text-sm mt-1">
                    Provides movie/TV show search functionality. TMDB may collect technical data.
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

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Cookie className="w-6 h-6 text-amber-600" />
                Cookies & Storage
              </h2>
              
              <p className="mb-4">
                We use browser storage technologies for functionality:
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
                    <td className="py-2">Game progress, settings, local data</td>
                    <td className="py-2">Permanent</td>
                  </tr>
                  <tr className="border-b border-stone-200 dark:border-stone-700">
                    <td className="py-2">sessionStorage</td>
                    <td className="py-2">Temporary game state</td>
                    <td className="py-2">Session only</td>
                  </tr>
                  <tr className="border-b border-stone-200 dark:border-stone-700">
                    <td className="py-2">Auth Cookies</td>
                    <td className="py-2">Secure session management</td>
                    <td className="py-2">Session or 7 days</td>
                  </tr>
                  <tr className="border-b border-stone-200 dark:border-stone-700">
                    <td className="py-2">Preference Cookies</td>
                    <td className="py-2">Remember your settings</td>
                    <td className="py-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Key className="w-6 h-6 text-amber-600" />
                Your Rights & Control
              </h2>
              
              <p className="mb-4">
                You have complete control over your data:
              </p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Play Without Account:</strong> All data stays local in your browser</li>
                <li><strong>Account Access:</strong> View and manage your account data anytime</li>
                <li><strong>Data Export:</strong> Download your complete game history</li>
                <li><strong>Account Deletion:</strong> Permanently remove your account and all data</li>
                <li><strong>Data Portability:</strong> Transfer your data to another service</li>
                <li><strong>Local Data Control:</strong> Clear browser data to remove everything</li>
              </ul>

              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                  GDPR & Privacy Rights
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  EU users have additional rights under GDPR including data rectification, 
                  erasure, processing restriction, and objection. Contact us to exercise these rights.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Shield className="w-6 h-6 text-amber-600" />
                Data Security
              </h2>
              
              <p className="mb-4">
                We protect your data using industry-standard security measures:
              </p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li>Encrypted data transmission (HTTPS/TLS)</li>
                <li>Secure authentication via Supabase</li>
                <li>Regular security updates and monitoring</li>
                <li>Limited data collection and retention</li>
                <li>No storage of sensitive personal information</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                Data Retention
              </h2>
              
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Local Data:</strong> Stored until you clear your browser or uninstall</li>
                <li><strong>Account Data:</strong> Retained while your account is active</li>
                <li><strong>Inactive Accounts:</strong> Deleted after 2 years of inactivity</li>
                <li><strong>Analytics Data:</strong> Anonymized and retained for up to 26 months</li>
                <li><strong>Deleted Accounts:</strong> All data permanently removed within 30 days</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                Children's Privacy
              </h2>
              <p>
                FrameGuessr is not directed to children under 13. We do not knowingly collect 
                personal information from children. If you are a parent and believe your child 
                has provided us with personal information, please contact us immediately, and we 
                will delete such information.
              </p>
            </section>

            {/* Contact */}
            <section className="pt-8 border-t border-stone-200 dark:border-stone-700">
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">Contact Us</h2>
              <p className="mb-4">
                For privacy questions, data requests, or account issues, contact us at:
              </p>
              <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-xl">
                <p className="font-mono text-sm">strahil.peykov@gmail.com</p>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
                  Please include "FrameGuessr Privacy" in the subject line
                </p>
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