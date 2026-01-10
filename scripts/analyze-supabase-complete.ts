/**
 * Script di Analisi Completa Supabase
 * Verifica allineamento tra progetto locale e database remoto
 * Genera report completo su: tabelle, migrazioni, RLS, funzioni, trigger, storage
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

console.log('🔍 ANALISI COMPLETA SUPABASE')
console.log('='.repeat(80))
console.log(`\n📡 Progetto: ${supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'N/A'}`)
console.log(`🔑 Anon Key: ${supabaseKey.substring(0, 20)}...`)
console.log(`🔐 Service Key: ${supabaseServiceKey ? '✅ Configurato' : '❌ Mancante'}\n`)

const supabase = createClient<Database>(supabaseUrl, supabaseKey)
const supabaseAdmin = supabaseServiceKey
  ? createClient<Database>(supabaseUrl, supabaseServiceKey)
  : null

interface AnalysisReport {
  timestamp: string
  projectId: string
  tables: TableInfo[]
  migrations: MigrationInfo[]
  rlsPolicies: RLSPolicyInfo[]
  functions: FunctionInfo[]
  triggers: TriggerInfo[]
  storageBuckets: StorageBucketInfo[]
  issues: Issue[]
  recommendations: string[]
}

interface TableInfo {
  name: string
  exists: boolean
  rowCount?: number
  columns?: string[]
  hasRLS?: boolean
}

interface MigrationInfo {
  name: string
  status: 'applied' | 'reverted' | 'unknown'
  existsLocal: boolean
  existsRemote: boolean
}

interface RLSPolicyInfo {
  table: string
  name: string
  exists: boolean
}

interface FunctionInfo {
  name: string
  exists: boolean
}

interface TriggerInfo {
  name: string
  table: string
  exists: boolean
}

interface StorageBucketInfo {
  name: string
  exists: boolean
  public: boolean
}

interface Issue {
  severity: 'critical' | 'warning' | 'info'
  category: string
  message: string
  fix?: string
}

const report: AnalysisReport = {
  timestamp: new Date().toISOString(),
  projectId: supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'unknown',
  tables: [],
  migrations: [],
  rlsPolicies: [],
  functions: [],
  triggers: [],
  storageBuckets: [],
  issues: [],
  recommendations: [],
}

// Lista tabelle attese dal progetto
const expectedTables = [
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
  'cliente_tags',
  'profiles_tags',
]

// Lista funzioni RPC attese
const expectedFunctions = [
  'get_clienti_stats',
  'get_payments_stats',
  'get_notifications_count',
  'get_chat_unread_count',
  'get_documents_count',
]

// Lista trigger attesi
const expectedTriggers = [
  { name: 'handle_new_user', table: 'auth.users' },
  { name: 'update_updated_at_column', table: 'profiles' },
]

// Lista storage buckets attesi
const expectedBuckets = [
  { name: 'documents', public: false },
  { name: 'exercise-videos', public: false },
  { name: 'progress-photos', public: false },
  { name: 'avatars', public: true },
]

async function analyzeTables() {
  console.log('\n📊 ANALISI TABELLE')
  console.log('-'.repeat(80))

  for (const tableName of expectedTables) {
    try {
      // Prova a fare una query per verificare se la tabella esiste
      const { error, count } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from(tableName as any)
        .select('*', { count: 'exact', head: true })

      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          report.tables.push({
            name: tableName,
            exists: false,
          })
          report.issues.push({
            severity: 'critical',
            category: 'database',
            message: `Tabella "${tableName}" non esiste nel database`,
            fix: `Eseguire migrazione per creare tabella ${tableName}`,
          })
          console.log(`  ❌ ${tableName}: NON ESISTE`)
        } else {
          // Errore RLS o altro
          report.tables.push({
            name: tableName,
            exists: true,
            hasRLS: error.code === '42501',
          })
          console.log(`  ⚠️  ${tableName}: Esiste (possibile problema RLS)`)
        }
      } else {
        report.tables.push({
          name: tableName,
          exists: true,
          rowCount: count || 0,
        })
        console.log(`  ✅ ${tableName}: Esiste (${count || 0} righe)`)
      }
    } catch {
      report.tables.push({
        name: tableName,
        exists: false,
      })
      console.log(`  ❌ ${tableName}: Errore verifica`)
    }
  }
}

async function analyzeMigrations() {
  console.log('\n📦 ANALISI MIGRAZIONI')
  console.log('-'.repeat(80))

  // Leggi migrazioni locali
  const migrationsPath = path.join(process.cwd(), 'supabase', 'migrations')
  const localMigrations: string[] = []

  if (fs.existsSync(migrationsPath)) {
    const files = fs.readdirSync(migrationsPath)
    localMigrations.push(
      ...files
        .filter((f) => f.endsWith('.sql'))
        .map((f) => f.replace('.sql', ''))
        .sort(),
    )
  }

  console.log(`  📁 Migrazioni locali trovate: ${localMigrations.length}`)

  // Verifica migrazioni remote (usando query diretta se possibile)
  // Nota: Questo richiede accesso alla tabella supabase_migrations
  // che potrebbe non essere accessibile con anon key
  if (supabaseAdmin) {
    try {
      const { data: remoteMigrations, error } = await supabaseAdmin
        .from('supabase_migrations')
        .select('name, version')
        .order('version', { ascending: true })

      if (!error && remoteMigrations) {
        console.log(`  ☁️  Migrazioni remote trovate: ${remoteMigrations.length}`)

        // Confronta
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const remoteNames = remoteMigrations.map((m: any) => m.name || m.version)
        const allMigrations = new Set([...localMigrations, ...remoteNames])

        for (const migration of allMigrations) {
          const existsLocal = localMigrations.includes(migration)
          const existsRemote = remoteNames.includes(migration)

          report.migrations.push({
            name: migration,
            status: existsRemote ? 'applied' : 'reverted',
            existsLocal,
            existsRemote,
          })

          if (existsLocal && !existsRemote) {
            report.issues.push({
              severity: 'warning',
              category: 'migrations',
              message: `Migrazione "${migration}" esiste localmente ma non è applicata`,
              fix: `Eseguire: npx supabase db push`,
            })
          } else if (!existsLocal && existsRemote) {
            report.issues.push({
              severity: 'info',
              category: 'migrations',
              message: `Migrazione "${migration}" applicata remotamente ma non esiste localmente`,
              fix: `Eseguire: npx supabase db pull o riparare con script repair-migrations`,
            })
          }
        }
      }
    } catch {
      console.log('  ⚠️  Impossibile verificare migrazioni remote (richiede service key)')
    }
  } else {
    console.log('  ⚠️  Service key non configurata - impossibile verificare migrazioni remote')
    report.issues.push({
      severity: 'warning',
      category: 'configuration',
      message: 'Service key non configurata - impossibile analisi completa migrazioni',
      fix: 'Aggiungere SUPABASE_SERVICE_ROLE_KEY in .env.local',
    })
  }
}

async function analyzeRLS() {
  console.log('\n🔒 ANALISI RLS POLICIES')
  console.log('-'.repeat(80))

  for (const table of report.tables.filter((t) => t.exists)) {
    try {
      // Prova a fare una query per verificare RLS
      const { error } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from(table.name as any)
        .select('*')
        .limit(1)

      if (error && error.code === '42501') {
        report.issues.push({
          severity: 'warning',
          category: 'rls',
          message: `Tabella "${table.name}" ha RLS attivo ma query fallisce`,
          fix: `Verificare policies RLS per tabella ${table.name}`,
        })
        console.log(`  ⚠️  ${table.name}: RLS attivo (possibile problema policies)`)
      } else {
        console.log(`  ✅ ${table.name}: RLS configurato correttamente`)
      }
    } catch {
      console.log(`  ❌ ${table.name}: Errore verifica RLS`)
    }
  }
}

async function analyzeFunctions() {
  console.log('\n⚙️  ANALISI FUNZIONI RPC')
  console.log('-'.repeat(80))

  for (const funcName of expectedFunctions) {
    try {
      // Prova a chiamare la funzione
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.rpc(funcName as any, {})

      if (error) {
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          report.functions.push({ name: funcName, exists: false })
          report.issues.push({
            severity: 'warning',
            category: 'functions',
            message: `Funzione RPC "${funcName}" non esiste`,
            fix: `Eseguire migrazione che crea funzione ${funcName}`,
          })
          console.log(`  ❌ ${funcName}: NON ESISTE`)
        } else {
          // Funzione esiste ma errore nei parametri (normale)
          report.functions.push({ name: funcName, exists: true })
          console.log(`  ✅ ${funcName}: Esiste`)
        }
      } else {
        report.functions.push({ name: funcName, exists: true })
        console.log(`  ✅ ${funcName}: Esiste`)
      }
    } catch {
      report.functions.push({ name: funcName, exists: false })
      console.log(`  ❌ ${funcName}: Errore verifica`)
    }
  }
}

async function analyzeTriggers() {
  console.log('\n🔔 ANALISI TRIGGER')
  console.log('-'.repeat(80))

  // Verifica trigger usando query SQL diretta se possibile
  if (supabaseAdmin) {
    for (const trigger of expectedTriggers) {
      try {
        const { data, error } = await supabaseAdmin.rpc('pg_get_triggerdef', {
          tgname: trigger.name,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)

        if (error || !data) {
          report.triggers.push({ name: trigger.name, table: trigger.table, exists: false })
          report.issues.push({
            severity: trigger.name === 'handle_new_user' ? 'critical' : 'warning',
            category: 'triggers',
            message: `Trigger "${trigger.name}" non esiste sulla tabella "${trigger.table}"`,
            fix: `Eseguire migrazione che crea trigger ${trigger.name}`,
          })
          console.log(`  ❌ ${trigger.name} (${trigger.table}): NON ESISTE`)
        } else {
          report.triggers.push({ name: trigger.name, table: trigger.table, exists: true })
          console.log(`  ✅ ${trigger.name} (${trigger.table}): Esiste`)
        }
      } catch {
        // Fallback: verifica indiretta
        console.log(`  ⚠️  ${trigger.name}: Verifica indiretta non disponibile`)
      }
    }
  } else {
    console.log('  ⚠️  Service key non configurata - impossibile verificare trigger')
  }
}

async function analyzeStorage() {
  console.log('\n💾 ANALISI STORAGE BUCKETS')
  console.log('-'.repeat(80))

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      console.log('  ❌ Errore nel recupero buckets:', error.message)
      return
    }

    const bucketNames = buckets?.map((b) => b.name) || []

    for (const expectedBucket of expectedBuckets) {
      const exists = bucketNames.includes(expectedBucket.name)
      report.storageBuckets.push({
        name: expectedBucket.name,
        exists,
        public: expectedBucket.public,
      })

      if (exists) {
        console.log(
          `  ✅ ${expectedBucket.name}: Esiste (${expectedBucket.public ? 'pubblico' : 'privato'})`,
        )
      } else {
        report.issues.push({
          severity: 'warning',
          category: 'storage',
          message: `Storage bucket "${expectedBucket.name}" non esiste`,
          fix: `Creare bucket "${expectedBucket.name}" nel dashboard Supabase`,
        })
        console.log(`  ❌ ${expectedBucket.name}: NON ESISTE`)
      }
    }
  } catch {
    console.log('  ❌ Errore analisi storage')
  }
}

async function generateRecommendations() {
  console.log('\n💡 RACCOMANDAZIONI')
  console.log('-'.repeat(80))

  const criticalIssues = report.issues.filter((i) => i.severity === 'critical')
  const warningIssues = report.issues.filter((i) => i.severity === 'warning')

  if (criticalIssues.length > 0) {
    report.recommendations.push(
      `⚠️  ${criticalIssues.length} problemi critici da risolvere immediatamente`,
    )
    criticalIssues.forEach((issue) => {
      console.log(`  🔴 ${issue.message}`)
      if (issue.fix) {
        console.log(`     💡 Fix: ${issue.fix}`)
      }
    })
  }

  if (warningIssues.length > 0) {
    report.recommendations.push(`⚠️  ${warningIssues.length} avvisi da verificare`)
    warningIssues.forEach((issue) => {
      console.log(`  🟡 ${issue.message}`)
      if (issue.fix) {
        console.log(`     💡 Fix: ${issue.fix}`)
      }
    })
  }

  // Verifica trigger profilo
  const triggerIssue = report.issues.find((i) => i.message.includes('handle_new_user'))
  if (triggerIssue) {
    report.recommendations.push(
      '🔴 PRIORITÀ ALTA: Applicare trigger handle_new_user() per creazione automatica profili',
    )
    report.recommendations.push('   Eseguire: docs/QUICK_APPLY_TRIGGER.sql nel dashboard Supabase')
  }

  // Verifica service key
  if (!supabaseServiceKey) {
    report.recommendations.push('⚠️  Configurare SUPABASE_SERVICE_ROLE_KEY per analisi completa')
  }

  // Verifica migrazioni
  const missingMigrations = report.migrations.filter((m) => m.existsLocal && !m.existsRemote)
  if (missingMigrations.length > 0) {
    report.recommendations.push(
      `📦 ${missingMigrations.length} migrazioni locali da applicare: npx supabase db push`,
    )
  }
}

async function saveReport() {
  const reportPath = path.join(process.cwd(), 'supabase-analysis-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n📄 Report salvato in: ${reportPath}`)
}

async function main() {
  try {
    await analyzeTables()
    await analyzeMigrations()
    await analyzeRLS()
    await analyzeFunctions()
    await analyzeTriggers()
    await analyzeStorage()
    await generateRecommendations()
    await saveReport()

    console.log('\n' + '='.repeat(80))
    console.log('✅ ANALISI COMPLETATA')
    console.log('='.repeat(80))

    const summary = {
      tabelle: {
        totali: expectedTables.length,
        esistenti: report.tables.filter((t) => t.exists).length,
        mancanti: report.tables.filter((t) => !t.exists).length,
      },
      funzioni: {
        totali: expectedFunctions.length,
        esistenti: report.functions.filter((f) => f.exists).length,
        mancanti: report.functions.filter((f) => !f.exists).length,
      },
      trigger: {
        totali: expectedTriggers.length,
        esistenti: report.triggers.filter((t) => t.exists).length,
        mancanti: report.triggers.filter((t) => !t.exists).length,
      },
      storage: {
        totali: expectedBuckets.length,
        esistenti: report.storageBuckets.filter((b) => b.exists).length,
        mancanti: report.storageBuckets.filter((b) => !b.exists).length,
      },
      problemi: {
        critici: report.issues.filter((i) => i.severity === 'critical').length,
        warning: report.issues.filter((i) => i.severity === 'warning').length,
        info: report.issues.filter((i) => i.severity === 'info').length,
      },
    }

    console.log('\n📊 RIEPILOGO:')
    console.log(JSON.stringify(summary, null, 2))
  } catch (error) {
    console.error('\n❌ Errore durante analisi:', error)
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
