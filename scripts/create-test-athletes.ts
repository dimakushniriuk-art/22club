/**
 * Script per creare 6 profili atleta completi per test
 *
 * Uso:
 *   npm run db:create-athletes
 *   oppure
 *   npx tsx scripts/create-test-athletes.ts
 *
 * Requisiti:
 *   - SUPABASE_SERVICE_ROLE_KEY nel file .env.local
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

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

// Usa service role per creare utenti
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

interface AthleteData {
  email: string
  password: string
  nome: string
  cognome: string
  phone: string
  data_iscrizione: string
  stato: 'attivo' | 'inattivo' | 'sospeso'
  note?: string
  documenti_scadenza?: boolean
}

type ProfileInsertData = {
  user_id: string
  nome: string
  cognome: string
  email: string
  phone: string
  data_iscrizione: string
  stato: string
  note?: string
  documenti_scadenza: boolean
  role: 'atleta' | 'athlete'
}

const athletes: AthleteData[] = [
  {
    email: 'mario.rossi@22club.it',
    password: 'Mario2024!',
    nome: 'Mario',
    cognome: 'Rossi',
    phone: '+39 333 123 4567',
    data_iscrizione: '2024-01-15T10:00:00Z',
    stato: 'attivo',
    note: 'Atleta dedicato, molto motivato. Obiettivo: aumentare massa muscolare. Ha problemi leggeri alla schiena, evitare esercizi di compressione spinale.',
    documenti_scadenza: false,
  },
  {
    email: 'giulia.bianchi@22club.it',
    password: 'Giulia2024!',
    nome: 'Giulia',
    cognome: 'Bianchi',
    phone: '+39 333 234 5678',
    data_iscrizione: '2024-02-01T09:30:00Z',
    stato: 'attivo',
    note: 'Atleta principiante, primo approccio al fitness. Obiettivo: perdita di peso e tonificazione. Preferisce allenamenti funzionali e cardio.',
    documenti_scadenza: false,
  },
  {
    email: 'luca.verdi@22club.it',
    password: 'Luca2024!',
    nome: 'Luca',
    cognome: 'Verdi',
    phone: '+39 333 345 6789',
    data_iscrizione: '2023-11-20T14:00:00Z',
    stato: 'attivo',
    note: 'Atleta esperto, pratica bodybuilding da 5 anni. Obiettivo: definizione muscolare. Richiede schede avanzate con focus su isolamento muscolare.',
    documenti_scadenza: true,
  },
  {
    email: 'sofia.neri@22club.it',
    password: 'Sofia2024!',
    nome: 'Sofia',
    cognome: 'Neri',
    phone: '+39 333 456 7890',
    data_iscrizione: '2024-03-10T11:00:00Z',
    stato: 'attivo',
    note: 'Atleta intermedio, pratica crossfit. Obiettivo: migliorare forza e resistenza. Ama gli allenamenti ad alta intensità.',
    documenti_scadenza: false,
  },
  {
    email: 'alessandro.ferrari@22club.it',
    password: 'Alessandro2024!',
    nome: 'Alessandro',
    cognome: 'Ferrari',
    phone: '+39 333 567 8901',
    data_iscrizione: '2023-09-05T16:00:00Z',
    stato: 'inattivo',
    note: 'Atleta con esperienza, attualmente in pausa per infortunio. Obiettivo al rientro: riabilitazione e recupero forma fisica.',
    documenti_scadenza: false,
  },
  {
    email: 'chiara.romano@22club.it',
    password: 'Chiara2024!',
    nome: 'Chiara',
    cognome: 'Romano',
    phone: '+39 333 678 9012',
    data_iscrizione: '2024-01-25T08:30:00Z',
    stato: 'attivo',
    note: 'Atleta principiante, obiettivo: benessere generale. Preferisce yoga e pilates ma vuole aggiungere esercizi di forza leggeri.',
    documenti_scadenza: false,
  },
]

async function createAthlete(athleteData: AthleteData) {
  try {
    console.log(
      `\n📝 Creazione atleta: ${athleteData.nome} ${athleteData.cognome} (${athleteData.email})`,
    )

    // 1. Crea utente in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: athleteData.email,
      password: athleteData.password,
      email_confirm: true, // Email già confermata per test
      user_metadata: {
        nome: athleteData.nome,
        cognome: athleteData.cognome,
      },
    })

    if (authError) {
      // Gestisci utente già esistente (controlla sia il messaggio che il codice)
      const isExistingUser =
        authError.message?.includes('already registered') ||
        authError.message?.includes('email address has already been registered') ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (authError as any).code === 'email_exists' ||
        authError.status === 422

      if (isExistingUser) {
        console.log(`⚠️  Utente già esistente, aggiorno il profilo...`)

        // Recupera l'utente esistente
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers?.users.find((u) => u.email === athleteData.email)

        if (!existingUser) {
          throw new Error(`Utente esistente ma non trovato: ${athleteData.email}`)
        }

        // Aggiorna password
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          password: athleteData.password,
        })

        // Aggiorna il profilo
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            nome: athleteData.nome,
            cognome: athleteData.cognome,
            email: athleteData.email,
            phone: athleteData.phone,
            data_iscrizione: athleteData.data_iscrizione,
            stato: athleteData.stato,
            note: athleteData.note,
            documenti_scadenza: athleteData.documenti_scadenza || false,
            role: 'atleta', // Assicura che il ruolo sia corretto
          })
          .eq('user_id', existingUser.id)

        if (updateError) {
          throw updateError
        }

        console.log(`✅ Profilo aggiornato per: ${athleteData.nome} ${athleteData.cognome}`)
        return { userId: existingUser.id, profileId: null }
      } else {
        throw authError
      }
    }

    if (!authData.user) {
      throw new Error('Utente non creato correttamente')
    }

    const userId = authData.user.id
    console.log(`✅ Utente creato: ${userId}`)

    // 2. Crea profilo nella tabella profiles
    // Prova prima con 'atleta', poi con 'athlete' per compatibilità
    const baseProfileData: ProfileInsertData = {
      user_id: userId,
      nome: athleteData.nome,
      cognome: athleteData.cognome,
      email: athleteData.email,
      phone: athleteData.phone,
      data_iscrizione: athleteData.data_iscrizione,
      stato: athleteData.stato,
      note: athleteData.note,
      documenti_scadenza: athleteData.documenti_scadenza ?? false,
      role: 'atleta',
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert(baseProfileData)
      .select()
      .single()

    if (profileError) {
      // Se fallisce con 'atleta', prova 'athlete'
      if (profileError.message.includes('role') || profileError.message.includes('atleta')) {
        console.log(`⚠️  Provo con ruolo 'athlete'...`)
        const fallbackProfileData: ProfileInsertData = {
          ...baseProfileData,
          role: 'athlete',
        }

        const { data: profile2, error: profileError2 } = await supabaseAdmin
          .from('profiles')
          .insert(fallbackProfileData)
          .select()
          .single()

        if (profileError2) {
          throw profileError2
        }

        console.log(`✅ Profilo creato con ruolo 'athlete': ${profile2.id}`)
        return { userId, profileId: profile2.id }
      } else {
        throw profileError
      }
    }

    console.log(`✅ Profilo creato: ${profile.id}`)
    return { userId, profileId: profile.id }
  } catch (error) {
    console.error(`❌ Errore creazione ${athleteData.email}:`, error)
    throw error
  }
}

async function main() {
  console.log('🚀 Creazione 6 profili atleta per test...\n')
  console.log('='.repeat(60))

  const results = []

  for (const athlete of athletes) {
    try {
      const result = await createAthlete(athlete)
      results.push({
        ...athlete,
        ...result,
        success: true,
      })

      // Piccola pausa per evitare rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`❌ Fallita creazione di ${athlete.email}`)
      results.push({
        ...athlete,
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
      })
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n📊 Riepilogo:\n')

  const successful = results.filter((r) => r.success)
  const failed = results.filter((r) => !r.success)

  console.log(`✅ Creati con successo: ${successful.length}/${athletes.length}`)
  console.log(`❌ Falliti: ${failed.length}/${athletes.length}`)

  if (successful.length > 0) {
    console.log('\n👥 Atleti creati:')
    successful.forEach((r) => {
      console.log(`   - ${r.nome} ${r.cognome}`)
      console.log(`     Email: ${r.email}`)
      console.log(`     Password: ${r.password}`)
      console.log(`     User ID: ${r.userId}`)
      if (r.profileId) {
        console.log(`     Profile ID: ${r.profileId}`)
      }
      console.log('')
    })
  }

  if (failed.length > 0) {
    console.log('\n❌ Errori:')
    failed.forEach((r) => {
      console.log(`   - ${r.email}: ${r.error}`)
    })
  }

  console.log('\n💡 Credenziali per il login:')
  console.log('='.repeat(60))
  successful.forEach((r) => {
    console.log(`${r.email} / ${r.password}`)
  })
  console.log('='.repeat(60))

  console.log('\n✅ Script completato!')
}

main().catch((error) => {
  console.error('\n❌ Errore fatale:', error)
  process.exit(1)
})
