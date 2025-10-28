'use client'

import { useEffect, useState } from 'react'
import { getWordPressConfig } from '@/lib/config'

interface EditBannerProps {
  postId?: string | number
}

interface SessionResponse {
  loggedIn: boolean
  user?: {
    id: number
    name: string
    roles: string[]
  }
}

export default function EditBanner({ postId }: EditBannerProps) {
  const [session, setSession] = useState<SessionResponse | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/wp-session', {
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Session fetch failed')
        }

        const data = (await response.json()) as SessionResponse
        setSession(data)
      } catch (error) {
        console.error('Erreur lors de la récupération de la session WP', error)
        setSession({ loggedIn: false })
      }
    }

    fetchSession()
  }, [])

  if (!session?.loggedIn || !session.user?.roles?.includes('administrator')) {
    return null
  }

  const { siteUrl } = getWordPressConfig()
  const editUrl = postId
    ? `${siteUrl?.replace(/\/$/, '')}/wp-admin/post.php?post=${postId}&action=edit`
    : siteUrl

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-yellow-300 p-3 text-center text-sm text-black shadow">
      ✏️ Vous êtes connecté à WordPress.
      {postId ? (
        <a
          href={editUrl}
          target="_blank"
          rel="noreferrer"
          className="ml-2 underline transition hover:text-blue-700"
        >
          Modifier cet article
        </a>
      ) : null}
    </div>
  )
}
