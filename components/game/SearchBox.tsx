'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Loader2, Film, Tv, Calendar, X } from 'lucide-react'
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
  placeholder = "Search the cinema archives..."
}: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<EnhancedSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [error, setError] = useState<string | null>(null)
  const [hasFocus, setHasFocus] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  
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
      
      // Filter out already selected items
      const filteredResults = data.filter((item: EnhancedSearchResult) => 
        !selectedIds.has(`${item.mediaType}-${item.id}`)
      )
      
      setResults(filteredResults)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Search failed:', error)
      setError(error instanceof Error ? error.message : 'Search failed')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [selectedIds])

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
    // Add to selected set
    setSelectedIds(prev => new Set(prev).add(`${result.mediaType}-${result.id}`))
    
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

  const shouldShowResults = showResults && (hasFocus || selectedIndex >= 0)

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Cinema Search Input */}
      <div className="relative">
        <div className="absolute left-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Search className="w-5 h-5 text-stone-400 dark:text-stone-500" />
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
          className={`w-full pl-14 pr-14 py-5 text-lg cinema-glass rounded-2xl 
            border-2 transition-all duration-300 shadow-lg hover:shadow-xl cinema-focus
            ${hasFocus || showResults 
              ? 'border-amber-500 dark:border-amber-400' 
              : 'border-stone-200 dark:border-stone-700'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-stone-300 dark:hover:border-stone-600'}
            text-stone-900 dark:text-stone-100 placeholder-stone-500 dark:placeholder-stone-400
            backdrop-blur-sm`}
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
        <div className="absolute right-5 top-1/2 transform -translate-y-1/2">
          {isSearching ? (
            <div className="cinema-spinner w-5 h-5" />
          ) : query.length > 0 ? (
            <button
              onClick={clearSearch}
              className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full transition-colors cinema-touch"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Cinema Search Results */}
      {shouldShowResults && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-50 cinema-scrollbar"
          role="listbox"
        >
          {error && (
            <div className="px-6 py-6 text-center text-red-600 dark:text-red-400 border-b border-stone-200 dark:border-stone-700">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-3">
                <X className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium">{error}</p>
              <p className="text-xs mt-1 opacity-70">The projection booth is having issues</p>
            </div>
          )}
          
          {!error && results.length === 0 && !isSearching && query.length >= 2 && (
            <div className="px-6 py-8 text-center text-stone-500 dark:text-stone-400">
              <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-sm font-medium">No films found in our archives</p>
              <p className="text-xs mt-1 opacity-70">Try a different title or director</p>
            </div>
          )}
          
          {!error && isSearching && (
            <div className="px-6 py-8 text-center text-stone-500 dark:text-stone-400">
              <div className="cinema-spinner mx-auto mb-4" />
              <p className="text-sm">Searching the film library...</p>
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
                  className={`w-full text-left px-5 py-4 transition-all duration-200 cinema-focus group
                    ${index === selectedIndex 
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500' 
                      : 'hover:bg-stone-50 dark:hover:bg-stone-800/50'
                    }
                    ${index < results.length - 1 ? 'border-b border-stone-200 dark:border-stone-700/30' : ''}
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* Poster with Cinema Frame */}
                    <div className="flex-shrink-0 relative">
                      {result.posterUrl ? (
                        <div className="relative">
                          <img
                            src={result.posterUrl}
                            alt=""
                            className="w-14 h-20 object-cover rounded-lg shadow-lg bg-stone-200 dark:bg-stone-700 border border-stone-300 dark:border-stone-600/50"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          {/* Film strip overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg pointer-events-none" />
                        </div>
                      ) : (
                        <div className="w-14 h-20 bg-stone-200 dark:bg-stone-700 rounded-lg flex items-center justify-center border border-stone-300 dark:border-stone-600/50">
                          {result.mediaType === 'tv' ? (
                            <Tv className="w-7 h-7 text-stone-400" />
                          ) : (
                            <Film className="w-7 h-7 text-stone-400" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Content with Cinema Styling */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-bold text-stone-900 dark:text-stone-100 truncate text-base leading-tight group-hover:text-amber-700 dark:group-hover:text-amber-200 transition-colors">
                          {result.title}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-400 mb-2">
                        {result.year && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {result.year}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          {result.mediaType === 'tv' ? (
                            <>
                              <Tv className="w-3.5 h-3.5" />
                              Television Series
                            </>
                          ) : (
                            <>
                              <Film className="w-3.5 h-3.5" />
                              Feature Film
                            </>
                          )}
                        </span>
                      </div>
                      
                      {result.overview && (
                        <p className="text-xs text-stone-500 dark:text-stone-500 line-clamp-2 leading-relaxed">
                          {result.overview.length > 140 
                            ? `${result.overview.substring(0, 140)}...`
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