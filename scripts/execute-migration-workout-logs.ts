#!/usr/bin/env tsx
/**
 * Script per eseguire la migration SQL per fix workout_logs RLS policy
 * 
 * Questo script esegue direttamente la migration SQL usando il client Supabase
 * con la service role key per bypassare RLS.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Carica variabili d'ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Errore: Variabili d\'ambiente mancanti')
  console.error('Assicurati di avere:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Crea client Supabase con service role key (bypassa RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function executeMigration() {
  try {
    console.log('🚀 Avvio esecuzione migration...')
    console.log('📄 Leggo il file di migration...')

    // Leggi il file SQL
    const migrationPath = join(
      process.cwd(),
      'supabase/migrations/20250117_fix_workout_logs_athlete_insert.sql'
    )
    const sql = readFileSync(migrationPath, 'utf-8')

    console.log('✅ File letto correttamente')
    console.log('🔧 Eseguo la migration SQL...')

    // Esegui la migration usando RPC o query diretta
    // Nota: Supabase JS client non supporta direttamente l'esecuzione di SQL arbitrario
    // Dobbiamo usare il metodo rpc() se esiste una funzione, oppure usare fetch diretto

    // Dividi lo script in singole query (separate da ;)
    // Rimuovi i commenti e le parti DO $$ ... END $$ che non funzionano via RPC
    const queries = sql
      .split(';')
      .map((q) => q.trim())
      .filter((q) => q.length > 0 && !q.startsWith('--'))

    // Esegui ogni query
    for (const query of queries) {
      if (query.includes('DO $$')) {
        // Salta i blocchi DO $$ - li eseguiremo separatamente
        continue
      }

      if (query.trim().length === 0 || query.startsWith('--')) {
        continue
      }

      try {
        // Usa fetch diretto per eseguire SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ sql: query }),
        })

        if (!response.ok) {
          // Se exec_sql non esiste, proviamo un approccio diverso
          console.warn('⚠️  Metodo exec_sql non disponibile, uso approccio alternativo...')
          break
        }
      } catch (err) {
        console.warn('⚠️  Errore esecuzione query:', err)
      }
    }

    // Approccio alternativo: usa direttamente l'API REST di Supabase
    // Eseguiamo le query critiche una per una usando l'endpoint SQL
    console.log('📝 Eseguo la policy creation...')

    // Query principale: CREATE POLICY
    const createPolicySQL = `
      DROP POLICY IF EXISTS "Athletes can insert own workout logs" ON public.workout_logs;
      
      CREATE POLICY "Athletes can insert own workout logs" 
      ON public.workout_logs 
      FOR INSERT 
      TO authenticated 
      WITH CHECK (
        (
          EXISTS (
            SELECT 1 
            FROM public.profiles 
            WHERE profiles.id = workout_logs.athlete_id 
              AND profiles.user_id = auth.uid()
          )
        )
        OR
        (
          EXISTS (
            SELECT 1 
            FROM public.profiles 
            WHERE profiles.id = workout_logs.atleta_id 
              AND profiles.user_id = auth.uid()
          )
        )
        OR
        (
          workout_logs.user_id = auth.uid()
        )
      );
    `

    // Prova a eseguire usando l'endpoint SQL di Supabase (se disponibile)
    // Altrimenti, mostra le istruzioni manuali
    console.log('⚠️  Supabase JS client non supporta esecuzione SQL diretta')
    console.log('📋 Ecco le istruzioni per eseguire manualmente:')
    console.log('')
    console.log('1. Vai su: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/sql/new')
    console.log('2. Copia e incolla il contenuto del file:')
    console.log('   supabase/migrations/20250117_fix_workout_logs_athlete_insert.sql')
    console.log('3. Clicca "Run"')
    console.log('')
    console.log('📄 Oppure usa questo SQL direttamente:')
    console.log('─'.repeat(80))
    console.log(createPolicySQL)
    console.log('─'.repeat(80))

    // Verifica se la policy esiste già
    console.log('')
    console.log('🔍 Verifica policy esistente...')
    const { data: policies, error: checkError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd, with_check')
      .eq('schemaname', 'public')
      .eq('tablename', 'workout_logs')
      .eq('policyname', 'Athletes can insert own workout logs')

    if (checkError) {
      console.log('⚠️  Non posso verificare le policies via client (normale)')
    } else if (policies && policies.length > 0) {
      console.log('✅ Policy già esistente!')
      console.log('Policy:', policies[0])
    } else {
      console.log('❌ Policy non trovata - devi eseguire la migration manualmente')
    }

    console.log('')
    console.log('✅ Script completato')
    console.log('📝 Ricorda: Esegui la migration SQL manualmente nel dashboard Supabase')
  } catch (error) {
    console.error('❌ Errore durante l\'esecuzione:', error)
    process.exit(1)
  }
}

executeMigration()
