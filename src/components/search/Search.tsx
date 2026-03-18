'use client'

import { useEffect, useMemo, useState } from 'react'
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
}

const placeholders = ['un restaurant ?', 'un hotel ?', 'une idée de sortie ?']

export default function Search({ initialQuery = '', onNavigate }: SearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [placeholder, setPlaceholder] = useState('')

  const fetchSuggestions = useMemo(
    () =>
      debounce(async (value: string) => {
        if (value.length < 3) {
          setSuggestions([])
          return
        }

        try {
          const response = await fetch(`/api/search?term=${encodeURIComponent(value)}&limit=6`)
          if (!response.ok) {
            throw new Error('Erreur lors de la recherche')
          }

          const data = (await response.json()) as SearchSuggestion[]
          setSuggestions(data)
        } catch (error) {
          console.error(error)
          setSuggestions([])
        }
      }, 300),
    []
  )

  useEffect(() => {
    setQuery(initialQuery)
    setSuggestions([])
  }, [initialQuery])

  useEffect(() => () => fetchSuggestions.cancel(), [fetchSuggestions])

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
    setQuery(value)
    fetchSuggestions(value)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      return
    }

    setSuggestions([])
    router.push(`/recherche?term=${encodeURIComponent(trimmedQuery)}`)
    onNavigate?.()
  }

  const navigateTo = (post: SearchSuggestion) => {
    router.push(`/articles/${post.slug}`)
    setSuggestions([])
    onNavigate?.()
  }

  return (
    <div className="mx-auto w-full px-3">
      <div className="relative mx-auto flex w-full max-w-2xl flex-col">
        <form onSubmit={handleSubmit} className="flex w-full flex-row">
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder={`Vous recherchez ${placeholder}`}
            className="w-full rounded-l border border-gray-300 p-2 font-montserrat text-[6pt] uppercase tracking-widest text-black focus:border-black-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-r bg-black px-6 font-montserrat text-[6pt] uppercase tracking-widest text-white transition hover:bg-gray-900"
            aria-label="Chercher"
          >
            Chercher
          </button>
        </form>

        {suggestions.length > 0 ? (
          <ul className="absolute left-0 right-0 top-full z-10 mt-2 max-h-[70vh] w-full overflow-y-auto overflow-x-hidden border border-black/10 bg-white text-left shadow-lg">
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
          </ul>
        ) : null}
      </div>
    </div>
  )
}
