'use client'

import { useEffect, useMemo } from 'react'

interface ElementorStylesLoaderProps {
  cssFiles: string[]
  bodyClasses?: string[] | null
}

export default function ElementorStylesLoader({ cssFiles, bodyClasses }: ElementorStylesLoaderProps) {
  const normalizedBodyClasses = useMemo(() => {
    return (bodyClasses ?? []).filter((cls): cls is string => Boolean(cls))
  }, [bodyClasses])

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
    const classesToApply = normalizedBodyClasses
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
  }, [normalizedBodyClasses])

  return null
}
