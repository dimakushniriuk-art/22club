#!/usr/bin/env tsx
/**
 * Script per eseguire la migration SQL direttamente usando pg
 * 
 * Questo script usa la libreria 'pg' per connettersi direttamente al database
 * e eseguire la migration SQL.
 */

import { Client } from 'pg'
import { readFileSync } from 'fs'
import { join } from 'path'
import * as dotenv from 'dotenv'

// Carica variabili d'ambiente
dotenv.config({ path: join(process.cwd(), '.env.local') })

const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL

if (!databaseUrl) {
  console.error('❌ Errore: DATABASE_URL o DIRECT_URL non trovato')
  console.error('Assicurati di avere una di queste variabili in .env.local:')
  console.error('  - DATABASE_URL (connection pooling)')
  console.error('  - DIRECT_URL (direct connection)')
  process.exit(1)
}

async function executeMigration() {
  const client = new Client({
    connectionString: databaseUrl,
  })

  try {
    console.log('🔌 Connessione al database...')
    await client.connect()
    console.log('✅ Connesso al database')

    console.log('📄 Leggo il file di migration...')
    const migrationPath = join(
      process.cwd(),
      'supabase/migrations/20250117_fix_workout_logs_athlete_insert.sql'
    )
    const sql = readFileSync(migrationPath, 'utf-8')

    console.log('🔧 Eseguo la migration SQL...')
    
    // Esegui l'intero script SQL
    await client.query(sql)

    console.log('✅ Migration eseguita con successo!')

    // Verifica che la policy sia stata creata
    console.log('🔍 Verifica policy creata...')
    const result = await client.query(`
      SELECT 
        policyname,
        cmd,
        qual,
        with_check
      FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename = 'workout_logs' 
        AND policyname = 'Athletes can insert own workout logs';
    `)

    if (result.rows.length > 0) {
      console.log('✅ Policy verificata:')
      console.log(JSON.stringify(result.rows[0], null, 2))
    } else {
      console.log('⚠️  Policy non trovata dopo l\'esecuzione')
    }

    console.log('')
    console.log('🎉 Migration completata con successo!')
  } catch (error) {
    console.error('❌ Errore durante l\'esecuzione:', error)
    if (error instanceof Error) {
      console.error('Messaggio:', error.message)
    }
    process.exit(1)
  } finally {
    await client.end()
    console.log('🔌 Connessione chiusa')
  }
}

executeMigration()
