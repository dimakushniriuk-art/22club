#!/usr/bin/env tsx
/**
 * Script semplificato per eseguire la migration SQL
 * 
 * Questo script legge il file SQL e lo esegue usando fetch diretto all'API Supabase
 * oppure mostra le istruzioni per eseguirlo manualmente.
 */

import { readFileSync } from 'fs'
import { join } from 'path'

const migrationPath = join(
  process.cwd(),
  'supabase/migrations/20250117_fix_workout_logs_athlete_insert.sql'
)

const sql = readFileSync(migrationPath, 'utf-8')

console.log('📄 Migration SQL:')
console.log('─'.repeat(80))
console.log(sql)
console.log('─'.repeat(80))
console.log('')
console.log('📋 Istruzioni per eseguire:')
console.log('')
console.log('Opzione 1: Supabase Dashboard (Raccomandato)')
console.log('  1. Vai su: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/sql/new')
console.log('  2. Copia e incolla il SQL sopra')
console.log('  3. Clicca "Run"')
console.log('')
console.log('Opzione 2: Script Bash')
console.log('  Esegui: bash scripts/run-migration-workout-logs.sh')
console.log('')
console.log('Opzione 3: psql diretto')
console.log('  psql "postgresql://postgres.icibqnmtacibgnhaidlz:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres" -f supabase/migrations/20250117_fix_workout_logs_athlete_insert.sql')
console.log('')
