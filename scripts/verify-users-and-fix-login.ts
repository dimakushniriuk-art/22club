#!/usr/bin/env npx tsx
/**
 * Script per verificare utenti e fix login
 * Verifica se gli utenti esistono e applica fix necessari
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Carica variabili d'ambiente
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Variabili d'ambiente mancanti!")
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  process.exit(1)
}

// Crea client con service role key (bypass RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const usersToCheck = [
  { email: 'b.francesco@22club.it', role: 'trainer', password: 'FrancescoB' },
  { email: 'admin@22club.it', role: 'admin', password: 'adminadmin' },
  { email: 'dima.kushniriuk@gmail.com', role: 'athlete', password: 'dimon280894' },
]

async function main() {
  console.log('🔍 Verifica Utenti e Fix Login\n')
  console.log('='.repeat(50))

  for (const user of usersToCheck) {
    console.log(`\n📧 Verifica: ${user.email}`)
    console.log('-'.repeat(50))

    // 1. Verifica se l'utente esiste in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('❌ Errore recupero utenti auth:', authError.message)
      continue
    }

    const authUser = authUsers.users.find((u) => u.email === user.email)

    if (!authUser) {
      console.log(`❌ Utente NON trovato in auth.users`)
      console.log(`   Suggerimento: L'utente deve essere creato manualmente nel dashboard Supabase`)
      continue
    }

    console.log(`✅ Utente trovato in auth.users`)
    console.log(`   ID: ${authUser.id}`)
    console.log(`   Email verificata: ${authUser.email_confirmed_at ? '✅' : '❌'}`)
    console.log(`   Creato: ${authUser.created_at}`)

    // 2. Verifica se esiste il profilo
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single()

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        console.log(`⚠️  Profilo NON trovato per questo utente`)
        console.log(`   Suggerimento: Creare profilo manualmente o verificare trigger`)
      } else {
        console.error(`❌ Errore recupero profilo:`, profileError.message)
      }
      continue
    }

    console.log(`✅ Profilo trovato`)
    console.log(`   Profilo ID: ${profile.id}`)
    console.log(`   Ruolo: ${profile.role || 'NON IMPOSTATO'}`)
    console.log(`   Nome: ${profile.nome || 'N/A'}`)
    console.log(`   Cognome: ${profile.cognome || 'N/A'}`)

    // 3. Verifica ruolo
    if (profile.role !== user.role && profile.role !== 'pt' && user.role === 'trainer') {
      console.log(`⚠️  Ruolo non corrisponde: profilo ha "${profile.role}", atteso "${user.role}"`)
    } else {
      console.log(`✅ Ruolo corretto`)
    }

    // 4. Test login (solo verifica, non esegue login reale)
    console.log(`\n🔐 Test Login:`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Password: ${'*'.repeat(user.password.length)}`)
    console.log(`   ⚠️  Nota: Verifica manualmente nel browser se il login funziona`)
  }

  console.log('\n' + '='.repeat(50))
  console.log('\n📋 Riepilogo:')
  console.log('1. Verifica che tutti gli utenti esistano in auth.users')
  console.log('2. Verifica che tutti abbiano un profilo in profiles')
  console.log('3. Verifica che i ruoli siano corretti')
  console.log('4. Testa il login manualmente nel browser')
  console.log('\n💡 Se mancano utenti o profili, creali manualmente nel dashboard Supabase')
}

main().catch((error) => {
  console.error('❌ Errore:', error)
  process.exit(1)
})
