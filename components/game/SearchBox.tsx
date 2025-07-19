'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Loader2, Film, Tv, Star, Calendar, X } from 'lucide-react'
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
  const [hasFocus, setHasFocus] = useState(false)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        setSelectedIndex(-1)
        setHasFocus(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [selectedIndex])

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      setShowResults(false)
      setError(null)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    setShowResults(true)
    setError(null)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      
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
  }, [])

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [query, performSearch])

  const handleSelect = useCallback((result: EnhancedSearchResult) => {
    onSelect(result)
    setQuery('')
    setResults([])
    setShowResults(false)
    setSelectedIndex(-1)
    setHasFocus(false)
    inputRef.current?.blur()
  }, [onSelect])

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
    setShowResults(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showResults) {
      if (e.key === 'Escape') {
        setShowResults(false)
        setHasFocus(false)
        inputRef.current?.blur()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        )
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
        setHasFocus(false)
        inputRef.current?.blur()
        break
    }
  }, [showResults, results, selectedIndex, handleSelect])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }, [])

  const handleFocus = useCallback(() => {
    setHasFocus(true)
    if (query.length >= 2) {
      setShowResults(true)
    }
  }, [query])

  const handleBlur = useCallback(() => {
    // Delay blur to allow for click events
    setTimeout(() => {
      if (!searchRef.current?.contains(document.activeElement)) {
        setHasFocus(false)
      }
    }, 150)
  }, [])

  const formatPopularity = (popularity: number): string => {
    if (popularity >= 100) return '🔥'
    if (popularity >= 50) return '⭐'
    if (popularity >= 20) return '👍'
    return ''
  }

  const shouldShowResults = showResults && (hasFocus || selectedIndex >= 0)

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full pl-12 pr-12 py-4 text-lg bg-white dark:bg-gray-800 rounded-2xl 
            border-2 transition-all duration-200 shadow-sm hover:shadow-md
            ${hasFocus || showResults 
              ? 'border-yellow-500 dark:border-yellow-400' 
              : 'border-gray-200 dark:border-gray-700'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300 dark:hover:border-gray-600'}
            focus:outline-none focus:ring-0 focus:border-yellow-500 dark:focus:border-yellow-400
            text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400`}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          role="combobox"
          aria-expanded={shouldShowResults}
          aria-autocomplete="list"
          aria-haspopup="listbox"
        />
        
        {/* Loading/Clear Button */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : query.length > 0 ? (
            <button
              onClick={clearSearch}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {shouldShowResults && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl max-h-96 overflow-y-auto z-50 scrollbar-thin"
          role="listbox"
        >
          {error && (
            <div className="px-6 py-4 text-center text-red-600 dark:text-red-400 border-b border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium">{error}</p>
              <p className="text-xs mt-1 opacity-70">Please try again</p>
            </div>
          )}
          
          {!error && results.length === 0 && !isSearching && query.length >= 2 && (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No results found</p>
              <p className="text-xs mt-1 opacity-70">Try a different search term</p>
            </div>
          )}
          
          {!error && isSearching && (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              <Loader2 className="w-6 h-6 mx-auto mb-3 animate-spin" />
              <p className="text-sm">Searching...</p>
            </div>
          )}

          {!error && results.length > 0 && (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.mediaType}-${result.id}`}
                  role="option"
                  aria-selected={index === selectedIndex}
                  onClick={() => handleSelect(result)}
                  className={`w-full text-left px-4 py-3 transition-all duration-150 focus:outline-none
                    ${index === selectedIndex 
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                    ${index < results.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* Poster Image */}
                    <div className="flex-shrink-0">
                      {result.posterUrl ? (
                        <img
                          src={result.posterUrl}
                          alt=""
                          className="w-12 h-16 object-cover rounded-lg shadow-sm bg-gray-200 dark:bg-gray-700"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          {result.mediaType === 'tv' ? (
                            <Tv className="w-6 h-6 text-gray-400" />
                          ) : (
                            <Film className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-base leading-tight">
                          {result.title}
                        </h3>
                        {result.popularity && (
                          <span className="text-lg flex-shrink-0 ml-2">
                            {formatPopularity(result.popularity)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {result.year && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {result.year}
                          </span>
                        )}
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
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {result.overview.length > 120 
                            ? `${result.overview.substring(0, 120)}...`
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