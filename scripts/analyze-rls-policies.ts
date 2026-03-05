/**
 * Script per Analisi RLS Policies Supabase
 * 
 * Verifica lo stato delle RLS policies per tutte le tabelle principali
 * 
 * Uso:
 *   npm run db:analyze-rls
 *   oppure
 *   npx tsx scripts/analyze-rls-policies.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import type { Database } from '@/types/supabase'

// Leggi .env.local
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8')
  envFile.split(/\r?\n/).forEach((line) => {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return
    }
    const match = trimmedLine.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      let value = match[2].trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      process.env[key] = value
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variabili d'ambiente mancanti!")
  console.error('   Configura NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

// Tabelle principali da verificare
const tablesToCheck = [
  'profiles',
  'appointments',
  'workout_plans',
  'workout_logs',
  'athlete_profiles',
  'communications',
  'communication_recipients',
  'notifications',
  'payments',
  'subscriptions',
  'documents',
  'exercises',
]

console.log('🔒 ANALISI RLS POLICIES')
console.log('='.repeat(80))
console.log(`\n📡 Progetto: ${supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'N/A'}`)
console.log(`🔑 Anon Key: ${supabaseKey.substring(0, 20)}...`)

// Crea client Supabase
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// Crea client admin se disponibile
let supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null
if (supabaseServiceKey) {
  supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  })
  console.log(`🔑 Service Key: Configurata (analisi completa disponibile)`)
} else {
  console.log(`⚠️  Service Key: Non configurata (analisi limitata)`)
}

interface RLSAnalysis {
  table: string
  exists: boolean
  rlsEnabled: boolean
  accessible: boolean
  error?: string
  errorCode?: string
  rowCount?: number
}

const results: RLSAnalysis[] = []

async function analyzeTableRLS(tableName: string): Promise<RLSAnalysis> {
  const result: RLSAnalysis = {
    table: tableName,
    exists: false,
    rlsEnabled: false,
    accessible: false,
  }

  try {
    // Prova query con anon key (soggetto a RLS)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error, count } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from(tableName as any)
      .select('*', { count: 'exact', head: true })

    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        result.exists = false
        result.error = 'Tabella non esiste'
        result.errorCode = error.code
      } else if (error.code === '42501' || error.message?.includes('permission denied')) {
        result.exists = true
        result.rlsEnabled = true
        result.accessible = false
        result.error = 'Accesso negato da RLS'
        result.errorCode = error.code
      } else {
        result.exists = true
        result.error = error.message
        result.errorCode = error.code
      }
    } else {
      result.exists = true
      result.rlsEnabled = true
      result.accessible = true
      result.rowCount = count || 0
    }

    // Se abbiamo service key, verifica conteggio reale
    if (supabaseAdmin && result.exists) {
      try {
        const { count: adminCount } = await supabaseAdmin
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .from(tableName as any)
          .select('*', { count: 'exact', head: true })
        result.rowCount = adminCount || 0
      } catch {
        // Ignora errori con service key
      }
    }
  } catch (err) {
    result.error = err instanceof Error ? err.message : 'Unknown error'
  }

  return result
}

async function main() {
  console.log('\n📊 Verifica RLS per tabelle principali...\n')

  for (const table of tablesToCheck) {
    const result = await analyzeTableRLS(table)
    results.push(result)

    // Stampa risultato
    if (!result.exists) {
      console.log(`  ❌ ${table}: NON ESISTE`)
    } else if (!result.rlsEnabled) {
      console.log(`  ⚠️  ${table}: Esiste ma RLS non attivo`)
    } else if (!result.accessible) {
      console.log(`  🔒 ${table}: RLS attivo, accesso negato (normale se non autenticato)`)
      if (result.rowCount !== undefined) {
        console.log(`     Righe totali: ${result.rowCount}`)
      }
    } else {
      console.log(`  ✅ ${table}: RLS attivo, accessibile`)
      if (result.rowCount !== undefined) {
        console.log(`     Righe visibili: ${result.rowCount}`)
      }
    }

    if (result.error && result.error !== 'Accesso negato da RLS') {
      console.log(`     Errore: ${result.error} (${result.errorCode || 'N/A'})`)
    }
  }

  // Riepilogo
  console.log('\n' + '='.repeat(80))
  console.log('\n📊 RIEPILOGO')
  console.log('-'.repeat(80))

  const existing = results.filter((r) => r.exists)
  const withRLS = results.filter((r) => r.rlsEnabled)
  const accessible = results.filter((r) => r.accessible)

  console.log(`\n✅ Tabelle esistenti: ${existing.length}/${tablesToCheck.length}`)
  console.log(`🔒 Tabelle con RLS: ${withRLS.length}/${existing.length}`)
  console.log(`👁️  Tabelle accessibili: ${accessible.length}/${existing.length}`)

  // Avvisi
  const withoutRLS = existing.filter((r) => !r.rlsEnabled)
  if (withoutRLS.length > 0) {
    console.log(`\n⚠️  ATTENZIONE: Tabelle senza RLS:`)
    withoutRLS.forEach((r) => {
      console.log(`   - ${r.table}`)
    })
  }

  const notAccessible = existing.filter((r) => r.rlsEnabled && !r.accessible)
  if (notAccessible.length > 0 && !supabaseServiceKey) {
    console.log(`\n💡 NOTA: ${notAccessible.length} tabelle con accesso negato (normale se non autenticato)`)
    console.log(`   Per verifica completa, configura SUPABASE_SERVICE_ROLE_KEY`)
  }

  console.log('\n' + '='.repeat(80))
  console.log('✅ Analisi completata!')
}

main().catch((error) => {
  console.error('\n❌ Errore durante analisi:', error)
  process.exit(1)
})
