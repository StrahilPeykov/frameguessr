import Link from 'next/link'
import { ArrowLeft, Shield, Database, Globe, Cookie, Users, FileText, Cloud, Key, Mail } from 'lucide-react'

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
              Last updated: January 17, 2025
            </p>
          </div>

          {/* Quick Summary */}
          <div className="bg-stone-100 dark:bg-stone-800/50 rounded-xl p-6 mb-8">
            <h2 className="font-bold text-stone-900 dark:text-stone-100 mb-3">
              Quick Summary
            </h2>
            <ul className="space-y-2 text-stone-700 dark:text-stone-300 text-sm">
              <li>• FrameGuessr can be played without creating an account</li>
              <li>• Game progress is stored locally in your browser by default</li>
              <li>• Optional user accounts enable cloud sync and leaderboards</li>
              <li>• We collect minimal data necessary for the game to function</li>
              <li>• No personal information is sold or shared with third parties</li>
              <li>• You can delete your data at any time</li>
            </ul>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <p className="text-stone-700 dark:text-stone-300">
              FrameGuessr ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your information when you use our daily movie guessing game at frameguessr.com (the "Service").
            </p>
          </section>

          {/* Sections */}
          <div className="space-y-8 text-stone-700 dark:text-stone-300">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Database className="w-6 h-6 text-amber-600" />
                Information We Collect
              </h2>
              
              <h3 className="text-lg font-semibold mt-6 mb-3 text-stone-800 dark:text-stone-200">
                When Playing Without an Account
              </h3>
              <p className="mb-3">
                If you play FrameGuessr without creating an account, all your game data is stored locally in your web browser. We do not collect or store any personal information on our servers. Local data includes:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Your game progress and history</li>
                <li>Game statistics (wins, losses, streaks)</li>
                <li>Your preferences (theme, volume settings)</li>
                <li>Cookie consent choices</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-6 mb-3 text-stone-800 dark:text-stone-200">
                When You Create an Account
              </h3>
              <p className="mb-3">
                Creating an account is optional. If you choose to create an account, we collect:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li><strong>Email address:</strong> For account identification and password recovery</li>
                <li><strong>Username:</strong> A unique identifier you choose for sign-in and leaderboards</li>
                <li><strong>Display name:</strong> The name shown on leaderboards and in your profile</li>
                <li><strong>Avatar selection:</strong> Your chosen profile picture from our predefined options</li>
                <li><strong>Game progress:</strong> Your daily game results, statistics, and achievements</li>
                <li><strong>Account timestamps:</strong> When your account was created and last accessed</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-3 text-stone-800 dark:text-stone-200">
                Google Sign-In
              </h3>
              <p className="mb-3">
                If you choose to sign in with Google, we receive:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your email address from Google</li>
                <li>Your Google profile name (used as your display name)</li>
                <li>A unique Google ID for authentication</li>
              </ul>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
                We do not access your Google contacts, files, or any other Google services.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-3 text-stone-800 dark:text-stone-200">
                Automatically Collected Information
              </h3>
              <p className="mb-3">
                When you use our Service, we may automatically collect:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Usage data:</strong> How you interact with the game (anonymized)</li>
                <li><strong>Device information:</strong> Browser type, operating system (for compatibility)</li>
                <li><strong>Log data:</strong> IP address, access times, pages viewed (for security and debugging)</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Cloud className="w-6 h-6 text-amber-600" />
                How We Use Your Information
              </h2>
              
              <p className="mb-4">We use the information we collect to:</p>
              
              <div className="space-y-4">
                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h4 className="font-semibold text-stone-800 dark:text-stone-200">
                    Provide Game Functionality
                  </h4>
                  <p className="text-sm mt-1">
                    Save your progress, maintain statistics, sync data across devices (if logged in), and remember your preferences.
                  </p>
                </div>
                
                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h4 className="font-semibold text-stone-800 dark:text-stone-200">
                    Enable Social Features
                  </h4>
                  <p className="text-sm mt-1">
                    Display leaderboards, share results, and compare progress with other players (optional features).
                  </p>
                </div>
                
                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h4 className="font-semibold text-stone-800 dark:text-stone-200">
                    Improve Our Service
                  </h4>
                  <p className="text-sm mt-1">
                    Analyze gameplay patterns to improve difficulty balance, fix bugs, and enhance user experience.
                  </p>
                </div>

                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h4 className="font-semibold text-stone-800 dark:text-stone-200">
                    Communicate With You
                  </h4>
                  <p className="text-sm mt-1">
                    Send important account-related emails (password resets, security alerts). We do not send marketing emails.
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
              
              <p className="mb-4">We use the following third-party services:</p>
              
              <div className="space-y-4">
                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h4 className="font-semibold text-stone-800 dark:text-stone-200">
                    Supabase
                  </h4>
                  <p className="text-sm mt-1">
                    Provides our database and authentication services. Supabase stores user accounts and game data securely. Based in the US with SOC2 compliance.
                  </p>
                  <a href="https://supabase.com/privacy" className="text-xs text-amber-600 dark:text-amber-400 hover:underline">
                    View Supabase Privacy Policy
                  </a>
                </div>

                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h4 className="font-semibold text-stone-800 dark:text-stone-200">
                    Google OAuth
                  </h4>
                  <p className="text-sm mt-1">
                    Optional sign-in method. Google handles the authentication process securely. We only receive basic profile information.
                  </p>
                  <a href="https://policies.google.com/privacy" className="text-xs text-amber-600 dark:text-amber-400 hover:underline">
                    View Google Privacy Policy
                  </a>
                </div>
                
                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h4 className="font-semibold text-stone-800 dark:text-stone-200">
                    The Movie Database (TMDB)
                  </h4>
                  <p className="text-sm mt-1">
                    Provides movie and TV show information. TMDB may log technical data when we fetch movie details.
                  </p>
                  <a href="https://www.themoviedb.org/privacy-policy" className="text-xs text-amber-600 dark:text-amber-400 hover:underline">
                    View TMDB Privacy Policy
                  </a>
                </div>
                
                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h4 className="font-semibold text-stone-800 dark:text-stone-200">
                    Deezer
                  </h4>
                  <p className="text-sm mt-1">
                    Provides audio previews for soundtrack hints. Deezer may collect playback analytics.
                  </p>
                  <a href="https://www.deezer.com/legal/privacy" className="text-xs text-amber-600 dark:text-amber-400 hover:underline">
                    View Deezer Privacy Policy
                  </a>
                </div>
                
                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h4 className="font-semibold text-stone-800 dark:text-stone-200">
                    Vercel
                  </h4>
                  <p className="text-sm mt-1">
                    Hosts our website. Vercel automatically collects basic analytics and performance metrics.
                  </p>
                  <a href="https://vercel.com/legal/privacy-policy" className="text-xs text-amber-600 dark:text-amber-400 hover:underline">
                    View Vercel Privacy Policy
                  </a>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Cookie className="w-6 h-6 text-amber-600" />
                Cookies & Local Storage
              </h2>
              
              <p className="mb-4">
                We use browser storage technologies to provide core functionality:
              </p>
              
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-700">
                    <th className="text-left py-2 text-stone-800 dark:text-stone-200">Type</th>
                    <th className="text-left py-2 text-stone-800 dark:text-stone-200">Purpose</th>
                    <th className="text-left py-2 text-stone-800 dark:text-stone-200">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-stone-200 dark:border-stone-700">
                    <td className="py-2">Local Storage</td>
                    <td className="py-2">Game progress, settings, preferences</td>
                    <td className="py-2">Until cleared</td>
                  </tr>
                  <tr className="border-b border-stone-200 dark:border-stone-700">
                    <td className="py-2">Session Storage</td>
                    <td className="py-2">Temporary game state during play</td>
                    <td className="py-2">Until tab closed</td>
                  </tr>
                  <tr className="border-b border-stone-200 dark:border-stone-700">
                    <td className="py-2">Auth Cookies</td>
                    <td className="py-2">Keep you signed in (if account created)</td>
                    <td className="py-2">7 days or until logout</td>
                  </tr>
                  <tr className="border-b border-stone-200 dark:border-stone-700">
                    <td className="py-2">Preference Cookie</td>
                    <td className="py-2">Remember cookie consent choice</td>
                    <td className="py-2">1 year</td>
                  </tr>
                </tbody>
              </table>

              <p className="mt-4 text-sm">
                These are essential for the game to function. You can clear them at any time through your browser settings.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Shield className="w-6 h-6 text-amber-600" />
                Data Security
              </h2>
              
              <p className="mb-4">
                We implement appropriate technical and organizational measures to protect your information:
              </p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Encryption:</strong> All data transmission uses HTTPS/TLS encryption</li>
                <li><strong>Secure Authentication:</strong> Passwords are hashed using industry-standard algorithms</li>
                <li><strong>Access Controls:</strong> Database access is restricted and monitored</li>
                <li><strong>Regular Updates:</strong> We keep our systems and dependencies up to date</li>
                <li><strong>Minimal Data:</strong> We only collect data necessary for the game to function</li>
              </ul>

              <p className="mt-4">
                While we strive to protect your information, no method of electronic storage is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Key className="w-6 h-6 text-amber-600" />
                Your Rights & Choices
              </h2>
              
              <p className="mb-4">
                You have control over your personal information:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-600 mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-stone-800 dark:text-stone-200">Access Your Data</h4>
                    <p className="text-sm">View all information we have about you through your account settings</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-600 mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-stone-800 dark:text-stone-200">Update Information</h4>
                    <p className="text-sm">Change your username, display name, or avatar at any time</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-600 mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-stone-800 dark:text-stone-200">Delete Your Account</h4>
                    <p className="text-sm">Permanently remove your account and all associated data</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-600 mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-stone-800 dark:text-stone-200">Export Your Data</h4>
                    <p className="text-sm">Download a copy of your game history and statistics</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-600 mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-stone-800 dark:text-stone-200">Play Without an Account</h4>
                    <p className="text-sm">All features except leaderboards and cloud sync are available without registration</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                  GDPR Rights (EU Users)
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  If you're in the European Union, you have additional rights under GDPR including data portability, 
                  rectification, erasure, and the right to object to processing. Contact us to exercise these rights.
                </p>
              </div>

              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  CCPA Rights (California Users)
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  California residents have the right to know what personal information we collect, request deletion, 
                  and opt-out of sales (we don't sell personal information). Contact us to exercise these rights.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                Data Retention
              </h2>
              
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Local Storage:</strong> Retained indefinitely until you clear your browser data</li>
                <li><strong>Account Data:</strong> Kept while your account is active</li>
                <li><strong>Inactive Accounts:</strong> Deleted after 2 years of inactivity</li>
                <li><strong>Deleted Accounts:</strong> Removed within 30 days of deletion request</li>
                <li><strong>Log Data:</strong> Automatically deleted after 90 days</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                Children's Privacy
              </h2>
              <p>
                FrameGuessr is not directed to children under 13. We do not knowingly collect personal information 
                from children under 13. If you are a parent and believe your child has provided personal information, 
                please contact us immediately, and we will delete such information.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                International Data Transfers
              </h2>
              <p>
                Your information may be transferred to and processed in countries other than your own. These countries 
                may have different data protection laws. By using our Service, you consent to such transfers. We ensure 
                appropriate safeguards are in place to protect your information.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
                new Privacy Policy on this page and updating the "Last updated" date. For significant changes, we may 
                provide additional notice through the Service or via email if you have an account.
              </p>
            </section>

            {/* Contact */}
            <section className="pt-8 border-t border-stone-200 dark:border-stone-700">
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Mail className="w-6 h-6 text-amber-600" />
                Contact Us
              </h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-xl">
                <p className="font-mono text-sm mb-2">Email: frameguessr@gmail.com</p>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Please include "FrameGuessr Privacy" in the subject line
                </p>
              </div>
              
              <div className="mt-4 p-4 bg-stone-100 dark:bg-stone-800 rounded-xl">
                <p className="text-sm font-medium mb-1">Data Protection Officer</p>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  For GDPR-related inquiries, you can contact our Data Protection Officer at the same email address.
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