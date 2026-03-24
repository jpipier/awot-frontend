'use client'

import { useEffect, useRef } from 'react'

const IMAGE_ACTIVE_CLASS = 'awot-carousel-cursor-image'
const POINTER_ACTIVE_CLASS = 'awot-carousel-cursor-pointer'
const CAROUSEL_SLIDE_SELECTOR = '.awot-carousel-cursor .swiper-slide'
const CAROUSEL_META_SELECTOR = '.awot-carousel-cursor .swiper-slide .mt-3'
const CAROUSEL_TITLE_SELECTOR = '.awot-carousel-cursor .swiper-slide h3'
const OFFSET_X = -64
const OFFSET_Y = -15

type CursorMode = 'inactive' | 'image' | 'pointer'

export default function CarouselHoverCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const cursorNode = cursorRef.current
    if (!cursorNode) {
      return
    }

    const hoverMediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!hoverMediaQuery.matches) {
      return
    }

    let mode: CursorMode = 'inactive'
    let rafId = 0
    let x = -9999
    let y = -9999

    const setMode = (nextMode: CursorMode) => {
      if (mode === nextMode) {
        return
      }
      mode = nextMode
      cursorNode.style.opacity = nextMode === 'image' ? '1' : '0'
      document.documentElement.classList.toggle(IMAGE_ACTIVE_CLASS, nextMode === 'image')
      document.documentElement.classList.toggle(POINTER_ACTIVE_CLASS, nextMode === 'pointer')
    }

    const paint = () => {
      rafId = 0
      cursorNode.style.transform = `translate3d(${Math.round(x + OFFSET_X)}px, ${Math.round(y + OFFSET_Y)}px, 0)`
    }

    const resolveMode = (target: EventTarget | null): CursorMode => {
      if (!(target instanceof Element)) {
        return 'inactive'
      }
      const articleMeta = target.closest(CAROUSEL_META_SELECTOR)
      if (articleMeta) {
        return 'pointer'
      }
      const articleTitle = target.closest(CAROUSEL_TITLE_SELECTOR)
      if (articleTitle) {
        return 'pointer'
      }
      const slideNode = target.closest(CAROUSEL_SLIDE_SELECTOR)
      if (!slideNode) {
        return 'inactive'
      }
      return 'image'
    }

    const handlePointerMove = (event: PointerEvent) => {
      x = event.clientX
      y = event.clientY
      const nextMode = resolveMode(event.target)
      setMode(nextMode)
      if (nextMode === 'image' && rafId === 0) {
        rafId = window.requestAnimationFrame(paint)
      }
    }

    const handleHide = () => {
      setMode('inactive')
    }

    const handlePointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) {
        handleHide()
      }
    }

    const handleMediaChange = () => {
      if (!hoverMediaQuery.matches) {
        handleHide()
      }
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerout', handlePointerOut)
    window.addEventListener('blur', handleHide)
    document.addEventListener('visibilitychange', handleHide)
    hoverMediaQuery.addEventListener?.('change', handleMediaChange)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerout', handlePointerOut)
      window.removeEventListener('blur', handleHide)
      document.removeEventListener('visibilitychange', handleHide)
      hoverMediaQuery.removeEventListener?.('change', handleMediaChange)
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
      document.documentElement.classList.remove(IMAGE_ACTIVE_CLASS, POINTER_ACTIVE_CLASS)
    }
  }, [])

  return <div ref={cursorRef} className="awot-carousel-faux-cursor" aria-hidden="true" />
}
