'use client'

import { useLayoutEffect, useMemo } from 'react'

interface ElementorBodyClassManagerProps {
  bodyClasses?: string[] | null
  isBuiltWithElementor?: boolean
}

export default function ElementorBodyClassManager({ bodyClasses, isBuiltWithElementor }: ElementorBodyClassManagerProps) {
  const normalizedClasses = useMemo(() => {
    return Array.from(new Set((bodyClasses ?? []).filter((cls): cls is string => Boolean(cls?.trim()))))
  }, [bodyClasses])

  useLayoutEffect(() => {
    const added: string[] = []

    normalizedClasses.forEach((cls) => {
      if (!document.body.classList.contains(cls)) {
        document.body.classList.add(cls)
        added.push(cls)
      }
    })

    if (isBuiltWithElementor === false) {
      if (!document.body.classList.contains('not-built-with-elementor')) {
        document.body.classList.add('not-built-with-elementor')
        added.push('not-built-with-elementor')
      }
    } else {
      if (!document.body.classList.contains('built-with-elementor')) {
        document.body.classList.add('built-with-elementor')
        added.push('built-with-elementor')
      }
    }

    return () => {
      added.forEach((cls) => {
        document.body.classList.remove(cls)
      })
    }
  }, [normalizedClasses, isBuiltWithElementor])

  return null
}
