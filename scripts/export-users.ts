/**
 * Script per esportare lista utenti da Supabase
 * Esporta profili e informazioni utente in formato CSV e JSON
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Leggi .env.local
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Variabili d'ambiente mancanti!")
  console.error('Richiesti: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface UserProfile {
  id: string
  user_id: string
  email: string
  nome: string | null
  cognome: string | null
  phone: string | null
  role: string | null
  stato: string | null
  avatar: string | null
  data_iscrizione: string | null
  org_id: string | null
  created_at: string | null
  updated_at: string | null
}

async function exportUsers() {
  console.log('📤 ESPORTAZIONE UTENTI DA SUPABASE')
  console.log('='.repeat(80))
  console.log(
    `\n📡 Progetto: ${supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'N/A'}\n`,
  )

  try {
    // 1. Recupera tutti i profili
    console.log('📊 Recupero profili...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('❌ Errore nel recupero profili:', profilesError.message)
      process.exit(1)
    }

    if (!profiles || profiles.length === 0) {
      console.log('⚠️ Nessun profilo trovato')
      process.exit(0)
    }

    console.log(`✅ Trovati ${profiles.length} profili\n`)

    // 2. Recupera informazioni aggiuntive da auth.users (se possibile)
    console.log('📊 Recupero informazioni auth...')
    // Nota: userIds potrebbe essere usato in futuro per query aggiuntive su auth.users
    // const userIds = profiles.map((p) => p.user_id).filter(Boolean)

    // Prepara dati per export
    const exportData = profiles.map((profile) => {
      const userProfile = profile as UserProfile
      return {
        id: userProfile.id,
        user_id: userProfile.user_id,
        email: userProfile.email || 'N/A',
        nome: userProfile.nome || '',
        cognome: userProfile.cognome || '',
        nome_completo: `${userProfile.nome || ''} ${userProfile.cognome || ''}`.trim() || 'N/A',
        phone: userProfile.phone || '',
        role: userProfile.role || 'N/A',
        stato: userProfile.stato || 'N/A',
        avatar: userProfile.avatar || '',
        data_iscrizione: userProfile.data_iscrizione || '',
        org_id: userProfile.org_id || '',
        created_at: userProfile.created_at || '',
        updated_at: userProfile.updated_at || '',
      }
    })

    // 3. Esporta in JSON
    const jsonPath = path.join(process.cwd(), 'export', 'users.json')
    const jsonDir = path.dirname(jsonPath)
    if (!fs.existsSync(jsonDir)) {
      fs.mkdirSync(jsonDir, { recursive: true })
    }

    fs.writeFileSync(jsonPath, JSON.stringify(exportData, null, 2), 'utf-8')
    console.log(`✅ JSON esportato: ${jsonPath}`)

    // 4. Esporta in CSV
    const csvPath = path.join(process.cwd(), 'export', 'users.csv')
    const csvHeaders = [
      'ID',
      'User ID',
      'Email',
      'Nome',
      'Cognome',
      'Nome Completo',
      'Telefono',
      'Ruolo',
      'Stato',
      'Avatar',
      'Data Iscrizione',
      'Org ID',
      'Creato il',
      'Aggiornato il',
    ]

    const csvRows = exportData.map((user) => [
      user.id,
      user.user_id,
      user.email,
      user.nome,
      user.cognome,
      user.nome_completo,
      user.phone,
      user.role,
      user.stato,
      user.avatar,
      user.data_iscrizione,
      user.org_id,
      user.created_at,
      user.updated_at,
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    fs.writeFileSync(csvPath, csvContent, 'utf-8')
    console.log(`✅ CSV esportato: ${csvPath}`)

    // 5. Statistiche
    console.log('\n📊 STATISTICHE')
    console.log('-'.repeat(80))

    const statsByRole = exportData.reduce(
      (acc, user) => {
        const role = user.role || 'N/A'
        acc[role] = (acc[role] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const statsByStatus = exportData.reduce(
      (acc, user) => {
        const status = user.stato || 'N/A'
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    console.log(`\n👥 Totale utenti: ${exportData.length}`)
    console.log(`\n📋 Per ruolo:`)
    Object.entries(statsByRole).forEach(([role, count]) => {
      console.log(`   - ${role}: ${count}`)
    })

    console.log(`\n📋 Per stato:`)
    Object.entries(statsByStatus).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count}`)
    })

    // 6. Anteprima primi 5 utenti
    console.log(`\n👤 PRIMI 5 UTENTI:`)
    console.log('-'.repeat(80))
    exportData.slice(0, 5).forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.nome_completo}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Ruolo: ${user.role}`)
      console.log(`   Stato: ${user.stato}`)
      console.log(
        `   Creato: ${user.created_at ? new Date(user.created_at).toLocaleDateString('it-IT') : 'N/A'}`,
      )
    })

    console.log('\n' + '='.repeat(80))
    console.log('✅ ESPORTAZIONE COMPLETATA!')
    console.log(`\n📁 File esportati:`)
    console.log(`   - JSON: ${jsonPath}`)
    console.log(`   - CSV: ${csvPath}\n`)
  } catch (error) {
    console.error("\n❌ Errore durante l'esportazione:", error)
    process.exit(1)
  }
}

exportUsers()
