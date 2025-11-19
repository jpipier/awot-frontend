'use client'

import { useEffect } from 'react'

type GSAPContext = { revert: (config?: object) => void } | undefined

export default function ElementorHeadingAnimator() {
  useEffect(() => {
    let cancelled = false
    let ctx: GSAPContext

    const animateHeadings = async () => {
      try {
        const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger')
        ])

        if (cancelled) {
          return
        }

        gsap.registerPlugin(ScrollTrigger)

        const headings = Array.from(
          document.querySelectorAll<HTMLElement>('.elementor-heading-title.elementor-size-small')
        )

        if (!headings.length) {
          return
        }

        ctx = gsap.context(() => {
          headings.forEach((heading, index) => {
            gsap.fromTo(
              heading,
              { opacity: 0, y: -40 },
              {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: 'power3.out',
                delay: Math.min(index * 0.05, 0.25),
                scrollTrigger: {
                  trigger: heading,
                  start: 'top 85%',
                  toggleActions: 'play none none reverse'
                }
              }
            )
          })
        })
      } catch (error) {
        console.error('Unable to animate Elementor headings', error)
      }
    }

    void animateHeadings()

    return () => {
      cancelled = true
      ctx?.revert()
    }
  }, [])

  return null
}
