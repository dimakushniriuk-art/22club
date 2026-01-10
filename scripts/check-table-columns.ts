/**
 * Script per verificare le colonne effettive di ogni tabella
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

// Tabelle e colonne richieste nello script
const requiredColumns: Record<string, string[]> = {
  appointments: ['athlete_id', 'trainer_id', 'staff_id'],
  payments: ['athlete_id', 'trainer_id'],
  inviti_atleti: ['trainer_id', 'pt_id', 'invited_by'],
  workout_plans: ['athlete_id', 'trainer_id', 'created_by'],
  workout_logs: ['athlete_id', 'atleta_id', 'workout_plan_id'],
}

async function getTableColumns(tableName: string): Promise<string[]> {
  try {
    // Usa una query SQL diretta tramite REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        sql: `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = '${tableName}'
          ORDER BY ordinal_position;
        `,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((row: any) => row.column_name)
    }
  } catch {
    // Ignora errori
  }

  // Fallback: prova a fare una query SELECT per vedere quali colonne sono disponibili
  try {
    const { data, error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from(tableName as any)
      .select('*')
      .limit(1)

    if (!error && data && data.length > 0) {
      return Object.keys(data[0])
    }
  } catch {
    // Ignora errori
  }

  return []
}

async function main() {
  console.log('🔍 VERIFICA COLONNE TABELLE')
  console.log('='.repeat(80))
  console.log(
    `\n📡 Progetto: ${supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'N/A'}\n`,
  )

  const results: Array<{
    table: string
    existingColumns: string[]
    requiredColumns: string[]
    missingColumns: string[]
  }> = []

  for (const [table, requiredCols] of Object.entries(requiredColumns)) {
    const existingCols = await getTableColumns(table)
    const missingCols = requiredCols.filter((col) => !existingCols.includes(col))

    results.push({
      table,
      existingColumns: existingCols,
      requiredColumns: requiredCols,
      missingColumns: missingCols,
    })
  }

  console.log('📊 RISULTATI DETTAGLIATI')
  console.log('='.repeat(80))

  for (const result of results) {
    console.log(`\n📋 Tabella: ${result.table}`)
    console.log('-'.repeat(80))
    console.log(`✅ Colonne esistenti (${result.existingColumns.length}):`)
    if (result.existingColumns.length > 0) {
      console.log(`   ${result.existingColumns.join(', ')}`)
    } else {
      console.log('   (Nessuna colonna trovata - possibile problema di accesso)')
    }

    console.log(`\n🔍 Colonne richieste dallo script:`)
    console.log(`   ${result.requiredColumns.join(', ')}`)

    if (result.missingColumns.length > 0) {
      console.log(`\n❌ Colonne MANCANTI:`)
      result.missingColumns.forEach((col) => {
        console.log(`   - ${col}`)
      })
    } else {
      console.log(`\n✅ Tutte le colonne richieste esistono!`)
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('\n📋 RIEPILOGO PROBLEMI')
  console.log('-'.repeat(80))

  const tablesWithMissingColumns = results.filter((r) => r.missingColumns.length > 0)

  if (tablesWithMissingColumns.length > 0) {
    console.log(`\n🔴 ${tablesWithMissingColumns.length} tabella/e con colonne mancanti:\n`)
    tablesWithMissingColumns.forEach((result) => {
      console.log(`  📋 ${result.table}:`)
      result.missingColumns.forEach((col) => {
        console.log(`     ❌ ${col}`)
      })
    })

    console.log('\n💡 SOLUZIONI:')
    console.log('   1. Aggiungi le colonne mancanti alle tabelle')
    console.log('   2. Oppure aggiorna lo script per usare colonne alternative esistenti')
  } else {
    console.log('\n✅ Tutte le colonne richieste esistono!')
  }

  // Salva report
  const report = {
    timestamp: new Date().toISOString(),
    results,
    tablesWithIssues: tablesWithMissingColumns.map((r) => ({
      table: r.table,
      missingColumns: r.missingColumns,
    })),
  }

  const reportPath = path.join(process.cwd(), 'table-columns-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n📄 Report salvato in: ${reportPath}`)
}

main().catch(console.error)
