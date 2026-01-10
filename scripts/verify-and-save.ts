/**
 * Script per verificare tutti i servizi e salvare i risultati in un file JSON
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
  timestamp: string
}

const results: VerificationResult[] = []
const reportPath = path.join(process.cwd(), 'verification-results.json')

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

// 1. Verifica Server Next.js
function verifyNextServer(): Promise<void> {
  return new Promise((resolve) => {
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
              status: 'ok',
              message: `Server attivo su porta ${serverPort}`,
              details: {
                status: health.status,
                uptime: health.uptime,
                environment: health.environment,
              },
              timestamp: new Date().toISOString(),
            })
            console.log(`✅ Server Next.js: OK`)
          } catch {
            results.push({
              service: 'Next.js Server',
              status: 'error',
              message: 'Risposta non valida',
              timestamp: new Date().toISOString(),
            })
            console.log(`❌ Server Next.js: Risposta non valida`)
          }
        } else {
          results.push({
            service: 'Next.js Server',
            status: 'error',
            message: `Status ${res.statusCode}`,
            timestamp: new Date().toISOString(),
          })
          console.log(`❌ Server Next.js: Status ${res.statusCode}`)
        }
        resolve()
      })
    })

    req.on('error', (error) => {
      results.push({
        service: 'Next.js Server',
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString(),
      })
      console.log(`❌ Server Next.js: ${error.message}`)
      resolve()
    })

    req.setTimeout(5000, () => {
      req.destroy()
      results.push({
        service: 'Next.js Server',
        status: 'error',
        message: 'Timeout connessione',
        timestamp: new Date().toISOString(),
      })
      console.log(`❌ Server Next.js: Timeout`)
      resolve()
    })
  })
}

// 2. Verifica Configurazione Supabase
function verifySupabaseConfig(): void {
  if (!supabaseUrl || supabaseUrl.includes('your_supabase')) {
    results.push({
      service: 'Supabase Config',
      status: 'error',
      message: 'NEXT_PUBLIC_SUPABASE_URL non configurato',
      timestamp: new Date().toISOString(),
    })
    console.log(`❌ Supabase Config: URL non configurato`)
    return
  }

  if (!supabaseKey || supabaseKey.includes('your_supabase')) {
    results.push({
      service: 'Supabase Config',
      status: 'error',
      message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY non configurato',
      timestamp: new Date().toISOString(),
    })
    console.log(`❌ Supabase Config: Key non configurata`)
    return
  }

  const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'N/A'

  results.push({
    service: 'Supabase Config',
    status: 'ok',
    message: 'Configurazione completa',
    details: { projectId },
    timestamp: new Date().toISOString(),
  })
  console.log(`✅ Supabase Config: OK (Project: ${projectId})`)
}

// 3. Verifica Connessione Supabase
async function verifySupabaseConnection(): Promise<void> {
  if (!supabaseUrl || !supabaseKey) {
    console.log(`⚠️  Supabase Connection: Salto (config mancante)`)
    return
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey)

  try {
    // Test sessione
    const { error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      results.push({
        service: 'Supabase Auth',
        status: 'error',
        message: sessionError.message,
        timestamp: new Date().toISOString(),
      })
      console.log(`❌ Supabase Auth: ${sessionError.message}`)
    } else {
      console.log(`✅ Supabase Auth: OK`)
    }

    // Test database
    const { error: profilesError, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (profilesError) {
      results.push({
        service: 'Supabase Database',
        status: 'error',
        message: profilesError.message,
        details: { code: profilesError.code },
        timestamp: new Date().toISOString(),
      })
      console.log(`❌ Supabase Database: ${profilesError.message}`)
    } else {
      results.push({
        service: 'Supabase Database',
        status: 'ok',
        message: `Connessione riuscita - ${count || 0} profili`,
        details: { profileCount: count || 0 },
        timestamp: new Date().toISOString(),
      })
      console.log(`✅ Supabase Database: OK (${count || 0} profili)`)
    }

    // Test RLS
    const { error: rlsError } = await supabase
      .from('profiles')
      .select('id, user_id, email')
      .limit(1)

    if (rlsError) {
      if (rlsError.code === '42501') {
        results.push({
          service: 'Supabase RLS',
          status: 'warning',
          message: 'Possibile problema RLS',
          timestamp: new Date().toISOString(),
        })
        console.log(`⚠️  Supabase RLS: Possibile problema`)
      } else {
        results.push({
          service: 'Supabase RLS',
          status: 'error',
          message: rlsError.message,
          timestamp: new Date().toISOString(),
        })
        console.log(`❌ Supabase RLS: ${rlsError.message}`)
      }
    } else {
      results.push({
        service: 'Supabase RLS',
        status: 'ok',
        message: 'RLS policies funzionanti',
        timestamp: new Date().toISOString(),
      })
      console.log(`✅ Supabase RLS: OK`)
    }
  } catch (error) {
    results.push({
      service: 'Supabase Connection',
      status: 'error',
      message: error instanceof Error ? error.message : 'Errore sconosciuto',
      timestamp: new Date().toISOString(),
    })
    console.log(`❌ Supabase Connection: Errore`)
  }
}

// Report finale
function saveReport(): void {
  const ok = results.filter((r) => r.status === 'ok').length
  const errors = results.filter((r) => r.status === 'error').length
  const warnings = results.filter((r) => r.status === 'warning').length

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      ok,
      errors,
      warnings,
    },
    results,
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n📄 Report salvato in: ${reportPath}`)
  console.log(`\n📊 Riepilogo:`)
  console.log(`   ✅ OK: ${ok}`)
  console.log(`   ⚠️  Warning: ${warnings}`)
  console.log(`   ❌ Errori: ${errors}`)
}

// Esegui verifiche
async function main() {
  await verifyNextServer()
  verifySupabaseConfig()
  await verifySupabaseConnection()
  saveReport()
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Errore fatale:', error)
    process.exit(1)
  })
