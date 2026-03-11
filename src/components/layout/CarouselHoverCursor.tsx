'use client'

import { useEffect, useRef } from 'react'

const ACTIVE_CLASS = 'awot-carousel-cursor-active'
const CAROUSEL_SELECTOR = '.awot-carousel-cursor'
const OFFSET_X = 12
const OFFSET_Y = 12

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

    let active = false
    let rafId = 0
    let x = -9999
    let y = -9999

    const setActive = (nextActive: boolean) => {
      if (active === nextActive) {
        return
      }
      active = nextActive
      cursorNode.style.opacity = nextActive ? '1' : '0'
      if (nextActive) {
        document.documentElement.classList.add(ACTIVE_CLASS)
      } else {
        document.documentElement.classList.remove(ACTIVE_CLASS)
      }
    }

    const paint = () => {
      rafId = 0
      cursorNode.style.transform = `translate3d(${Math.round(x + OFFSET_X)}px, ${Math.round(y + OFFSET_Y)}px, 0)`
    }

    const isCarouselTarget = (target: EventTarget | null) => target instanceof Element && Boolean(target.closest(CAROUSEL_SELECTOR))

    const handlePointerMove = (event: PointerEvent) => {
      x = event.clientX
      y = event.clientY
      setActive(isCarouselTarget(event.target))
      if (active && rafId === 0) {
        rafId = window.requestAnimationFrame(paint)
      }
    }

    const handleHide = () => {
      setActive(false)
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
      document.documentElement.classList.remove(ACTIVE_CLASS)
    }
  }, [])

  return <div ref={cursorRef} className="awot-carousel-faux-cursor" aria-hidden="true" />
}
