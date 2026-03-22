#!/usr/bin/env node
/**
 * Anti-regression: fallisce se nel codice compaiono ruoli legacy
 * ('pt', 'atleta', 'nutrizionista', 'massaggiatore' come ruoli utente).
 * Esclude commenti e stringhe descrittive (e.g. "profilo atleta").
 * Ruoli definitivi: admin, trainer, athlete, marketing.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const SRC_DIR = path.join(ROOT, 'src')
const TESTS_DIR = path.join(ROOT, 'tests')
const SUPABASE_MIGRATIONS = path.join(ROOT, 'supabase', 'migrations')

const FORBIDDEN_PATTERNS = [
  { pattern: /role\s*[=:]\s*['"]pt['"]/g, name: "role = 'pt'" },
  { pattern: /role\s*===?\s*['"]pt['"]/g, name: "role === 'pt'" },
  { pattern: /['"]pt['"]\s*\|/g, name: "union type 'pt' |" },
  { pattern: /\|\s*['"]pt['"]/g, name: "union type | 'pt'" },
  { pattern: /\.eq\s*\(\s*['"]role['"]\s*,\s*['"]pt['"]\s*\)/g, name: ".eq('role', 'pt')" },
  { pattern: /value=["']pt["']/g, name: 'value="pt" (role select)' },
  { pattern: /option\s+value=["']pt["']/g, name: 'option value="pt"' },
  { pattern: /role\s*[=:]\s*['"]atleta['"]/g, name: "role = 'atleta'" },
  { pattern: /role\s*===?\s*['"]atleta['"]/g, name: "role === 'atleta'" },
  { pattern: /['"]atleta['"]\s*\|/g, name: "union type 'atleta' |" },
  { pattern: /\|\s*['"]atleta['"]/g, name: "union type | 'atleta'" },
  { pattern: /\.eq\s*\(\s*['"]role['"]\s*,\s*['"]atleta['"]\s*\)/g, name: ".eq('role', 'atleta')" },
  {
    pattern: /\.in\s*\(\s*['"]role['"]\s*,\s*\[\s*['"]atleta['"]/g,
    name: ".in('role', ['atleta']",
  },
  { pattern: /value=["']atleta["']/g, name: 'value="atleta" (role select)' },
  { pattern: /option\s+value=["']atleta["']/g, name: 'option value="atleta"' },
  { pattern: /z\.enum\s*\([^)]*['"]pt['"]/g, name: "z.enum(..., 'pt')" },
  { pattern: /z\.enum\s*\([^)]*['"]atleta['"]/g, name: "z.enum(..., 'atleta')" },
  { pattern: /role\s*[=:]\s*['"]nutrizionista['"]/g, name: "role = 'nutrizionista'" },
  { pattern: /role\s*[=:]\s*['"]massaggiatore['"]/g, name: "role = 'massaggiatore'" },
  {
    pattern: /\.in\s*\(\s*['"]role['"]\s*,\s*\[\s*['"]nutrizionista['"]/g,
    name: ".in('role', ['nutrizionista']",
  },
  {
    pattern: /\.in\s*\(\s*['"]role['"]\s*,\s*\[\s*['"]massaggiatore['"]/g,
    name: ".in('role', ['massaggiatore']",
  },
  { pattern: /z\.enum\s*\([^)]*['"]nutrizionista['"]/g, name: "z.enum(..., 'nutrizionista')" },
  { pattern: /z\.enum\s*\([^)]*['"]massaggiatore['"]/g, name: "z.enum(..., 'massaggiatore')" },
]

function walkDir(dir, exts, fileList = []) {
  if (!fs.existsSync(dir)) return fileList
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name !== 'node_modules' && e.name !== '.next' && e.name !== '.git') {
        walkDir(full, exts, fileList)
      }
    } else if (exts.some((ext) => e.name.endsWith(ext))) {
      fileList.push(full)
    }
  }
  return fileList
}

const ALL_FILES = [
  ...walkDir(SRC_DIR, ['.ts', '.tsx']),
  ...walkDir(TESTS_DIR, ['.ts', '.tsx', '.spec.ts']),
]
// File che possono contenere pt/atleta solo per normalizzazione input (CSV, JWT legacy, DB pre-migration)
// appointment.ts: 'nutrizionista' è tipo appuntamento (session type), non ruolo utente
const EXCLUDE_FILES = new Set([
  'src/lib/utils/role-normalizer.ts',
  'src/components/dashboard/admin/user-import-modal.tsx',
  'src/providers/auth-provider.tsx',
  'src/middleware.ts',
  'src/lib/supabase/get-user-profile.ts',
  'src/app/login/page.tsx',
  'src/app/post-login/page.tsx',
  'src/lib/validations/appointment.ts',
])
const files = ALL_FILES.filter(
  (f) => !EXCLUDE_FILES.has(path.relative(ROOT, f).replace(/\\/g, '/')),
)
// Migrations: solo la nuova (dopo normalizzazione) non deve contenere pt/atleta come valori ammessi
const _migrationFiles = walkDir(SUPABASE_MIGRATIONS, ['.sql']).filter(
  (f) => path.basename(f) >= '20260301130000_profiles_role_normalization.sql',
)

let failed = false
const errors = []

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8')
  const lines = content.split('\n')
  for (const { pattern, name } of FORBIDDEN_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags)
    let m
    re.lastIndex = 0
    while ((m = re.exec(content)) !== null) {
      const lineNum = content.slice(0, m.index).split('\n').length
      const line = lines[lineNum - 1]?.trim() || ''
      if (line.startsWith('//') || line.startsWith('*') || line.startsWith('/*')) continue
      errors.push({
        file: path.relative(ROOT, file),
        line: lineNum,
        match: name,
        snippet: line.slice(0, 80),
      })
      failed = true
    }
  }
}

if (failed) {
  console.error('check:roles — Trovati riferimenti a ruoli legacy (pt, atleta):\n')
  const byFile = {}
  for (const e of errors) {
    const k = e.file
    if (!byFile[k]) byFile[k] = []
    byFile[k].push(e)
  }
  for (const [f, list] of Object.entries(byFile)) {
    console.error(`  ${f}`)
    for (const { line, match, snippet } of list) {
      console.error(`    L${line}: ${match}  → ${snippet}...`)
    }
  }
  console.error(
    '\nRimuovi ruoli legacy (pt, atleta, nutrizionista, massaggiatore). Ruoli ammessi: admin, trainer, athlete, marketing.',
  )
  process.exit(1)
}

console.log('check:roles — Nessun ruolo legacy (pt, atleta) trovato.')
process.exit(0)
