'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import Search from '@/components/search/Search'
import { useSiteChrome } from '@/components/providers/SiteChromeProvider'

export default function Header() {
  const { headerMenu: menuItems } = useSiteChrome()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [shouldRenderMenu, setShouldRenderMenu] = useState(false)
  const [shouldRenderSearch, setShouldRenderSearch] = useState(false)
  const [shouldShowHeader, setShouldShowHeader] = useState(true)
  const [isOverDark, setIsOverDark] = useState(false)
  const pathname = usePathname()
  const OVERLAY_ANIMATION_MS = 320

  useEffect(() => {
    const body = document.body
    if (isMenuOpen || isSearchOpen) {
      body.classList.add('overflow-hidden')
    } else {
      body.classList.remove('overflow-hidden')
    }

    return () => {
      body.classList.remove('overflow-hidden')
    }
  }, [isMenuOpen, isSearchOpen])

  useEffect(() => {
    if (isMenuOpen) {
      setShouldRenderMenu(true)
      return
    }
    const timeout = window.setTimeout(() => setShouldRenderMenu(false), OVERLAY_ANIMATION_MS)
    return () => {
      window.clearTimeout(timeout)
    }
  }, [isMenuOpen])

  useEffect(() => {
    if (isSearchOpen) {
      setShouldRenderSearch(true)
      return
    }
    const timeout = window.setTimeout(() => setShouldRenderSearch(false), OVERLAY_ANIMATION_MS)
    return () => {
      window.clearTimeout(timeout)
    }
  }, [isSearchOpen])

  const toggleMenu = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false)
    }
    setIsMenuOpen((prev) => !prev)
  }

  const toggleSearch = () => {
    setIsMenuOpen(false)
    setIsSearchOpen((prev) => !prev)
  }

  const closeOverlays = () => {
    setIsMenuOpen(false)
    setIsSearchOpen(false)
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const slider = document.querySelector('[data-home-hero-slider]')
    if (!slider) {
      setShouldShowHeader(true)
      return
    }

    const computeVisibility = () => {
      const rect = slider.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1
      const inView = rect.top < viewportHeight && rect.bottom > 0
      setShouldShowHeader(!inView)
    }

    computeVisibility()

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShouldShowHeader(!entry.isIntersecting)
      },
      { threshold: 0.01 }
    )

    observer.observe(slider)

    return () => {
      observer.disconnect()
    }
  }, [pathname])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mql = window.matchMedia('(max-width: 767px)')

    const setup = () => {
      if (!mql.matches) {
        setIsOverDark(false)
        return null
      }

      const targets = document.querySelectorAll('[data-header-dark]')
      if (!targets.length) {
        setIsOverDark(false)
        return null
      }

      const headerHeight = 60
      const bottomMargin = window.innerHeight - headerHeight
      const observer = new IntersectionObserver(
        (entries) => {
          const anyIntersecting = entries.some((e) => e.isIntersecting)
          setIsOverDark(anyIntersecting)
        },
        { rootMargin: `0px 0px -${bottomMargin}px 0px`, threshold: 0.01 }
      )

      targets.forEach((el) => observer.observe(el))
      return observer
    }

    let observer = setup()

    const onMediaChange = () => {
      observer?.disconnect()
      observer = setup()
    }

    mql.addEventListener('change', onMediaChange)

    return () => {
      observer?.disconnect()
      mql.removeEventListener('change', onMediaChange)
    }
  }, [pathname])

  const overlayOpen = isMenuOpen || isSearchOpen
  const headerColorClass = isOverDark && !overlayOpen ? 'text-white' : 'text-black'
  const burgerBgClass = isOverDark && !overlayOpen ? 'bg-white' : 'bg-black'
  const headerColorBg = isOverDark && !overlayOpen ? '' : 'bg-white md:bg-white/0 fixed right-0 top-0 z-50 flex w-full h-20'


  const controlsVisibilityClass = clsx(
    'transition-opacity duration-300',
    shouldShowHeader ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
  )

  return (
    <div className={clsx(headerColorBg, controlsVisibilityClass)}>
      <span
        className={clsx(
          'fixed left-6 md:left-[2rem] top-4 z-50 flex h-10 items-center justify-center font-custom text-[20pt] transition-colors duration-300',
          headerColorClass,
          controlsVisibilityClass
        )}
      >
        <Link href="/" onClick={closeOverlays}>
          A way of travel
        </Link>
      </span>

      <button
        type="button"
        onClick={toggleSearch}
        className={clsx('fixed right-14 top-4 z-50 flex h-10 w-10 items-center justify-center', controlsVisibilityClass)}
        aria-label={isSearchOpen ? 'Fermer la recherche' : 'Ouvrir la recherche'}
      >
        <svg 
            className={clsx('h-[1.5rem] w-[1.5rem] transition-colors duration-300', headerColorClass)} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor">
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="1.5" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z">
                </path>
        </svg>
      </button>

      <button
        type="button"
        onClick={toggleMenu}
        className={clsx(
          'group fixed right-4 top-4 z-50 flex h-10 w-10 flex-col items-center justify-center',
          controlsVisibilityClass
        )}
        aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
      >
        <span
          className={clsx(
            'block h-0.5 w-6 transition duration-300',
            burgerBgClass,
            overlayOpen && 'translate-y-1.5 rotate-45'
          )}
        />
        <span
          className={clsx(
            'my-1 block h-0.5 w-6 transition-opacity duration-300',
            burgerBgClass,
            overlayOpen ? 'opacity-0' : 'opacity-100'
          )}
        />
        <span
          className={clsx(
            'block h-0.5 w-6 transition duration-300',
            burgerBgClass,
            overlayOpen && '-translate-y-1.5 -rotate-45'
          )}
        />
      </button>

      {shouldRenderMenu && (
        <div
          className={clsx(
            'fixed inset-0 z-40 flex items-center justify-center bg-white px-6 transition-all duration-[420ms] ease-[cubic-bezier(0.23,1,0.32,1)] transform',
            isMenuOpen ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 -translate-y-6'
          )}
        >
          <nav>
            <ul className="flex flex-col items-center gap-6 text-center">
              {menuItems.map((item, index) => (
                <li
                  key={item.id}
                  style={{ transitionDelay: isMenuOpen ? `${0 + index * 40}ms` : '0ms' }}
                  className={clsx(
                    'font-custom text-[30pt] sm:text-[40pt] md:text-[50pt] transition-[opacity,transform] duration-300 ease-out hover:italic transform',
                    isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  )}
                >
                  <Link href={item.path} onClick={closeOverlays}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      {shouldRenderSearch && (
        <div
          className={clsx(
            'fixed inset-0 z-40 flex flex-col items-center justify-center bg-white/95 px-4 backdrop-blur-md transition-all duration-[420ms] ease-[cubic-bezier(0.23,1,0.32,1)] transform',
            isSearchOpen ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-95'
          )}
        >
          <h4
            className={clsx(
              'font-custom text-[50pt] transition-all duration-300 ease-out transform',
              isSearchOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            )}
          >
            Rechercher...
          </h4>
          <div
            className={clsx(
              'w-full max-w-md p-4 transition-all duration-300 ease-out transform',
              isSearchOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            )}
          >
            <Search onNavigate={closeOverlays} />
          </div>
        </div>
      )}
    </div>
  )
}
