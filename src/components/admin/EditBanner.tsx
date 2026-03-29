'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getWordPressConfig } from '@/lib/config'

interface EditBannerProps {
  postId?: string | number
  canEdit?: boolean
}

export default function EditBanner({ postId, canEdit = false }: EditBannerProps) {
  const [mounted, setMounted] = useState(false)
  const { siteUrl } = getWordPressConfig()
  const baseUrl = siteUrl?.replace(/\/$/, '') ?? ''
  const editUrl = postId
    ? `${baseUrl}/wp/wp-admin/post.php?post=${postId}&action=elementor`
    : `${baseUrl}/wp/wp-admin/`

  useEffect(() => {
    setMounted(true)
    return () => {
      setMounted(false)
    }
  }, [])

  if (!canEdit || !postId || !mounted || typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <a
      href={editUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-[#1f1f1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 md:px-6 md:text-sm"
      style={{
        position: 'fixed',
        right: 'max(16px, env(safe-area-inset-right))',
        bottom: 'max(16px, env(safe-area-inset-bottom))',
        zIndex: 2147483647
      }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4 shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 20H8L18.5 9.5C19.3 8.7 19.3 7.3 18.5 6.5L17.5 5.5C16.7 4.7 15.3 4.7 14.5 5.5L4 16V20Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      Modifier l&apos;article
    </a>,
    document.body
  )
}
