import he from 'he'

interface SanitizeExcerptOptions {
  preserveLineBreaks?: boolean
}

export function sanitizeExcerptText(
  value?: string | null,
  { preserveLineBreaks = false }: SanitizeExcerptOptions = {}
): string {
  if (!value) {
    return ''
  }

  const decoded = he.decode(value)
  const withBreaks = decoded
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n')
    .replace(/<\s*p[^>]*>/gi, '')
    .replace(/<\/\s*p\s*>/gi, '\n')
  const withoutTags = withBreaks.replace(/<[^>]*>/g, '')
  const normalized = withoutTags
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t\f\v]+/g, ' ')

  if (preserveLineBreaks) {
    return normalized
      .replace(/\n{3,}/g, '\n\n')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join('\n')
  }

  return normalized.replace(/\s+/g, ' ').trim()
}
