import { NextResponse } from 'next/server'
import { fetchWordPressGraphQL } from '@/lib/wordpress'

interface ViewerSessionResponse {
  viewer: {
    databaseId: number
    name?: string | null
    username?: string | null
    roles?: {
      nodes?: Array<{
        name?: string | null
      }>
    } | null
  } | null
}

const VIEWER_SESSION_QUERY = /* GraphQL */ `
  query GetViewerSession {
    viewer {
      databaseId
      name
      username
      roles {
        nodes {
          name
        }
      }
    }
  }
`

function hasWordPressLoginCookie(cookieHeader: string) {
  return /(?:^|;\s*)wordpress_logged_in_[^=]+=/.test(cookieHeader)
}

export async function GET(request: Request) {
  const cookie = request.headers.get('cookie')

  if (!cookie) {
    return NextResponse.json({ loggedIn: false })
  }

  const hasWpCookie = hasWordPressLoginCookie(cookie)

  try {
    const data = await fetchWordPressGraphQL<ViewerSessionResponse>(VIEWER_SESSION_QUERY, {
      cache: 'no-store',
      headers: {
        cookie
      }
    })

    if (!data.viewer) {
      return NextResponse.json({ loggedIn: false })
    }

    const roles = data.viewer.roles?.nodes?.map((role) => role.name).filter(Boolean) ?? []

    return NextResponse.json({
      loggedIn: true,
      user: {
        id: data.viewer.databaseId,
        name: data.viewer.name ?? data.viewer.username ?? '',
        roles
      }
    })
  } catch (error) {
    console.error('Erreur WordPress session', error)
    return NextResponse.json({ loggedIn: hasWpCookie })
  }
}
