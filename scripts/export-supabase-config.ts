#!/usr/bin/env tsx
/**
 * Script per esportare la configurazione completa di Supabase
 * Interroga direttamente il database e genera file di configurazione
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Carica variabili d'ambiente
function loadEnv() {
  try {
    const envPath = join(projectRoot, 'env.local')
    const envContent = readFileSync(envPath, 'utf-8')
    const env: Record<string, string> = {}

    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=').replace(/^["']|["']$/g, '')
        env[key.trim()] = value.trim()
      }
    })

    return env
  } catch (error) {
    console.error('Errore nel caricamento env.local:', error)
    process.exit(1)
  }
}

const env = loadEnv()

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Variabili d'ambiente mancanti!")
  console.error('Richiesto: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Crea client Supabase con service role key (bypassa RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

interface TableInfo {
  table_name: string
  table_schema: string
  table_type: string
}

interface ColumnInfo {
  table_name: string
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
  character_maximum_length: number | null
  numeric_precision: number | null
  numeric_scale: number | null
}

interface ConstraintInfo {
  constraint_name: string
  table_name: string
  constraint_type: string
  column_name: string | null
  foreign_table_name: string | null
  foreign_column_name: string | null
}

interface IndexInfo {
  indexname: string
  tablename: string
  indexdef: string
}

interface FunctionInfo {
  routine_name: string
  routine_schema: string
  routine_type: string
  data_type: string
  routine_definition: string
}

interface TriggerInfo {
  trigger_name: string
  event_manipulation: string
  event_object_table: string
  action_statement: string
  action_timing: string
}

interface PolicyInfo {
  schemaname: string
  tablename: string
  policyname: string
  permissive: string
  roles: string[]
  cmd: string
  qual: string | null
  with_check: string | null
}

interface ViewInfo {
  table_name: string
  view_definition: string
}

interface ExtensionInfo {
  extname: string
  extversion: string
}

interface StorageBucket {
  id: string
  name: string
  public: boolean
  file_size_limit: number | null
  allowed_mime_types: string[] | null
  created_at: string
  updated_at: string
}

/**
 * Esegue una query SQL e restituisce i risultati
 * @deprecated Non usato al momento, mantenuto per uso futuro
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function querySQL<T>(_sql: string): Promise<T[]> {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
    // Se la funzione exec_sql non esiste, usa direttamente la query
    // Nota: Supabase non supporta query SQL dirette via JS client
    // Dobbiamo usare le API disponibili o creare funzioni helper
    return { data: null, error: { message: 'Metodo non supportato direttamente' } }
  })

  if (error) {
    console.warn(`⚠️  Query fallita (potrebbe essere normale): ${error.message}`)
    return []
  }

  return (data as T[]) || []
}

/**
 * Ottiene tutte le tabelle del database
 * @deprecated Non usato al momento, mantenuto per uso futuro
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getTables(): Promise<TableInfo[]> {
  // SQL query commentata (non usata al momento)
  // const sql = `
  //   SELECT
  //     table_name,
  //     table_schema,
  //     table_type
  //   FROM information_schema.tables
  //   WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  //     AND table_schema NOT LIKE 'pg_%'
  //   ORDER BY table_schema, table_name;
  // `

  // Usiamo una query diretta tramite REST API se possibile
  // Altrimenti usiamo le funzioni helper del database
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema, table_type')
      .neq('table_schema', 'pg_catalog')
      .neq('table_schema', 'information_schema')

    if (!error && data) {
      return data as TableInfo[]
    }
  } catch {
    // Fallback: usa una funzione SQL custom se disponibile
  }

  // Prova a usare una funzione helper se esiste
  const { data, error } = await supabase.rpc('get_all_tables').catch(() => ({
    data: null,
    error: { message: 'Funzione non disponibile' },
  }))

  if (error || !data) {
    console.warn('⚠️  Impossibile ottenere tabelle direttamente. Useremo metodo alternativo.')
    return []
  }

  return data as TableInfo[]
}

/**
 * Ottiene tutte le colonne delle tabelle
 * @deprecated Non usato al momento, mantenuto per uso futuro
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getColumns(): Promise<ColumnInfo[]> {
  // Prova funzione helper
  const { data, error } = await supabase.rpc('get_all_columns').catch(() => ({
    data: null,
    error: { message: 'Funzione non disponibile' },
  }))

  if (!error && data) {
    return data as ColumnInfo[]
  }

  return []
}

/**
 * Ottiene tutti i constraint (foreign keys, primary keys, etc.)
 * @deprecated Non usato al momento, mantenuto per uso futuro
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getConstraints(): Promise<ConstraintInfo[]> {
  const { data, error } = await supabase.rpc('get_all_constraints').catch(() => ({
    data: null,
    error: { message: 'Funzione non disponibile' },
  }))

  if (!error && data) {
    return data as ConstraintInfo[]
  }

  return []
}

/**
 * Ottiene tutti gli indici
 * @deprecated Non usato al momento, mantenuto per uso futuro
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getIndexes(): Promise<IndexInfo[]> {
  const { data, error } = await supabase.rpc('get_all_indexes').catch(() => ({
    data: null,
    error: { message: 'Funzione non disponibile' },
  }))

  if (!error && data) {
    return data as IndexInfo[]
  }

  return []
}

/**
 * Ottiene tutte le funzioni/stored procedures
 * @deprecated Non usato al momento, mantenuto per uso futuro
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getFunctions(): Promise<FunctionInfo[]> {
  const { data, error } = await supabase.rpc('get_all_functions').catch(() => ({
    data: null,
    error: { message: 'Funzione non disponibile' },
  }))

  if (!error && data) {
    return data as FunctionInfo[]
  }

  return []
}

/**
 * Ottiene tutti i trigger
 * @deprecated Non usato al momento, mantenuto per uso futuro
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getTriggers(): Promise<TriggerInfo[]> {
  const { data, error } = await supabase.rpc('get_all_triggers').catch(() => ({
    data: null,
    error: { message: 'Funzione non disponibile' },
  }))

  if (!error && data) {
    return data as TriggerInfo[]
  }

  return []
}

/**
 * Ottiene tutte le politiche RLS
 * @deprecated Non usato al momento, mantenuto per uso futuro
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getRLSPolicies(): Promise<PolicyInfo[]> {
  const { data, error } = await supabase.rpc('get_all_rls_policies').catch(() => ({
    data: null,
    error: { message: 'Funzione non disponibile' },
  }))

  if (!error && data) {
    return data as PolicyInfo[]
  }

  return []
}

/**
 * Ottiene tutte le viste
 * @deprecated Non usato al momento, mantenuto per uso futuro
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getViews(): Promise<ViewInfo[]> {
  const { data, error } = await supabase.rpc('get_all_views').catch(() => ({
    data: null,
    error: { message: 'Funzione non disponibile' },
  }))

  if (!error && data) {
    return data as ViewInfo[]
  }

  return []
}

/**
 * Ottiene tutte le estensioni
 * @deprecated Non usato al momento, mantenuto per uso futuro
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getExtensions(): Promise<ExtensionInfo[]> {
  const { data, error } = await supabase.rpc('get_all_extensions').catch(() => ({
    data: null,
    error: { message: 'Funzione non disponibile' },
  }))

  if (!error && data) {
    return data as ExtensionInfo[]
  }

  return []
}

/**
 * Ottiene tutti i bucket di storage
 */
async function getStorageBuckets(): Promise<StorageBucket[]> {
  const { data, error } = await supabase.storage.listBuckets()

  if (error) {
    console.warn(`⚠️  Errore nel recupero bucket storage: ${error.message}`)
    return []
  }

  return (data || []).map((bucket) => ({
    id: bucket.id,
    name: bucket.name,
    public: bucket.public,
    file_size_limit: bucket.file_size_limit,
    allowed_mime_types: bucket.allowed_mime_types || null,
    created_at: bucket.created_at || '',
    updated_at: bucket.updated_at || '',
  }))
}

/**
 * Crea le funzioni helper SQL necessarie per interrogare il database
 */
async function createHelperFunctions(): Promise<void> {
  const helperSQL = `
    -- Funzione per ottenere tutte le tabelle
    CREATE OR REPLACE FUNCTION get_all_tables()
    RETURNS TABLE (
      table_name text,
      table_schema text,
      table_type text
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        t.table_name::text,
        t.table_schema::text,
        t.table_type::text
      FROM information_schema.tables t
      WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        AND t.table_schema NOT LIKE 'pg_%'
      ORDER BY t.table_schema, t.table_name;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Funzione per ottenere tutte le colonne
    CREATE OR REPLACE FUNCTION get_all_columns()
    RETURNS TABLE (
      table_name text,
      column_name text,
      data_type text,
      is_nullable text,
      column_default text,
      character_maximum_length integer,
      numeric_precision integer,
      numeric_scale integer
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        c.table_name::text,
        c.column_name::text,
        c.data_type::text,
        c.is_nullable::text,
        c.column_default::text,
        c.character_maximum_length::integer,
        c.numeric_precision::integer,
        c.numeric_scale::integer
      FROM information_schema.columns c
      WHERE c.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        AND c.table_schema NOT LIKE 'pg_%'
      ORDER BY c.table_schema, c.table_name, c.ordinal_position;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Funzione per ottenere tutti i constraint
    CREATE OR REPLACE FUNCTION get_all_constraints()
    RETURNS TABLE (
      constraint_name text,
      table_name text,
      constraint_type text,
      column_name text,
      foreign_table_name text,
      foreign_column_name text
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        tc.constraint_name::text,
        tc.table_name::text,
        tc.constraint_type::text,
        kcu.column_name::text,
        ccu.table_name::text AS foreign_table_name,
        ccu.column_name::text AS foreign_column_name
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        AND tc.table_schema NOT LIKE 'pg_%'
      ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Funzione per ottenere tutti gli indici
    CREATE OR REPLACE FUNCTION get_all_indexes()
    RETURNS TABLE (
      indexname text,
      tablename text,
      indexdef text
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        i.indexname::text,
        t.tablename::text,
        pg_get_indexdef(i.indexrelid)::text AS indexdef
      FROM pg_indexes i
      JOIN pg_tables t ON i.tablename = t.tablename AND i.schemaname = t.schemaname
      WHERE i.schemaname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        AND i.schemaname NOT LIKE 'pg_%'
      ORDER BY i.schemaname, i.tablename, i.indexname;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Funzione per ottenere tutte le funzioni
    CREATE OR REPLACE FUNCTION get_all_functions()
    RETURNS TABLE (
      routine_name text,
      routine_schema text,
      routine_type text,
      data_type text,
      routine_definition text
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        r.routine_name::text,
        r.routine_schema::text,
        r.routine_type::text,
        r.data_type::text,
        pg_get_functiondef(p.oid)::text AS routine_definition
      FROM information_schema.routines r
      LEFT JOIN pg_proc p ON p.proname = r.routine_name
      LEFT JOIN pg_namespace n ON n.oid = p.pronamespace AND n.nspname = r.routine_schema
      WHERE r.routine_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        AND r.routine_schema NOT LIKE 'pg_%'
      ORDER BY r.routine_schema, r.routine_name;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Funzione per ottenere tutti i trigger
    CREATE OR REPLACE FUNCTION get_all_triggers()
    RETURNS TABLE (
      trigger_name text,
      event_manipulation text,
      event_object_table text,
      action_statement text,
      action_timing text
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        t.trigger_name::text,
        t.event_manipulation::text,
        t.event_object_table::text,
        t.action_statement::text,
        t.action_timing::text
      FROM information_schema.triggers t
      WHERE t.trigger_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        AND t.trigger_schema NOT LIKE 'pg_%'
      ORDER BY t.event_object_table, t.trigger_name;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Funzione per ottenere tutte le politiche RLS
    CREATE OR REPLACE FUNCTION get_all_rls_policies()
    RETURNS TABLE (
      schemaname text,
      tablename text,
      policyname text,
      permissive text,
      roles text[],
      cmd text,
      qual text,
      with_check text
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        schemaname::text,
        tablename::text,
        policyname::text,
        permissive::text,
        roles::text[],
        cmd::text,
        qual::text,
        with_check::text
      FROM pg_policies
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        AND schemaname NOT LIKE 'pg_%'
      ORDER BY schemaname, tablename, policyname;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Funzione per ottenere tutte le viste
    CREATE OR REPLACE FUNCTION get_all_views()
    RETURNS TABLE (
      table_name text,
      view_definition text
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        v.table_name::text,
        v.view_definition::text
      FROM information_schema.views v
      WHERE v.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        AND v.table_schema NOT LIKE 'pg_%'
      ORDER BY v.table_schema, v.table_name;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Funzione per ottenere tutte le estensioni
    CREATE OR REPLACE FUNCTION get_all_extensions()
    RETURNS TABLE (
      extname text,
      extversion text
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        e.extname::text,
        e.extversion::text
      FROM pg_extension e
      ORDER BY e.extname;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `

  // Esegui le funzioni helper tramite una migrazione SQL
  // Nota: Non possiamo eseguire SQL diretto via JS client
  // Le funzioni devono essere create manualmente o tramite migrazione
  console.log('📝 Funzioni helper SQL da creare:')
  console.log('   Le funzioni helper devono essere create manualmente nel database.')
  console.log('   Salvo il SQL in supabase-config-helper-functions.sql')

  const outputDir = join(projectRoot, 'supabase-config-export')
  mkdirSync(outputDir, { recursive: true })
  writeFileSync(join(outputDir, 'helper-functions.sql'), helperSQL, 'utf-8')
}

/**
 * Metodo alternativo: usa le API REST di Supabase per ottenere informazioni
 */
async function exportConfigAlternative(): Promise<void> {
  console.log('🔍 Interrogazione Supabase in corso...\n')

  const outputDir = join(projectRoot, 'supabase-config-export')
  mkdirSync(outputDir, { recursive: true })

  type StorageBucket = {
    id: string
    name: string
    public?: boolean
    file_size_limit?: number | null
    allowed_mime_types?: string[] | null
  }
  type ConfigExport = {
    metadata: {
      exported_at: string
      supabase_url: string
      project_id: string
    }
    storage: {
      buckets: StorageBucket[]
    }
    database: {
      note: string
    }
  }
  const config: ConfigExport = {
    metadata: {
      exported_at: new Date().toISOString(),
      supabase_url: SUPABASE_URL,
      project_id: SUPABASE_URL.split('//')[1]?.split('.')[0] || 'unknown',
    },
    storage: {
      buckets: [],
    },
    database: {
      note: 'Per ottenere lo schema completo del database, esegui le funzioni helper SQL create in helper-functions.sql',
    },
  }

  // Ottieni bucket storage
  console.log('📦 Recupero bucket storage...')
  const buckets = await getStorageBuckets()
  config.storage.buckets = buckets
  console.log(`   ✓ Trovati ${buckets.length} bucket\n`)

  // Salva configurazione JSON
  writeFileSync(join(outputDir, 'config.json'), JSON.stringify(config, null, 2), 'utf-8')

  // Genera report markdown
  let markdown = `# 📊 Report Configurazione Supabase - 22Club\n\n`
  markdown += `**Data esportazione**: ${new Date().toLocaleString('it-IT')}\n\n`
  markdown += `**URL Progetto**: ${SUPABASE_URL}\n\n`
  markdown += `**Project ID**: ${config.metadata.project_id}\n\n`

  markdown += `## 📦 Storage Buckets\n\n`
  if (buckets.length === 0) {
    markdown += `Nessun bucket configurato.\n\n`
  } else {
    markdown += `| Nome | Pubblico | File Size Limit | Allowed MIME Types |\n`
    markdown += `|------|----------|-----------------|-------------------|\n`
    buckets.forEach((bucket) => {
      markdown += `| ${bucket.name} | ${bucket.public ? '✅' : '❌'} | ${bucket.file_size_limit || 'N/A'} | ${bucket.allowed_mime_types?.join(', ') || 'Tutti'} |\n`
    })
    markdown += `\n`
  }

  markdown += `## 📝 Note\n\n`
  markdown += `Per ottenere lo schema completo del database (tabelle, colonne, constraint, funzioni, trigger, RLS policies, etc.),\n`
  markdown += `è necessario eseguire le funzioni helper SQL create in \`helper-functions.sql\`.\n\n`
  markdown += `Le funzioni helper possono essere eseguite tramite:\n`
  markdown += `- Supabase Dashboard > SQL Editor\n`
  markdown += `- Supabase CLI: \`supabase db execute --file helper-functions.sql\`\n`
  markdown += `- Client PostgreSQL diretto\n\n`

  markdown += `## 🔧 Prossimi Passi\n\n`
  markdown += `1. Esegui le funzioni helper SQL nel database\n`
  markdown += `2. Riesegui questo script per ottenere il report completo\n`
  markdown += `3. In alternativa, usa \`pg_dump\` o Supabase CLI per esportare lo schema\n\n`

  writeFileSync(join(outputDir, 'REPORT.md'), markdown, 'utf-8')

  console.log('✅ Configurazione esportata in:', outputDir)
  console.log('   - config.json (JSON completo)')
  console.log('   - REPORT.md (Report markdown)')
  console.log('   - helper-functions.sql (Funzioni SQL helper)')
  console.log(
    '\n⚠️  Per ottenere lo schema completo del database, esegui prima le funzioni helper SQL.',
  )
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Esportazione Configurazione Supabase\n')
  console.log(`📡 Connessione a: ${SUPABASE_URL}\n`)

  try {
    // Crea funzioni helper
    await createHelperFunctions()

    // Esporta configurazione (metodo alternativo)
    await exportConfigAlternative()

    console.log('\n✅ Esportazione completata!')
  } catch (error) {
    console.error("\n❌ Errore durante l'esportazione:", error)
    process.exit(1)
  }
}

main()
