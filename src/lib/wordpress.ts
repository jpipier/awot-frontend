import 'server-only'

import { cookies, draftMode } from 'next/headers'
import { getWordPressConfig } from './config'

type NextCacheOptions = {
  revalidate?: number
  tags?: string[]
}

interface FetchOptions {
  variables?: Record<string, unknown>
  cache?: RequestCache
  next?: NextCacheOptions
  headers?: HeadersInit
}

const WORDPRESS_EDITOR_COOKIE_PREFIXES = ['wordpress_logged_in_', 'wordpress_sec_']

function hasWordPressEditorSession() {
  try {
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    return allCookies.some(({ name }) =>
      WORDPRESS_EDITOR_COOKIE_PREFIXES.some((prefix) => name.startsWith(prefix))
    )
  } catch {
    return false
  }
}

function isDraftModeEnabled() {
  try {
    return draftMode().isEnabled
  } catch {
    return false
  }
}

function shouldBypassNextCache() {
  return isDraftModeEnabled() || hasWordPressEditorSession()
}

export async function fetchWordPressGraphQL<T>(
  query: string,
  options: FetchOptions = {}
): Promise<T> {
  const { gqlEndpoint } = getWordPressConfig()
  const { variables, cache, next, headers } = options
  const shouldBypassCache = shouldBypassNextCache()

  const resolvedCache: RequestCache | undefined = shouldBypassCache
    ? 'no-store'
    : cache ?? (next ? undefined : 'force-cache')
  const resolvedNext = shouldBypassCache ? undefined : next

  const fetchInit: RequestInit & { next?: NextCacheOptions } = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(headers ?? {})
    },
    body: JSON.stringify({ query, variables })
  }

  if (resolvedCache) {
    fetchInit.cache = resolvedCache
  }
  if (resolvedNext) {
    fetchInit.next = resolvedNext
  }

  const response = await fetch(gqlEndpoint, fetchInit)

  if (!response.ok) {
    throw new Error(`WordPress GraphQL error: ${response.status} ${response.statusText}`)
  }

  const payload = await response.json()

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error: { message: string }) => error.message).join('\n'))
  }

  return payload.data as T
}

export async function fetchWordPressRest<T>(path: string, init?: RequestInit): Promise<T> {
  const { restEndpoint } = getWordPressConfig()
  const url = `${restEndpoint.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
  const shouldBypassCache = shouldBypassNextCache()
  const resolvedCache: RequestCache | undefined = shouldBypassCache ? 'no-store' : init?.cache

  const response = await fetch(url, {
    ...init,
    cache: resolvedCache,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {})
    }
  })

  if (!response.ok) {
    throw new Error(`WordPress REST error: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}
