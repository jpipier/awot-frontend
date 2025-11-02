'use client'

import { useEffect } from 'react'

interface ElementorStylesLoaderProps {
  cssFiles: string[]
  bodyClasses?: string[] | null
}

export default function ElementorStylesLoader({ cssFiles, bodyClasses }: ElementorStylesLoaderProps) {
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

  useEffect(() => {
    const classesToApply = (bodyClasses ?? []).filter(Boolean)
    const addedClasses: string[] = []

    classesToApply.forEach((cls) => {
      if (!document.body.classList.contains(cls)) {
        document.body.classList.add(cls)
        addedClasses.push(cls)
      }
    })

    return () => {
      addedClasses.forEach((cls) => {
        document.body.classList.remove(cls)
      })
    }
  }, [bodyClasses?.join(' ')])

  return null
}
