/**
 * Script per testare direttamente la query dei clienti
 *
 * Uso:
 *   npx tsx scripts/test-clienti-query.ts
 *
 * Questo script testa la query direttamente per identificare problemi
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

type ProfileSummary = {
  id: string
  nome: string | null
  cognome: string | null
  email: string | null
  role: string | null
}

type MinimalProfile = Pick<ProfileSummary, 'id' | 'nome' | 'cognome'>

type ColumnInfo = {
  column_name: string
  data_type: string
  is_nullable: 'YES' | 'NO'
}

// Leggi .env.local se esiste
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '❌ Errore: Configura NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel file .env.local',
  )
  process.exit(1)
}

// Usa service role per bypassare RLS
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function testQuery() {
  console.log('🔍 Test query clienti...\n')
  console.log('='.repeat(60))

  // Test 1: Query semplice - conta tutti i profili
  console.log('\n📊 Test 1: Conta tutti i profili')
  try {
    const start = Date.now()
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    const duration = Date.now() - start

    if (error) {
      console.error('❌ Errore:', error.message)
    } else {
      console.log(`✅ Totale profili: ${count} (${duration}ms)`)
    }
  } catch (error) {
    console.error('❌ Errore:', error)
  }

  // Test 2: Query con filtro role = 'atleta'
  console.log('\n📊 Test 2: Query con role = "atleta"')
  try {
    const start = Date.now()
    const {
      data: athleteProfiles,
      error,
      count,
    } = await supabase
      .from<ProfileSummary>('profiles')
      .select('id, nome, cognome, email, role', { count: 'exact' })
      .eq('role', 'atleta')
      .limit(10)
    const duration = Date.now() - start

    if (error) {
      console.error('❌ Errore:', error.message)
    } else {
      const totalFound = count ?? athleteProfiles?.length ?? 0
      console.log(`✅ Trovati ${totalFound} atleti (${duration}ms)`)
      if (athleteProfiles && athleteProfiles.length > 0) {
        console.log('\n📋 Primi risultati:')
        athleteProfiles.forEach((profile, i) => {
          console.log(
            `   ${i + 1}. ${profile.nome} ${profile.cognome} (${profile.email}) - role: ${profile.role}`,
          )
        })
      }
    }
  } catch (error) {
    console.error('❌ Errore:', error)
  }

  // Test 3: Query con filtro role = 'athlete'
  console.log('\n📊 Test 3: Query con role = "athlete"')
  try {
    const start = Date.now()
    const {
      data: englishAthletes,
      error,
      count,
    } = await supabase
      .from<ProfileSummary>('profiles')
      .select('id, nome, cognome, email, role', { count: 'exact' })
      .eq('role', 'athlete')
      .limit(10)
    const duration = Date.now() - start

    if (error) {
      console.error('❌ Errore:', error.message)
    } else {
      const totalFound = count ?? englishAthletes?.length ?? 0
      console.log(`✅ Trovati ${totalFound} atleti con role "athlete" (${duration}ms)`)
      if (englishAthletes && englishAthletes.length > 0) {
        console.log('\n📋 Risultati:')
        englishAthletes.forEach((profile, i) => {
          console.log(
            `   ${i + 1}. ${profile.nome} ${profile.cognome} (${profile.email}) - role: ${profile.role}`,
          )
        })
      }
    }
  } catch (error) {
    console.error('❌ Errore:', error)
  }

  // Test 4: Query con OR (role = 'atleta' OR role = 'athlete')
  console.log('\n📊 Test 4: Query con OR (atleta OR athlete)')
  try {
    const start = Date.now()
    const {
      data: allAthletes,
      error,
      count,
    } = await supabase
      .from<ProfileSummary>('profiles')
      .select('id, nome, cognome, email, role', { count: 'exact' })
      .or('role.eq.atleta,role.eq.athlete')
      .limit(10)
    const duration = Date.now() - start

    if (error) {
      console.error('❌ Errore:', error.message)
    } else {
      const totalFound = count ?? allAthletes?.length ?? 0
      console.log(`✅ Trovati ${totalFound} atleti totali (${duration}ms)`)
    }
  } catch (error) {
    console.error('❌ Errore:', error)
  }

  // Test 5: Verifica indici
  console.log('\n📊 Test 5: Verifica struttura tabella')
  try {
    const { data, error } = await supabase
      .rpc<ColumnInfo>('exec_sql', {
        query: `
        SELECT 
          column_name, 
          data_type,
          is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
          AND column_name IN ('role', 'stato', 'data_iscrizione', 'nome', 'cognome', 'email')
        ORDER BY ordinal_position;
      `,
      })
      .catch(() => ({ data: null, error: { message: 'RPC non disponibile' } }))

    if (error && error.message !== 'RPC non disponibile') {
      console.error('⚠️  Non posso verificare la struttura (RLS):', error.message)
    } else if (data) {
      console.log('✅ Struttura tabella:')
      console.table(data)
    } else {
      console.log('⚠️  Non posso verificare la struttura tramite RPC')
    }
  } catch {
    console.log('⚠️  Verifica struttura non disponibile')
  }

  // Test 6: Query semplificata (solo id, nome, cognome)
  console.log('\n📊 Test 6: Query minimale (solo id, nome, cognome)')
  try {
    const start = Date.now()
    const { data: minimalAthletes, error } = await supabase
      .from<MinimalProfile>('profiles')
      .select('id, nome, cognome')
      .eq('role', 'atleta')
      .limit(20)
    const duration = Date.now() - start

    if (error) {
      console.error('❌ Errore:', error.message)
    } else {
      console.log(`✅ Query completata (${duration}ms)`)
      const totalFound = minimalAthletes?.length ?? 0
      console.log(`✅ Risultati: ${totalFound}`)
      if (minimalAthletes && minimalAthletes.length > 0) {
        console.log('\n📋 Primi 5 risultati:')
        minimalAthletes.slice(0, 5).forEach((profile, i) => {
          console.log(`   ${i + 1}. ${profile.nome} ${profile.cognome} (id: ${profile.id})`)
        })
      }
    }
  } catch (error) {
    console.error('❌ Errore:', error)
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n✅ Test completati!')
  console.log('\n💡 Se tutte le query sono veloci (< 500ms), il problema potrebbe essere:')
  console.log('   1. RLS policies che rallentano le query')
  console.log('   2. Latenza di rete')
  console.log('   3. Indici non creati')
}

testQuery().catch(console.error)
