#!/usr/bin/env tsx
/**
 * Script per testare il login admin e la lettura del profilo
 * Simula esattamente quello che fa il browser
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Carica variabili d'ambiente da .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const ADMIN_EMAIL = 'admin@22club.it'
const ADMIN_PASSWORD = 'adminadmin'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Errore: Variabili d'ambiente non configurate")
  process.exit(1)
}

async function testAdminLogin() {
  console.log('🧪 Test Login Admin e Lettura Profilo')
  console.log('=====================================')
  console.log('')

  // Crea client come nel browser (usa anon key, non service role)
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  try {
    // Step 1: Login
    console.log('🔐 Step 1: Login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    })

    if (authError) {
      console.error('❌ Errore login:', authError.message)
      console.error('   Code:', authError.code)
      console.error('   Status:', authError.status)
      return false
    }

    if (!authData.user) {
      console.error('❌ Login fallito: nessun utente restituito')
      return false
    }

    console.log('✅ Login riuscito!')
    console.log(`   User ID: ${authData.user.id}`)
    console.log(`   Email: ${authData.user.email}`)
    console.log(`   Session: ${authData.session ? 'Presente' : 'Mancante'}`)
    console.log('')

    // Step 2: Verifica sessione
    console.log('🔍 Step 2: Verifica sessione...')
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('❌ Errore sessione:', sessionError.message)
      return false
    }

    if (!sessionData.session) {
      console.error('❌ Nessuna sessione attiva')
      return false
    }

    console.log('✅ Sessione attiva')
    console.log(`   Access Token: ${sessionData.session.access_token.substring(0, 50)}...`)
    console.log(`   User ID dalla sessione: ${sessionData.session.user.id}`)
    console.log('')

    // Step 3: Lettura profilo
    console.log('👤 Step 3: Lettura profilo...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, email, role, stato, nome, cognome')
      .eq('user_id', authData.user.id)
      .single()

    if (profileError) {
      console.error('❌ Errore lettura profilo:')
      console.error('   Message:', profileError.message)
      console.error('   Code:', profileError.code)
      console.error('   Details:', profileError.details)
      console.error('   Hint:', profileError.hint)
      console.error('')
      console.error('🔍 Possibili cause:')
      console.error('   1. RLS policies bloccano la lettura')
      console.error('   2. Profilo non esiste per questo user_id')
      console.error('   3. auth.uid() non corrisponde a user_id nel profilo')
      console.error('')
      console.error('💡 Soluzione: Verifica RLS policies con:')
      console.error('   docs/VERIFICA_RLS_PROFILES.sql')
      return false
    }

    if (!profile) {
      console.error('❌ Profilo non trovato')
      console.error('')
      console.error('💡 Soluzione: Crea il profilo con:')
      console.error('   npm run admin:create-profile')
      return false
    }

    console.log('✅ Profilo trovato!')
    console.log(`   Profile ID: ${profile.id}`)
    console.log(`   User ID: ${profile.user_id}`)
    console.log(`   Email: ${profile.email}`)
    console.log(`   Ruolo: ${profile.role}`)
    console.log(`   Stato: ${profile.stato}`)
    console.log(`   Nome: ${profile.nome} ${profile.cognome}`)
    console.log('')

    // Step 4: Verifica corrispondenza user_id
    if (profile.user_id !== authData.user.id) {
      console.error('⚠️  ATTENZIONE: user_id non corrisponde!')
      console.error(`   User ID dalla sessione: ${authData.user.id}`)
      console.error(`   User ID nel profilo: ${profile.user_id}`)
      return false
    }

    console.log('✅ user_id corrisponde')
    console.log('')
    console.log('=====================================')
    console.log('✅ Test completato con successo!')
    console.log('')
    console.log('Il login e la lettura profilo funzionano correttamente.')
    console.log('Se il problema persiste nel browser, potrebbe essere:')
    console.log('1. Cache del browser')
    console.log('2. Cookie di sessione non salvati correttamente')
    console.log('3. Problema con il client Supabase nel browser')
    console.log('')

    return true
  } catch (error) {
    console.error('❌ Errore imprevisto:', error)
    if (error instanceof Error) {
      console.error('   Messaggio:', error.message)
      console.error('   Stack:', error.stack)
    }
    return false
  } finally {
    // Logout
    await supabase.auth.signOut()
  }
}

// Esegui il test
testAdminLogin()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('❌ Errore fatale:', error)
    process.exit(1)
  })
