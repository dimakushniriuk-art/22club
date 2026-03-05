#!/usr/bin/env tsx
/**
 * Script per creare il profilo admin se mancante
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

if (!SUPABASE_URL) {
  console.error('❌ Errore: NEXT_PUBLIC_SUPABASE_URL non configurato in .env.local')
  process.exit(1)
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Errore: SUPABASE_SERVICE_ROLE_KEY non configurato in .env.local')
  process.exit(1)
}

// Crea client Supabase con Service Role Key (ha privilegi admin)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createAdminProfile() {
  console.log('👤 Creazione Profilo Admin')
  console.log('================================')
  console.log('')

  try {
    // Step 1: Trova l'utente admin
    console.log('🔍 Cerca utente admin...')
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
      console.error('2. Oppure esegui: npm run admin:reset-password')
      return false
    }

    console.log(`✅ Utente trovato: ${adminUser.id}`)
    console.log('')

    // Step 2: Verifica se il profilo esiste già
    console.log('🔍 Verifica profilo esistente...')
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, role, stato, nome, cognome')
      .eq('user_id', adminUser.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, che è OK se il profilo non esiste
      console.error('❌ Errore durante la verifica profilo:', profileError.message)
      return false
    }

    if (existingProfile) {
      console.log('ℹ️  Profilo già esistente:')
      console.log(`   ID: ${existingProfile.id}`)
      console.log(`   Ruolo: ${existingProfile.role}`)
      console.log(`   Stato: ${existingProfile.stato}`)
      console.log('')

      // Aggiorna il ruolo a 'admin' se non lo è già
      if (existingProfile.role !== 'admin' || existingProfile.stato !== 'attivo') {
        console.log('🔄 Aggiorna profilo a admin...')
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            role: 'admin',
            stato: 'attivo',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingProfile.id)

        if (updateError) {
          console.error("❌ Errore durante l'aggiornamento:", updateError.message)
          return false
        }

        console.log('✅ Profilo aggiornato a admin')
      } else {
        console.log('✅ Profilo già configurato correttamente')
      }

      return true
    }

    // Step 3: Crea il profilo admin
    console.log('🔄 Crea profilo admin...')
    const { data: newProfile, error: createError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: adminUser.id,
        email: ADMIN_EMAIL,
        role: 'admin',
        stato: 'attivo',
        nome: 'Admin',
        cognome: '22Club',
        first_name: 'Admin',
        last_name: '22Club',
        data_iscrizione: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, role, stato, nome, cognome')
      .single()

    if (createError) {
      console.error('❌ Errore durante la creazione profilo:', createError.message)
      console.error('   Dettagli:', createError)
      return false
    }

    console.log('✅ Profilo admin creato con successo!')
    console.log('')
    console.log('Dettagli profilo:')
    console.log(`   ID: ${newProfile.id}`)
    console.log(`   Email: ${ADMIN_EMAIL}`)
    console.log(`   Ruolo: ${newProfile.role}`)
    console.log(`   Stato: ${newProfile.stato}`)
    console.log(`   Nome: ${newProfile.nome} ${newProfile.cognome}`)
    console.log('')

    // Step 4: Verifica finale
    console.log('🔍 Verifica finale...')
    const { data: verifyProfile, error: verifyError } = await supabaseAdmin
      .from('profiles')
      .select('id, role, stato, nome, cognome')
      .eq('user_id', adminUser.id)
      .single()

    if (verifyError) {
      console.warn('⚠️  Errore durante la verifica:', verifyError.message)
    } else {
      console.log('✅ Profilo verificato:')
      console.log(`   ID: ${verifyProfile.id}`)
      console.log(`   Ruolo: ${verifyProfile.role}`)
      console.log(`   Stato: ${verifyProfile.stato}`)
    }

    console.log('')
    console.log('================================')
    console.log('✅ Profilo admin creato/verificato!')
    console.log('')
    console.log('Ora puoi fare login con:')
    console.log(`   Email: ${ADMIN_EMAIL}`)
    console.log(`   Password: adminadmin`)
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
createAdminProfile()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('❌ Errore fatale:', error)
    process.exit(1)
  })
