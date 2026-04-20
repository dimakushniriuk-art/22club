#!/usr/bin/env node
/**
 * Commit (solo working tree con modifiche/nuovi), push su origin, deploy Vercel produzione.
 *
 * Uso:
 *   npm run upload -- "messaggio commit"
 *   npm run upload -- --no-vercel "solo git"
 *   npm run upload -- --no-push "solo commit locale"
 *   npm run upload -- --no-version-bump "senza incremento versione in package.json"
 *
 * Con modifiche da committare: incrementa `version` in package.json (schema MAJOR.MINOR.PP,
 * es. 1.0.00 → 1.0.01; dopo 1.0.99 → 1.1.00) prima del commit, così GitHub e Vercel allineati.
 *
 * `git add -A` mette in stage solo file tracciati modificati / nuovi non ignorati (non re-invii l'intero storico).
 */

import { spawnSync, execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const packageJsonPath = path.join(repoRoot, 'package.json')

const rawArgs = process.argv.slice(2)
const noVercel = rawArgs.includes('--no-vercel')
const noPush = rawArgs.includes('--no-push')
const noVersionBump = rawArgs.includes('--no-version-bump')
const message = rawArgs
  .filter((a) => !a.startsWith('--'))
  .join(' ')
  .trim()
const commitMessage =
  message || `chore: sync ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`

function runGit(args) {
  const r = spawnSync('git', args, { stdio: 'inherit' })
  const code = r.status ?? 1
  if (code !== 0) process.exit(code)
}

function gitOut(args) {
  const r = spawnSync('git', args, { encoding: 'utf-8' })
  if (r.error) throw r.error
  return (r.stdout ?? '').trim()
}

/** @param {string} current es. 1.0.00 */
function bumpVersion(current) {
  const raw = String(current).trim()
  const parts = raw.split('.')
  if (parts.length !== 3) {
    throw new Error(`versione non valida "${raw}": attesi tre segmenti tipo 1.0.00`)
  }
  const major = parseInt(parts[0], 10)
  const minor = parseInt(parts[1], 10)
  const patch = parseInt(parts[2], 10)
  if (![major, minor, patch].every((n) => Number.isFinite(n) && n >= 0)) {
    throw new Error(`versione non valida "${raw}"`)
  }
  let p = patch + 1
  let mi = minor
  let ma = major
  if (p > 99) {
    p = 0
    mi += 1
  }
  if (mi > 99) {
    mi = 0
    ma += 1
  }
  return `${ma}.${mi}.${String(p).padStart(2, '0')}`
}

function bumpPackageJson() {
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
  const prev = String(pkg.version ?? '').trim()
  const next = bumpVersion(prev || '0.0.00')
  pkg.version = next
  writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf-8')
  console.log(`Versione progetto: ${prev} → ${next}`)
}

const porcelain = gitOut(['status', '--porcelain'])

if (porcelain) {
  if (!noVersionBump) {
    bumpPackageJson()
  }
  runGit(['add', '-A'])
  const staged = spawnSync('git', ['diff', '--cached', '--quiet'])
  if (staged.status === 0) {
    console.log('Nessun file staged (es. solo ignorati): salto commit.')
  } else {
    runGit(['commit', '-m', commitMessage])
  }
} else {
  console.log('Working tree pulito: salto add/commit.')
}

if (!noPush) {
  runGit(['push'])
}

if (!noVercel) {
  execSync('npx vercel --prod --yes', {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
}

console.log('\n✅ Flusso upload completato.')
