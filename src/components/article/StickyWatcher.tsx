'use client'

import { useEffect } from 'react'
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger'

export default function StickyWatcher() {
  useEffect(() => {
    let destroyed = false
    let stickyTrigger: ScrollTriggerType | null = null

    const initSticky = async () => {
      const stickyEl = document.getElementById('sticky1')
      const stickyAnchor = document.getElementById('sticky-anchor')
      const stickyTitle = document.getElementById('stickyTitle')
      const removeSticky =
        document.getElementById('removeSticky') ||
        document.querySelector('[data-elementor-type="footer"]') ||
        document.querySelector('.removeSticky')

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

      const padding = document.querySelector('[data-elementor-device-mode="tablet"]') ? 50 : 10

      const computePinDistance = () => {
        const anchorTop = stickyAnchor.getBoundingClientRect().top + window.scrollY
        const footerTop = (removeSticky as HTMLElement).getBoundingClientRect().top + window.scrollY
        const distance = footerTop - anchorTop - stickyEl.offsetHeight - padding
        return Math.max(distance, 0)
      }

      const initialDistance = computePinDistance()
      if (initialDistance <= 0) {
        stickyEl.classList.remove('stick')
        stickyTitle.classList.remove('titleStick')
        return
      }

      stickyTrigger = ScrollTrigger.create({
        trigger: stickyAnchor,
        start: 'top top',
        end: () => `+=${computePinDistance()}`,
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
      window.removeEventListener('scroll', imgScroll)
      window.removeEventListener('load', imgScroll)
    }
  }, [])

  return null
}
