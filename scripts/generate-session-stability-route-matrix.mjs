/**
 * Genera markdown: matrice route App Router → URL, layout chain, tier rischio (L/M/H).
 * Uso: node scripts/generate-session-stability-route-matrix.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const APP = path.join(__dirname, '..', 'src', 'app')

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name)
    if (name.isDirectory()) {
      if (name.name === 'api' || name.name.startsWith('_')) continue
      walk(p, acc)
    } else if (name.name === 'page.tsx') acc.push(p)
  }
  return acc
}

function pagePathToUrlPattern(relFromApp) {
  const norm = relFromApp.replace(/\\/g, '/')
  const withoutPage = norm.replace(/\/page\.tsx$|^page\.tsx$/, '')
  if (!withoutPage) return '/'
  // Parallel routes (@slot): URL visibile resta /dashboard/workouts
  if (withoutPage.includes('@')) {
    const base = withoutPage.replace(/\/@[^/]+.*$/, '')
    return base ? `/${base}` : '/'
  }
  return '/' + withoutPage
}

function layoutChain(pageFile) {
  const parts = []
  let dir = path.dirname(pageFile)
  const root = APP
  while (dir.startsWith(root) && dir !== root) {
    const layoutPath = path.join(dir, 'layout.tsx')
    if (fs.existsSync(layoutPath)) {
      parts.push(path.relative(root, layoutPath).replace(/\\/g, '/'))
    }
    dir = path.dirname(dir)
  }
  const rootLayout = path.join(root, 'layout.tsx')
  if (fs.existsSync(rootLayout)) parts.push('layout.tsx')
  return parts.reverse().join(' -> ')
}

function tierFor(url) {
  const u = url.toLowerCase()
  if (
    u.includes('/home/allenamenti') ||
    u.includes('/home/progressi') ||
    u.includes('/embed/athlete-allenamenti') ||
    u.includes('/dashboard/marketing') ||
    u.includes('/dashboard/calendario') ||
    u.includes('/dashboard/appuntamenti') ||
    u.includes('/dashboard/prenotazioni') ||
    u.includes('/dashboard/pagamenti') ||
    u.includes('/home/appuntamenti') ||
    u.includes('/home/pagamenti') ||
    u.includes('/home/documenti') ||
    u.includes('/home/chat') ||
    u.includes('/dashboard/atleti/') ||
    u.includes('/dashboard/nutrizionista') ||
    u.includes('/dashboard/massaggiatore') ||
    u.includes('/dashboard/clienti') ||
    u.includes('/dashboard/schede') ||
    u.includes('/dashboard/allenamenti') ||
    u.includes('/dashboard/workouts')
  )
    return 'H'
  if (
    u.includes('/home/profilo') ||
    u.includes('/home/trainer') ||
    u.includes('/home/massaggiatore') ||
    u.includes('/home/nutrizionista') ||
    u.includes('/dashboard/') ||
    u.includes('/welcome') ||
    u.includes('/post-login') ||
    u.includes('/login') ||
    u.includes('/registrati') ||
    u.includes('/forgot-password') ||
    u.includes('/reset-password')
  )
    return 'M'
  return 'L'
}

const pages = walk(APP).sort((a, b) => a.localeCompare(b))
const rows = pages.map((abs) => {
  const rel = path.relative(APP, abs).replace(/\\/g, '/')
  const url = pagePathToUrlPattern(rel)
  return { url, file: `src/app/${rel}`, layout: layoutChain(abs), tier: tierFor(url) }
})

let md = `## Matrice route (auto-generata)

Generata con \`node scripts/generate-session-stability-route-matrix.mjs\`. **Tier**: L=basso, M=medio, H=alto (mutazioni dense, realtime, UI mobile sticky, o staff critico).

| Tier | URL | File | Layout chain |
|------|-----|------|--------------|
`
for (const r of rows) {
  md += `| ${r.tier} | \`${r.url}\` | \`${r.file}\` | ${r.layout.replace(/\|/g, '\\|')} |\n`
}
md += `\n**Totale route:** ${rows.length}\n`

const outPath =
  process.argv[2] || path.join(__dirname, 'session-stability-route-matrix.generated.md')
fs.writeFileSync(outPath, md, 'utf8')
console.error('Wrote', outPath, rows.length, 'routes')
