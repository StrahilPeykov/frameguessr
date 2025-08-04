import Link from 'next/link'
import { ArrowLeft, Scale, AlertTriangle, Copyright, Shield, FileText, Users, Cloud, Key, Globe } from 'lucide-react'

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
              Last updated: January 17, 2025
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-xl p-6 mb-8">
            <h2 className="font-bold text-amber-900 dark:text-amber-100 mb-3">
              Important Notice
            </h2>
            <ul className="space-y-2 text-amber-800 dark:text-amber-200 text-sm">
              <li>• FrameGuessr is a free-to-play movie guessing game</li>
              <li>• You must be at least 13 years old to create an account</li>
              <li>• The game can be played without registration</li>
              <li>• We use movie/TV content under fair use for entertainment purposes</li>
              <li>• By using FrameGuessr, you agree to these terms</li>
            </ul>
          </div>

          {/* Sections */}
          <div className="space-y-8 text-stone-700 dark:text-stone-300">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Scale className="w-6 h-6 text-amber-600" />
                1. Agreement to Terms
              </h2>
              <p className="mb-3">
                Welcome to FrameGuessr! These Terms of Service ("Terms") govern your use of our website located at 
                frameguessr.com and our daily movie guessing game service (together, the "Service") operated by 
                FrameGuessr ("we", "us", or "our").
              </p>
              <p className="mb-3">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any 
                part of these terms, then you may not access the Service.
              </p>
              <p>
                We reserve the right to update these Terms at any time. We will notify users of any material changes 
                by posting the new Terms on this page and updating the "Last Updated" date. Your continued use of the 
                Service after any changes constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Users className="w-6 h-6 text-amber-600" />
                2. Eligibility & Accounts
              </h2>
              
              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Age Requirements</h3>
              <p className="mb-4">
                To create an account, you must be at least 13 years old. Users under 18 must have permission from 
                a parent or guardian. By creating an account, you represent that you meet these age requirements.
              </p>

              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Playing Without an Account</h3>
              <p className="mb-4">
                You may play FrameGuessr without creating an account. When playing without an account, your game 
                progress is stored locally in your browser and is not synced across devices.
              </p>
              
              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Account Registration</h3>
              <p className="mb-3">
                If you choose to create an account, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your password and account</li>
                <li>Promptly update your account information if it changes</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Not share your account credentials with others</li>
                <li>Not create multiple accounts to manipulate leaderboards or game statistics</li>
                <li>Not use offensive, inappropriate, or misleading usernames</li>
              </ul>

              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Google Sign-In</h3>
              <p>
                If you choose to sign in with Google, you agree to Google's Terms of Service. We will receive 
                basic profile information from Google as described in our Privacy Policy.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Globe className="w-6 h-6 text-amber-600" />
                3. Use of the Service
              </h2>
              
              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Permitted Use</h3>
              <p className="mb-3">
                You may use FrameGuessr for:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Playing the daily movie/TV guessing game</li>
                <li>Tracking your personal statistics and progress</li>
                <li>Participating in leaderboards (with an account)</li>
                <li>Sharing your results on social media</li>
                <li>Enjoying the game for personal entertainment</li>
              </ul>

              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Prohibited Activities</h3>
              <p className="mb-3">
                You agree NOT to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Use automated tools, bots, or scripts to play the game or manipulate results</li>
                <li>Attempt to hack, reverse engineer, or gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Harvest, scrape, or collect data from the Service</li>
                <li>Impersonate others or provide false information</li>
                <li>Use the Service to transmit harmful code or malware</li>
                <li>Circumvent any security features or access restrictions</li>
                <li>Create content that is hateful, threatening, or harassing</li>
                <li>Use the Service in any way that could damage our reputation</li>
              </ul>

              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Fair Play</h3>
              <p>
                FrameGuessr is designed to be a fun, fair challenge for all players. Using external tools or 
                information to identify movies defeats the purpose of the game. We encourage honest play and 
                may take action against accounts that systematically cheat.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Copyright className="w-6 h-6 text-amber-600" />
                4. Intellectual Property
              </h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">Fair Use Notice</h3>
                  <p className="text-sm">
                    FrameGuessr displays movie and TV show stills under Fair Use provisions of US copyright law 
                    (17 U.S.C. §107). Our use is transformative, educational, and non-commercial. We use minimal 
                    content necessary for the game mechanic.
                  </p>
                </div>

                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">Third-Party Content</h3>
                  <p className="text-sm">
                    All movie and TV show images, titles, and metadata remain the property of their respective 
                    copyright holders. We claim no ownership of this content. Movie data is provided by The Movie 
                    Database (TMDB). Audio previews are provided by Deezer.
                  </p>
                </div>

                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">Our Content</h3>
                  <p className="text-sm">
                    The FrameGuessr game format, website design, code, and original content are protected by 
                    copyright. You may not copy, modify, distribute, or create derivative works without our 
                    written permission.
                  </p>
                </div>

                <div className="border-l-4 border-stone-300 dark:border-stone-600 pl-4">
                  <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">User Content</h3>
                  <p className="text-sm">
                    By creating an account, you grant us a worldwide, non-exclusive, royalty-free license to use, 
                    display, and distribute your username and game statistics in connection with the Service 
                    (such as on leaderboards).
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Cloud className="w-6 h-6 text-amber-600" />
                5. Privacy & Data
              </h2>
              
              <p className="mb-4">
                Your use of our Service is also governed by our Privacy Policy. Please review our 
                <Link href="/privacy" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 mx-1">
                  Privacy Policy
                </Link>
                which explains how we collect, use, and protect your information.
              </p>

              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Data Storage</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Without an account: All data is stored locally in your browser</li>
                <li>With an account: Data is synced to our secure cloud database</li>
                <li>You can delete your data at any time</li>
              </ul>
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
                  THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, 
                  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
                  PARTICULAR PURPOSE, NON-INFRINGEMENT, OR THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE.
                </p>
              </div>

              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">
                Limitation of Liability
              </h3>
              <p className="mb-3">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, FRAMEGUESSR SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of data, including game progress or statistics</li>
                <li>Service interruptions or downtime</li>
                <li>Damages arising from your use or inability to use the Service</li>
                <li>Any claims relating to third-party content</li>
                <li>Damages exceeding $100 USD</li>
              </ul>

              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">
                No Guarantee of Availability
              </h3>
              <p>
                We strive to provide reliable service but cannot guarantee uninterrupted access. We may modify, 
                suspend, or discontinue the Service at any time without notice.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                7. Indemnification
              </h2>
              <p>
                You agree to defend, indemnify, and hold harmless FrameGuessr and its operators from any claims, 
                damages, losses, liabilities, costs, and expenses (including attorneys' fees) arising from your 
                use of the Service, violation of these Terms, or infringement of any rights of another party.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Key className="w-6 h-6 text-amber-600" />
                8. Account Termination
              </h2>
              
              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Your Rights</h3>
              <p className="mb-3">
                You may stop using the Service at any time. If you have an account, you can delete it through 
                your account settings or by contacting us. Account deletion is permanent.
              </p>

              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Our Rights</h3>
              <p className="mb-3">
                We may suspend or terminate your account if you:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Violate these Terms</li>
                <li>Engage in prohibited activities</li>
                <li>Create risk or legal exposure for us</li>
                <li>Use the Service in a way that harms other users</li>
              </ul>

              <p>
                We will make reasonable efforts to notify you before terminating your account unless immediate 
                action is required.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                9. DMCA Compliance
              </h2>
              <p className="mb-4">
                We respect intellectual property rights. If you believe content on our Service infringes your 
                copyright, please send a DMCA notice to:
              </p>
              <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-xl mb-4">
                <p className="font-mono text-sm">frameguessr@gmail.com</p>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                  Subject: "DMCA Notice - FrameGuessr"
                </p>
              </div>
              <p className="mb-3">
                Your notice must include:
              </p>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Identification of the copyrighted work</li>
                <li>Identification of the allegedly infringing material</li>
                <li>Your contact information</li>
                <li>A statement of good faith belief</li>
                <li>A statement of accuracy under penalty of perjury</li>
                <li>Your physical or electronic signature</li>
              </ol>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                10. Governing Law & Disputes
              </h2>
              <p className="mb-4">
                These Terms are governed by the laws of the Netherlands, without regard to conflict of law 
                principles. Any disputes arising from these Terms or your use of the Service shall be resolved 
                in the courts of The Hague, Netherlands.
              </p>
              <p>
                You agree to bring any claims against FrameGuessr in your individual capacity, not as part of 
                any class action or representative proceeding.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                11. General Provisions
              </h2>
              
              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Entire Agreement</h3>
              <p className="mb-4">
                These Terms constitute the entire agreement between you and FrameGuessr regarding the Service.
              </p>

              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Severability</h3>
              <p className="mb-4">
                If any provision of these Terms is found to be unenforceable, the remaining provisions will 
                continue in full force and effect.
              </p>

              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">No Waiver</h3>
              <p className="mb-4">
                Our failure to enforce any right or provision of these Terms will not be considered a waiver.
              </p>

              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Assignment</h3>
              <p>
                You may not assign or transfer these Terms. We may assign our rights and obligations without 
                restriction.
              </p>
            </section>

            {/* Contact */}
            <section className="pt-8 border-t border-stone-200 dark:border-stone-700">
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">Contact Information</h2>
              <p className="mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-xl">
                <p className="font-mono text-sm mb-2">Email: frameguessr@gmail.com</p>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Please include "FrameGuessr Terms" in the subject line
                </p>
              </div>
              
              <div className="mt-4 p-4 bg-stone-100 dark:bg-stone-800 rounded-xl">
                <p className="text-sm font-medium mb-1">FrameGuessr</p>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  The Hague, Netherlands<br />
                  A project by Strahil Peykov
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