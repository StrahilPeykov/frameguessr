import Link from 'next/link'
import { ArrowLeft, Scale, AlertTriangle, Copyright, Shield, FileText } from 'lucide-react'

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
              <li>• You must be at least 13 years old to use FrameGuessr</li>
              <li>• This is a free entertainment service with no warranties</li>
              <li>• We use movie/TV content under fair use for educational purposes</li>
              <li>• By using the service, you agree to these terms</li>
            </ul>
          </div>

          {/* Sections */}
          <div className="space-y-8 text-stone-700 dark:text-stone-300">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                1. Acceptance of Terms
              </h2>
              <p className="mb-3">
                By accessing or using FrameGuessr ("the Service"), you agree to be bound by these 
                Terms of Service ("Terms"). If you disagree with any part of these terms, you may 
                not access the Service.
              </p>
              <p>
                We reserve the right to update these Terms at any time. We will notify users of any 
                material changes by posting the new Terms on this page and updating the "Last Updated" date.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                2. Eligibility & Use
              </h2>
              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Age Requirement</h3>
              <p className="mb-4">
                You must be at least 13 years old to use this Service. By using FrameGuessr, 
                you represent and warrant that you meet this age requirement.
              </p>
              
              <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Acceptable Use</h3>
              <p className="mb-3">
                You agree NOT to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use automated systems to extract data (web scraping)</li>
                <li>Reverse engineer or decompile any part of the Service</li>
                <li>Transmit viruses, malware, or other harmful code</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                3. Intellectual Property
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
                    The FrameGuessr game format, code, and original content are protected by 
                    copyright and other intellectual property laws. You may not copy, modify, 
                    or distribute our original content without permission.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                4. Disclaimers & Limitations
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
              <ul className="list-disc pl-6 space-y-1">
                <li>Any indirect, incidental, special, or consequential damages</li>
                <li>Loss of profits, data, or goodwill</li>
                <li>Service interruptions or data loss</li>
                <li>Damages resulting from use or inability to use the Service</li>
                <li>Any claims relating to third-party content</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                5. Privacy & Data
              </h2>
              <p>
                Your use of our Service is also governed by our Privacy Policy. Please review our 
                <Link href="/privacy" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 mx-1">
                  Privacy Policy
                </Link>
                to understand our practices. By using FrameGuessr, you consent to our data 
                practices as described in the Privacy Policy.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                6. DMCA Compliance
              </h2>
              <p className="mb-4">
                We respect intellectual property rights. If you believe content on our Service 
                infringes your copyright, please send a DMCA notice containing:
              </p>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Description of the copyrighted work</li>
                <li>Description of the allegedly infringing material</li>
                <li>Your contact information</li>
                <li>Statement of good faith belief</li>
                <li>Statement of accuracy under penalty of perjury</li>
                <li>Your physical or electronic signature</li>
              </ol>
              <div className="mt-4 p-4 bg-stone-100 dark:bg-stone-800 rounded-xl">
                <p className="font-mono text-sm">strahil.peykov@gmail.com</p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                7. Governing Law
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of 
                the Netherlands, without regard to its conflict of law provisions. You agree to 
                submit to the personal jurisdiction of the courts located in The Hague, Netherlands.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
                8. Termination
              </h2>
              <p>
                We may terminate or suspend access to our Service immediately, without prior notice 
                or liability, for any reason whatsoever, including without limitation if you breach 
                the Terms.
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