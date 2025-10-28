import 'server-only'

import { getWordPressConfig } from './config'

type NextCacheOptions = {
  revalidate?: number
  tags?: string[]
}

interface FetchOptions {
  variables?: Record<string, unknown>
  cache?: RequestCache
  next?: NextCacheOptions
}

export async function fetchWordPressGraphQL<T>(
  query: string,
  options: FetchOptions = {}
): Promise<T> {
  const { gqlEndpoint } = getWordPressConfig()
  const { variables, cache, next } = options

  const resolvedCache: RequestCache | undefined = cache ?? (next ? undefined : 'force-cache')

  const fetchInit: RequestInit & { next?: NextCacheOptions } = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  }

  if (resolvedCache) {
    fetchInit.cache = resolvedCache
  }
  if (next) {
    fetchInit.next = next
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

  const response = await fetch(url, {
    ...init,
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
