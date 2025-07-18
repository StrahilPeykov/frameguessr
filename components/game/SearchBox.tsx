'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, Film, Tv } from 'lucide-react'
import { SearchResult } from '@/types/game'

interface SearchBoxProps {
  onSelect: (result: SearchResult) => void
  disabled?: boolean
}

export default function SearchBox({ onSelect, disabled }: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    setIsSearching(true)
    setShowResults(true)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data)
      } catch (error) {
        console.error('Search failed:', error)
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

  const handleSelect = (result: SearchResult) => {
    onSelect(result)
    setQuery('')
    setResults([])
    setShowResults(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowResults(false)
      inputRef.current?.blur()
    } else if (e.key === 'ArrowDown' && results.length > 0) {
      e.preventDefault()
      const firstButton = searchRef.current?.querySelector<HTMLButtonElement>('[role="option"]')
      firstButton?.focus()
    }
  }

  const handleResultKeyDown = (e: React.KeyboardEvent, index: number) => {
    const options = searchRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]')
    if (!options) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIndex = (index + 1) % options.length
      options[nextIndex]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prevIndex = index === 0 ? options.length - 1 : index - 1
      options[prevIndex]?.focus()
    } else if (e.key === 'Escape') {
      inputRef.current?.focus()
      setShowResults(false)
    }
  }

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder="Search for a movie or TV show..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (results.length > 0 || (query.length >= 2 && !isSearching)) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50 scrollbar-thin">
          {results.length === 0 && !isSearching ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">No results found for "{query}"</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          ) : (
            <div role="listbox">
              {results.map((result, index) => (
                <button
                  key={`${result.mediaType}-${result.id}`}
                  role="option"
                  onClick={() => handleSelect(result)}
                  onKeyDown={(e) => handleResultKeyDown(e, index)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors touch-feedback"
                >
                  <div className="flex items-start gap-3">
                    {result.posterUrl ? (
                      <img
                        src={result.posterUrl}
                        alt=""
                        className="w-10 h-14 object-cover rounded"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-10 h-14 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        {result.mediaType === 'tv' ? (
                          <Tv className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Film className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {result.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {result.year && `${result.year} • `}
                        {result.mediaType === 'tv' ? 'TV Show' : 'Movie'}
                      </p>
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