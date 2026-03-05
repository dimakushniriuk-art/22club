#!/usr/bin/env node

/**
 * Script di pulizia del progetto
 * Rimuove file temporanei, cache e file generati
 */

import { execSync } from 'child_process'
import { existsSync, rmSync } from 'fs'
import { join } from 'path'

const PROJECT_ROOT = process.cwd()

const CLEANUP_TARGETS = [
  { path: join(PROJECT_ROOT, '.next'), type: 'Next.js build cache' },
  { path: join(PROJECT_ROOT, 'node_modules/.cache'), type: 'Node modules cache' },
  { path: join(PROJECT_ROOT, 'coverage'), type: 'Test coverage' },
  { path: join(PROJECT_ROOT, '.turbo'), type: 'Turborepo cache' },
  { path: join(PROJECT_ROOT, 'dist'), type: 'Distribution files' },
  { path: join(PROJECT_ROOT, 'build'), type: 'Build files' },
  { path: join(PROJECT_ROOT, '*.tsbuildinfo'), type: 'TypeScript build info' },
  { path: join(PROJECT_ROOT, '*.log'), type: 'Log files' },
]

console.log('🧹 Avvio pulizia progetto...\n')

let cleaned = 0
let errors = 0

for (const target of CLEANUP_TARGETS) {
  try {
    if (existsSync(target.path)) {
      rmSync(target.path, { recursive: true, force: true })
      console.log(`✅ Rimosso: ${target.type}`)
      cleaned++
    }
  } catch (error) {
    console.error(`❌ Errore rimozione ${target.type}:`, error.message)
    errors++
  }
}

// Rimuovi file .tsbuildinfo sparsi
try {
  execSync('find . -name "*.tsbuildinfo" -type f -delete', {
    cwd: PROJECT_ROOT,
    stdio: 'ignore',
    shell: true,
  })
  console.log('✅ Rimossi file .tsbuildinfo')
} catch {
  // Ignora se il comando non funziona (es. Windows)
}

// Rimuovi log files sparsi
try {
  execSync('find . -name "*.log" -type f -not -path "./node_modules/*" -delete', {
    cwd: PROJECT_ROOT,
    stdio: 'ignore',
    shell: true,
  })
  console.log('✅ Rimossi file .log')
} catch {
  // Ignora se il comando non funziona (es. Windows)
}

console.log(`\n📊 Risultati:`)
console.log(`   ✅ ${cleaned} cartelle/file rimossi`)
if (errors > 0) {
  console.log(`   ❌ ${errors} errori`)
}
console.log('\n✨ Pulizia completata!')
