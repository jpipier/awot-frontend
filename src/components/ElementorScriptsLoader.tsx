'use client'

import { useEffect, useMemo } from 'react'
import type { ElementorInlineScript, ElementorJsPayload, ElementorScriptAsset } from '@/types/wordpress'

interface ElementorScriptsLoaderProps {
  assets?: ElementorJsPayload | null
}

const GLOBAL_TARGET = '__global__'

export default function ElementorScriptsLoader({ assets }: ElementorScriptsLoaderProps) {
  const scripts = assets?.scripts ?? []
  const inline = assets?.inline ?? []

  const inlineByTarget = useMemo(() => {
    const map = new Map<string, { before: ElementorInlineScript[]; after: ElementorInlineScript[] }>()

    inline.forEach((entry) => {
      const key = entry.target ?? GLOBAL_TARGET
      if (!map.has(key)) {
        map.set(key, { before: [], after: [] })
      }
      const bucket = map.get(key)!
      if ((entry.position ?? 'before') === 'after') {
        bucket.after.push(entry)
      } else {
        bucket.before.push(entry)
      }
    })

    return map
  }, [inline])

  useEffect(() => {
    if (!scripts.length && !inline.length) {
      return
    }

    let cancelled = false
    const attachedScripts: HTMLScriptElement[] = []
    const attachedInline: HTMLScriptElement[] = []

    const host = document.body || document.head || document.documentElement

    const injectInline = (targetKey: string | null, timing: 'before' | 'after') => {
      const key = targetKey ?? GLOBAL_TARGET
      const bucket = inlineByTarget.get(key)
      if (!bucket) {
        return
      }
      const entries = timing === 'after' ? bucket.after : bucket.before
      entries.forEach((entry) => {
        if (document.querySelector(`script[data-awot-inline="${entry.id}"]`)) {
          return
        }
        const inlineTag = document.createElement('script')
        inlineTag.type = 'text/javascript'
        inlineTag.dataset.awotInline = entry.id
        inlineTag.dataset.awotTarget = entry.target ?? ''
        inlineTag.dataset.awotTiming = timing
        inlineTag.text = entry.code
        host.appendChild(inlineTag)
        attachedInline.push(inlineTag)
      })
    }

    const scriptAlreadyPresent = (script: ElementorScriptAsset) => {
      if (document.querySelector(`script[data-awot-handle="${script.handle}"]`)) {
        return true
      }

      const normalized = normalizeUrl(script.src)
      if (!normalized) {
        return false
      }

      const existing = Array.from(document.querySelectorAll<HTMLScriptElement>('script[src]'))
      return existing.some((el) => normalizeUrl(el.src) === normalized)
    }

    const loadScriptsSequentially = async () => {
      injectInline(null, 'before')

      for (const script of scripts) {
        if (cancelled) {
          break
        }

        injectInline(script.handle, 'before')

        if (!scriptAlreadyPresent(script)) {
          await new Promise<void>((resolve) => {
            const tag = document.createElement('script')
            tag.src = script.src
            tag.type = script.type ?? 'text/javascript'
            tag.dataset.awotHandle = script.handle

            tag.onload = () => {
              if (!cancelled) {
                injectInline(script.handle, 'after')
              }
              resolve()
            }
            tag.onerror = () => {
              console.error(`[ElementorScriptsLoader] Failed to load ${script.handle}`)
              resolve()
            }

            host.appendChild(tag)
            attachedScripts.push(tag)
          })
        } else {
          injectInline(script.handle, 'after')
        }
      }

      if (!cancelled) {
        injectInline(null, 'after')
      }
    }

    void loadScriptsSequentially()

    return () => {
      cancelled = true
      attachedScripts.forEach((tag) => {
        tag.remove()
      })
      attachedInline.forEach((tag) => {
        tag.remove()
      })
    }
  }, [inlineByTarget, scripts])

  return null
}

function normalizeUrl(value: string) {
  try {
    return new URL(value, window.location.origin).toString()
  } catch (error) {
    console.warn('[ElementorScriptsLoader] Unable to normalize URL', value, error)
    return null
  }
}
