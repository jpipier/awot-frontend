import { NextResponse } from 'next/server'
import { getWordPressConfig } from '@/lib/config'

export async function GET(request: Request) {
  const cookie = request.headers.get('cookie')

  if (!cookie) {
    return NextResponse.json({ loggedIn: false })
  }

  const { restEndpoint } = getWordPressConfig()
  const url = `${restEndpoint.replace(/\/$/, '')}/wp/v2/users/me`

  try {
    const response = await fetch(url, {
      headers: {
        cookie,
        Accept: 'application/json'
      },
      credentials: 'include'
    })

    if (!response.ok) {
      return NextResponse.json({ loggedIn: false })
    }

    const data = await response.json()

    return NextResponse.json({
      loggedIn: true,
      user: {
        id: data.id,
        name: data.name,
        roles: data.roles
      }
    })
  } catch (error) {
    console.error('Erreur WordPress session', error)
    return NextResponse.json({ loggedIn: false })
  }
}
