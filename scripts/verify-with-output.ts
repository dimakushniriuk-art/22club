/**
 * Script per verificare tutti i servizi con output diretto su file
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as http from 'http'
import type { Database } from '../src/types/supabase'

const output: string[] = []
const results: Array<{ service: string; status: string; message: string }> = []

function log(message: string) {
  console.log(message)
  output.push(message)
}

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

log('🔍 VERIFICA COMPLETA SERVIZI - 22Club\n')
log('='.repeat(70))

// 1. Verifica Server Next.js
function verifyNextServer(): Promise<void> {
  return new Promise((resolve) => {
    log('\n📡 1. VERIFICA SERVER NEXT.JS')
    log('-'.repeat(70))

    const req = http.get(`http://localhost:${serverPort}/api/health`, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk.toString()
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
            log(`  ✅ Server attivo su http://localhost:${serverPort}`)
            log(`     Status: ${health.status}`)
            log(`     Uptime: ${Math.round(health.uptime)}s`)
            log(`     Environment: ${health.environment || 'development'}`)
          } catch {
            results.push({
              service: 'Next.js Server',
              status: '❌ ERROR',
              message: 'Risposta non valida',
            })
            log(`  ❌ Risposta non valida`)
          }
        } else {
          results.push({
            service: 'Next.js Server',
            status: '❌ ERROR',
            message: `Status ${res.statusCode}`,
          })
          log(`  ❌ Server risponde con errore: ${res.statusCode}`)
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
      log(`  ❌ Errore connessione: ${error.message}`)
      log(`     💡 Assicurati che il server sia avviato con: npm run dev`)
      resolve()
    })

    req.setTimeout(5000, () => {
      req.destroy()
      results.push({
        service: 'Next.js Server',
        status: '❌ ERROR',
        message: 'Timeout connessione',
      })
      log(`  ❌ Timeout connessione`)
      resolve()
    })
  })
}

// 2. Verifica Configurazione Supabase
function verifySupabaseConfig(): void {
  log('\n⚙️  2. VERIFICA CONFIGURAZIONE SUPABASE')
  log('-'.repeat(70))

  if (!supabaseUrl || supabaseUrl.includes('your_supabase')) {
    results.push({
      service: 'Supabase Config',
      status: '❌ ERROR',
      message: 'NEXT_PUBLIC_SUPABASE_URL non configurato',
    })
    log('  ❌ NEXT_PUBLIC_SUPABASE_URL non configurato')
    return
  }

  if (!supabaseKey || supabaseKey.includes('your_supabase')) {
    results.push({
      service: 'Supabase Config',
      status: '❌ ERROR',
      message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY non configurato',
    })
    log('  ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY non configurato')
    return
  }

  const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'N/A'

  results.push({
    service: 'Supabase Config',
    status: '✅ OK',
    message: 'Configurazione completa',
  })

  log('  ✅ Configurazione completa')
  log(`     URL: ${supabaseUrl.substring(0, 50)}...`)
  log(`     Project ID: ${projectId}`)
  log(`     Key: ${supabaseKey.substring(0, 30)}...`)
}

// 3. Verifica Connessione Supabase
async function verifySupabaseConnection(): Promise<void> {
  log('\n🔗 3. VERIFICA CONNESSIONE SUPABASE')
  log('-'.repeat(70))

  if (!supabaseUrl || !supabaseKey) {
    log('  ⚠️  Salto verifica: configurazione mancante')
    return
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey)

  try {
    // Test 1: Verifica sessione
    log('  Test 1: Verifica sessione...')
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
      log(`    ❌ Errore: ${sessionError.message}`)
    } else {
      log(`    ✅ Sessione: ${session ? 'Attiva' : 'Nessuna sessione'}`)
      if (session?.user) {
        log(`       User ID: ${session.user.id}`)
        log(`       Email: ${session.user.email}`)
      }
    }

    // Test 2: Query tabella profiles
    log('  Test 2: Query tabella profiles...')
    const { error: profilesError, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (profilesError) {
      results.push({
        service: 'Supabase Database',
        status: '❌ ERROR',
        message: profilesError.message,
      })
      log(`    ❌ Errore: ${profilesError.message}`)
      log(`       Code: ${profilesError.code || 'N/A'}`)
      if (profilesError.hint) {
        log(`       Hint: ${profilesError.hint}`)
      }
      if (profilesError.details) {
        log(`       Details: ${JSON.stringify(profilesError.details)}`)
      }
    } else {
      results.push({
        service: 'Supabase Database',
        status: '✅ OK',
        message: `Connessione riuscita - ${count || 0} profili trovati`,
      })
      log(`    ✅ Connessione riuscita!`)
      log(`       Profili totali: ${count || 0}`)
    }

    // Test 3: Verifica RLS
    log('  Test 3: Verifica RLS policies...')
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
        log(`    ⚠️  Possibile problema RLS: ${rlsError.message}`)
      } else {
        results.push({
          service: 'Supabase RLS',
          status: '❌ ERROR',
          message: rlsError.message,
        })
        log(`    ❌ Errore: ${rlsError.message}`)
      }
    } else {
      results.push({
        service: 'Supabase RLS',
        status: '✅ OK',
        message: 'RLS policies funzionanti',
      })
      log(`    ✅ RLS policies funzionanti`)
    }
  } catch (error) {
    results.push({
      service: 'Supabase Connection',
      status: '❌ ERROR',
      message: error instanceof Error ? error.message : 'Errore sconosciuto',
    })
    log(
      `  ❌ Errore durante la verifica: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
    )
    if (error instanceof Error && error.stack) {
      log(`     Stack: ${error.stack}`)
    }
  }
}

// 4. Verifica Profili
async function verifyProfiles(): Promise<void> {
  log('\n👥 4. VERIFICA PROFILI')
  log('-'.repeat(70))

  if (!supabaseUrl || !supabaseKey) {
    log('  ⚠️  Salto verifica: configurazione mancante')
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
      log(`  ❌ Errore: ${error.message}`)
      if (error.code) {
        log(`     Code: ${error.code}`)
      }
      return
    }

    results.push({
      service: 'Profili',
      status: '✅ OK',
      message: `${count || profiles?.length || 0} profili trovati`,
    })

    log(`  ✅ Trovati ${count || profiles?.length || 0} profili`)
    if (profiles && profiles.length > 0) {
      log('\n  Primi profili:')
      profiles.slice(0, 5).forEach((profile, idx) => {
        log(
          `    ${idx + 1}. ${profile.nome || ''} ${profile.cognome || ''} (${profile.email || 'N/A'})`,
        )
        log(`       Role: ${profile.role || 'N/A'} | Stato: ${profile.stato || 'N/A'}`)
      })
    }
  } catch (error) {
    results.push({
      service: 'Profili',
      status: '❌ ERROR',
      message: error instanceof Error ? error.message : 'Errore sconosciuto',
    })
    log(`  ❌ Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`)
    if (error instanceof Error && error.stack) {
      log(`     Stack: ${error.stack}`)
    }
  }
}

// Report finale
function printFinalReport(): void {
  log('\n' + '='.repeat(70))
  log('📊 REPORT FINALE')
  log('='.repeat(70))

  const ok = results.filter((r) => r.status.includes('✅')).length
  const errors = results.filter((r) => r.status.includes('❌')).length
  const warnings = results.filter((r) => r.status.includes('⚠️')).length

  log(`\n✅ Servizi OK: ${ok}`)
  log(`⚠️  Warning: ${warnings}`)
  log(`❌ Errori: ${errors}`)

  if (errors > 0) {
    log('\n❌ SERVIZI CON ERRORI:')
    results
      .filter((r) => r.status.includes('❌'))
      .forEach((r) => {
        log(`  - ${r.service}: ${r.message}`)
      })
  }

  if (warnings > 0) {
    log('\n⚠️  WARNING:')
    results
      .filter((r) => r.status.includes('⚠️'))
      .forEach((r) => {
        log(`  - ${r.service}: ${r.message}`)
      })
  }

  log('\n' + '='.repeat(70))
  if (errors === 0) {
    log('✅ TUTTI I SERVIZI FUNZIONANO CORRETTAMENTE!')
  } else {
    log('⚠️  ALCUNI SERVIZI RICHIEDONO ATTENZIONE')
  }
  log('='.repeat(70))

  // Salva output in file
  const outputPath = path.join(process.cwd(), 'verification-output.txt')
  fs.writeFileSync(outputPath, output.join('\n'))
  log(`\n📄 Output salvato in: ${outputPath}`)
}

// Esegui tutte le verifiche
async function main() {
  try {
    await verifyNextServer()
    verifySupabaseConfig()
    await verifySupabaseConnection()
    await verifyProfiles()
    printFinalReport()
  } catch (error) {
    log(`\n❌ Errore fatale: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`)
    if (error instanceof Error && error.stack) {
      log(`Stack: ${error.stack}`)
    }
    printFinalReport()
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
