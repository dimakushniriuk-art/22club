#!/usr/bin/env tsx
/**
 * Script per sincronizzare schema-with-data.sql come fonte di verità
 *
 * Questo script:
 * 1. Verifica che schema-with-data.sql esista
 * 2. Esporta lo schema attuale dal database
 * 3. Confronta con schema-with-data.sql
 * 4. Aggiorna schema-with-data.sql se ci sono differenze
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

const SOURCE_OF_TRUTH = join(projectRoot, 'supabase-config-export/schema-with-data.sql')
const EXPORT_FILE = join(projectRoot, 'supabase-config-export/schema-complete.sql')

console.log('🔄 Sincronizzazione Schema - Fonte di Verità\n')

// 1. Verifica che il file fonte di verità esista
if (!existsSync(SOURCE_OF_TRUTH)) {
  console.error('❌ ERRORE: schema-with-data.sql non trovato!')
  console.error(`   Percorso atteso: ${SOURCE_OF_TRUTH}`)
  console.error('\n💡 Crea prima il file usando: npm run db:export-schema-pgdump')
  process.exit(1)
}

console.log('✅ File fonte di verità trovato:', SOURCE_OF_TRUTH)
console.log('📊 Dimensione file:', (readFileSync(SOURCE_OF_TRUTH).length / 1024).toFixed(2), 'KB\n')

// 2. Carica variabili d'ambiente
let databaseUrl: string | undefined

try {
  const envContent = readFileSync(join(projectRoot, 'env.local'), 'utf-8')
  const envLines = envContent.split('\n')

  for (const line of envLines) {
    if (line.startsWith('DATABASE_URL=') || line.startsWith('DIRECT_URL=')) {
      const match = line.match(/^[^=]+="?([^"]+)"?$/)
      if (match && !match[1].includes('[YOUR-PASSWORD]') && !match[1].includes('your-project')) {
        databaseUrl = match[1]
        break
      }
    }
  }
} catch {
  console.log("⚠️  Impossibile leggere env.local, userò variabili d'ambiente\n")
}

databaseUrl = databaseUrl || process.env.DATABASE_URL || process.env.DIRECT_URL

if (!databaseUrl) {
  console.error('❌ ERRORE: Connection string non trovata!')
  console.error('\n💡 Configura DATABASE_URL o DIRECT_URL in env.local')
  console.error('   Oppure usa: bash supabase-config-export/pg-dump-completo.sh\n')
  process.exit(1)
}

// 3. Esporta schema attuale
console.log('📦 Esportazione schema attuale dal database...\n')

try {
  execSync(
    `pg_dump "${databaseUrl}" --schema=public --schema-only --no-owner --no-acl -f "${EXPORT_FILE}"`,
    {
      stdio: 'inherit',
      cwd: projectRoot,
      env: { ...process.env },
    },
  )
  console.log(`\n✅ Schema esportato in: ${EXPORT_FILE}\n`)
} catch (err) {
  const error = err instanceof Error ? err : new Error(String(err))
  console.error("❌ Errore durante l'esportazione:")
  console.error(`   ${error.message}\n`)
  console.error('💡 Verifica:')
  console.error('   1. La connection string è corretta')
  console.error('   2. pg_dump è installato')
  console.error('   3. Il database è raggiungibile\n')
  process.exit(1)
}

// 4. Confronta i file
console.log('🔍 Confronto file...\n')

const sourceContent = readFileSync(SOURCE_OF_TRUTH, 'utf-8')
const exportContent = readFileSync(EXPORT_FILE, 'utf-8')

const sourceLines = sourceContent.split('\n').length
const exportLines = exportContent.split('\n').length

console.log(`   Fonte di verità: ${sourceLines} righe`)
console.log(`   Export attuale:  ${exportLines} righe`)

if (sourceContent === exportContent) {
  console.log('\n✅ I file sono identici - nessuna sincronizzazione necessaria\n')
  process.exit(0)
}

// 5. Calcola differenze
const sourceHash = sourceContent.split('\n').slice(0, 100).join('\n')
const exportHash = exportContent.split('\n').slice(0, 100).join('\n')

console.log('\n⚠️  I file sono diversi!')

// 6. Chiedi conferma per aggiornare
console.log('\n📝 Opzioni:')
console.log('   1. Aggiorna schema-with-data.sql con la versione attuale')
console.log('   2. Mantieni schema-with-data.sql (ignora differenze)')
console.log('   3. Mostra differenze (primi 50 caratteri)')

// Per ora, mostriamo le differenze e chiediamo conferma
console.log('\n🔍 Prime differenze rilevate:')
console.log('   (Confronto prime 100 righe)')

if (sourceHash !== exportHash) {
  console.log('\n   ⚠️  Le prime 100 righe sono diverse')
  console.log('   💡 Il database potrebbe essere stato modificato\n')

  // Mostra un sample delle differenze
  const sourceSample = sourceContent.split('\n').slice(0, 5).join('\n')
  const exportSample = exportContent.split('\n').slice(0, 5).join('\n')

  if (sourceSample !== exportSample) {
    console.log('   Sample fonte di verità (prime 5 righe):')
    console.log('   ' + sourceSample.split('\n')[0])
    console.log('   ' + sourceSample.split('\n')[1])
    console.log('\n   Sample export attuale (prime 5 righe):')
    console.log('   ' + exportSample.split('\n')[0])
    console.log('   ' + exportSample.split('\n')[1])
  }
}

console.log('\n💡 Per aggiornare manualmente:')
console.log(`   cp ${EXPORT_FILE} ${SOURCE_OF_TRUTH}\n`)

console.log('📋 Prossimi passi:')
console.log('   1. Verifica le differenze tra i file')
console.log("   2. Se l'export è corretto, aggiorna schema-with-data.sql")
console.log('   3. Committa il file aggiornato nel repository\n')

process.exit(0)
