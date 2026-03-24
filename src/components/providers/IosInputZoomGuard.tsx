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

const removeMaximumScale = (content: string) =>
  content
    .split(',')
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0 && !chunk.toLowerCase().startsWith('maximum-scale'))
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
    const viewportWithoutMaxScale = removeMaximumScale(initialViewport)
    const noZoomViewport = viewportWithoutMaxScale
      ? `${viewportWithoutMaxScale}, maximum-scale=1`
      : 'width=device-width, initial-scale=1, maximum-scale=1'

    let activeTextEntryFocuses = 0

    const handleFocusIn = (event: FocusEvent) => {
      if (!isTextEntryElement(event.target)) {
        return
      }
      activeTextEntryFocuses += 1
      viewportMeta.setAttribute('content', noZoomViewport)
    }

    const handleFocusOut = (event: FocusEvent) => {
      if (!isTextEntryElement(event.target)) {
        return
      }
      activeTextEntryFocuses = Math.max(activeTextEntryFocuses - 1, 0)
      if (activeTextEntryFocuses === 0) {
        viewportMeta.setAttribute('content', initialViewport)
      }
    }

    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)

    return () => {
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
      viewportMeta.setAttribute('content', initialViewport)
    }
  }, [])

  return null
}
