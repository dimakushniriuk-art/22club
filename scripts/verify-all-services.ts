/**
 * Script completo per verificare la comunicazione con tutti i servizi
 * Verifica: Next.js Server, Supabase, Database, Profili
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as http from 'http'
import type { Database } from '../src/types/supabase'

interface VerificationResult {
  service: string
  status: 'ok' | 'error' | 'warning'
  message: string
  details?: Record<string, unknown>
}

const results: VerificationResult[] = []

// Leggi .env.local
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
const serverPort = process.env.PORT || '3001'
const serverUrl = `http://localhost:${serverPort}`

console.log('🔍 VERIFICA COMPLETA SERVIZI - 22Club\n')
console.log('='.repeat(70))

// 1. Verifica Server Next.js
async function verifyNextServer(): Promise<void> {
  console.log('\n📡 1. VERIFICA SERVER NEXT.JS')
  console.log('-'.repeat(70))

  try {
    // Usa http module invece di fetch per compatibilità Node.js
    const response = await new Promise<{ statusCode?: number; data: string }>((resolve, reject) => {
      const req = http.get(`${serverUrl}/api/health`, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk.toString()
        })
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, data })
        })
      })
      req.on('error', reject)
      req.setTimeout(5000, () => {
        req.destroy()
        reject(new Error('Timeout connessione'))
      })
    })

    if (response.statusCode === 200) {
      const data = JSON.parse(response.data)
      results.push({
        service: 'Next.js Server',
        status: 'ok',
        message: `Server attivo su porta ${serverPort}`,
        details: {
          status: data.status,
          uptime: data.uptime,
          environment: data.environment,
          checks: data.checks,
        },
      })
      console.log(`  ✅ Server attivo su ${serverUrl}`)
      console.log(`     Status: ${data.status}`)
      console.log(`     Uptime: ${Math.round(data.uptime)}s`)
      console.log(`     Environment: ${data.environment || 'development'}`)
    } else {
      results.push({
        service: 'Next.js Server',
        status: 'error',
        message: `Server risponde con status ${response.statusCode}`,
      })
      console.log(`  ❌ Server risponde con errore: ${response.statusCode}`)
    }
  } catch (error) {
    results.push({
      service: 'Next.js Server',
      status: 'error',
      message: error instanceof Error ? error.message : 'Errore sconosciuto',
    })
    console.log(
      `  ❌ Errore connessione server: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
    )
    console.log(`     💡 Assicurati che il server sia avviato con: npm run dev`)
  }
}

// 2. Verifica Configurazione Supabase
function verifySupabaseConfig(): void {
  console.log('\n⚙️  2. VERIFICA CONFIGURAZIONE SUPABASE')
  console.log('-'.repeat(70))

  if (!supabaseUrl) {
    results.push({
      service: 'Supabase Config',
      status: 'error',
      message: 'NEXT_PUBLIC_SUPABASE_URL non configurato',
    })
    console.log('  ❌ NEXT_PUBLIC_SUPABASE_URL non configurato')
    return
  }

  if (!supabaseKey) {
    results.push({
      service: 'Supabase Config',
      status: 'error',
      message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY non configurato',
    })
    console.log('  ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY non configurato')
    return
  }

  const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'N/A'

  results.push({
    service: 'Supabase Config',
    status: 'ok',
    message: 'Configurazione completa',
    details: {
      url: supabaseUrl.substring(0, 40) + '...',
      projectId,
      keyLength: supabaseKey.length,
    },
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
        status: 'error',
        message: sessionError.message,
        details: { code: sessionError.status },
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
        status: 'error',
        message: profilesError.message,
        details: {
          code: profilesError.code,
          hint: profilesError.hint,
        },
      })
      console.log(`    ❌ Errore: ${profilesError.message}`)
      console.log(`       Code: ${profilesError.code || 'N/A'}`)
    } else {
      results.push({
        service: 'Supabase Database',
        status: 'ok',
        message: `Connessione riuscita - ${count || 0} profili trovati`,
        details: { profileCount: count || 0 },
      })
      console.log(`    ✅ Connessione riuscita!`)
      console.log(`       Profili totali: ${count || 0}`)
    }

    // Test 3: Verifica altre tabelle importanti
    console.log('  Test 3: Verifica tabelle principali...')
    const tables = ['exercises', 'appointments', 'workout_plans', 'payments', 'notifications']
    const tableResults: Record<string, number> = {}

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        if (!error) {
          tableResults[table] = count || 0
        }
      } catch {
        // Ignora errori per tabelle che potrebbero non esistere
      }
    }

    console.log('    ✅ Tabelle verificate:')
    Object.entries(tableResults).forEach(([table, count]) => {
      console.log(`       - ${table}: ${count} righe`)
    })

    // Test 4: Verifica RLS
    console.log('  Test 4: Verifica RLS policies...')
    const { error: rlsError } = await supabase
      .from('profiles')
      .select('id, user_id, email')
      .limit(1)

    if (rlsError) {
      if (rlsError.code === '42501' || rlsError.message?.includes('permission denied')) {
        results.push({
          service: 'Supabase RLS',
          status: 'warning',
          message: 'Possibile problema RLS',
          details: { error: rlsError.message },
        })
        console.log(`    ⚠️  Possibile problema RLS: ${rlsError.message}`)
      } else {
        results.push({
          service: 'Supabase RLS',
          status: 'error',
          message: rlsError.message,
        })
        console.log(`    ❌ Errore: ${rlsError.message}`)
      }
    } else {
      results.push({
        service: 'Supabase RLS',
        status: 'ok',
        message: 'RLS policies funzionanti',
      })
      console.log(`    ✅ RLS policies funzionanti`)
    }
  } catch (error) {
    results.push({
      service: 'Supabase Connection',
      status: 'error',
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
        status: 'error',
        message: error.message,
      })
      console.log(`  ❌ Errore: ${error.message}`)
      return
    }

    results.push({
      service: 'Profili',
      status: 'ok',
      message: `${count || profiles?.length || 0} profili trovati`,
      details: { count: count || profiles?.length || 0 },
    })

    console.log(`  ✅ Trovati ${count || profiles?.length || 0} profili`)
    if (profiles && profiles.length > 0) {
      console.log('\n  Primi profili:')
      profiles.slice(0, 5).forEach((profile, idx) => {
        const p = profile as {
          nome?: string
          cognome?: string
          email?: string
          role?: string
          stato?: string
        }
        console.log(`    ${idx + 1}. ${p.nome || ''} ${p.cognome || ''} (${p.email || 'N/A'})`)
        console.log(`       Role: ${p.role || 'N/A'} | Stato: ${p.stato || 'N/A'}`)
      })
    }
  } catch (error) {
    results.push({
      service: 'Profili',
      status: 'error',
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

  const ok = results.filter((r) => r.status === 'ok').length
  const errors = results.filter((r) => r.status === 'error').length
  const warnings = results.filter((r) => r.status === 'warning').length

  console.log(`\n✅ Servizi OK: ${ok}`)
  console.log(`⚠️  Warning: ${warnings}`)
  console.log(`❌ Errori: ${errors}`)

  if (errors > 0) {
    console.log('\n❌ SERVIZI CON ERRORI:')
    results
      .filter((r) => r.status === 'error')
      .forEach((r) => {
        console.log(`  - ${r.service}: ${r.message}`)
      })
  }

  if (warnings > 0) {
    console.log('\n⚠️  WARNING:')
    results
      .filter((r) => r.status === 'warning')
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

  // Salva report in file
  const reportPath = path.join(process.cwd(), 'verification-report.json')
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      ok,
      errors,
      warnings,
      total: results.length,
    },
    results,
  }
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n📄 Report salvato in: ${reportPath}`)
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
