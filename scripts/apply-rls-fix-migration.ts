/**
 * Script per applicare la migration RLS policies fix
 *
 * NOTA: Supabase non permette esecuzione SQL arbitrario via API per sicurezza.
 * Questo script prepara il file SQL e fornisce istruzioni per applicarlo.
 *
 * Uso:
 *   npm run db:apply-rls-fix
 *   oppure
 *   npx tsx scripts/apply-rls-fix-migration.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// Leggi .env.local se esiste
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      process.env[key] = value
    }
  })
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const projectId =
  SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'icibqnmtacibgnhaidlz'

async function main() {
  console.log('🚀 APPLICAZIONE MIGRATION RLS POLICIES FIX')
  console.log('='.repeat(80))
  console.log(`\n📡 Progetto: ${projectId}`)
  console.log(`🌐 Dashboard: https://supabase.com/dashboard/project/${projectId}\n`)

  // Verifica che il file migration esista
  const migrationPath = path.join(
    process.cwd(),
    'supabase',
    'migrations',
    '20250131_fix_rls_policies_complete.sql',
  )

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ File migration non trovato: ${migrationPath}`)
    process.exit(1)
  }

  const sqlContent = fs.readFileSync(migrationPath, 'utf-8')
  console.log(`✅ File migration trovato: ${migrationPath}`)
  console.log(`📏 Dimensione: ${sqlContent.length} caratteri\n`)

  console.log('📋 ISTRUZIONI PER APPLICARE LA MIGRATION:')
  console.log('-'.repeat(80))
  console.log('\n⚠️  NOTA: Supabase non permette esecuzione SQL arbitrario via API.')
  console.log('   Devi applicare la migration manualmente nel Dashboard SQL Editor.\n')

  console.log('🔧 STEP 1: Apri Supabase Dashboard SQL Editor')
  console.log(`   👉 https://supabase.com/dashboard/project/${projectId}/sql/new\n`)

  console.log('🔧 STEP 2: Copia il contenuto del file SQL')
  console.log(`   File: ${migrationPath}\n`)

  console.log('🔧 STEP 3: Incolla nel SQL Editor e clicca "Run"\n')

  console.log('🔧 STEP 4: Verifica che non ci siano errori\n')

  console.log('🔧 STEP 5: Verifica il fix con:')
  console.log('   npm run db:verify-data-deep\n')

  // Crea un file temporaneo con il contenuto SQL per facilitare il copy-paste
  const tempSqlPath = path.join(process.cwd(), 'temp_rls_fix.sql')
  fs.writeFileSync(tempSqlPath, sqlContent, 'utf-8')
  console.log(`💡 File SQL copiato in: ${tempSqlPath}`)
  console.log('   Puoi aprire questo file e copiare il contenuto nel SQL Editor.\n')

  console.log('='.repeat(80))
  console.log('\n✅ Preparazione completata!')
  console.log('\n📝 Prossimi passi:')
  console.log('   1. Apri il file temp_rls_fix.sql')
  console.log('   2. Copia tutto il contenuto')
  console.log(`   3. Vai su: https://supabase.com/dashboard/project/${projectId}/sql/new`)
  console.log('   4. Incolla e clicca "Run"')
  console.log('   5. Verifica con: npm run db:verify-data-deep')
  console.log("\n🗑️  Dopo l'applicazione, puoi eliminare: temp_rls_fix.sql\n")
}

main().catch((error) => {
  console.error('\n❌ Errore fatale:', error)
  process.exit(1)
})
