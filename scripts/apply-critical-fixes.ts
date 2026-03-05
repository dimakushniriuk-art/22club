/**
 * Script per Applicare Fix Critici Supabase
 *
 * Questo script:
 * 1. Fornisce istruzioni per applicare i fix SQL
 * 2. Verifica lo stato attuale
 * 3. Fornisce link diretti al dashboard
 */

import * as fs from 'fs'
import * as path from 'path'

// Leggi .env.local
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const projectId =
  supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'icibqnmtacibgnhaidlz'

console.log('🔧 APPLICAZIONE FIX CRITICI SUPABASE')
console.log('='.repeat(80))
console.log(`\n📡 Progetto: ${projectId}`)
console.log(`🌐 Dashboard: https://supabase.com/dashboard/project/${projectId}\n`)

// Verifica che i file SQL esistano
const fixRLSPath = path.join(process.cwd(), 'docs', 'FIX_RLS_POLICIES_COMPLETE.sql')
const triggerPath = path.join(process.cwd(), 'docs', 'QUICK_APPLY_TRIGGER.sql')

const filesExist = {
  rls: fs.existsSync(fixRLSPath),
  trigger: fs.existsSync(triggerPath),
}

console.log('📋 VERIFICA FILE SQL')
console.log('-'.repeat(80))
console.log(`✅ FIX_RLS_POLICIES_COMPLETE.sql: ${filesExist.rls ? '✅ Esiste' : '❌ MANCA'}`)
console.log(`✅ QUICK_APPLY_TRIGGER.sql: ${filesExist.trigger ? '✅ Esiste' : '❌ MANCA'}\n`)

if (!filesExist.rls || !filesExist.trigger) {
  console.error('❌ File SQL mancanti! Verifica che i file esistano in docs/')
  process.exit(1)
}

// Leggi i file SQL per mostrare dimensioni
const rlsContent = fs.readFileSync(fixRLSPath, 'utf-8')
const triggerContent = fs.readFileSync(triggerPath, 'utf-8')

console.log('📊 DIMENSIONI FILE SQL')
console.log('-'.repeat(80))
console.log(`📄 FIX_RLS_POLICIES_COMPLETE.sql: ${rlsContent.split('\n').length} righe`)
console.log(`📄 QUICK_APPLY_TRIGGER.sql: ${triggerContent.split('\n').length} righe\n`)

console.log('🎯 ISTRUZIONI PER APPLICARE I FIX')
console.log('='.repeat(80))
console.log('\n📌 FIX 1: RLS Policies su appointments')
console.log('-'.repeat(80))
console.log('1. Apri il SQL Editor:')
console.log(`   👉 https://supabase.com/dashboard/project/${projectId}/sql/new`)
console.log('\n2. Copia il contenuto di: docs/FIX_RLS_POLICIES_COMPLETE.sql')
console.log('\n3. Incolla nel SQL Editor')
console.log('\n4. Clicca "Run" o premi Ctrl+Enter')
console.log('\n5. Verifica che non ci siano errori\n')

console.log('📌 FIX 2: Trigger handle_new_user')
console.log('-'.repeat(80))
console.log('1. Apri il SQL Editor:')
console.log(`   👉 https://supabase.com/dashboard/project/${projectId}/sql/new`)
console.log('\n2. Copia il contenuto di: docs/QUICK_APPLY_TRIGGER.sql')
console.log('\n3. Incolla nel SQL Editor')
console.log('\n4. Clicca "Run" o premi Ctrl+Enter')
console.log('\n5. Verifica che non ci siano errori\n')

console.log('✅ VERIFICA POST-APPLICAZIONE')
console.log('-'.repeat(80))
console.log('Dopo aver applicato entrambi i fix, esegui:')
console.log('  npm run db:verify-data-deep')
console.log('  npm run db:analyze-complete\n')

console.log('📋 CHECKLIST')
console.log('-'.repeat(80))
console.log('☐ 1. Applicato FIX_RLS_POLICIES_COMPLETE.sql')
console.log('☐ 2. Applicato QUICK_APPLY_TRIGGER.sql')
console.log('☐ 3. Eseguito npm run db:verify-data-deep')
console.log('☐ 4. Verificato che appointments sia accessibile')
console.log('☐ 5. Verificato che il trigger esista\n')

console.log('💡 SUGGERIMENTI')
console.log('-'.repeat(80))
console.log('• Applica i fix uno alla volta per identificare eventuali errori')
console.log('• Se vedi errori, controlla i messaggi e verifica la sintassi SQL')
console.log('• Dopo ogni fix, verifica con npm run db:verify-data-deep')
console.log('• Se appointments ha ancora problemi, verifica le colonne (trainer_id, staff_id)\n')

console.log('='.repeat(80))
console.log('✅ Istruzioni complete! Apri i link sopra per applicare i fix.')
console.log('='.repeat(80))
