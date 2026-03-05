#!/usr/bin/env tsx
/**
 * Script per esportare lo schema completo del database Supabase
 * Genera un file SQL con CREATE statements che può essere usato come base
 * per importare modifiche o ricreare il database
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { execSync } from 'child_process'

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
  console.error('❌ Variabili d\'ambiente mancanti!')
  console.error('Richiesto: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

/**
 * Genera SQL per esportare lo schema usando pg_dump
 */
function generateSchemaDumpSQL(): string {
  return `-- =====================================================
-- SQL per esportare schema completo con pg_dump
-- =====================================================
-- 
-- OPZIONE 1: Usa Supabase CLI (RACCOMANDATO)
-- =====================================================
-- 
-- 1. Assicurati di essere loggato:
--    npx supabase login
--
-- 2. Linka il progetto (se non già fatto):
--    npx supabase link --project-ref icibqnmtacibgnhaidlz
--
-- 3. Esporta lo schema:
--    npx supabase db dump --schema public > schema-complete.sql
--
-- Oppure solo schema (senza dati):
--    npx supabase db dump --schema public --schema-only > schema-only.sql
--
-- =====================================================
-- OPZIONE 2: Usa pg_dump direttamente
-- =====================================================
--
-- Per usare pg_dump, hai bisogno della connection string diretta.
-- Trovala in Supabase Dashboard > Settings > Database > Connection string
-- (usa la versione "Direct connection" o "Connection pooling")
--
-- Esempio:
-- pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \\
--   --schema=public \\
--   --schema-only \\
--   --no-owner \\
--   --no-acl \\
--   > schema-complete.sql
--
-- Con dati (ATTENZIONE: file molto grande):
-- pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \\
--   --schema=public \\
--   --no-owner \\
--   --no-acl \\
--   > schema-with-data.sql
--
-- =====================================================
-- OPZIONE 3: Usa Supabase Dashboard
-- =====================================================
--
-- 1. Vai su Supabase Dashboard > Database
-- 2. Clicca su "Generate types" o "Download schema"
-- 3. Oppure usa il SQL Editor per eseguire:
--
-- SELECT 
--   'CREATE TABLE ' || schemaname || '.' || tablename || ' (' || 
--   string_agg(column_name || ' ' || data_type, ', ') || 
--   ');' AS create_statement
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
-- GROUP BY schemaname, tablename;
--
-- =====================================================
`
}

/**
 * Prova a eseguire supabase db dump
 */
async function trySupabaseDump(): Promise<boolean> {
  try {
    console.log('🔍 Tentativo di esportazione con Supabase CLI...\n')
    
    // Verifica se supabase CLI è disponibile
    try {
      execSync('npx supabase --version', { stdio: 'ignore' })
    } catch {
      console.log('⚠️  Supabase CLI non trovato. Installalo con: npm install -g supabase\n')
      return false
    }

    const outputDir = join(projectRoot, 'supabase-config-export')
    mkdirSync(outputDir, { recursive: true })

    // Prova a fare il dump dal database remoto (linked)
    console.log('📦 Esecuzione: npx supabase db dump --schema public --linked\n')
    console.log('⚠️  Nota: Questo esporterà schema + dati. Per solo schema, usa pg_dump.\n')
    
    const schemaFile = join(outputDir, 'schema-complete.sql')
    
    // Verifica se il progetto è linkato
    try {
      execSync('npx supabase status', { stdio: 'ignore', cwd: projectRoot })
    } catch {
      console.log('⚠️  Progetto non linkato. Eseguendo link...\n')
      const projectRef = SUPABASE_URL.split('//')[1]?.split('.')[0] || 'icibqnmtacibgnhaidlz'
      try {
        execSync(`npx supabase link --project-ref ${projectRef} --password "${SUPABASE_SERVICE_KEY.substring(0, 20)}..."`, {
          stdio: 'inherit',
          cwd: projectRoot
        })
      } catch {
        console.log('⚠️  Link fallito. Usa manualmente: npx supabase link --project-ref icibqnmtacibgnhaidlz\n')
      }
    }
    
    execSync(
      `npx supabase db dump --schema public --linked -f "${schemaFile}"`,
      { 
        stdio: 'inherit',
        cwd: projectRoot,
        env: { ...process.env }
      }
    )

    console.log(`\n✅ Schema esportato in: ${schemaFile}\n`)
    return true
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.log('⚠️  Errore durante l\'esportazione con Supabase CLI:')
    console.log(`   ${error.message}\n`)
    console.log('💡 Assicurati di:')
    console.log('   1. Essere loggato: npx supabase login')
    console.log('   2. Aver linkato il progetto: npx supabase link --project-ref icibqnmtacibgnhaidlz\n')
    return false
  }
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Esportazione Schema Completo Database Supabase\n')
  console.log(`📡 Progetto: ${SUPABASE_URL}\n`)

  const outputDir = join(projectRoot, 'supabase-config-export')
  mkdirSync(outputDir, { recursive: true })

  // Genera file con istruzioni
  const instructionsSQL = generateSchemaDumpSQL()
  writeFileSync(
    join(outputDir, 'HOW-TO-EXPORT-SCHEMA.sql'),
    instructionsSQL,
    'utf-8'
  )
  console.log('📝 File istruzioni creato: HOW-TO-EXPORT-SCHEMA.sql\n')

  // Prova a eseguire il dump automaticamente
  const success = await trySupabaseDump()

  if (!success) {
    console.log('📋 ISTRUZIONI MANUALI:\n')
    console.log('Per esportare lo schema completo, usa uno di questi metodi:\n')
    console.log('METODO 1 - Supabase CLI (RACCOMANDATO):')
    console.log('  1. npx supabase login')
    console.log('  2. npx supabase link --project-ref icibqnmtacibgnhaidlz')
    console.log('  3. npx supabase db dump --schema public -f supabase-config-export/schema-complete.sql')
    console.log('     (Nota: include anche i dati. Per solo schema, usa pg_dump)\n')
    
    console.log('METODO 2 - pg_dump:')
    console.log('  Vedi il file HOW-TO-EXPORT-SCHEMA.sql per istruzioni dettagliate\n')
    
    console.log('METODO 3 - Supabase Dashboard:')
    console.log('  1. Vai su Supabase Dashboard > Database')
    console.log('  2. Usa "Generate types" o esporta manualmente\n')
  }

  console.log('✅ File generati in:', outputDir)
  console.log('   - HOW-TO-EXPORT-SCHEMA.sql (Istruzioni dettagliate)')
  if (success) {
    console.log('   - schema-only.sql (Schema completo esportato)')
  }
}

main()
