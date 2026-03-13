'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import debounce from 'lodash.debounce'

interface SearchSuggestion {
  id: string
  title: string
  slug: string
}

interface SearchProps {
  onNavigate?: () => void
}

const placeholders = ['un restaurant ?', 'un hotel ?', 'une idée de sortie ?']

export default function Search({ onNavigate }: SearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
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
          const response = await fetch(`/api/search?term=${encodeURIComponent(value)}`)
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
    if (suggestions.length > 0) {
      navigateTo(suggestions[0])
    }
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
          className="w-full rounded-l border border-gray-300 p-2 focus:border-black-500 focus:outline-none uppercase text-[6pt] tracking-widest font-montserrat text-black"
        />
        <button
          type="submit"
          className="rounded-r bg-black px-6 text-white transition hover:bg-gray-900 font-montserrat uppercase text-[6pt] tracking-widest"
          aria-label="Chercher"
        >
          Chercher
        </button>
      </form>
        {suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-10 mt-2 w-full bg-white text-left shadow-lg">
          {suggestions.map((post) => (
            <li
              key={post.id}
              className="cursor-pointer p-2 hover:bg-gray-200 font-montserrat uppercase text-[6pt] tracking-widest text-black"
              onClick={() => navigateTo(post)}
            >
              {post.title}
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  )
}
