'use client'

import { useState } from 'react'
import { X, Film, Tv, Clock, Volume2, Star, Trophy, Calendar, Zap } from 'lucide-react'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'howto'>('about')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-stone-900 max-w-2xl w-full rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Film className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              FrameGuessr
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-stone-500 dark:text-stone-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 dark:border-stone-700">
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'about'
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-600 dark:border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/50'
            }`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab('howto')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'howto'
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-600 dark:border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/50'
            }`}
          >
            How to Play
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === 'about' && (
            <div className="space-y-4">
              {/* Hero Description */}
              <div className="text-center">
                <h3 className="text-xl font-bold cinema-gradient-text mb-2">
                  Daily Movie Guessing Game
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Identify movies and TV shows from blurred frames with progressive hints.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-stone-100 dark:bg-stone-800 rounded-lg">
                  <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
                  <h4 className="font-medium text-stone-900 dark:text-stone-100 text-sm">Daily Challenges</h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400">New every day</p>
                </div>
                
                <div className="text-center p-3 bg-stone-100 dark:bg-stone-800 rounded-lg">
                  <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
                  <h4 className="font-medium text-stone-900 dark:text-stone-100 text-sm">Progressive Hints</h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400">Gets clearer</p>
                </div>
                
                <div className="text-center p-3 bg-stone-100 dark:bg-stone-800 rounded-lg">
                  <Volume2 className="w-6 h-6 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
                  <h4 className="font-medium text-stone-900 dark:text-stone-100 text-sm">Audio Clues</h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400">Soundtrack hints</p>
                </div>
                
                <div className="text-center p-3 bg-stone-100 dark:bg-stone-800 rounded-lg">
                  <Star className="w-6 h-6 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
                  <h4 className="font-medium text-stone-900 dark:text-stone-100 text-sm">Full Archive</h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400">Play any day</p>
                </div>
              </div>

              {/* What Makes It Special */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-lg p-3">
                <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4" />
                  Why FrameGuessr?
                </h4>
                <div className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
                  <p>• Movies <Film className="w-3 h-3 inline mx-1" /> & TV shows <Tv className="w-3 h-3 inline mx-1" /> • Free forever • No ads</p>
                  <p>• Play without signing up • Optional progress sync</p>
                </div>
              </div>

              {/* Credits */}
              <div className="text-center text-xs text-stone-500 dark:text-stone-500">
                <p>Data: TMDB • Audio: Deezer • Made with ❤️</p>
              </div>
            </div>
          )}

          {activeTab === 'howto' && (
            <div className="space-y-4">
              {/* Game Rules */}
              <div className="text-center">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-lg p-3 mb-3">
                  <p className="text-amber-900 dark:text-amber-100 font-medium text-sm">
                    Guess the movie/show in 3 attempts or less!
                  </p>
                </div>
              </div>

              {/* How It Works - Compact */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-stone-100 dark:bg-stone-800 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold mx-auto mb-1">1</div>
                  <h5 className="font-medium text-stone-900 dark:text-stone-100 text-xs mb-1">Start Blurred</h5>
                  <p className="text-xs text-stone-600 dark:text-stone-400">3s audio</p>
                </div>
                
                <div className="text-center p-2 bg-stone-100 dark:bg-stone-800 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold mx-auto mb-1">2</div>
                  <h5 className="font-medium text-stone-900 dark:text-stone-100 text-xs mb-1">Get Hints</h5>
                  <p className="text-xs text-stone-600 dark:text-stone-400">Tagline + 5s</p>
                </div>
                
                <div className="text-center p-2 bg-stone-100 dark:bg-stone-800 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold mx-auto mb-1">3</div>
                  <h5 className="font-medium text-stone-900 dark:text-stone-100 text-xs mb-1">Final Clues</h5>
                  <p className="text-xs text-stone-600 dark:text-stone-400">Year + 15s</p>
                </div>
              </div>

              {/* Hint Progression - Visual */}
              <div>
                <h4 className="font-medium text-stone-900 dark:text-stone-100 mb-2 text-center text-sm">Blur Progression:</h4>
                <div className="flex items-center justify-center gap-2">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-6 bg-stone-300 dark:bg-stone-600 rounded border border-stone-400 dark:border-stone-500 flex items-center justify-center" style={{filter: 'blur(3px)'}}>
                      <Film className="w-3 h-3 text-stone-600 dark:text-stone-300" />
                    </div>
                    <span className="text-xs text-stone-500 dark:text-stone-400 mt-1">Heavy</span>
                  </div>
                  <span className="text-stone-400 dark:text-stone-500 text-xs">→</span>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-6 bg-stone-300 dark:bg-stone-600 rounded border border-stone-400 dark:border-stone-500 flex items-center justify-center" style={{filter: 'blur(1.5px)'}}>
                      <Film className="w-3 h-3 text-stone-600 dark:text-stone-300" />
                    </div>
                    <span className="text-xs text-stone-500 dark:text-stone-400 mt-1">Medium</span>
                  </div>
                  <span className="text-stone-400 dark:text-stone-500 text-xs">→</span>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-6 bg-stone-300 dark:bg-stone-600 rounded border border-stone-400 dark:border-stone-500 flex items-center justify-center" style={{filter: 'blur(0.3px)'}}>
                      <Film className="w-3 h-3 text-stone-600 dark:text-stone-300" />
                    </div>
                    <span className="text-xs text-stone-500 dark:text-stone-400 mt-1">Light</span>
                  </div>
                  <span className="text-stone-400 dark:text-stone-500 text-xs">→</span>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-6 bg-amber-100 dark:bg-amber-900/30 rounded border border-amber-300 dark:border-amber-600 flex items-center justify-center">
                      <Trophy className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-xs text-amber-600 dark:text-amber-400 mt-1">Win!</span>
                  </div>
                </div>
              </div>

              {/* Tips & Scoring - Combined */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-lg p-3">
                  <h4 className="font-medium text-stone-900 dark:text-stone-100 mb-1 flex items-center gap-1 text-sm">
                    <Volume2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    Tips:
                  </h4>
                  <ul className="text-xs text-stone-700 dark:text-stone-300 space-y-0.5">
                    <li>• Listen to audio</li>
                    <li>• Watch details</li>
                    <li>• Skip if stuck</li>
                  </ul>
                </div>
                
                <div className="bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-lg p-3">
                  <h4 className="font-medium text-stone-900 dark:text-stone-100 mb-1 flex items-center gap-1 text-sm">
                    <Star className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    Score:
                  </h4>
                  <p className="text-xs text-stone-700 dark:text-stone-300">
                    Fewer attempts = better score!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}