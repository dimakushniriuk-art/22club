/**
 * Script per verificare quali tabelle esistono nel database
 * e confrontarle con quelle richieste nello script FIX_RLS_POLICIES_COMPLETE.sql
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Leggi .env.local
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      process.env[key] = value
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Variabili d'ambiente mancanti!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Tabelle richieste nello script FIX_RLS_POLICIES_COMPLETE.sql
const requiredTables = [
  'profiles',
  'exercises',
  'appointments',
  'payments',
  'notifications',
  'chat_messages',
  'inviti_atleti',
  'pt_atleti',
  'workout_plans',
  'workout_logs',
]

async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    // Prova a fare una query semplice per verificare se la tabella esiste
    const { error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from(tableName as any)
      .select('*')
      .limit(0)

    // Se l'errore è "relation does not exist", la tabella non esiste
    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return false
      }
      // Altri errori (come RLS) significano che la tabella esiste
      return true
    }
    return true
  } catch {
    return false
  }
}

// Funzione helper per ottenere colonne di una tabella (attualmente non usata, mantenuta per uso futuro)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getTableColumns(tableName: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}'
        ORDER BY ordinal_position;
      `,
    })

    if (error) {
      // Prova query diretta
      const { error: directError } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from(tableName as any)
        .select('*')
        .limit(0)

      if (directError) {
        return []
      }
      // Non possiamo ottenere le colonne facilmente, restituiamo array vuoto
      return []
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data?.map((row: any) => row.column_name) || []
  } catch {
    return []
  }
}

async function main() {
  console.log('🔍 VERIFICA ESISTENZA TABELLE')
  console.log('='.repeat(80))
  console.log(
    `\n📡 Progetto: ${supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'N/A'}\n`,
  )

  const results: Array<{
    table: string
    exists: boolean
    columns: string[]
  }> = []

  for (const table of requiredTables) {
    const exists = await checkTableExists(table)
    let columns: string[] = []

    if (exists) {
      // Prova a ottenere le colonne usando una query SQL diretta
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = '${table}'
            ORDER BY ordinal_position;
          `,
        })

        if (!error && data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          columns = data.map((row: any) => row.column_name)
        }
      } catch {
        // Ignora errori
      }
    }

    results.push({ table, exists, columns })
  }

  console.log('📊 RISULTATI')
  console.log('-'.repeat(80))
  console.log('\nTabella                  Esiste    Colonne')
  console.log('-'.repeat(80))

  const missingTables: string[] = []
  const existingTables: string[] = []

  for (const result of results) {
    const status = result.exists ? '✅' : '❌'
    const columnsInfo = result.exists
      ? result.columns.length > 0
        ? `${result.columns.length} colonne`
        : 'N/A'
      : 'N/A'

    console.log(`${result.table.padEnd(25)} ${status.padEnd(8)} ${columnsInfo}`)

    if (result.exists) {
      existingTables.push(result.table)
      if (result.columns.length > 0) {
        console.log(
          `  Colonne: ${result.columns.slice(0, 10).join(', ')}${result.columns.length > 10 ? '...' : ''}`,
        )
      }
    } else {
      missingTables.push(result.table)
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('\n📋 RIEPILOGO')
  console.log('-'.repeat(80))
  console.log(`✅ Tabelle esistenti: ${existingTables.length}/${requiredTables.length}`)
  console.log(`❌ Tabelle mancanti: ${missingTables.length}/${requiredTables.length}`)

  if (missingTables.length > 0) {
    console.log('\n🔴 TABELLE MANCANTI:')
    missingTables.forEach((table) => {
      console.log(`  - ${table}`)
    })

    console.log('\n💡 AZIONE RICHIESTA:')
    console.log('   Crea le tabelle mancanti o aggiorna lo script per saltarle')
  } else {
    console.log('\n✅ Tutte le tabelle richieste esistono!')
  }

  // Salva report
  const report = {
    timestamp: new Date().toISOString(),
    total: requiredTables.length,
    existing: existingTables.length,
    missing: missingTables.length,
    existingTables,
    missingTables,
    details: results,
  }

  const reportPath = path.join(process.cwd(), 'table-existence-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n📄 Report salvato in: ${reportPath}`)
}

main().catch(console.error)
