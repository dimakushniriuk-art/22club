#!/usr/bin/env tsx
/**
 * Script completo per esportare la configurazione di Supabase
 * Genera SQL queries e usa API REST disponibili
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

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

/**
 * Genera SQL completo per esportare tutte le informazioni del database
 */
function generateCompleteSQL(): string {
  return `-- =====================================================
-- SQL per esportare configurazione completa Supabase
-- Esegui questo script nel SQL Editor di Supabase
-- =====================================================

-- 1. TABELLE
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  AND table_schema NOT LIKE 'pg_%'
ORDER BY table_schema, table_name;

-- 2. COLONNE
SELECT 
  c.table_schema,
  c.table_name,
  c.column_name,
  c.ordinal_position,
  c.data_type,
  c.character_maximum_length,
  c.numeric_precision,
  c.numeric_scale,
  c.is_nullable,
  c.column_default,
  c.udt_name
FROM information_schema.columns c
WHERE c.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  AND c.table_schema NOT LIKE 'pg_%'
ORDER BY c.table_schema, c.table_name, c.ordinal_position;

-- 3. PRIMARY KEYS
SELECT
  tc.table_schema,
  tc.table_name,
  tc.constraint_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  AND tc.table_schema NOT LIKE 'pg_%'
ORDER BY tc.table_schema, tc.table_name, kcu.ordinal_position;

-- 4. FOREIGN KEYS
SELECT
  tc.table_schema,
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  AND tc.table_schema NOT LIKE 'pg_%'
ORDER BY tc.table_schema, tc.table_name, tc.constraint_name;

-- 5. UNIQUE CONSTRAINTS
SELECT
  tc.table_schema,
  tc.table_name,
  tc.constraint_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE'
  AND tc.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  AND tc.table_schema NOT LIKE 'pg_%'
ORDER BY tc.table_schema, tc.table_name, tc.constraint_name;

-- 6. CHECK CONSTRAINTS
SELECT
  tc.table_schema,
  tc.table_name,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
  AND tc.table_schema = cc.constraint_schema
WHERE tc.constraint_type = 'CHECK'
  AND tc.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  AND tc.table_schema NOT LIKE 'pg_%'
ORDER BY tc.table_schema, tc.table_name, tc.constraint_name;

-- 7. INDICI
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  AND schemaname NOT LIKE 'pg_%'
ORDER BY schemaname, tablename, indexname;

-- 8. FUNZIONI/STORED PROCEDURES
SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_result(p.oid) AS return_type,
  pg_get_function_arguments(p.oid) AS arguments,
  CASE p.provolatile
    WHEN 'i' THEN 'IMMUTABLE'
    WHEN 's' THEN 'STABLE'
    WHEN 'v' THEN 'VOLATILE'
  END AS volatility,
  pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  AND n.nspname NOT LIKE 'pg_%'
ORDER BY n.nspname, p.proname;

-- 9. TRIGGER
SELECT
  t.trigger_schema,
  t.trigger_name,
  t.event_manipulation,
  t.event_object_table,
  t.action_statement,
  t.action_timing,
  t.action_orientation
FROM information_schema.triggers t
WHERE t.trigger_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  AND t.trigger_schema NOT LIKE 'pg_%'
ORDER BY t.event_object_table, t.trigger_name;

-- 10. VISTE
SELECT
  table_schema,
  table_name,
  view_definition
FROM information_schema.views
WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  AND table_schema NOT LIKE 'pg_%'
ORDER BY table_schema, table_name;

-- 11. RLS POLICIES
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  AND schemaname NOT LIKE 'pg_%'
ORDER BY schemaname, tablename, policyname;

-- 12. RLS ENABLED TABLES
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  AND schemaname NOT LIKE 'pg_%'
  AND rowsecurity = true
ORDER BY schemaname, tablename;

-- 13. ESTENSIONI
SELECT
  extname,
  extversion,
  nspname AS schema_name
FROM pg_extension e
LEFT JOIN pg_namespace n ON e.extnamespace = n.oid
ORDER BY extname;

-- 14. SEQUENCES
SELECT
  sequence_schema,
  sequence_name,
  data_type,
  numeric_precision,
  numeric_scale,
  start_value,
  minimum_value,
  maximum_value,
  increment,
  cycle_option
FROM information_schema.sequences
WHERE sequence_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  AND sequence_schema NOT LIKE 'pg_%'
ORDER BY sequence_schema, sequence_name;

-- 15. ENUMS (User-defined types)
SELECT
  n.nspname AS schema_name,
  t.typname AS type_name,
  string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) AS enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  AND n.nspname NOT LIKE 'pg_%'
GROUP BY n.nspname, t.typname
ORDER BY n.nspname, t.typname;

-- 16. COMMENTS (Table and column comments)
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  a.attname AS column_name,
  obj_description(c.oid, 'pg_class') AS table_comment,
  col_description(c.oid, a.attnum) AS column_comment
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_attribute a ON c.oid = a.attrelid AND a.attnum > 0 AND NOT a.attisdropped
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  AND n.nspname NOT LIKE 'pg_%'
  AND c.relkind IN ('r', 'v')
ORDER BY n.nspname, c.relname, a.attnum;
`
}

/**
 * Ottiene informazioni storage
 */
async function getStorageInfo() {
  const buckets = await supabase.storage.listBuckets()
  type StorageBucketInfo = {
    id: string
    name: string
    public?: boolean
    file_size_limit?: number | null
    allowed_mime_types?: string[] | null
  }
  const storageInfo: { buckets: StorageBucketInfo[] } = {
    buckets: [],
  }

  if (buckets.data) {
    for (const bucket of buckets.data) {
      // Ottieni policies del bucket (non usato al momento, ma potrebbe essere utile in futuro)
      // const { data: policies } = await supabase.storage.from(bucket.name).list('', {
      //   limit: 1,
      // })

      storageInfo.buckets.push({
        id: bucket.id,
        name: bucket.name,
        public: bucket.public,
        file_size_limit: bucket.file_size_limit,
        allowed_mime_types: bucket.allowed_mime_types,
        created_at: bucket.created_at,
        updated_at: bucket.updated_at,
      })
    }
  }

  return storageInfo
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Esportazione Configurazione Completa Supabase\n')
  console.log(`📡 Connessione a: ${SUPABASE_URL}\n`)

  const outputDir = join(projectRoot, 'supabase-config-export')
  mkdirSync(outputDir, { recursive: true })

  try {
    // 1. Genera SQL completo
    console.log('📝 Generazione SQL queries...')
    const sql = generateCompleteSQL()
    writeFileSync(join(outputDir, 'export-database-schema.sql'), sql, 'utf-8')
    console.log('   ✓ SQL generato: export-database-schema.sql\n')

    // 2. Ottieni informazioni storage
    console.log('📦 Recupero informazioni storage...')
    const storageInfo = await getStorageInfo()
    writeFileSync(
      join(outputDir, 'storage-config.json'),
      JSON.stringify(storageInfo, null, 2),
      'utf-8',
    )
    console.log(`   ✓ Trovati ${storageInfo.buckets.length} bucket\n`)

    // 3. Genera report markdown
    console.log('📄 Generazione report...')
    const projectId = SUPABASE_URL.split('//')[1]?.split('.')[0] || 'unknown'

    let markdown = `# 📊 Report Configurazione Supabase - 22Club\n\n`
    markdown += `**Data esportazione**: ${new Date().toLocaleString('it-IT')}\n\n`
    markdown += `**URL Progetto**: ${SUPABASE_URL}\n\n`
    markdown += `**Project ID**: ${projectId}\n\n`

    markdown += `## 📦 Storage Buckets\n\n`
    if (storageInfo.buckets.length === 0) {
      markdown += `Nessun bucket configurato.\n\n`
    } else {
      markdown += `| Nome | Pubblico | File Size Limit | Allowed MIME Types |\n`
      markdown += `|------|----------|-----------------|-------------------|\n`
      storageInfo.buckets.forEach((bucket: StorageBucketInfo) => {
        markdown += `| ${bucket.name} | ${bucket.public ? '✅' : '❌'} | ${bucket.file_size_limit || 'N/A'} | ${bucket.allowed_mime_types?.join(', ') || 'Tutti'} |\n`
      })
      markdown += `\n`
    }

    markdown += `## 🗃️ Database Schema\n\n`
    markdown += `Per esportare lo schema completo del database:\n\n`
    markdown += `1. Apri Supabase Dashboard > SQL Editor\n`
    markdown += `2. Esegui il file \`export-database-schema.sql\`\n`
    markdown += `3. Esporta i risultati in JSON o CSV\n\n`
    markdown += `Oppure usa Supabase CLI:\n\n`
    markdown += `\`\`\`bash\n`
    markdown += `# Esegui le query SQL\n`
    markdown += `supabase db execute --file export-database-schema.sql\n\n`
    markdown += `# Oppure esporta lo schema completo\n`
    markdown += `supabase db dump --schema public > schema-dump.sql\n`
    markdown += `\`\`\`\n\n`

    markdown += `## 📁 File Generati\n\n`
    markdown += `- \`export-database-schema.sql\` - Query SQL per esportare tutto lo schema\n`
    markdown += `- \`storage-config.json\` - Configurazione storage buckets\n`
    markdown += `- \`REPORT.md\` - Questo report\n\n`

    markdown += `## 🔧 Prossimi Passi\n\n`
    markdown += `1. Esegui \`export-database-schema.sql\` nel SQL Editor di Supabase\n`
    markdown += `2. Esporta i risultati di ogni query in file JSON separati\n`
    markdown += `3. Usa i file generati come documentazione della configurazione\n\n`

    writeFileSync(join(outputDir, 'REPORT.md'), markdown, 'utf-8')
    console.log('   ✓ Report generato: REPORT.md\n')

    // 4. Genera file di configurazione strutturato
    const config = {
      metadata: {
        exported_at: new Date().toISOString(),
        supabase_url: SUPABASE_URL,
        project_id: projectId,
      },
      storage: storageInfo,
      database: {
        note: 'Esegui export-database-schema.sql per ottenere lo schema completo',
        sql_file: 'export-database-schema.sql',
      },
    }

    writeFileSync(join(outputDir, 'config.json'), JSON.stringify(config, null, 2), 'utf-8')
    console.log('   ✓ Configurazione JSON generata: config.json\n')

    console.log('✅ Esportazione completata!')
    console.log(`\n📁 File salvati in: ${outputDir}`)
    console.log('\n📋 File generati:')
    console.log('   - export-database-schema.sql (Query SQL complete)')
    console.log('   - storage-config.json (Configurazione storage)')
    console.log('   - config.json (Configurazione generale)')
    console.log('   - REPORT.md (Report markdown)')
    console.log('\n💡 Prossimo passo: Esegui export-database-schema.sql nel SQL Editor di Supabase')
  } catch (error) {
    console.error("\n❌ Errore durante l'esportazione:", error)
    process.exit(1)
  }
}

main()
