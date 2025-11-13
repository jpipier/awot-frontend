import ElementorBodyClassManager from './ElementorBodyClassManager'
import type { ElementorCssAsset } from '@/lib/article'

interface ElementorStylesLoaderProps {
  cssBundle?: ElementorCssAsset[]
  bodyClasses?: string[] | null
}

export default function ElementorStylesLoader({ cssBundle, bodyClasses }: ElementorStylesLoaderProps) {
  const normalizedCssBundle = Array.from(
    new Map(
      (cssBundle ?? [])
        .filter((asset): asset is ElementorCssAsset => Boolean(asset?.content?.trim()))
        .map((asset) => [asset.id, asset])
    ).values()
  )

  const normalizedBodyClasses = Array.from(
    new Set((bodyClasses ?? []).filter((cls): cls is string => Boolean(cls && cls.trim())))
  )

  if (!normalizedCssBundle.length && !normalizedBodyClasses.length) {
    return null
  }

  return (
    <>
      {normalizedCssBundle.map((asset) => (
        <style
          key={asset.id}
          data-awot-elementor-stylesheet="true"
          dangerouslySetInnerHTML={{ __html: asset.content }}
        />
      ))}
      {normalizedBodyClasses.length ? (
        <ElementorBodyClassManager bodyClasses={normalizedBodyClasses} />
      ) : null}
    </>
  )
}
