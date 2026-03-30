import { NextResponse } from 'next/server'
import { getWordPressConfig } from '@/lib/config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const HEALTHCHECK_TIMEOUT_MS = 3000

type HealthCheckResult = {
  ok: boolean
  status: 'ok' | 'error'
  durationMs: number
  detail?: string
}

function withTimeoutSignal(timeoutMs: number) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId)
  }
}

function formatError(error: unknown) {
  if (error instanceof Error) {
    return error.name === 'AbortError' ? 'Request timed out' : error.message
  }

  return 'Unknown error'
}

async function checkWordPressGraphql(gqlEndpoint: string): Promise<HealthCheckResult> {
  const startTime = Date.now()
  const { signal, clear } = withTimeoutSignal(HEALTHCHECK_TIMEOUT_MS)

  try {
    const response = await fetch(gqlEndpoint, {
      method: 'POST',
      cache: 'no-store',
      signal,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'query Healthcheck { generalSettings { title } }'
      })
    }).finally(clear)

    const durationMs = Date.now() - startTime

    if (!response.ok) {
      return {
        ok: false,
        status: 'error',
        durationMs,
        detail: `HTTP ${response.status} ${response.statusText}`
      }
    }

    const payload = (await response.json().catch(() => null)) as
      | { data?: { generalSettings?: { title?: string | null } | null }; errors?: Array<{ message?: string }> }
      | null

    if (payload?.errors?.length) {
      return {
        ok: false,
        status: 'error',
        durationMs,
        detail: payload.errors.map((error) => error.message || 'Unknown GraphQL error').join(' | ')
      }
    }

    if (!payload?.data?.generalSettings) {
      return {
        ok: false,
        status: 'error',
        durationMs,
        detail: 'Missing generalSettings in GraphQL response'
      }
    }

    return {
      ok: true,
      status: 'ok',
      durationMs
    }
  } catch (error) {
    return {
      ok: false,
      status: 'error',
      durationMs: Date.now() - startTime,
      detail: formatError(error)
    }
  }
}

async function checkWordPressRest(restEndpoint: string): Promise<HealthCheckResult> {
  const startTime = Date.now()
  const { signal, clear } = withTimeoutSignal(HEALTHCHECK_TIMEOUT_MS)
  const url = restEndpoint.replace(/\/$/, '')

  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      signal,
      headers: {
        Accept: 'application/json'
      }
    }).finally(clear)

    const durationMs = Date.now() - startTime

    if (!response.ok) {
      return {
        ok: false,
        status: 'error',
        durationMs,
        detail: `HTTP ${response.status} ${response.statusText}`
      }
    }

    await response.json().catch(() => null)

    return {
      ok: true,
      status: 'ok',
      durationMs
    }
  } catch (error) {
    return {
      ok: false,
      status: 'error',
      durationMs: Date.now() - startTime,
      detail: formatError(error)
    }
  }
}

export async function GET() {
  let gqlEndpoint: string
  let restEndpoint: string

  try {
    ;({ gqlEndpoint, restEndpoint } = getWordPressConfig())
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        status: 'not-ready',
        service: 'awot-frontend',
        timestamp: new Date().toISOString(),
        checks: {
          config: {
            ok: false,
            status: 'error',
            detail: formatError(error)
          }
        }
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    )
  }

  const [graphql, rest] = await Promise.all([
    checkWordPressGraphql(gqlEndpoint),
    checkWordPressRest(restEndpoint)
  ])

  const ok = graphql.ok && rest.ok

  return NextResponse.json(
    {
      ok,
      status: ok ? 'ready' : 'not-ready',
      service: 'awot-frontend',
      timestamp: new Date().toISOString(),
      checks: {
        wordpressGraphql: graphql,
        wordpressRest: rest
      }
    },
    {
      status: ok ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    }
  )
}
