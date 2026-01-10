/**
 * Script semplificato per verificare tutti i servizi
 * Usa solo moduli Node.js nativi
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as http from 'http'
import type { Database } from '../src/types/supabase'

const results: Array<{ service: string; status: string; message: string }> = []

// Leggi .env.local
const envPath = path.join(process.cwd(), '.env.local')
const envVars: Record<string, string> = {}

if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      envVars[key] = value
    }
  })
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serverPort = process.env.PORT || '3001'

console.log('🔍 VERIFICA COMPLETA SERVIZI - 22Club\n')
console.log('='.repeat(70))

// 1. Verifica Server Next.js
function verifyNextServer(): Promise<void> {
  return new Promise((resolve) => {
    console.log('\n📡 1. VERIFICA SERVER NEXT.JS')
    console.log('-'.repeat(70))

    const req = http.get(`http://localhost:${serverPort}/api/health`, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const health = JSON.parse(data)
            results.push({
              service: 'Next.js Server',
              status: '✅ OK',
              message: `Server attivo su porta ${serverPort}`,
            })
            console.log(`  ✅ Server attivo su http://localhost:${serverPort}`)
            console.log(`     Status: ${health.status}`)
            console.log(`     Uptime: ${Math.round(health.uptime)}s`)
            console.log(`     Environment: ${health.environment || 'development'}`)
          } catch {
            results.push({
              service: 'Next.js Server',
              status: '⚠️ WARNING',
              message: 'Risposta non valida',
            })
            console.log(`  ⚠️  Risposta non valida`)
          }
        } else {
          results.push({
            service: 'Next.js Server',
            status: '❌ ERROR',
            message: `Status ${res.statusCode}`,
          })
          console.log(`  ❌ Server risponde con errore: ${res.statusCode}`)
        }
        resolve()
      })
    })

    req.on('error', (error) => {
      results.push({
        service: 'Next.js Server',
        status: '❌ ERROR',
        message: error.message,
      })
      console.log(`  ❌ Errore connessione: ${error.message}`)
      console.log(`     💡 Assicurati che il server sia avviato con: npm run dev`)
      resolve()
    })

    req.setTimeout(5000, () => {
      req.destroy()
      results.push({
        service: 'Next.js Server',
        status: '❌ ERROR',
        message: 'Timeout connessione',
      })
      console.log(`  ❌ Timeout connessione`)
      resolve()
    })
  })
}

// 2. Verifica Configurazione Supabase
function verifySupabaseConfig(): void {
  console.log('\n⚙️  2. VERIFICA CONFIGURAZIONE SUPABASE')
  console.log('-'.repeat(70))

  if (!supabaseUrl) {
    results.push({
      service: 'Supabase Config',
      status: '❌ ERROR',
      message: 'NEXT_PUBLIC_SUPABASE_URL non configurato',
    })
    console.log('  ❌ NEXT_PUBLIC_SUPABASE_URL non configurato')
    return
  }

  if (!supabaseKey) {
    results.push({
      service: 'Supabase Config',
      status: '❌ ERROR',
      message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY non configurato',
    })
    console.log('  ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY non configurato')
    return
  }

  const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'N/A'

  results.push({
    service: 'Supabase Config',
    status: '✅ OK',
    message: 'Configurazione completa',
  })

  console.log('  ✅ Configurazione completa')
  console.log(`     URL: ${supabaseUrl.substring(0, 50)}...`)
  console.log(`     Project ID: ${projectId}`)
  console.log(`     Key: ${supabaseKey.substring(0, 30)}...`)
}

// 3. Verifica Connessione Supabase
async function verifySupabaseConnection(): Promise<void> {
  console.log('\n🔗 3. VERIFICA CONNESSIONE SUPABASE')
  console.log('-'.repeat(70))

  if (!supabaseUrl || !supabaseKey) {
    console.log('  ⚠️  Salto verifica: configurazione mancante')
    return
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey)

  try {
    // Test 1: Verifica sessione
    console.log('  Test 1: Verifica sessione...')
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      results.push({
        service: 'Supabase Auth',
        status: '❌ ERROR',
        message: sessionError.message,
      })
      console.log(`    ❌ Errore: ${sessionError.message}`)
    } else {
      console.log(`    ✅ Sessione: ${session ? 'Attiva' : 'Nessuna sessione'}`)
      if (session?.user) {
        console.log(`       User ID: ${session.user.id}`)
        console.log(`       Email: ${session.user.email}`)
      }
    }

    // Test 2: Query tabella profiles
    console.log('  Test 2: Query tabella profiles...')
    const { error: profilesError, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (profilesError) {
      results.push({
        service: 'Supabase Database',
        status: '❌ ERROR',
        message: profilesError.message,
      })
      console.log(`    ❌ Errore: ${profilesError.message}`)
      console.log(`       Code: ${profilesError.code || 'N/A'}`)
    } else {
      results.push({
        service: 'Supabase Database',
        status: '✅ OK',
        message: `Connessione riuscita - ${count || 0} profili trovati`,
      })
      console.log(`    ✅ Connessione riuscita!`)
      console.log(`       Profili totali: ${count || 0}`)
    }

    // Test 3: Verifica RLS
    console.log('  Test 3: Verifica RLS policies...')
    const { error: rlsError } = await supabase
      .from('profiles')
      .select('id, user_id, email')
      .limit(1)

    if (rlsError) {
      if (rlsError.code === '42501' || rlsError.message?.includes('permission denied')) {
        results.push({
          service: 'Supabase RLS',
          status: '⚠️ WARNING',
          message: 'Possibile problema RLS',
        })
        console.log(`    ⚠️  Possibile problema RLS: ${rlsError.message}`)
      } else {
        results.push({
          service: 'Supabase RLS',
          status: '❌ ERROR',
          message: rlsError.message,
        })
        console.log(`    ❌ Errore: ${rlsError.message}`)
      }
    } else {
      results.push({
        service: 'Supabase RLS',
        status: '✅ OK',
        message: 'RLS policies funzionanti',
      })
      console.log(`    ✅ RLS policies funzionanti`)
    }
  } catch (error) {
    results.push({
      service: 'Supabase Connection',
      status: '❌ ERROR',
      message: error instanceof Error ? error.message : 'Errore sconosciuto',
    })
    console.log(
      `  ❌ Errore durante la verifica: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
    )
  }
}

// 4. Verifica Profili
async function verifyProfiles(): Promise<void> {
  console.log('\n👥 4. VERIFICA PROFILI')
  console.log('-'.repeat(70))

  if (!supabaseUrl || !supabaseKey) {
    console.log('  ⚠️  Salto verifica: configurazione mancante')
    return
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey)

  try {
    const {
      data: profiles,
      error,
      count,
    } = await supabase
      .from('profiles')
      .select('id, user_id, email, nome, cognome, role, stato')
      .limit(10)

    if (error) {
      results.push({
        service: 'Profili',
        status: '❌ ERROR',
        message: error.message,
      })
      console.log(`  ❌ Errore: ${error.message}`)
      return
    }

    results.push({
      service: 'Profili',
      status: '✅ OK',
      message: `${count || profiles?.length || 0} profili trovati`,
    })

    console.log(`  ✅ Trovati ${count || profiles?.length || 0} profili`)
    if (profiles && profiles.length > 0) {
      console.log('\n  Primi profili:')
      profiles.slice(0, 5).forEach((profile, idx) => {
        console.log(
          `    ${idx + 1}. ${profile.nome || ''} ${profile.cognome || ''} (${profile.email || 'N/A'})`,
        )
        console.log(`       Role: ${profile.role || 'N/A'} | Stato: ${profile.stato || 'N/A'}`)
      })
    }
  } catch (error) {
    results.push({
      service: 'Profili',
      status: '❌ ERROR',
      message: error instanceof Error ? error.message : 'Errore sconosciuto',
    })
    console.log(`  ❌ Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`)
  }
}

// Report finale
function printFinalReport(): void {
  console.log('\n' + '='.repeat(70))
  console.log('📊 REPORT FINALE')
  console.log('='.repeat(70))

  const ok = results.filter((r) => r.status.includes('✅')).length
  const errors = results.filter((r) => r.status.includes('❌')).length
  const warnings = results.filter((r) => r.status.includes('⚠️')).length

  console.log(`\n✅ Servizi OK: ${ok}`)
  console.log(`⚠️  Warning: ${warnings}`)
  console.log(`❌ Errori: ${errors}`)

  if (errors > 0) {
    console.log('\n❌ SERVIZI CON ERRORI:')
    results
      .filter((r) => r.status.includes('❌'))
      .forEach((r) => {
        console.log(`  - ${r.service}: ${r.message}`)
      })
  }

  if (warnings > 0) {
    console.log('\n⚠️  WARNING:')
    results
      .filter((r) => r.status.includes('⚠️'))
      .forEach((r) => {
        console.log(`  - ${r.service}: ${r.message}`)
      })
  }

  console.log('\n' + '='.repeat(70))
  if (errors === 0) {
    console.log('✅ TUTTI I SERVIZI FUNZIONANO CORRETTAMENTE!')
  } else {
    console.log('⚠️  ALCUNI SERVIZI RICHIEDONO ATTENZIONE')
  }
  console.log('='.repeat(70))
}

// Esegui tutte le verifiche
async function main() {
  await verifyNextServer()
  verifySupabaseConfig()
  await verifySupabaseConnection()
  await verifyProfiles()
  printFinalReport()
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Errore fatale:', error)
    process.exit(1)
  })
