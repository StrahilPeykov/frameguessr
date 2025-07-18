'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, Film, Tv, Star, Calendar } from 'lucide-react'
import { SearchResult } from '@/types/game'

interface SearchBoxProps {
  onSelect: (result: SearchResult) => void
  disabled?: boolean
  placeholder?: string
}

interface EnhancedSearchResult extends SearchResult {
  overview?: string
  popularity?: number
  backdropUrl?: string
}

export default function SearchBox({ 
  onSelect, 
  disabled = false,
  placeholder = "Search for a movie or TV show..."
}: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<EnhancedSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [error, setError] = useState<string | null>(null)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout>()

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search function
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setShowResults(false)
      setError(null)
      return
    }

    setIsSearching(true)
    setShowResults(true)
    setError(null)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Search failed')
        }
        
        const data = await response.json()
        setResults(data)
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Search failed:', error)
        setError(error instanceof Error ? error.message : 'Search failed')
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [query])

  const handleSelect = (result: EnhancedSearchResult) => {
    onSelect(result)
    setQuery('')
    setResults([])
    setShowResults(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) {
      if (e.key === 'Escape') {
        setShowResults(false)
        inputRef.current?.blur()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex])
        }
        break
      case 'Escape':
        setShowResults(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const formatPopularity = (popularity: number): string => {
    if (popularity >= 100) return '🔥'
    if (popularity >= 50) return '⭐'
    if (popularity >= 20) return '👍'
    return ''
  }

  return (
    <div ref={searchRef} className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.length >= 2) {
              setShowResults(true)
            }
          }}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        {isSearching && (
          <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-50 backdrop-blur-sm"
        >
          {error && (
            <div className="px-6 py-4 text-center text-red-600 dark:text-red-400">
              <p className="text-sm font-medium">{error}</p>
              <p className="text-xs mt-1">Please try again</p>
            </div>
          )}
          
          {!error && results.length === 0 && !isSearching && query.length >= 2 && (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No results found for "{query}"</p>
              <p className="text-xs mt-1">Try a different search term or check the spelling</p>
            </div>
          )}
          
          {!error && isSearching && (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" />
              <p className="text-sm">Searching...</p>
            </div>
          )}

          {!error && results.length > 0 && (
            <div role="listbox" className="py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.mediaType}-${result.id}`}
                  role="option"
                  aria-selected={index === selectedIndex}
                  onClick={() => handleSelect(result)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none transition-colors ${
                    index === selectedIndex ? 'bg-gray-50 dark:bg-gray-700' : ''
                  } ${index < results.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Poster Image */}
                    {result.posterUrl ? (
                      <img
                        src={result.posterUrl}
                        alt=""
                        className="w-12 h-16 object-cover rounded-lg flex-shrink-0 shadow-sm"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        {result.mediaType === 'tv' ? (
                          <Tv className="w-6 h-6 text-gray-400" />
                        ) : (
                          <Film className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-base">
                          {result.title}
                        </h3>
                        {result.popularity && (
                          <span className="text-lg flex-shrink-0">
                            {formatPopularity(result.popularity)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          {result.year && (
                            <>
                              <Calendar className="w-3 h-3" />
                              {result.year}
                            </>
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          {result.mediaType === 'tv' ? (
                            <>
                              <Tv className="w-3 h-3" />
                              TV Show
                            </>
                          ) : (
                            <>
                              <Film className="w-3 h-3" />
                              Movie
                            </>
                          )}
                        </span>
                      </div>
                      
                      {result.overview && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {result.overview.length > 100 
                            ? `${result.overview.substring(0, 100)}...`
                            : result.overview
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}