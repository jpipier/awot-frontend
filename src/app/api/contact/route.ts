import { NextResponse } from 'next/server'
import { getWordPressConfig } from '@/lib/config'

export const runtime = 'nodejs'

const MAX_MESSAGE_LENGTH = 2000
const MAX_SUBJECT_LENGTH = 160
const MAX_NAME_LENGTH = 80

type ContactPayload = {
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
  website?: string
}

const normalizeValue = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const buildAuthHeader = () => {
  const token = process.env.WORDPRESS_CONTACT_TOKEN
  if (token) {
    return `Bearer ${token}`
  }

  const username = process.env.WORDPRESS_CONTACT_USER
  const password = process.env.WORDPRESS_CONTACT_APP_PASSWORD

  if (username && password) {
    const encoded = Buffer.from(`${username}:${password}`).toString('base64')
    return `Basic ${encoded}`
  }

  return null
}

export async function POST(request: Request) {
  let payload: ContactPayload

  try {
    payload = (await request.json()) as ContactPayload
  } catch (error) {
    return NextResponse.json({ error: 'Requete invalide.' }, { status: 400 })
  }

  const firstName = normalizeValue(payload.firstName)
  const lastName = normalizeValue(payload.lastName)
  const email = normalizeValue(payload.email)
  const subject = normalizeValue(payload.subject)
  const message = normalizeValue(payload.message)
  const website = normalizeValue(payload.website)

  if (website) {
    return NextResponse.json({ ok: true })
  }

  if (!firstName || !lastName || !email || !subject || !message) {
    return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 })
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Email invalide.' }, { status: 400 })
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: 'Message trop long.' }, { status: 400 })
  }

  if (subject.length > MAX_SUBJECT_LENGTH || firstName.length > MAX_NAME_LENGTH || lastName.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: 'Champs trop longs.' }, { status: 400 })
  }

  const authHeader = buildAuthHeader()

  if (!authHeader) {
    return NextResponse.json({ error: 'Contact non configure.' }, { status: 500 })
  }

  const { restEndpoint } = getWordPressConfig()
  const postType = process.env.WORDPRESS_CONTACT_POST_TYPE ?? 'contact'
  const url = `${restEndpoint.replace(/\/$/, '')}/wp/v2/${postType}`

  const titleParts = [`${lastName} ${firstName}`.trim(), subject].filter(Boolean)
  const title = titleParts.join(' - ')

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader
      },
      body: JSON.stringify({
        title,
        status: 'publish',
        content: message,
        meta: {
          nom: lastName,
          prenom: firstName,
          email,
          sujet: subject,
          message
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('WordPress contact submission failed', response.status, errorText)
      return NextResponse.json({ error: 'Envoi impossible, merci de reessayer.' }, { status: 502 })
    }

    const result = await response.json().catch(() => null)

    return NextResponse.json({ ok: true, id: result?.id ?? null })
  } catch (error) {
    console.error('WordPress contact submission error', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 502 })
  }
}
