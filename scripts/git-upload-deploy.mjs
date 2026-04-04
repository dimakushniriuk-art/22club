#!/usr/bin/env node
/**
 * Commit (solo working tree con modifiche/nuovi), push su origin, deploy Vercel produzione.
 *
 * Uso:
 *   npm run upload -- "messaggio commit"
 *   npm run upload -- --no-vercel "solo git"
 *   npm run upload -- --no-push "solo commit locale"
 *
 * `git add -A` mette in stage solo file tracciati modificati / nuovi non ignorati (non re-invii l'intero storico).
 */

import { spawnSync, execSync } from 'node:child_process'
import process from 'node:process'

const rawArgs = process.argv.slice(2)
const noVercel = rawArgs.includes('--no-vercel')
const noPush = rawArgs.includes('--no-push')
const message = rawArgs.filter((a) => !a.startsWith('--')).join(' ').trim()
const commitMessage =
  message ||
  `chore: sync ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`

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

const porcelain = gitOut(['status', '--porcelain'])

if (porcelain) {
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
