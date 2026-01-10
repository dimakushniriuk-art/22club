/**
 * Script per verificare la configurazione Supabase
 * Confronta le variabili d'ambiente con il progetto Supabase
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import type { Database } from '@/types/supabase'

// Leggi .env.local se esiste
const envPath = path.join(process.cwd(), '.env.local')
const envVars: Record<string, string> = {}

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
      envVars[key] = value
    }
  })
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Verifica Configurazione Supabase\n')
console.log('='.repeat(60))

// 1. Verifica variabili d'ambiente
console.log("\n📋 Variabili d'ambiente:")
console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Configurato' : '❌ Mancante'}`)
if (supabaseUrl) {
  console.log(`    Valore: ${supabaseUrl.substring(0, 40)}...`)
  console.log(
    `    Progetto ID: ${supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'N/A'}`,
  )
}
console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Configurato' : '❌ Mancante'}`)
if (supabaseKey) {
  console.log(`    Valore: ${supabaseKey.substring(0, 30)}...`)
}

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Configurazione incompleta!')
  console.error(
    'Configura NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY nel file .env.local',
  )
  process.exit(1)
}

// 2. Test connessione
console.log('\n🔗 Test Connessione:')
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // Test 1: Verifica sessione
    console.log('  Test 1: Verifica sessione...')
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error(`    ❌ Errore: ${sessionError.message}`)
    } else {
      console.log(`    ✅ Sessione: ${session ? 'Attiva' : 'Nessuna sessione'}`)
      if (session?.user) {
        console.log(`    User ID: ${session.user.id}`)
        console.log(`    Email: ${session.user.email}`)
      }
    }

    // Test 2: Query semplice a profiles
    console.log('  Test 2: Query tabella profiles...')
    const { error: profilesError, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (profilesError) {
      console.error(`    ❌ Errore: ${profilesError.message}`)
      console.error(`    Code: ${profilesError.code || 'N/A'}`)
      console.error(`    Details: ${JSON.stringify(profilesError.details || {})}`)
      console.error(`    Hint: ${profilesError.hint || 'N/A'}`)
    } else {
      console.log(`    ✅ Connessione riuscita!`)
      console.log(`    Profili totali: ${count || 0}`)
    }

    // Test 3: Query con select completo (se c'è una sessione)
    if (session?.user) {
      console.log('  Test 3: Query profilo utente corrente...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          console.log(`    ⚠️ Profilo non trovato per utente ${session.user.id}`)
          console.log(`    💡 Il profilo dovrebbe essere creato automaticamente dal trigger`)
        } else {
          console.error(`    ❌ Errore: ${profileError.message}`)
          console.error(`    Code: ${profileError.code || 'N/A'}`)
        }
      } else if (profile) {
        console.log(`    ✅ Profilo trovato:`)
        console.log(`      - ID: ${profile.id}`)
        console.log(`      - Nome: ${profile.nome || 'N/A'} ${profile.cognome || 'N/A'}`)
        console.log(`      - Ruolo: ${profile.role || 'N/A'}`)
        console.log(`      - Stato: ${profile.stato || 'N/A'}`)
      }
    }

    // Test 4: Verifica RLS
    console.log('  Test 4: Verifica RLS policies...')
    const { error: rlsError } = await supabase
      .from('profiles')
      .select('id, user_id, email')
      .limit(1)

    if (rlsError) {
      if (rlsError.code === '42501' || rlsError.message?.includes('permission denied')) {
        console.log(`    ⚠️ Possibile problema RLS: ${rlsError.message}`)
      } else {
        console.error(`    ❌ Errore: ${rlsError.message}`)
      }
    } else {
      console.log(`    ✅ RLS policies funzionanti`)
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ Verifica completata!')
  } catch (error) {
    console.error('\n❌ Errore durante la verifica:', error)
    if (error instanceof Error) {
      console.error('  Message:', error.message)
      console.error('  Stack:', error.stack)
    }
  }
}

testConnection()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Errore fatale:', error)
    process.exit(1)
  })
