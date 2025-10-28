'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import Search from '@/components/search/Search'
import { useSiteChrome } from '@/components/providers/SiteChromeProvider'

export default function Header() {
  const { headerMenu: menuItems } = useSiteChrome()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

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

  return (
    <>
      <span className="fixed left-14 top-4 z-50 flex h-10 items-center justify-center font-custom text-[20pt]">
        <Link href="/" onClick={closeOverlays}>
          A way of travel
        </Link>
      </span>

      <button
        type="button"
        onClick={toggleSearch}
        className="fixed right-14 top-4 z-50 flex h-10 w-10 items-center justify-center"
        aria-label={isSearchOpen ? 'Fermer la recherche' : 'Ouvrir la recherche'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="h-6 w-6 text-black"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z"
          />
        </svg>
      </button>

      <button
        type="button"
        onClick={toggleMenu}
        className="group fixed right-4 top-4 z-50 flex h-10 w-10 flex-col items-center justify-center"
        aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
      >
        <span
          className={clsx(
            'block h-0.5 w-6 bg-black transition duration-300',
            (isMenuOpen || isSearchOpen) && 'translate-y-1.5 rotate-45'
          )}
        />
        <span
          className={clsx(
            'my-1 block h-0.5 w-6 bg-black transition-opacity duration-300',
            (isMenuOpen || isSearchOpen) ? 'opacity-0' : 'opacity-100'
          )}
        />
        <span
          className={clsx(
            'block h-0.5 w-6 bg-black transition duration-300',
            (isMenuOpen || isSearchOpen) && '-translate-y-1.5 -rotate-45'
          )}
        />
      </button>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white">
          <nav>
            <ul>
              {menuItems.map((item) => (
                <li key={item.id} className="font-custom text-[50pt] transition hover:italic">
                  <Link href={item.path} onClick={closeOverlays}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      {isSearchOpen && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-white">
          <h4 className="font-custom text-[50pt]">Rechercher...</h4>
          <div className="w-full max-w-md p-4">
            <Search onNavigate={closeOverlays} />
          </div>
        </div>
      )}
    </>
  )
}
