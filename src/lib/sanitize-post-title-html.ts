import he from 'he'

const ALLOWED_TITLE_TAGS = new Set(['strong', 'b', 'br', 'span'])
const BLOCKED_CONTAINER_TAGS = 'script|style|iframe|object|embed|svg|math|link|meta'

export function sanitizePostTitleHtml(value?: string | null): string {
  if (!value) {
    return ''
  }

  const decodedValue = he.decode(value)
  const withoutBlockedContainers = decodedValue
    .replace(new RegExp(`<\\s*(${BLOCKED_CONTAINER_TAGS})\\b[^>]*>[\\s\\S]*?<\\s*\\/\\s*\\1\\s*>`, 'gi'), '')
    .replace(new RegExp(`<\\s*(${BLOCKED_CONTAINER_TAGS})\\b[^>]*\\/?>`, 'gi'), '')

  return withoutBlockedContainers.replace(/<\/?([a-zA-Z0-9:-]+)([^>]*)>/g, (fullMatch, rawTagName) => {
    const tagName = String(rawTagName).toLowerCase()
    if (!ALLOWED_TITLE_TAGS.has(tagName)) {
      return ''
    }

    const isClosingTag = /^<\s*\//.test(fullMatch)
    if (isClosingTag) {
      return tagName === 'br' ? '' : `</${tagName}>`
    }

    if (tagName === 'br') {
      return '<br />'
    }

    if (tagName === 'span') {
      return '<span>'
    }

    return `<${tagName}>`
  })
}
