'use client'

import { type PropsWithChildren, useEffect, useRef } from 'react'

type ScrollSmootherInstance = import('gsap/ScrollSmoother').ScrollSmoother | null
type GSAPContext = { revert: (config?: object) => void } | undefined

export default function ScrollSmootherProvider({ children }: PropsWithChildren) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let smoother: ScrollSmootherInstance = null
    let ctx: GSAPContext
    let cancelled = false

    const init = async () => {
      if (motionQuery.matches || cancelled || !wrapperRef.current || !contentRef.current) {
        document.documentElement.dataset.scrollSmoother = 'disabled'
        return
      }

      try {
        const [{ default: gsap }, { ScrollTrigger }, { ScrollSmoother }] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger'),
          import('gsap/ScrollSmoother')
        ])

        if (!wrapperRef.current || !contentRef.current || cancelled) {
          return
        }

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
        })
      } catch (error) {
        console.error('Failed to initialize ScrollSmoother', error)
        document.documentElement.dataset.scrollSmoother = 'errored'
      }
    }

    init()

    const handleMotionChange = () => {
      if (!motionQuery.matches || !smoother) {
        return
      }
      smoother.kill()
      ctx?.revert()
      document.documentElement.dataset.scrollSmoother = 'disabled'
    }

    motionQuery.addEventListener?.('change', handleMotionChange)

    return () => {
      cancelled = true
      motionQuery.removeEventListener?.('change', handleMotionChange)
      smoother?.kill()
      ctx?.revert()
      delete document.documentElement.dataset.scrollSmoother
    }
  }, [])

  return (
    <div ref={wrapperRef} className="scroll-smoother-wrapper">
      <div ref={contentRef} className="scroll-smoother-content">
        {children}
      </div>
    </div>
  )
}
