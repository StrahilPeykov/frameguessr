import { Metadata } from 'next'
import Link from 'next/link'
import { Film, Trophy, Music, Clock, Sparkles, ArrowLeft, Play, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About FrameGuessr - The Original Daily Movie Frame Guessing Game',
  description: 'FrameGuessr (not freeguessr) is the original daily movie and TV show guessing game. Learn about our unique frame-based puzzle game with audio hints and progressive clues.',
  keywords: [
    'about frameguessr',
    'frameguessr game',
    'what is frameguessr',
    'frameguessr not freeguessr',
    'frame guessr explained',
    'movie guessing game frameguessr',
    'how to play frameguessr',
    'frameguessr features',
    'frameguessr vs framed',
    'frameguessr vs other games'
  ],
  alternates: {
    canonical: 'https://frameguessr.com/about'
  },
  openGraph: {
    title: 'About FrameGuessr - The Original Movie Frame Game',
    description: 'Learn about FrameGuessr, the daily movie guessing game with progressive hints and audio clues. Not to be confused with freeguessr.',
    url: 'https://frameguessr.com/about',
  }
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-rose-50/20 dark:from-stone-950 dark:via-amber-950/20 dark:to-rose-950/10">
      {/* Simple Header */}
      <header className="bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-stone-200/40 dark:border-amber-900/40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link 
            href="/"
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 text-stone-600 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
          </Link>
          <h1 className="text-xl font-bold cinema-gradient-text">About FrameGuessr</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-red-600 rounded-full mb-6">
            <Film className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-stone-900 dark:text-stone-100">
            Welcome to <span className="cinema-gradient-text">FrameGuessr</span>
          </h1>
          
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            <strong>FrameGuessr</strong> (often searched as "frame guessr" or mistaken for "freeguessr") 
            is the original daily movie and TV show guessing game where players identify films and shows 
            from single frames.
          </p>
        </div>

        {/* What is FrameGuessr Section */}
        <section className="mb-12">
          <div className="cinema-glass rounded-2xl p-6 sm:p-8 border border-stone-200/30 dark:border-amber-700/30">
            <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
              What is FrameGuessr?
            </h2>
            
            <p className="text-stone-600 dark:text-stone-400 mb-6">
              FrameGuessr is a web-based game that challenges movie enthusiasts to guess movies and TV shows 
              from carefully selected still frames. Not to be confused with other similar-sounding games, 
              FrameGuessr offers unique features that set it apart:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: <Sparkles className="w-5 h-5" />,
                  title: "Progressive Hint System",
                  description: "Blur gradually reduces with each hint, revealing more details"
                },
                {
                  icon: <Music className="w-5 h-5" />,
                  title: "Audio Soundtrack Clues",
                  description: "Hear actual music from the movie or show"
                },
                {
                  icon: <Clock className="w-5 h-5" />,
                  title: "Daily Challenges",
                  description: "New movie or TV show every single day"
                },
                {
                  icon: <Trophy className="w-5 h-5" />,
                  title: "Progress Tracking",
                  description: "Keep track of your wins and build streaks"
                }
              ].map((feature, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-stone-600 dark:text-stone-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to Play */}
        <section className="mb-12">
          <div className="cinema-glass rounded-2xl p-6 sm:p-8 border border-stone-200/30 dark:border-amber-700/30">
            <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Play className="w-6 h-6 text-amber-600" />
              How to Play FrameGuessr
            </h2>
            
            <ol className="space-y-4">
              {[
                "Each day, you'll see a heavily blurred frame from a movie or TV show",
                "You have 3 attempts to guess the correct title",
                "After each wrong guess, you unlock a new hint:",
                "• First hint: Less blur on the image",
                "• Second hint: Tagline + even less blur",
                "• Third hint: Year, genre, and audio clip",
                "Win by guessing correctly, or learn something new!"
              ].map((step, index) => (
                <li key={index} className={`${index < 3 ? 'font-medium' : ''} text-stone-700 dark:text-stone-300`}>
                  {index < 3 && <span className="text-amber-600 dark:text-amber-400 font-bold mr-2">{index + 1}.</span>}
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FrameGuessr vs Others */}
        <section className="mb-12">
          <div className="cinema-glass rounded-2xl p-6 sm:p-8 border border-stone-200/30 dark:border-amber-700/30">
            <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
              FrameGuessr vs Similar Games
            </h2>
            
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              While you might find FrameGuessr when searching for "freeguessr" or "frame quiz", 
              our game offers a unique experience designed specifically for true cinema lovers:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 dark:text-stone-100">FrameGuessr Exclusive:</strong>
                  <span className="text-stone-600 dark:text-stone-400"> Audio soundtrack hints from the actual movies</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 dark:text-stone-100">Progressive Blur System:</strong>
                  <span className="text-stone-600 dark:text-stone-400"> Gradually reveals the image, not just new frames</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 dark:text-stone-100">Movies AND TV Shows:</strong>
                  <span className="text-stone-600 dark:text-stone-400"> Double the content variety</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 dark:text-stone-100">Cinematic Design:</strong>
                  <span className="text-stone-600 dark:text-stone-400"> Theater-inspired interface with attention to detail</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-stone-900 dark:text-stone-100">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            <details className="cinema-glass rounded-xl p-4 border border-stone-200/30 dark:border-amber-700/30 group">
              <summary className="font-semibold text-stone-900 dark:text-stone-100 cursor-pointer flex items-center justify-between">
                Is it FrameGuessr or FreeGuessr?
                <span className="text-amber-600 dark:text-amber-400 text-sm ml-2">↓</span>
              </summary>
              <p className="mt-3 text-stone-600 dark:text-stone-400">
                It's <strong>FrameGuessr</strong> - a frame-based movie guessing game. We're not affiliated 
                with freeguessr or any other similar-sounding games. FrameGuessr is the original daily 
                movie frame puzzle with unique features like audio hints and progressive blur.
              </p>
            </details>
            
            <details className="cinema-glass rounded-xl p-4 border border-stone-200/30 dark:border-amber-700/30 group">
              <summary className="font-semibold text-stone-900 dark:text-stone-100 cursor-pointer flex items-center justify-between">
                How is FrameGuessr different from Framed?
                <span className="text-amber-600 dark:text-amber-400 text-sm ml-2">↓</span>
              </summary>
              <p className="mt-3 text-stone-600 dark:text-stone-400">
                FrameGuessr offers several unique features: audio soundtrack hints, progressive blur reduction 
                (instead of just showing new frames), both movies AND TV shows, detailed movie information 
                after completion, and a more immersive cinematic interface.
              </p>
            </details>
            
            <details className="cinema-glass rounded-xl p-4 border border-stone-200/30 dark:border-amber-700/30 group">
              <summary className="font-semibold text-stone-900 dark:text-stone-100 cursor-pointer flex items-center justify-between">
                Is FrameGuessr free to play?
                <span className="text-amber-600 dark:text-amber-400 text-sm ml-2">↓</span>
              </summary>
              <p className="mt-3 text-stone-600 dark:text-stone-400">
                Yes! FrameGuessr is completely free to play. No ads, no paywalls, no premium features. 
                You can optionally create an account to sync your progress across devices, but it's not required.
              </p>
            </details>
            
            <details className="cinema-glass rounded-xl p-4 border border-stone-200/30 dark:border-amber-700/30 group">
              <summary className="font-semibold text-stone-900 dark:text-stone-100 cursor-pointer flex items-center justify-between">
                When do new challenges appear?
                <span className="text-amber-600 dark:text-amber-400 text-sm ml-2">↓</span>
              </summary>
              <p className="mt-3 text-stone-600 dark:text-stone-400">
                A new FrameGuessr challenge is released every day at midnight (your local time). 
                You can also browse and play previous challenges in our archive.
              </p>
            </details>
          </div>
        </section>

        {/* Community Section */}
        <section className="mb-12">
          <div className="cinema-glass rounded-2xl p-6 sm:p-8 border border-stone-200/30 dark:border-amber-700/30 text-center">
            <Users className="w-12 h-12 text-amber-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
              Join the FrameGuessr Community
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mb-6 max-w-2xl mx-auto">
              Share your results, discuss movies, and connect with other film enthusiasts. 
              Use <strong>#frameguessr</strong> on social media to join the conversation!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a 
                href="https://twitter.com/frameguessr"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors text-sm font-medium"
              >
                Twitter
              </a>
              <a 
                href="https://reddit.com/r/frameguessr"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors text-sm font-medium"
              >
                Reddit
              </a>
              <a 
                href="mailto:frameguessr@gmail.com"
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors text-sm font-medium"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>

        {/* Creator Section */}
        <section className="text-center text-sm text-stone-500 dark:text-stone-500">
          <p>
            FrameGuessr was created with ❤️ by Strahil Peykov for movie lovers everywhere.
          </p>
          <p className="mt-2">
            Special thanks to my girlfriend Ally for the inspiration.
          </p>
        </section>
      </main>
    </div>
  )
}