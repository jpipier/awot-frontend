'use client'

import { useLayoutEffect, useMemo } from 'react'

interface ElementorBodyClassManagerProps {
  bodyClasses?: string[] | null
}

export default function ElementorBodyClassManager({ bodyClasses }: ElementorBodyClassManagerProps) {
  const normalizedClasses = useMemo(() => {
    return Array.from(new Set((bodyClasses ?? []).filter((cls): cls is string => Boolean(cls?.trim()))))
  }, [bodyClasses])

  useLayoutEffect(() => {
    if (!normalizedClasses.length) {
      return
    }

    const added: string[] = []
    normalizedClasses.forEach((cls) => {
      if (!document.body.classList.contains(cls)) {
        document.body.classList.add(cls)
        added.push(cls)
      }
    })

    return () => {
      added.forEach((cls) => {
        document.body.classList.remove(cls)
      })
    }
  }, [normalizedClasses])

  return null
}
