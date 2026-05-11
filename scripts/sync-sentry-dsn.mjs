import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {}
  return Object.fromEntries(
    readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.trim().startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=')
        return [line.slice(0, index), line.slice(index + 1)]
      }),
  )
}

function upsertEnvValue(filePath, key, value) {
  const lines = existsSync(filePath) ? readFileSync(filePath, 'utf8').split(/\r?\n/) : []
  const prefix = `${key}=`
  let found = false
  const next = lines.map((line) => {
    if (line.startsWith(prefix)) {
      found = true
      return `${key}=${value}`
    }
    return line
  })
  if (!found) next.push(`${key}=${value}`)
  writeFileSync(filePath, `${next.join('\n').replace(/\n?$/, '\n')}`, 'utf8')
}

function isRealDsn(dsn) {
  if (!dsn) return false
  const lower = dsn.trim().toLowerCase()
  return lower.includes('ingest') && !lower.includes('your-dsn')
}

async function fetchDsnFromSentryApi(token) {
  const response = await fetch('https://sentry.io/api/0/projects/22club/javascript-nextjs/keys/', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) return null
  const keys = await response.json()
  const active = keys.find((key) => key.isActive) ?? keys[0]
  return active?.dsn?.public?.trim() ?? null
}

function upsertVercelEnv(name, value, { sensitive = false } = {}) {
  const targets = [['production'], ['development']]

  for (const target of targets) {
    const args = ['vercel', 'env', 'add', name, ...target, '--value', value, '--force', '--yes']
    if (sensitive) args.push('--sensitive')
    try {
      execSync(`npx ${args.map((arg) => JSON.stringify(arg)).join(' ')}`, {
        cwd: root,
        stdio: 'pipe',
      })
      console.log(`Vercel ${name} → ${target.join('/')}`)
    } catch (error) {
      const stderr = error.stderr?.toString?.() ?? ''
      const stdout = error.stdout?.toString?.() ?? ''
      console.error(`Vercel ${name} → ${target.join('/')} failed: ${stderr || stdout || error.message}`)
    }
  }
}

const configuredDsn = process.env.SENTRY_CONFIGURE_DSN?.trim()
const buildEnv = parseEnvFile(path.join(root, '.env.sentry-build-plugin'))
const token = buildEnv.SENTRY_AUTH_TOKEN?.trim()

let dsn = isRealDsn(configuredDsn) ? configuredDsn : null
if (!dsn && token) {
  dsn = await fetchDsnFromSentryApi(token)
}

if (!dsn) {
  console.error('Missing Sentry DSN. Set SENTRY_CONFIGURE_DSN or a token with project read access.')
  process.exit(1)
}

for (const fileName of ['.env.local', 'env.local']) {
  const filePath = path.join(root, fileName)
  if (!existsSync(filePath)) continue
  upsertEnvValue(filePath, 'NEXT_PUBLIC_SENTRY_DSN', dsn)
  upsertEnvValue(filePath, 'SENTRY_DSN', dsn)
  console.log(`Updated ${fileName}`)
}

if (token) {
  upsertVercelEnv('NEXT_PUBLIC_SENTRY_DSN', dsn)
  upsertVercelEnv('SENTRY_DSN', dsn)
  upsertVercelEnv('SENTRY_AUTH_TOKEN', token, { sensitive: true })
  console.log('Updated Vercel env for Sentry DSN and auth token')
} else {
  console.log('Skipped Vercel env sync: SENTRY_AUTH_TOKEN missing in .env.sentry-build-plugin')
}

console.log('Sentry environment sync completed')
