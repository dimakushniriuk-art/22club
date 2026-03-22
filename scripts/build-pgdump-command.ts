#!/usr/bin/env tsx
/**
 * Script helper per costruire il comando pg_dump corretto
 */

import { writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import * as readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function main() {
  console.log('🔧 Costruttore Comando pg_dump\n')
  console.log('Ti aiuterò a costruire il comando corretto.\n')

  // Chiedi la connection string
  console.log('📋 OPZIONE 1: Incolla la connection string completa')
  console.log('   (Vai su: Supabase Dashboard > Settings > Database > Connection string)\n')
  console.log('📋 OPZIONE 2: Inserisci i valori separatamente\n')

  const choice = await question('Vuoi incollare la connection string completa? (s/n): ')

  let connectionString = ''

  if (
    choice.toLowerCase() === 's' ||
    choice.toLowerCase() === 'y' ||
    choice.toLowerCase() === 'si'
  ) {
    const fullString = await question('\nIncolla la connection string: ')
    connectionString = fullString.trim()

    // Verifica se contiene placeholder per la password
    if (connectionString.includes('[YOUR-PASSWORD]') || connectionString.includes('[PASSWORD]')) {
      console.log('\n⚠️  Rilevato placeholder [YOUR-PASSWORD] nella connection string')
      const password = await question('Inserisci la password del database: ')

      // Sostituisci il placeholder con la password reale
      connectionString = connectionString.replace(/\[YOUR-PASSWORD\]/g, password)
      connectionString = connectionString.replace(/\[PASSWORD\]/g, password)

      console.log('✅ Password sostituita nel comando\n')
    }
  } else {
    console.log('\nInserisci i valori separatamente:\n')

    const projectRef = await question('Project Ref (es: icibqnmtacibgnhaidlz): ')
    const password = await question('Database Password: ')
    const region = await question('Region (es: eu-central-1, us-east-1): ')
    const useDirect = await question('Usa direct connection? (s/n, default: n per pooler): ')

    if (useDirect.toLowerCase() === 's' || useDirect.toLowerCase() === 'y') {
      connectionString = `postgresql://postgres.${projectRef}:${password}@aws-0-${region}.pooler.supabase.com:5432/postgres`
    } else {
      // Prova anche con db. invece di aws-0-
      connectionString = `postgresql://postgres.${projectRef}:${password}@db.${projectRef}.supabase.co:5432/postgres`
    }
  }

  if (!connectionString) {
    console.log('\n❌ Connection string non valida')
    rl.close()
    process.exit(1)
  }

  // Chiedi se vuole solo schema o anche dati
  const schemaOnly = await question('\nVuoi solo lo schema (senza dati)? (s/n, default: s): ')
  const onlySchema = schemaOnly.toLowerCase() !== 'n' && schemaOnly.toLowerCase() !== 'no'

  // Costruisci il comando
  let command = `pg_dump "${connectionString}" \\\n`
  command += `  --schema=public \\\n`

  if (onlySchema) {
    command += `  --schema-only \\\n`
  }

  command += `  --no-owner \\\n`
  command += `  --no-acl \\\n`
  command += `  --file=supabase-config-export/schema-complete.sql`

  // Salva il comando
  const outputDir = join(projectRoot, 'supabase-config-export')
  const commandFile = join(outputDir, 'pg-dump-command-ready.sh')
  writeFileSync(
    commandFile,
    `#!/bin/bash\n# Comando pg_dump generato automaticamente\n# Data: ${new Date().toISOString()}\n\n${command}\n`,
    'utf-8',
  )

  console.log('\n✅ Comando generato!\n')
  console.log('📝 Comando:')
  console.log(command)
  console.log('\n📁 Salvato in: supabase-config-export/pg-dump-command-ready.sh\n')
  console.log('🚀 Per eseguire:')
  console.log('   bash supabase-config-export/pg-dump-command-ready.sh\n')
  console.log('   Oppure copia e incolla il comando sopra nel terminale.\n')

  rl.close()
}

main().catch(console.error)
