'use client'

import { useEffect, useState } from 'react'
import { getWordPressConfig } from '@/lib/config'

interface EditBannerProps {
  postId?: string | number
}

interface SessionResponse {
  loggedIn: boolean
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
          setSession({ loggedIn: false })
          return
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

  if (!postId) {
    return null
  }

  if (!session?.loggedIn) {
    return null
  }

  const { siteUrl } = getWordPressConfig()
  const editUrl = `${siteUrl?.replace(/\/$/, '')}/wp-admin/post.php?post=${postId}&action=edit`

  return (
    <a
      href={editUrl}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-[#1f1f1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
    >
      Modifier l&apos;article
    </a>
  )
}
