#!/usr/bin/env node

import { promises as fs } from 'node:fs'
import path from 'node:path'

const DEFAULT_ENV_PATH = '.env'
const REFRESH_ENDPOINT = 'https://graph.instagram.com/refresh_access_token'

function parseArgs(argv) {
  const args = {
    envPath: DEFAULT_ENV_PATH,
    dryRun: false
  }

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index]

    if (current === '--dry-run') {
      args.dryRun = true
      continue
    }

    if (current === '--env') {
      const next = argv[index + 1]
      if (!next) {
        throw new Error('Missing value for --env')
      }
      args.envPath = next
      index += 1
      continue
    }

    throw new Error(`Unknown argument: ${current}`)
  }

  return args
}

function stripWrappingQuotes(value) {
  if (value.length < 2) {
    return value
  }

  const first = value[0]
  const last = value[value.length - 1]
  const isWrapped = (first === '"' && last === '"') || (first === "'" && last === "'")

  return isWrapped ? value.slice(1, -1) : value
}

function parseDotEnv(content) {
  const values = {}
  const lines = content.split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/)
    if (!match) {
      continue
    }

    const key = match[1]
    const rawValue = match[2]
    values[key] = stripWrappingQuotes(rawValue.trim())
  }

  return values
}

function setEnvValue(content, key, value) {
  const normalized = value.replace(/\r?\n/g, '').trim()
  const nextLine = `${key}=${normalized}`
  const keyPattern = new RegExp(`^\\s*(?:export\\s+)?${key}=.*$`, 'm')

  if (keyPattern.test(content)) {
    return content.replace(keyPattern, nextLine)
  }

  const needsNewline = content.length > 0 && !content.endsWith('\n')
  return `${content}${needsNewline ? '\n' : ''}${nextLine}\n`
}

function maskToken(token) {
  if (token.length <= 12) {
    return token
  }

  return `${token.slice(0, 6)}...${token.slice(-4)}`
}

async function refreshInstagramLongLivedToken(token) {
  const params = new URLSearchParams({
    grant_type: 'ig_refresh_token',
    access_token: token
  })
  const response = await fetch(`${REFRESH_ENDPOINT}?${params.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' }
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok || !payload?.access_token) {
    const message = payload?.error?.message ?? payload?.error_message ?? response.statusText
    throw new Error(`Instagram refresh failed (${response.status}): ${message}`)
  }

  return {
    accessToken: payload.access_token,
    expiresIn: Number(payload.expires_in ?? 0),
    tokenType: payload.token_type ?? 'bearer'
  }
}

async function readEnvFile(envPath) {
  try {
    return await fs.readFile(envPath, 'utf8')
  } catch (error) {
    if ((error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) {
      return ''
    }
    throw error
  }
}

async function writeFileAtomic(targetPath, content) {
  const directory = path.dirname(targetPath)
  const tempPath = path.join(directory, `.tmp-${path.basename(targetPath)}-${Date.now()}`)

  await fs.writeFile(tempPath, content, { encoding: 'utf8', mode: 0o600 })
  await fs.rename(tempPath, targetPath)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const envPath = path.resolve(process.cwd(), args.envPath)
  const envContent = await readEnvFile(envPath)
  const fileValues = parseDotEnv(envContent)
  const currentToken = process.env.INSTAGRAM_ACCESS_TOKEN ?? fileValues.INSTAGRAM_ACCESS_TOKEN

  if (!currentToken) {
    throw new Error(
      `Missing INSTAGRAM_ACCESS_TOKEN. Set it in process env or in ${args.envPath} before running this script.`
    )
  }

  if (!currentToken.startsWith('IG')) {
    throw new Error(
      'This refresh flow supports IG long-lived tokens only (prefix IG...). For Facebook business tokens (EAA...), use a dedicated Facebook token flow.'
    )
  }

  const refreshed = await refreshInstagramLongLivedToken(currentToken)
  const refreshedAt = new Date().toISOString()
  const expiresAt =
    refreshed.expiresIn > 0 ? new Date(Date.now() + refreshed.expiresIn * 1000).toISOString() : ''

  console.log(`Instagram token refreshed (${maskToken(refreshed.accessToken)})`)
  if (refreshed.expiresIn > 0) {
    console.log(`expires_in=${refreshed.expiresIn}s (~${Math.round(refreshed.expiresIn / 86400)} days)`)
    console.log(`expires_at=${expiresAt}`)
  }

  if (args.dryRun) {
    console.log('Dry run enabled: .env not updated.')
    return
  }

  let nextEnvContent = envContent
  nextEnvContent = setEnvValue(nextEnvContent, 'INSTAGRAM_ACCESS_TOKEN', refreshed.accessToken)
  nextEnvContent = setEnvValue(nextEnvContent, 'INSTAGRAM_TOKEN_LAST_REFRESHED_AT', refreshedAt)

  if (expiresAt) {
    nextEnvContent = setEnvValue(nextEnvContent, 'INSTAGRAM_TOKEN_EXPIRES_AT', expiresAt)
  }

  await writeFileAtomic(envPath, nextEnvContent)
  console.log(`Updated ${envPath}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
