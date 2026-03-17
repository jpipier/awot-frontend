'use client'

import { useEffect } from 'react'
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger'

export default function StickyWatcher() {
  useEffect(() => {
    let destroyed = false
    let stickyTrigger: ScrollTriggerType | null = null
    let mm: gsap.MatchMedia | null = null

    const initSticky = async () => {
      const stickyEl = document.getElementById('sticky1')
      const stickyAnchor = document.getElementById('sticky-anchor')
      const stickyTitle = document.getElementById('stickyTitle')
      const removeStickyById = document.getElementById('removeSticky')
      const removeSticky =
        removeStickyById ||
        (document.querySelector('[data-elementor-type="footer"]') as HTMLElement | null) ||
        (document.querySelector('.removeSticky') as HTMLElement | null)
      const isById = !!removeStickyById

      if (!stickyEl || !stickyAnchor || !stickyTitle || !removeSticky) {
        return
      }

      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger')
      ])

      if (destroyed) {
        return
      }

      gsap.registerPlugin(ScrollTrigger)

      mm = gsap.matchMedia()

      mm.add('(min-width: 768px)', () => {
        const remToPx = (rem: number) => {
          const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize || '16')
          return rem * (Number.isNaN(rootFontSize) ? 16 : rootFontSize)
        }
        const releaseOffsetRem = 4
        const gap = 3 - remToPx(isById ? 18 : 16)

        const computeDistanceUntilRelease = () => {
          const anchorTop = stickyAnchor.getBoundingClientRect().top + window.scrollY
          const footerTop = removeSticky.getBoundingClientRect().top + window.scrollY
          const distance = footerTop - anchorTop - window.innerHeight + stickyEl.offsetHeight + gap
          return Math.max(distance, 0)
        }

        const initialDistance = computeDistanceUntilRelease()
        if (initialDistance <= 0) {
          stickyEl.classList.remove('stick')
          stickyTitle.classList.remove('titleStick')
          return
        }

        stickyTrigger = ScrollTrigger.create({
          trigger: stickyAnchor,
          start: 'top top',
          endTrigger: removeSticky,
          end: () => `top bottom+=${remToPx(releaseOffsetRem)}`,
          pin: stickyEl,
          pinSpacing: false,
          invalidateOnRefresh: true,
          onEnter: () => {
            stickyEl.classList.add('stick')
            stickyTitle.classList.add('titleStick')
            gsap.set(stickyEl, { top: 0 })
          },
          onEnterBack: () => {
            stickyEl.classList.add('stick')
            stickyTitle.classList.add('titleStick')
            gsap.set(stickyEl, { top: 0 })
          },
          onLeave: () => {
            stickyEl.classList.remove('stick')
            stickyTitle.classList.remove('titleStick')
            gsap.set(stickyEl, { top: '' })
          },
          onLeaveBack: () => {
            stickyEl.classList.remove('stick')
            stickyTitle.classList.remove('titleStick')
            gsap.set(stickyEl, { top: '' })
          }
        })
      })
    }

    void initSticky()

    const imgScroll = () => {
      const el = document.querySelector('.elementor-element-27c5e308') as HTMLElement | null
      if (!el) {
        return
      }
      const img = el.querySelector('img') as HTMLImageElement | null
      const height = el.offsetHeight

      if (height > 218 && img) {
        const windowTop = window.scrollY
        img.style.height = `${height - windowTop / 4}px`
      }
    }

    window.addEventListener('scroll', imgScroll)
    window.addEventListener('load', imgScroll)

    return () => {
      destroyed = true
      stickyTrigger?.kill()
      mm?.revert()
      window.removeEventListener('scroll', imgScroll)
      window.removeEventListener('load', imgScroll)
    }
  }, [])

  return null
}
