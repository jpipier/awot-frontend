'use client'

import { useEffect } from 'react'

interface PageDebugLoggerProps {
  label: string
  value: unknown
}

export default function PageDebugLogger({ label, value }: PageDebugLoggerProps) {
  useEffect(() => {
    console.log(label, value)
  }, [label, value])

  return null
}
