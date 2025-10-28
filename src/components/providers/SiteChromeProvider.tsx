'use client'

import { createContext, useContext } from 'react'
import type { MenuItem, SiteSettings } from '@/types/wordpress'

interface SiteChromeContextValue {
  settings: SiteSettings
  headerMenu: MenuItem[]
  footerMenu: MenuItem[]
}

const SiteChromeContext = createContext<SiteChromeContextValue | undefined>(undefined)

interface SiteChromeProviderProps {
  value: SiteChromeContextValue
  children: React.ReactNode
}

export function SiteChromeProvider({ value, children }: SiteChromeProviderProps) {
  return <SiteChromeContext.Provider value={value}>{children}</SiteChromeContext.Provider>
}

export function useSiteChrome() {
  const context = useContext(SiteChromeContext)
  if (!context) {
    throw new Error('useSiteChrome must be used within a SiteChromeProvider')
  }
  return context
}
