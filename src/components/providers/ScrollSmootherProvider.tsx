'use client'

import { type PropsWithChildren, Suspense, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

type ScrollSmootherInstance = import('gsap/ScrollSmoother').ScrollSmoother | null
type GSAPContext = { revert: (config?: object) => void } | undefined

export default function ScrollSmootherProvider({ children }: PropsWithChildren) {
  return (
    <Suspense fallback={null}>
      <ScrollSmootherInner>{children}</ScrollSmootherInner>
    </Suspense>
  )
}

function ScrollSmootherInner({ children }: PropsWithChildren) {
  const pathname = usePathname()
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const smootherRef = useRef<ScrollSmootherInstance>(null)
  const previousPathnameRef = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarsePointerQuery = window.matchMedia('(hover: none), (pointer: coarse)')
    const mobileViewportQuery = window.matchMedia('(max-width: 1023px)')
    let smoother: ScrollSmootherInstance = null
    let ctx: GSAPContext
    let cancelled = false
    let cancelLoadWait: (() => void) | undefined
    let cancelFrameWait: (() => void) | undefined

    const shouldDisableSmoothing = () =>
      motionQuery.matches || coarsePointerQuery.matches || mobileViewportQuery.matches

    const waitForPageLoad = () => new Promise<void>((resolve) => {
      if (document.readyState === 'complete') {
        resolve()
        return
      }
      const finish = () => {
        window.removeEventListener('load', finish)
        cancelLoadWait = undefined
        resolve()
      }
      cancelLoadWait = finish
      window.addEventListener('load', finish, { once: true })
    })

    const waitForFrame = () => new Promise<void>((resolve) => {
      const frame = window.requestAnimationFrame(() => {
        cancelFrameWait = undefined
        resolve()
      })
      cancelFrameWait = () => {
        window.cancelAnimationFrame(frame)
        cancelFrameWait = undefined
        resolve()
      }
    })

    const init = async () => {
      if (
        shouldDisableSmoothing() ||
        cancelled ||
        !wrapperRef.current ||
        !contentRef.current
      ) {
        document.documentElement.dataset.scrollSmoother = 'disabled'
        return
      }

      document.documentElement.dataset.scrollSmoother = 'pending'

      try {
        const [{ default: gsap }, { ScrollTrigger }, { ScrollSmoother }] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger'),
          import('gsap/ScrollSmoother')
        ])

        if (cancelled) return
        // A cold visit can finish loading images/fonts after the reader has scrolled.
        // Let load-time ScrollTrigger refreshes finish before changing the scroller.
        await waitForPageLoad()
        if (cancelled) return
        await document.fonts.ready
        if (cancelled) return
        await waitForFrame()

        if (!wrapperRef.current || !contentRef.current || cancelled) {
          return
        }
        if (shouldDisableSmoothing()) {
          document.documentElement.dataset.scrollSmoother = 'disabled'
          return
        }

        const initialScrollY = window.scrollY
        gsap.registerPlugin(ScrollTrigger, ScrollSmoother)
        document.documentElement.dataset.scrollSmoother = 'enabled'

        ctx = gsap.context(() => {
          smoother = ScrollSmoother.create({
            wrapper: wrapperRef.current!,
            content: contentRef.current!,
            smooth: 1,
            smoothTouch: 0.1,
            effects: true
          })
          smootherRef.current = smoother
          ScrollTrigger.refresh()
          smoother.scrollTop(Math.min(initialScrollY, ScrollTrigger.maxScroll(window)))
        })
      } catch (error) {
        console.error('Failed to initialize ScrollSmoother', error)
        document.documentElement.dataset.scrollSmoother = 'errored'
      }
    }

    init()

    const handleMotionChange = () => {
      if (
        (!motionQuery.matches && !coarsePointerQuery.matches && !mobileViewportQuery.matches) ||
        !smoother
      ) {
        return
      }
      smoother.kill()
      smootherRef.current = null
      ctx?.revert()
      document.documentElement.dataset.scrollSmoother = 'disabled'
    }

    motionQuery.addEventListener?.('change', handleMotionChange)
    coarsePointerQuery.addEventListener?.('change', handleMotionChange)
    mobileViewportQuery.addEventListener?.('change', handleMotionChange)

    return () => {
      cancelled = true
      cancelLoadWait?.()
      cancelFrameWait?.()
      motionQuery.removeEventListener?.('change', handleMotionChange)
      coarsePointerQuery.removeEventListener?.('change', handleMotionChange)
      mobileViewportQuery.removeEventListener?.('change', handleMotionChange)
      smoother?.kill()
      smootherRef.current = null
      ctx?.revert()
      delete document.documentElement.dataset.scrollSmoother
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const currentPathname = pathname ?? null

    if (!currentPathname) {
      return
    }

    if (!previousPathnameRef.current) {
      previousPathnameRef.current = currentPathname
      return
    }

    if (previousPathnameRef.current === currentPathname) {
      return
    }

    previousPathnameRef.current = currentPathname

    // Article navigation uses scroll:false so Next cannot leave a pending scroll
    // that a later recommendation prefetch would execute during reading.
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      smootherRef.current?.scrollTop(0)
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [pathname])

  return (
    <div ref={wrapperRef} className="scroll-smoother-wrapper">
      <div ref={contentRef} className="scroll-smoother-content">
        {children}
      </div>
    </div>
  )
}
