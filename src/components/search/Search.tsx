'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import debounce from 'lodash.debounce'

interface SearchSuggestion {
  id: string
  title: string
  slug: string
  image?: string | null
  imageAlt?: string | null
  location?: string | null
}

interface SearchProps {
  initialQuery?: string
  onNavigate?: () => void
  variant?: 'default' | 'hero'
}

const placeholders = ['un restaurant végétarien ?', 'un hotel ?', 'une idée de sortie ?','un cours de yoga ?', 'une idée cadeau ?']
const SUGGESTIONS_LIMIT = 6
const SUGGESTIONS_DEBOUNCE_MS = 150

export default function Search({ initialQuery = '', onNavigate, variant = 'default' }: SearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [placeholder, setPlaceholder] = useState('')
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [hasSearchedSuggestions, setHasSearchedSuggestions] = useState(false)
  const activeRequestControllerRef = useRef<AbortController | null>(null)
  const suggestionsRequestIndexRef = useRef(0)

  const fetchSuggestions = useMemo(
    () =>
      debounce(async (value: string) => {
        const trimmedValue = value.trim()
        if (trimmedValue.length < 3) {
          suggestionsRequestIndexRef.current += 1
          activeRequestControllerRef.current?.abort()
          setSuggestions([])
          setIsLoadingSuggestions(false)
          setHasSearchedSuggestions(false)
          return
        }

        activeRequestControllerRef.current?.abort()
        const controller = new AbortController()
        activeRequestControllerRef.current = controller
        const requestIndex = suggestionsRequestIndexRef.current + 1
        suggestionsRequestIndexRef.current = requestIndex
        setIsLoadingSuggestions(true)
        setHasSearchedSuggestions(false)

        try {
          const response = await fetch(
            `/api/search?term=${encodeURIComponent(trimmedValue)}&limit=${SUGGESTIONS_LIMIT}`,
            {
              signal: controller.signal
            }
          )
          if (!response.ok) {
            throw new Error('Erreur lors de la recherche')
          }

          const data = (await response.json()) as SearchSuggestion[]
          if (requestIndex === suggestionsRequestIndexRef.current) {
            setSuggestions(data)
            setIsLoadingSuggestions(false)
            setHasSearchedSuggestions(true)
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            return
          }

          console.error(error)
          if (requestIndex === suggestionsRequestIndexRef.current) {
            setSuggestions([])
            setIsLoadingSuggestions(false)
            setHasSearchedSuggestions(true)
          }
        }
      }, SUGGESTIONS_DEBOUNCE_MS),
    []
  )

  useEffect(() => {
    fetchSuggestions.cancel()
    activeRequestControllerRef.current?.abort()
    suggestionsRequestIndexRef.current += 1
    setQuery(initialQuery)
    setSuggestions([])
    setIsLoadingSuggestions(false)
    setHasSearchedSuggestions(false)
  }, [fetchSuggestions, initialQuery])

  useEffect(
    () => () => {
      fetchSuggestions.cancel()
      activeRequestControllerRef.current?.abort()
    },
    [fetchSuggestions]
  )

  useEffect(() => {
    let mounted = true
    let placeholderIndex = 0
    let charIndex = 0
    let typing = true
    let timeoutId: NodeJS.Timeout

    const step = () => {
      if (!mounted) {
        return
      }

      const phrase = placeholders[placeholderIndex]

      if (typing) {
        setPlaceholder(phrase.slice(0, charIndex))
        charIndex += 1

        if (charIndex <= phrase.length) {
          timeoutId = setTimeout(step, 40)
        } else {
          typing = false
          timeoutId = setTimeout(step, 1000)
        }
      } else {
        charIndex -= 1
        setPlaceholder(phrase.slice(0, Math.max(charIndex, 0)))

        if (charIndex > 0) {
          timeoutId = setTimeout(step, 50)
        } else {
          typing = true
          placeholderIndex = (placeholderIndex + 1) % placeholders.length
          timeoutId = setTimeout(step, 200)
        }
      }
    }

    step()

    return () => {
      mounted = false
      clearTimeout(timeoutId)
    }
  }, [])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const trimmedValue = value.trim()

    setQuery(value)

    if (trimmedValue.length >= 3) {
      setIsLoadingSuggestions(true)
      setHasSearchedSuggestions(false)
    } else {
      setIsLoadingSuggestions(false)
      setHasSearchedSuggestions(false)
    }

    fetchSuggestions(value)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      return
    }

    fetchSuggestions.cancel()
    activeRequestControllerRef.current?.abort()
    suggestionsRequestIndexRef.current += 1
    setSuggestions([])
    setIsLoadingSuggestions(false)
    setHasSearchedSuggestions(false)
    router.push(`/recherche?term=${encodeURIComponent(trimmedQuery)}`)
    onNavigate?.()
  }

  const navigateTo = (post: SearchSuggestion) => {
    fetchSuggestions.cancel()
    activeRequestControllerRef.current?.abort()
    suggestionsRequestIndexRef.current += 1
    router.push(`/articles/${post.slug}`)
    setSuggestions([])
    setIsLoadingSuggestions(false)
    setHasSearchedSuggestions(false)
    onNavigate?.()
  }

  const navigateToSearchResults = () => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      return
    }

    fetchSuggestions.cancel()
    activeRequestControllerRef.current?.abort()
    suggestionsRequestIndexRef.current += 1
    router.push(`/recherche?term=${encodeURIComponent(trimmedQuery)}`)
    setSuggestions([])
    setIsLoadingSuggestions(false)
    setHasSearchedSuggestions(false)
    onNavigate?.()
  }

  const shouldShowSuggestionsDropdown =
    query.trim().length >= 3 &&
    (isLoadingSuggestions || suggestions.length > 0 || hasSearchedSuggestions)

  return (
    <div className={variant === 'hero' ? 'home-hero-search-control mx-auto w-full' : 'mx-auto w-full px-3'}>
      <div className={`relative mx-auto flex w-full flex-col${variant === 'hero' ? '' : ' max-w-2xl'}`}>
        <form onSubmit={handleSubmit} className="relative flex w-full flex-row">
          {variant === 'hero' && (
            <svg aria-hidden="true" className="home-hero-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="10" cy="10" r="7" />
              <path d="m15 15 6 6" />
            </svg>
          )}
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder={`Vous recherchez ${placeholder}`}
            className="w-full rounded-l border border-gray-300 p-2 font-montserrat text-[10px] uppercase tracking-widest text-black focus:border-black-500 focus:outline-none sm:text-[6pt]"
          />
          <button
            type="submit"
            className="rounded-r bg-black px-6 font-montserrat text-[6pt] uppercase tracking-widest text-white transition hover:bg-gray-900 w-[110px]"
            aria-label="Chercher"
          >
            {variant === 'hero' ? 'Chercher' : 'Let’s go !'}
          </button>
        </form>

        {shouldShowSuggestionsDropdown ? (
          <ul className="absolute left-0 right-0 top-full z-10 mt-2 max-h-[70vh] w-full overflow-y-auto overflow-x-hidden border border-black/10 bg-white text-left shadow-lg">
            {isLoadingSuggestions ? (
              <li className="border-t border-black/5 first:border-t-0">
                <div className="flex items-center gap-3 px-4 py-4">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  <p className="font-montserrat text-[10px] uppercase tracking-[0.24em] text-black/70">
                    Recherche en cours...
                  </p>
                </div>
              </li>
            ) : suggestions.length > 0 ? (
              <>
                {suggestions.map((post) => (
                  <li key={post.id} className="border-t border-black/5 first:border-t-0">
                    <button
                      type="button"
                      className="flex w-full items-center gap-4 p-3 text-left transition-colors hover:bg-gray-100"
                      onClick={() => navigateTo(post)}
                    >
                      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden bg-black/5 sm:h-[110px] sm:w-[110px]">
                        {post.image ? (
                          <Image
                            src={post.image}
                            alt={post.imageAlt ?? post.title}
                            fill
                            className="object-cover"
                            sizes="150px"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                          <p className="min-w-0 flex-1 font-brandonRegular text-xs uppercase leading-tight text-black sm:text-sm">
                            {post.title}
                          </p>
                          {post.location ? (
                            <p className="font-montserrat text-[9px] uppercase tracking-[0.24em] text-black/60 sm:max-w-[18ch] sm:text-right">
                              {post.location}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
                <li className="border-t border-black/10">
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-center font-montserrat text-[10px] uppercase tracking-[0.28em] text-black transition-colors hover:bg-gray-100"
                    onClick={navigateToSearchResults}
                  >
                    Voir tous les résultats
                  </button>
                </li>
              </>
            ) : (
              <li className="border-t border-black/5 first:border-t-0">
                <p className="px-4 py-4 font-montserrat text-[10px] uppercase tracking-[0.24em] text-black/60">
                  Aucun résultat.
                </p>
              </li>
            )}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
