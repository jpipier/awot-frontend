'use client'

import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import type { CategoryNode } from '@/types/wordpress'

interface CategoryMenuClientProps {
  categories: CategoryNode[]
  selectedSlug?: string
  parentName: string
}

export default function CategoryMenuClient({ categories, selectedSlug, parentName }: CategoryMenuClientProps) {
  const router = useRouter()
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    if (value) {
      router.push(`/categories/${value}`)
    }
  }

  return (
    <div className="category-list mx-auto w-full px-6 pb-2 text-nowrap lg:w-1/2">
      <ul className="category-list hidden flex-wrap justify-start lg:flex pr-[3rem] pb-[2rem]">
        {categories.map((child) => (
          <li key={child.slug}>
            <a
              href={`/categories/${child.slug}`}
              className={clsx('text-xs uppercase font-montserrat', child.slug === selectedSlug && 'font-semibold underline')}
            >
              {child.name}
            </a>
          </li>
        ))}
        <li>
          <a
            href="/categories/voyages"
            className={clsx('text-xs uppercase font-montserrat', selectedSlug === 'voyages' && 'font-semibold underline')}
          >
            Toutes les destinations
          </a>
        </li>
      </ul>
      <div className="lg:hidden">
        <select
          onChange={handleChange}
          value={selectedSlug ?? ''}
          className="w-full rounded border border-gray-300 p-2 text-xs uppercase"
        >
          <option value="">Choisissez une catégorie</option>
          {categories.map((child) => (
            <option key={child.slug} value={child.slug}>
              {child.name}
            </option>
          ))}
          <option value="voyages">Toutes les destinations</option>
        </select>
      </div>
      <style jsx>{`
        .category-list li {
          position: relative;
        }
        .category-list li::after {
          content: ' | ';
          display: inline-block;
          margin: 0 0.5rem;
          font-weight: 200;
        }
        .category-list li:last-child::after {
          content: '';
        }
      `}</style>
    </div>
  )
}
