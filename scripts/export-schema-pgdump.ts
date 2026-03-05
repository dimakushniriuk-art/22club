#!/usr/bin/env tsx
/**
 * Script per esportare lo schema usando pg_dump direttamente
 * Non richiede Docker, funziona direttamente con la connection string
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

if (!SUPABASE_URL) {
  console.error('❌ Variabili d\'ambiente mancanti!')
  console.error('Richiesto: NEXT_PUBLIC_SUPABASE_URL')
  process.exit(1)
}

/**
 * Genera il comando pg_dump con placeholder
 */
function generatePgDumpCommand(): string {
  const projectId = SUPABASE_URL.split('//')[1]?.split('.')[0] || 'icibqnmtacibgnhaidlz'
  
  return `# =====================================================
# Comando pg_dump per esportare schema completo
# =====================================================
#
# PREREQUISITI:
# 1. PostgreSQL client tools installati (pg_dump)
#    macOS: brew install postgresql
#    Linux: sudo apt-get install postgresql-client
#    Windows: Installa PostgreSQL o usa WSL
#
# 2. Connection string dal Supabase Dashboard:
#    - Vai su: https://supabase.com/dashboard/project/${projectId}/settings/database
#    - Copia la "Connection string" (usa "Direct connection")
#    - Formato: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
#
# =====================================================
# SOLO SCHEMA (senza dati) - RACCOMANDATO
# =====================================================

pg_dump "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres" \\
  --schema=public \\
  --schema-only \\
  --no-owner \\
  --no-acl \\
  --file=supabase-config-export/schema-only.sql

# =====================================================
# SCHEMA + DATI (file molto grande)
# =====================================================

pg_dump "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres" \\
  --schema=public \\
  --no-owner \\
  --no-acl \\
  --file=supabase-config-export/schema-with-data.sql

# =====================================================
# ALTERNATIVA: Usa connection string diretta
# =====================================================
# Se hai la connection string diretta (non pooler):
#
# pg_dump "postgresql://postgres:[PASSWORD]@db.${projectId}.supabase.co:5432/postgres" \\
#   --schema=public \\
#   --schema-only \\
#   --no-owner \\
#   --no-acl \\
#   --file=supabase-config-export/schema-only.sql

# =====================================================
# NOTE:
# =====================================================
# - Sostituisci [PASSWORD] con la password del database
# - Sostituisci [PROJECT-REF] con: ${projectId}
# - Sostituisci [REGION] con la tua regione (es: eu-central-1)
# - La password NON è la service role key!
# - Trova la password in: Dashboard > Settings > Database > Database password
`
}

/**
 * Prova a eseguire pg_dump se la connection string è disponibile
 */
async function tryPgDump(): Promise<boolean> {
  // Verifica se pg_dump è disponibile
  try {
    execSync('which pg_dump', { stdio: 'ignore' })
  } catch {
    console.log('⚠️  pg_dump non trovato.\n')
    console.log('Installa PostgreSQL client tools:')
    console.log('  macOS: brew install postgresql')
    console.log('  Linux: sudo apt-get install postgresql-client\n')
    return false
  }

  // Verifica se abbiamo DATABASE_URL o DIRECT_URL configurati
  const databaseUrl = env.DATABASE_URL || env.DIRECT_URL
  
  if (!databaseUrl || databaseUrl.includes('your-project') || databaseUrl.includes('your-password')) {
    console.log('⚠️  Connection string non configurata in env.local\n')
    console.log('Per esportare automaticamente, configura DATABASE_URL o DIRECT_URL in env.local')
    console.log('Oppure usa il comando manuale generato in pg-dump-command.sh\n')
    return false
  }

  try {
    const outputDir = join(projectRoot, 'supabase-config-export')
    mkdirSync(outputDir, { recursive: true })

    const schemaFile = join(outputDir, 'schema-only.sql')
    
    console.log('📦 Esecuzione pg_dump (solo schema, senza dati)...\n')
    
    // Esegui pg_dump
    execSync(
      `pg_dump "${databaseUrl}" --schema=public --schema-only --no-owner --no-acl -f "${schemaFile}"`,
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
    console.log('⚠️  Errore durante pg_dump:')
    console.log(`   ${error.message}\n`)
    console.log('💡 Verifica:')
    console.log('   1. La connection string è corretta')
    console.log('   2. La password è corretta (non la service role key!)')
    console.log('   3. Il database è raggiungibile\n')
    return false
  }
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Esportazione Schema con pg_dump\n')
  console.log(`📡 Progetto: ${SUPABASE_URL}\n`)

  const outputDir = join(projectRoot, 'supabase-config-export')
  mkdirSync(outputDir, { recursive: true })

  // Genera file con comando
  const command = generatePgDumpCommand()
  const commandFile = join(outputDir, 'pg-dump-command.sh')
  writeFileSync(commandFile, command, 'utf-8')
  console.log('📝 File comando creato: pg-dump-command.sh\n')

  // Prova a eseguire automaticamente
  const success = await tryPgDump()

  if (!success) {
    console.log('📋 ISTRUZIONI MANUALI:\n')
    console.log('1. Apri il file: supabase-config-export/pg-dump-command.sh')
    console.log('2. Ottieni la connection string da:')
    console.log(`   https://supabase.com/dashboard/project/${SUPABASE_URL.split('//')[1]?.split('.')[0]}/settings/database`)
    console.log('3. Sostituisci [PASSWORD] e [REGION] nel comando')
    console.log('4. Esegui il comando\n')
    
    console.log('OPPURE configura DATABASE_URL in env.local e riesegui questo script.\n')
  }

  console.log('✅ File generati in:', outputDir)
  console.log('   - pg-dump-command.sh (Comando da eseguire)')
  if (success) {
    console.log('   - schema-only.sql (Schema esportato)')
  }
}

main()
