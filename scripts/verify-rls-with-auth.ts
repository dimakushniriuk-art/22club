/**
 * Script per verificare RLS policies con utente autenticato
 *
 * Uso:
 *   npm run db:verify-rls-auth
 *   oppure
 *   npx tsx scripts/verify-rls-with-auth.ts
 *
 * Questo script autentica un utente di test prima di verificare l'accesso ai dati
 */

import { createClient } from '@supabase/supabase-js'
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '❌ Errore: Configura NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY nel file .env.local',
  )
  process.exit(1)
}

// Crea client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Utente di test da usare
const TEST_EMAIL = 'mario.rossi@22club.it'
const TEST_PASSWORD = 'Mario2024!'

async function checkTableWithAuth(tableName: string) {
  try {
    const { data, error, count } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from(tableName as any)
      .select('*', { count: 'exact', head: false })
      .limit(100)

    if (error) {
      return {
        success: false,
        count: 0,
        error: error.message,
        code: error.code,
      }
    }

    return {
      success: true,
      count: count || data?.length || 0,
      data: data?.slice(0, 5) || [],
    }
  } catch (error) {
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function main() {
  console.log('🔍 VERIFICA RLS POLICIES CON UTENTE AUTENTICATO')
  console.log('='.repeat(80))
  console.log(
    `\n📡 Progetto: ${SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'N/A'}`,
  )
  console.log(`👤 Utente test: ${TEST_EMAIL}\n`)

  // Step 1: Autentica utente
  console.log('🔐 Autenticazione utente...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  })

  if (authError || !authData.session) {
    console.error(`❌ Errore autenticazione: ${authError?.message || 'Nessuna sessione'}`)
    console.log('\n💡 Verifica che le credenziali siano corrette:')
    console.log(`   Email: ${TEST_EMAIL}`)
    console.log(`   Password: ${TEST_PASSWORD}`)
    process.exit(1)
  }

  console.log(`✅ Autenticato come: ${authData.user.email}`)
  console.log(`   User ID: ${authData.user.id}\n`)

  // Step 2: Verifica accesso alle tabelle
  const tables = [
    'profiles',
    'exercises',
    'appointments',
    'payments',
    'notifications',
    'chat_messages',
    'inviti_atleti',
    'pt_atleti',
    'workout_plans',
  ]

  console.log('📊 VERIFICA ACCESSO TABELLE CON UTENTE AUTENTICATO')
  console.log('='.repeat(80))

  const results: Array<{
    table: string
    success: boolean
    count: number
    error?: string
  }> = []

  for (const table of tables) {
    const result = await checkTableWithAuth(table)
    results.push({
      table,
      success: result.success,
      count: result.count,
      error: result.error,
    })

    const status = result.success ? '✅' : '❌'
    const countStr = result.count > 0 ? `${result.count} record` : '0 record'
    const errorStr = result.error ? ` - ${result.error}` : ''
    console.log(`${status} ${table.padEnd(20)} : ${countStr}${errorStr}`)
  }

  // Step 3: Riepilogo
  console.log('\n' + '='.repeat(80))
  console.log('📋 RIEPILOGO')
  console.log('='.repeat(80))

  const successful = results.filter((r) => r.success && r.count > 0)
  const failed = results.filter((r) => !r.success || r.count === 0)

  console.log(`✅ Tabelle accessibili: ${successful.length}/${tables.length}`)
  console.log(`❌ Tabelle non accessibili: ${failed.length}/${tables.length}`)

  if (successful.length > 0) {
    console.log('\n✅ Tabelle accessibili:')
    successful.forEach((r) => {
      console.log(`   - ${r.table}: ${r.count} record`)
    })
  }

  if (failed.length > 0) {
    console.log('\n❌ Tabelle non accessibili:')
    failed.forEach((r) => {
      const reason = r.error || (r.count === 0 ? '0 record' : 'Errore sconosciuto')
      console.log(`   - ${r.table}: ${reason}`)
    })
  }

  // Step 4: Logout
  await supabase.auth.signOut()
  console.log('\n🔓 Logout completato')

  console.log('\n' + '='.repeat(80))
  if (failed.length === 0) {
    console.log('✅ TUTTE LE TABELLE SONO ACCESSIBILI! RLS policies funzionano correttamente.')
  } else {
    console.log('⚠️  Alcune tabelle non sono accessibili. Verifica le policies RLS.')
  }
  console.log('='.repeat(80))
}

main().catch((error) => {
  console.error('\n❌ Errore fatale:', error)
  process.exit(1)
})
