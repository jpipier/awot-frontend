import ElementorBodyClassManager from './ElementorBodyClassManager'
import type { ElementorCssAsset } from '@/lib/article'

interface ElementorStylesLoaderProps {
  cssBundle?: ElementorCssAsset[]
  bodyClasses?: string[] | null
  isBuiltWithElementor?: boolean
}

const FONT_AWESOME_CSS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
const FONT_AWESOME_CSS_INTEGRITY = 'sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=='

export default function ElementorStylesLoader({ cssBundle, bodyClasses, isBuiltWithElementor }: ElementorStylesLoaderProps) {
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

  return (
    <>
      {isBuiltWithElementor ? (
        <link
          rel="stylesheet"
          href={FONT_AWESOME_CSS_URL}
          integrity={FONT_AWESOME_CSS_INTEGRITY}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      ) : null}
      {normalizedCssBundle.map((asset) => (
        <style
          key={asset.id}
          data-awot-elementor-stylesheet="true"
          dangerouslySetInnerHTML={{ __html: asset.content }}
        />
      ))}
      <ElementorBodyClassManager bodyClasses={normalizedBodyClasses} isBuiltWithElementor={isBuiltWithElementor} />
    </>
  )
}
