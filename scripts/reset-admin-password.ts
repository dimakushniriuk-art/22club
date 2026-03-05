#!/usr/bin/env tsx
/**
 * Script per resettare la password dell'utente admin tramite API Supabase
 * Usa la Service Role Key per accedere all'API Admin
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Carica variabili d'ambiente da .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ADMIN_EMAIL = 'admin@22club.it'
const ADMIN_PASSWORD = 'adminadmin'

if (!SUPABASE_URL) {
  console.error('❌ Errore: NEXT_PUBLIC_SUPABASE_URL non configurato in .env.local')
  process.exit(1)
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Errore: SUPABASE_SERVICE_ROLE_KEY non configurato in .env.local')
  console.error('')
  console.error('Per ottenere la Service Role Key:')
  console.error('1. Vai su https://app.supabase.com')
  console.error('2. Seleziona il tuo progetto')
  console.error('3. Vai su Settings > API')
  console.error('4. Copia la "service_role" key (NON la anon key!)')
  console.error('5. Aggiungila a .env.local come: SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
  process.exit(1)
}

// Crea client Supabase con Service Role Key (ha privilegi admin)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function resetAdminPassword() {
  console.log('🔐 Reset Password Utente Admin')
  console.log('================================')
  console.log('')
  console.log(`📧 Email: ${ADMIN_EMAIL}`)
  console.log(`🔑 Nuova Password: ${ADMIN_PASSWORD}`)
  console.log('')

  try {
    // Step 1: Verifica se l'utente esiste
    console.log('🔍 Verifica esistenza utente...')
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error('❌ Errore durante la ricerca utenti:', listError.message)
      return false
    }

    const adminUser = users.users.find((u) => u.email === ADMIN_EMAIL)

    if (!adminUser) {
      console.error(`❌ Utente ${ADMIN_EMAIL} non trovato`)
      console.error('')
      console.error("Crea prima l'utente tramite:")
      console.error('1. Dashboard Supabase > Authentication > Users > Add User')
      console.error('2. Oppure esegui: docs/CREA_UTENTE_ADMIN_DIRETTO.sql')
      return false
    }

    console.log(`✅ Utente trovato: ${adminUser.id}`)
    console.log(`   Email confermata: ${adminUser.email_confirmed_at ? 'Sì' : 'No'}`)
    console.log('')

    // Step 2: Reset password usando l'API Admin
    console.log('🔄 Reset password in corso...')
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(adminUser.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true, // Conferma automaticamente l'email
    })

    if (updateError) {
      console.error('❌ Errore durante il reset password:', updateError.message)
      console.error('   Dettagli:', updateError)
      return false
    }

    console.log('✅ Password resettata con successo!')
    console.log('')

    // Step 3: Verifica che il reset sia andato a buon fine
    console.log('🔍 Verifica finale...')
    const { data: verifyData, error: verifyError } = await supabaseAdmin.auth.admin.getUserById(
      adminUser.id,
    )

    if (verifyError) {
      console.warn('⚠️  Errore durante la verifica:', verifyError.message)
    } else {
      console.log('✅ Utente verificato:')
      console.log(`   ID: ${verifyData.user.id}`)
      console.log(`   Email: ${verifyData.user.email}`)
      console.log(`   Email confermata: ${verifyData.user.email_confirmed_at ? 'Sì' : 'No'}`)
      console.log(`   Ultimo aggiornamento: ${verifyData.user.updated_at}`)
    }

    console.log('')
    console.log('================================')
    console.log('✅ Reset password completato!')
    console.log('')
    console.log('Ora puoi fare login con:')
    console.log(`   Email: ${ADMIN_EMAIL}`)
    console.log(`   Password: ${ADMIN_PASSWORD}`)
    console.log('')

    return true
  } catch (error) {
    console.error('❌ Errore imprevisto:', error)
    if (error instanceof Error) {
      console.error('   Messaggio:', error.message)
      console.error('   Stack:', error.stack)
    }
    return false
  }
}

// Esegui lo script
resetAdminPassword()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('❌ Errore fatale:', error)
    process.exit(1)
  })
