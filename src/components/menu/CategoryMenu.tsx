import CategoryMenuClient from './CategoryMenuClient'
import { getCategoryChildrenBySlug } from '@/lib/categories'

interface CategoryMenuProps {
  parentSlug?: string
  selectedSlug?: string
}

export default async function CategoryMenu({ parentSlug = 'voyages', selectedSlug }: CategoryMenuProps) {
  const category = await getCategoryChildrenBySlug(parentSlug)
  const children = category?.children?.nodes ?? []
  const parentName = category?.name ?? parentSlug

  if (!children.length) {
    return null
  }

  return <CategoryMenuClient categories={children} parentName={parentName} selectedSlug={selectedSlug} />
}
