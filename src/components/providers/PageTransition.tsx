'use client'

import { type PropsWithChildren, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

type GSAPContext = { revert: () => void }

export default function PageTransition({ children }: PropsWithChildren) {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    let ctx: GSAPContext | undefined
    let cancelled = false

    const animate = async () => {
      if (typeof window === 'undefined' || !overlayRef.current) {
        return
      }

      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      if (motionQuery.matches) {
        return
      }

      try {
        const { default: gsap } = await import('gsap')
        if (!overlayRef.current || cancelled) {
          return
        }

        ctx = gsap.context(() => {
          const overlay = overlayRef.current!
          gsap
            .timeline()
            .set(overlay, { yPercent: 100, autoAlpha: 1 })
            .to(overlay, {
              yPercent: 0,
              duration: 0.35,
              ease: 'power4.out'
            })
            .to(overlay, {
              yPercent: -100,
              duration: 0.45,
              ease: 'power4.in'
            })
            .set(overlay, { autoAlpha: 0, yPercent: 100 })
        }, overlayRef)
      } catch (error) {
        console.error('Failed to run page transition animation', error)
      }
    }

    animate()

    return () => {
      cancelled = true
      ctx?.revert()
    }
  }, [pathname])

  return (
    <>
      <div ref={overlayRef} className="page-transition-overlay" aria-hidden="true" />
      {children}
    </>
  )
}
