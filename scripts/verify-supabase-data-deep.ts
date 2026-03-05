/**
 * Script di Verifica Approfondita Dati Supabase
 * Usa service key per bypassare RLS e verificare dati reali
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
    // Ignora righe vuote e commenti
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return
    }
    const match = trimmedLine.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      let value = match[2].trim()
      // Rimuovi virgolette all'inizio e alla fine se presenti
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
  process.exit(1)
}

console.log('🔍 VERIFICA APPROFONDITA DATI SUPABASE')
console.log('='.repeat(80))
console.log(`\n📡 Progetto: ${supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'N/A'}`)

// Crea client con anon key (soggetto a RLS)
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// Crea client admin con service key (bypassa RLS)
let supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null
if (supabaseServiceKey) {
  supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  console.log('✅ Service key configurata - analisi completa disponibile\n')
} else {
  console.log(
    '⚠️  Service key NON configurata - analisi limitata (solo dati accessibili con anon key)\n',
  )
  console.log('💡 Aggiungi SUPABASE_SERVICE_ROLE_KEY in .env.local per analisi completa\n')
}

async function checkTableData(tableName: string, useAdmin = false) {
  const client = useAdmin && supabaseAdmin ? supabaseAdmin : supabase
  const clientType = useAdmin && supabaseAdmin ? 'ADMIN (bypass RLS)' : 'ANON (con RLS)'

  try {
    const { data, error, count } = await client
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from(tableName as any)
      .select('*', { count: 'exact', head: false })
      .limit(1000)

    if (error) {
      return {
        exists: false,
        count: 0,
        error: error.message,
        code: error.code,
        clientType,
      }
    }

    return {
      exists: true,
      count: count || data?.length || 0,
      sampleData: data?.slice(0, 5) || [],
      clientType,
    }
  } catch (error) {
    return {
      exists: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      clientType,
    }
  }
}

async function checkProfiles() {
  console.log('\n👥 ANALISI PROFILI')
  console.log('-'.repeat(80))

  // Con anon key (soggetto a RLS)
  const anonResult = await checkTableData('profiles', false)
  console.log(`\n📊 Con ANON Key (soggetto a RLS):`)
  console.log(`   Esiste: ${anonResult.exists ? '✅' : '❌'}`)
  console.log(`   Conteggio: ${anonResult.count}`)
  if (anonResult.error) {
    console.log(`   Errore: ${anonResult.error} (${anonResult.code || 'N/A'})`)
  }

  // Con service key (bypass RLS)
  if (supabaseAdmin) {
    const adminResult = await checkTableData('profiles', true)
    console.log(`\n📊 Con SERVICE Key (bypass RLS):`)
    console.log(`   Esiste: ${adminResult.exists ? '✅' : '❌'}`)
    console.log(`   Conteggio: ${adminResult.count}`)
    if (adminResult.sampleData && adminResult.sampleData.length > 0) {
      console.log(`\n   📋 Primi ${Math.min(5, adminResult.sampleData.length)} profili:`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      adminResult.sampleData.forEach((profile: any, idx: number) => {
        console.log(
          `   ${idx + 1}. ${profile.nome || 'N/A'} ${profile.cognome || 'N/A'} (${profile.role || 'N/A'}) - ${profile.email || 'N/A'}`,
        )
      })
    }
    if (adminResult.error) {
      console.log(`   Errore: ${adminResult.error}`)
    }
  }

  // Statistiche per ruolo
  if (supabaseAdmin) {
    try {
      const { data: profiles, error } = await supabaseAdmin.from('profiles').select('role, stato')

      if (!error && profiles) {
        const roleStats: Record<string, number> = {}
        const statusStats: Record<string, number> = {}

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        profiles.forEach((p: any) => {
          roleStats[p.role] = (roleStats[p.role] || 0) + 1
          statusStats[p.stato || 'N/A'] = (statusStats[p.stato || 'N/A'] || 0) + 1
        })

        console.log(`\n   📊 Statistiche per ruolo:`)
        Object.entries(roleStats).forEach(([role, count]) => {
          console.log(`      - ${role}: ${count}`)
        })

        console.log(`\n   📊 Statistiche per stato:`)
        Object.entries(statusStats).forEach(([status, count]) => {
          console.log(`      - ${status}: ${count}`)
        })
      }
    } catch (error) {
      console.log(`   ⚠️  Errore nel calcolo statistiche: ${error}`)
    }
  }
}

async function checkExercises() {
  console.log('\n💪 ANALISI ESERCIZI')
  console.log('-'.repeat(80))

  const anonResult = await checkTableData('exercises', false)
  console.log(`\n📊 Con ANON Key:`)
  console.log(`   Conteggio: ${anonResult.count}`)
  if (anonResult.error) {
    console.log(`   Errore: ${anonResult.error} (${anonResult.code || 'N/A'})`)
  }

  if (supabaseAdmin) {
    const adminResult = await checkTableData('exercises', true)
    console.log(`\n📊 Con SERVICE Key:`)
    console.log(`   Conteggio: ${adminResult.count}`)
    if (adminResult.sampleData && adminResult.sampleData.length > 0) {
      console.log(`\n   📋 Primi ${Math.min(5, adminResult.sampleData.length)} esercizi:`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      adminResult.sampleData.forEach((exercise: any, idx: number) => {
        console.log(`   ${idx + 1}. ${exercise.name || 'N/A'} - ${exercise.muscle_groups || 'N/A'}`)
      })
    }
  }
}

async function checkWorkoutPlans() {
  console.log('\n📋 ANALISI WORKOUT PLANS')
  console.log('-'.repeat(80))

  const anonResult = await checkTableData('workout_plans', false)
  console.log(`\n📊 Con ANON Key:`)
  console.log(`   Conteggio: ${anonResult.count}`)
  if (anonResult.error) {
    console.log(`   Errore: ${anonResult.error}`)
  }

  if (supabaseAdmin) {
    const adminResult = await checkTableData('workout_plans', true)
    console.log(`\n📊 Con SERVICE Key:`)
    console.log(`   Conteggio: ${adminResult.count}`)
  }
}

async function checkWorkoutLogs() {
  console.log('\n📝 ANALISI WORKOUT LOGS')
  console.log('-'.repeat(80))

  const anonResult = await checkTableData('workout_logs', false)
  console.log(`\n📊 Con ANON Key:`)
  console.log(`   Conteggio: ${anonResult.count}`)
  if (anonResult.error) {
    console.log(`   Errore: ${anonResult.error}`)
  }

  if (supabaseAdmin) {
    const adminResult = await checkTableData('workout_logs', true)
    console.log(`\n📊 Con SERVICE Key:`)
    console.log(`   Conteggio: ${adminResult.count}`)
  }
}

async function checkAppointments() {
  console.log('\n📅 ANALISI APPUNTAMENTI')
  console.log('-'.repeat(80))

  const anonResult = await checkTableData('appointments', false)
  console.log(`\n📊 Con ANON Key:`)
  console.log(`   Conteggio: ${anonResult.count}`)
  if (anonResult.error) {
    console.log(`   Errore: ${anonResult.error} (${anonResult.code || 'N/A'})`)
    if (anonResult.code === '42501') {
      console.log(`   ⚠️  Problema RLS: Le policies RLS bloccano l'accesso con anon key`)
    }
  }

  if (supabaseAdmin) {
    const adminResult = await checkTableData('appointments', true)
    console.log(`\n📊 Con SERVICE Key:`)
    console.log(`   Conteggio: ${adminResult.count}`)
  }
}

async function checkAllTables() {
  console.log('\n📊 ANALISI TUTTE LE TABELLE')
  console.log('-'.repeat(80))

  const tables = [
    'profiles',
    'roles',
    'appointments',
    'workout_plans',
    'workout_logs',
    'exercises',
    'documents',
    'payments',
    'lesson_counters',
    'notifications',
    'chat_messages',
    'inviti_atleti',
    'progress_logs',
    'progress_photos',
    'pt_atleti',
    'audit_logs',
    'push_subscriptions',
  ]

  const results: Array<{
    table: string
    anonCount: number
    adminCount: number | null
    anonError?: string
  }> = []

  for (const table of tables) {
    const anonResult = await checkTableData(table, false)
    let adminCount: number | null = null

    if (supabaseAdmin) {
      const adminResult = await checkTableData(table, true)
      adminCount = adminResult.count
    }

    results.push({
      table,
      anonCount: anonResult.count,
      adminCount,
      anonError: anonResult.error,
    })
  }

  console.log('\n📋 Riepilogo:')
  console.log('─'.repeat(80))
  console.log('Tabella'.padEnd(25) + 'ANON Key'.padEnd(15) + 'SERVICE Key'.padEnd(15) + 'Note')
  console.log('─'.repeat(80))

  results.forEach((r) => {
    const anonStr = r.anonError ? '❌ Error' : `${r.anonCount}`
    const adminStr = r.adminCount !== null ? `${r.adminCount}` : 'N/A'
    const note = r.anonError ? `RLS: ${r.anonError.substring(0, 30)}...` : ''
    console.log(r.table.padEnd(25) + anonStr.padEnd(15) + adminStr.padEnd(15) + note)
  })

  console.log('─'.repeat(80))

  // Riepilogo differenze
  const differences = results.filter((r) => r.adminCount !== null && r.anonCount !== r.adminCount)

  if (differences.length > 0) {
    console.log('\n⚠️  TABELLE CON DIFFERENZE TRA ANON E SERVICE KEY (problemi RLS):')
    differences.forEach((r) => {
      console.log(
        `   - ${r.table}: ANON=${r.anonCount}, ADMIN=${r.adminCount} (differenza: ${r.adminCount! - r.anonCount})`,
      )
    })
  }
}

async function main() {
  try {
    await checkProfiles()
    await checkExercises()
    await checkWorkoutPlans()
    await checkWorkoutLogs()
    await checkAppointments()
    await checkAllTables()

    console.log('\n' + '='.repeat(80))
    console.log('✅ VERIFICA COMPLETATA')
    console.log('='.repeat(80))

    if (!supabaseServiceKey) {
      console.log('\n💡 RACCOMANDAZIONE:')
      console.log('   Aggiungi SUPABASE_SERVICE_ROLE_KEY in .env.local per analisi completa')
      console.log('   La service key permette di vedere tutti i dati bypassando RLS')
    }
  } catch (error) {
    console.error('\n❌ Errore durante verifica:', error)
    if (error instanceof Error) {
      console.error('  Message:', error.message)
      console.error('  Stack:', error.stack)
    }
    process.exit(1)
  }
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Errore fatale:', error)
    process.exit(1)
  })
