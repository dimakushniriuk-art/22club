/**
 * Script per verificare lo stato dei profili in Supabase
 * Verifica:
 * - Profili esistenti
 * - Utenti senza profilo
 * - Relazioni tra auth.users e profiles
 * - Stato dei profili
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import type { Database } from '@/types/supabase'

// Leggi .env.local se esiste
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8')
  envFile.split(/\r?\n/).forEach((line) => {
    // Ignora righe vuote e commenti
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return
    }
    const match = trimmedLine.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      let value = match[2].trim()
      // Rimuovi virgolette all'inizio e alla fine se presenti
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      process.env[key] = value
    }
  })
}

// Carica variabili d'ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variabili d'ambiente mancanti!")
  console.error(
    'Configura NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY nel file .env.local',
  )
  console.error('\nVariabili trovate:')
  console.error(`  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}`)
  console.error(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '✅' : '❌'}`)
  process.exit(1)
}

console.log('🔗 Connessione a Supabase...')
console.log(`  URL: ${supabaseUrl.substring(0, 30)}...`)
console.log(`  Key: ${supabaseKey.substring(0, 20)}...\n`)

const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// Interface per statistiche profili (mantenuta per uso futuro)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ProfileStats {
  totalProfiles: number
  totalUsers: number
  usersWithoutProfile: number
  profilesWithoutUser: number
  profilesByRole: Record<string, number>
  profilesByStatus: Record<string, number>
}

async function verifyProfiles() {
  console.log('🔍 Verifica profili in Supabase...\n')
  console.log('📝 Script avviato correttamente\n')

  try {
    // 1. Conta tutti i profili
    const { count: profilesCount, error: profilesError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (profilesError) {
      console.error('❌ Errore nel conteggio profili:', profilesError)
      return
    }

    console.log(`✅ Profili totali: ${profilesCount || 0}`)

    // 2. Ottieni tutti i profili con dettagli
    const { data: profiles, error: profilesDataError } = await supabase
      .from('profiles')
      .select('id, user_id, email, nome, cognome, role, stato, created_at, org_id')
      .order('created_at', { ascending: false })
      .limit(100)

    if (profilesDataError) {
      console.error('❌ Errore nel recupero profili:', profilesDataError)
      return
    }

    console.log(`\n📋 Dettagli profili (primi 100):`)
    if (profiles && profiles.length > 0) {
      console.table(
        profiles.map((p) => ({
          id: p.id.substring(0, 8) + '...',
          user_id: p.user_id?.substring(0, 8) + '...' || 'N/A',
          email: p.email || 'N/A',
          nome: p.nome || 'N/A',
          cognome: p.cognome || 'N/A',
          role: p.role || 'N/A',
          stato: p.stato || 'N/A',
          org_id: p.org_id || 'N/A',
          created_at: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A',
        })),
      )
    } else {
      console.log('⚠️ Nessun profilo trovato')
    }

    // 3. Statistiche per ruolo
    const { data: profilesByRole, error: roleError } = await supabase
      .from('profiles')
      .select('role')
      .not('role', 'is', null)

    if (!roleError && profilesByRole) {
      const roleStats: Record<string, number> = {}
      profilesByRole.forEach((p) => {
        roleStats[p.role] = (roleStats[p.role] || 0) + 1
      })

      console.log('\n📊 Profili per ruolo:')
      Object.entries(roleStats).forEach(([role, count]) => {
        console.log(`  - ${role}: ${count}`)
      })
    }

    // 4. Statistiche per stato
    const { data: profilesByStatus, error: statusError } = await supabase
      .from('profiles')
      .select('stato')
      .not('stato', 'is', null)

    if (!statusError && profilesByStatus) {
      const statusStats: Record<string, number> = {}
      profilesByStatus.forEach((p) => {
        statusStats[p.stato || 'N/A'] = (statusStats[p.stato || 'N/A'] || 0) + 1
      })

      console.log('\n📊 Profili per stato:')
      Object.entries(statusStats).forEach(([status, count]) => {
        console.log(`  - ${status}: ${count}`)
      })
    }

    // 5. Verifica utenti autenticati
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('\n❌ Errore nel recupero sessione:', sessionError)
    } else if (session?.user) {
      console.log('\n👤 Utente autenticato corrente:')
      console.log(`  - ID: ${session.user.id}`)
      console.log(`  - Email: ${session.user.email}`)

      // Verifica se questo utente ha un profilo
      const { data: currentProfile, error: currentProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (currentProfileError) {
        if (currentProfileError.code === 'PGRST116') {
          console.log('  ⚠️ Questo utente NON ha un profilo!')
          console.log('  💡 Dovrebbe essere creato automaticamente dal trigger.')
        } else {
          console.error('  ❌ Errore nel recupero profilo:', currentProfileError)
        }
      } else if (currentProfile) {
        console.log('  ✅ Profilo trovato:')
        console.log(
          `    - Nome: ${currentProfile.nome || 'N/A'} ${currentProfile.cognome || 'N/A'}`,
        )
        console.log(`    - Ruolo: ${currentProfile.role || 'N/A'}`)
        console.log(`    - Stato: ${currentProfile.stato || 'N/A'}`)
      }
    } else {
      console.log('\n⚠️ Nessun utente autenticato')
      console.log('💡 Accedi per verificare il tuo profilo specifico')
    }

    // 6. Verifica profili con user_id null o mancante
    const { data: profilesWithoutUserId, error: nullUserIdError } = await supabase
      .from('profiles')
      .select('id, email, nome, cognome')
      .is('user_id', null)
      .limit(10)

    if (!nullUserIdError && profilesWithoutUserId && profilesWithoutUserId.length > 0) {
      console.log('\n⚠️ Profili senza user_id:')
      profilesWithoutUserId.forEach((p) => {
        console.log(`  - ${p.id.substring(0, 8)}... - ${p.email || 'N/A'}`)
      })
    }

    // 7. Verifica profili duplicati (stesso user_id)
    if (profiles && profiles.length > 0) {
      const userIdCounts: Record<string, number> = {}
      profiles.forEach((p) => {
        if (p.user_id) {
          userIdCounts[p.user_id] = (userIdCounts[p.user_id] || 0) + 1
        }
      })

      const duplicates = Object.entries(userIdCounts).filter(([, count]) => count > 1)
      if (duplicates.length > 0) {
        console.log('\n⚠️ Profili duplicati (stesso user_id):')
        duplicates.forEach(([userId, count]) => {
          console.log(`  - ${userId.substring(0, 8)}...: ${count} profili`)
        })
      }
    }

    console.log('\n✅ Verifica completata!')
  } catch (error) {
    console.error('❌ Errore durante la verifica:', error)
  }
}

// Esegui la verifica
verifyProfiles()
  .then(() => {
    console.log('\n✨ Script completato')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Errore fatale:', error)
    process.exit(1)
  })
