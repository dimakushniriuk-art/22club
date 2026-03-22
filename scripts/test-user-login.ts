/**
 * Script per testare il login di un utente importato
 * Usage: npx tsx scripts/test-user-login.ts sofia.gialli@example.com Password123!
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// Carica variabili d'ambiente
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error("❌ Variabili d'ambiente mancanti!")
  console.error(
    'Richiesti: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY',
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function testUserLogin(email: string, password: string) {
  console.log('🔍 Test Login Utente')
  console.log('='.repeat(60))
  console.log(`Email: ${email}`)
  console.log(
    `Password: ${password.length >= 6 ? '✅ Valida' : '❌ Troppo corta'} (${password.length} caratteri)`,
  )
  console.log()

  // 1. Verifica utente in auth.users
  console.log('📋 Step 1: Verifica utente in auth.users')
  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
  const authUser = authUsers?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())

  if (!authUser) {
    console.error('❌ Utente non trovato in auth.users')
    return
  }

  console.log('✅ Utente trovato in auth.users')
  console.log(`   ID: ${authUser.id}`)
  console.log(`   Email: ${authUser.email}`)
  console.log(`   Email confermata: ${authUser.email_confirmed_at ? '✅ Sì' : '❌ No'}`)
  console.log(`   Creato: ${authUser.created_at}`)
  console.log(`   Ultimo accesso: ${authUser.last_sign_in_at || 'Mai'}`)
  console.log()

  // 2. Verifica profilo
  console.log('📋 Step 2: Verifica profilo')
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('user_id', authUser.id)
    .maybeSingle()

  if (profileError) {
    console.error('❌ Errore recupero profilo:', profileError.message)
    return
  }

  if (!profile) {
    console.error('❌ Profilo non trovato')
    return
  }

  console.log('✅ Profilo trovato')
  console.log(`   ID: ${profile.id}`)
  console.log(`   Nome: ${profile.nome || 'N/A'}`)
  console.log(`   Cognome: ${profile.cognome || 'N/A'}`)
  console.log(`   Ruolo: ${profile.role}`)
  console.log(`   Stato: ${profile.stato}`)
  console.log()

  // 3. Test login
  console.log('📋 Step 3: Test login')
  try {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      console.error('❌ Errore login:', signInError.message)
      console.error('   Codice:', (signInError as { code?: string }).code)
      console.error('   Status:', (signInError as { status?: number }).status)

      // Suggerimenti
      if (signInError.message?.includes('Invalid login credentials')) {
        console.log()
        console.log('💡 Suggerimenti:')
        console.log('   1. Verifica che la password sia corretta')
        console.log('   2. Prova a resettare la password tramite API Admin')
        console.log("   3. Verifica che l'email sia confermata")
      }
      return
    }

    if (signInData.user) {
      console.log('✅ Login riuscito!')
      console.log(`   User ID: ${signInData.user.id}`)
      console.log(`   Email: ${signInData.user.email}`)
      console.log(`   Session: ${signInData.session ? '✅ Creata' : '❌ Non creata'}`)

      // Logout
      await supabase.auth.signOut()
      console.log('   Logout eseguito')
    }
  } catch (error) {
    console.error('❌ Errore durante test login:', error)
  }
}

// Main
const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error('Usage: npx tsx scripts/test-user-login.ts <email> <password>')
  console.error('Example: npx tsx scripts/test-user-login.ts sofia.gialli@example.com Password123!')
  process.exit(1)
}

testUserLogin(email, password)
  .then(() => {
    console.log()
    console.log('✅ Test completato')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Errore:', error)
    process.exit(1)
  })
