'use client'

import { useEffect } from 'react'

interface ElementorStylesLoaderProps {
  cssFiles: string[]
}

export default function ElementorStylesLoader({ cssFiles }: ElementorStylesLoaderProps) {
  useEffect(() => {
    const appended: HTMLLinkElement[] = []

    cssFiles.forEach((fileUrl) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = fileUrl
      document.head.appendChild(link)
      appended.push(link)
    })

    return () => {
      appended.forEach((link) => {
        if (document.head.contains(link)) {
          document.head.removeChild(link)
        }
      })
    }
  }, [cssFiles])

  return null
}
