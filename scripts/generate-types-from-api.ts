#!/usr/bin/env tsx
/**
 * Script per generare tipi TypeScript da Supabase usando l'API REST
 * Usa le credenziali dal .env per accedere all'API
 */

import { readFileSync } from 'fs'
import { join } from 'path'

const PROJECT_REF = 'icibqnmtacibgnhaidlz'

async function generateTypes() {
  try {
    console.log('🔄 Generazione tipi TypeScript da Supabase API...')

    // Leggi le variabili d'ambiente
    const envPath = join(process.cwd(), '.env.local')
    let envContent = ''
    try {
      envContent = readFileSync(envPath, 'utf-8')
    } catch {
      console.log("⚠️  .env.local non trovato, uso variabili d'ambiente")
    }

    // Estrai SERVICE_ROLE_KEY o ANON_KEY
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.replace(/['"]/g, '') ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.replace(/['"]/g, '')

    if (!serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_ANON_KEY non trovato')
    }

    // Usa l'API REST per ottenere lo schema
    // Nota: Supabase non ha un endpoint diretto per i tipi TypeScript
    // Dobbiamo usare il CLI Supabase o l'interfaccia web

    console.log('⚠️  Supabase non fornisce un endpoint API diretto per i tipi TypeScript')
    console.log('📋 Usa uno di questi metodi:')
    console.log('')
    console.log('1. Interfaccia Web:')
    console.log('   https://supabase.com/dashboard/project/' + PROJECT_REF + '/settings/api')
    console.log('   Scorri fino a "TypeScript types" e copia il codice')
    console.log('')
    console.log('2. CLI Supabase (richiede access token):')
    console.log('   npx supabase gen types typescript --project-id ' + PROJECT_REF)
    console.log('')
    console.log('3. Ottieni access token:')
    console.log('   https://supabase.com/dashboard/account/tokens')
    console.log('   Poi esegui:')
    console.log(
      '   $env:SUPABASE_ACCESS_TOKEN = "sbp_..."; npx supabase gen types typescript --project-id ' +
        PROJECT_REF +
        ' > src/lib/supabase/types.ts',
    )

    process.exit(1)
  } catch (error) {
    console.error('❌ Errore:', error)
    process.exit(1)
  }
}

generateTypes()
