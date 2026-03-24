'use client'

import { useEffect } from 'react'

const IOS_USER_AGENT_REGEX = /iP(ad|hone|od)|Macintosh.*Mobile/
const TEXT_INPUT_TYPES = new Set([
  '',
  'text',
  'search',
  'email',
  'url',
  'tel',
  'password',
  'number',
  'date',
  'datetime-local',
  'month',
  'time',
  'week'
])

const removeZoomDirectives = (content: string) =>
  content
    .split(',')
    .map((chunk) => chunk.trim())
    .filter((chunk) => {
      if (chunk.length === 0) {
        return false
      }
      const normalized = chunk.toLowerCase()
      return !normalized.startsWith('maximum-scale') && !normalized.startsWith('user-scalable')
    })
    .join(', ')

const isTextEntryElement = (target: EventTarget | null): target is HTMLInputElement | HTMLTextAreaElement => {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  if (target instanceof HTMLTextAreaElement) {
    return true
  }
  if (!(target instanceof HTMLInputElement)) {
    return false
  }
  return TEXT_INPUT_TYPES.has(target.type)
}

export default function IosInputZoomGuard() {
  useEffect(() => {
    if (!IOS_USER_AGENT_REGEX.test(window.navigator.userAgent)) {
      return
    }

    const viewportMeta = document.querySelector('meta[name="viewport"]')
    if (!viewportMeta) {
      return
    }

    const initialViewport = viewportMeta.getAttribute('content') ?? ''
    const viewportWithoutZoomDirectives = removeZoomDirectives(initialViewport)
    const noZoomViewport = viewportWithoutZoomDirectives
      ? `${viewportWithoutZoomDirectives}, maximum-scale=1, user-scalable=no`
      : 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'

    const applyNoZoom = () => viewportMeta.setAttribute('content', noZoomViewport)
    const restoreZoom = () => viewportMeta.setAttribute('content', initialViewport)

    const handleTouchStart = (event: TouchEvent) => {
      if (!isTextEntryElement(event.target)) {
        return
      }
      applyNoZoom()
    }

    const handleFocusIn = (event: FocusEvent) => {
      if (!isTextEntryElement(event.target)) {
        return
      }
      applyNoZoom()
    }

    const handleFocusOut = (event: FocusEvent) => {
      if (!isTextEntryElement(event.target)) {
        return
      }
      requestAnimationFrame(() => {
        if (isTextEntryElement(document.activeElement)) {
          return
        }
        restoreZoom()
      })
    }

    document.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true })
    document.addEventListener('focusin', handleFocusIn, true)
    document.addEventListener('focusout', handleFocusOut, true)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart, true)
      document.removeEventListener('focusin', handleFocusIn, true)
      document.removeEventListener('focusout', handleFocusOut, true)
      restoreZoom()
    }
  }, [])

  return null
}
