import Link from 'next/link'
import { ArrowLeft, Scale, AlertTriangle, Copyright, Shield, FileText, Users, Cloud, Key } from 'lucide-react'

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="text-stone-600 dark:text-stone-400">
              Last updated: January 2025
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-xl p-6 mb-8">
            <h2 className="font-bold text-amber-900 dark:text-amber-100 mb-3">
              Important Notice
            </h2>
            <ul className="space-y-2 text-amber-800 dark:text-amber-200 text-sm">
              <li>• You must be at least 13 years old to create an account</li>
              <li>• Game can be played without registration</li>
              <li>• User accounts enable progress syncing and leaderboards</li>
              <li>• We use movie/TV content under fair use for educational purposes</li>
              <li>• By using the service, you agree to these terms</li>
            </ul>
          </div>

          {/* Sections */}
          <div className="space-y-8 text-stone-700 dark:text-stone-300">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Scale className="w-6 h-6 text-amber-600" />
                1. Acceptance of Terms
              </h2>
              <p className="mb-3">
                By accessing or using FrameGuessr ("the Service"), you agree to be bound by these 
                Terms of Service ("Terms"). If you disagree with any part of these terms, you may 
                not access the Service.
              </p>
              <p className="mb-3">
                These Terms apply to both registered users with accounts and anonymous users playing 
                without registration.
              </p>
              <p>
                We reserve the right to update these Terms at any time. We will notify users of any 
                material changes by posting the new Terms on this page and updating the "Last Updated" date.
                Continued use after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Users className="w-6 h-6 text-amber-600" />
                2. User Accounts & Eligibility
              </h2>
              
              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Age Requirements</h3>
              <p className="mb-4">
                You must be at least 13 years old to create a user account. Users under 18 must have 
                parental consent. By creating an account, you represent and warrant that you meet these 
                age requirements.
              </p>
              
              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Account Registration</h3>
              <p className="mb-3">
                When creating an account, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Promptly update any information that becomes inaccurate</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Not share your account with others</li>
                <li>Not create multiple accounts to manipulate leaderboards</li>
              </ul>

              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Google OAuth</h3>
              <p className="mb-3">
                When signing in with Google, you additionally agree to Google's Terms of Service 
                and acknowledge that we will receive basic profile information from Google as 
                described in our Privacy Policy.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                3. Acceptable Use
              </h2>
              
              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Permitted Uses</h3>
              <p className="mb-3">
                You may use FrameGuessr for:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Playing the daily movie/TV guessing game</li>
                <li>Viewing your personal statistics and progress</li>
                <li>Participating in leaderboards (if you have an account)</li>
                <li>Sharing your results on social media</li>
              </ul>

              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Prohibited Activities</h3>
              <p className="mb-3">
                You agree NOT to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Use automated tools, bots, or scripts to play the game</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Reverse engineer or decompile any part of the Service</li>
                <li>Extract or scrape content from the Service</li>
                <li>Create accounts with inappropriate or offensive display names</li>
                <li>Manipulate leaderboards through multiple accounts or cheating</li>
                <li>Transmit viruses, malware, or other harmful code</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Cloud className="w-6 h-6 text-amber-600" />
                4. Data & Privacy
              </h2>
              
              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Local vs. Cloud Storage</h3>
              <p className="mb-3">
                FrameGuessr operates using a hybrid storage model:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>No Account:</strong> All data stored locally in your browser</li>
                <li><strong>With Account:</strong> Data synced between local storage and our secure cloud database</li>
                <li><strong>Data Sync:</strong> When you sign in, local data is automatically synced to your account</li>
              </ul>

              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Data Usage</h3>
              <p className="mb-3">
                Your use of our Service is also governed by our Privacy Policy. Please review our 
                <Link href="/privacy" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 mx-1">
                  Privacy Policy
                </Link>
                to understand our practices. By using FrameGuessr, you consent to our data 
                practices as described in the Privacy Policy.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Copyright className="w-6 h-6 text-amber-600" />
                5. Intellectual Property
              </h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">Fair Use Notice</h3>
                  <p className="text-sm">
                    This Service contains copyrighted material used under Fair Use provisions of 
                    US copyright law (17 U.S.C. §107). Content is used for commentary, criticism, 
                    educational purposes, and transformative use in a non-commercial game format.
                  </p>
                </div>

                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">Third-Party Content</h3>
                  <p className="text-sm">
                    All movie and TV show images, titles, and metadata are property of their 
                    respective copyright holders. We claim no ownership of this content. 
                    Data is provided by The Movie Database (TMDB) and audio previews by Deezer.
                  </p>
                </div>

                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">Our Content</h3>
                  <p className="text-sm">
                    The FrameGuessr game format, code, design, and original content are protected by 
                    copyright and other intellectual property laws. You may not copy, modify, 
                    or distribute our original content without permission.
                  </p>
                </div>

                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">User Content</h3>
                  <p className="text-sm">
                    You retain ownership of any content you provide (such as display names). However, 
                    by providing content, you grant us a license to use, display, and distribute it 
                    in connection with the Service (e.g., showing your name on leaderboards).
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Shield className="w-6 h-6 text-amber-600" />
                6. Disclaimers & Limitations
              </h2>
              
              <div className="bg-stone-100 dark:bg-stone-800/50 rounded-xl p-6 mb-4">
                <h3 className="font-bold text-stone-800 dark:text-stone-200 mb-3 uppercase">
                  Service Provided "AS IS"
                </h3>
                <p className="text-sm">
                  THE SERVICE IS PROVIDED WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, 
                  INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
                  PARTICULAR PURPOSE, NON-INFRINGEMENT, OR ACCURACY OF CONTENT.
                </p>
              </div>

              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">
                Limitation of Liability
              </h3>
              <p className="mb-3">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, FRAMEGUESSR SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Any indirect, incidental, special, or consequential damages</li>
                <li>Loss of data, including game progress or statistics</li>
                <li>Service interruptions or downtime</li>
                <li>Damages resulting from use or inability to use the Service</li>
                <li>Any claims relating to third-party content or services</li>
                <li>Issues arising from Google OAuth or other third-party authentication</li>
              </ul>

              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">
                Service Availability
              </h3>
              <p className="mb-3">
                We strive to provide reliable service but cannot guarantee:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Uninterrupted access to the Service</li>
                <li>Preservation of data in case of technical failures</li>
                <li>Continued availability of third-party integrations</li>
                <li>Compatibility with all devices or browsers</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Key className="w-6 h-6 text-amber-600" />
                7. Account Termination
              </h2>
              
              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Termination by You</h3>
              <p className="mb-3">
                You may terminate your account at any time by:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Using the account deletion feature in your settings</li>
                <li>Contacting us directly at strahil.peykov@gmail.com</li>
              </ul>
              <p className="mb-4">
                Upon termination, all your account data will be permanently deleted within 30 days.
              </p>

              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Termination by Us</h3>
              <p className="mb-3">
                We may terminate or suspend your account immediately if you:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Violate these Terms of Service</li>
                <li>Engage in prohibited activities</li>
                <li>Use the Service in a way that harms other users</li>
                <li>Provide false information during registration</li>
              </ul>

              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Effect of Termination</h3>
              <p className="mb-3">
                Upon termination of your account:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your access to account features will cease immediately</li>
                <li>Your data will be removed from leaderboards</li>
                <li>All account data will be permanently deleted</li>
                <li>Local browser data will remain unaffected</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                8. DMCA Compliance
              </h2>
              <p className="mb-4">
                We respect intellectual property rights. If you believe content on our Service 
                infringes your copyright, please send a DMCA notice containing:
              </p>
              <ol className="list-decimal pl-6 space-y-1 mb-4">
                <li>Description of the copyrighted work</li>
                <li>Description of the allegedly infringing material</li>
                <li>Your contact information</li>
                <li>Statement of good faith belief</li>
                <li>Statement of accuracy under penalty of perjury</li>
                <li>Your physical or electronic signature</li>
              </ol>
              <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-xl">
                <p className="font-mono text-sm">strahil.peykov@gmail.com</p>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                  Subject: "DMCA Notice - FrameGuessr"
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                9. Governing Law
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of 
                the Netherlands, without regard to its conflict of law provisions. You agree to 
                submit to the personal jurisdiction of the courts located in The Hague, Netherlands 
                for any disputes arising from these Terms or your use of the Service.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                10. Changes to Service
              </h2>
              <p className="mb-3">
                We reserve the right to:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Modify or discontinue any part of the Service</li>
                <li>Change pricing (currently free)</li>
                <li>Update game mechanics or features</li>
                <li>Remove or add third-party integrations</li>
              </ul>
              <p>
                We will provide reasonable notice of significant changes when possible.
              </p>
            </section>

            {/* Contact */}
            <section className="pt-8 border-t border-stone-200 dark:border-stone-700">
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">Contact Us</h2>
              <p className="mb-4">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-xl">
                <p className="font-mono text-sm">strahil.peykov@gmail.com</p>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
                  Please include "FrameGuessr Terms" in the subject line
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <Link href="/privacy" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium">
            View Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  )
}