/**
 * Script per reimpostare le password di test per tutti gli utenti
 *
 * Uso:
 *   npx tsx scripts/reset-test-passwords.ts
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

// Usa service role per aggiornare password
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

interface UserCredential {
  email: string
  password: string
  nome: string
  cognome: string
  role: string
  userId: string
}

/**
 * Genera password basata sul ruolo e nome
 */
function generatePassword(nome: string, role: string): string {
  // Rimuovi spazi e caratteri speciali dal nome per la password
  const cleanName = nome.trim().replace(/\s+/g, '')

  switch (role) {
    case 'pt':
    case 'trainer':
      return `PT${cleanName}2024!`
    case 'admin':
      return `Admin${cleanName}2024!`
    case 'atleta':
    case 'athlete':
    default:
      return `${cleanName}2024!`
  }
}

async function resetPasswordForUser(
  userId: string,
  email: string,
  password: string,
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: password,
    })

    if (error) {
      console.error(`   ❌ Errore aggiornamento password per ${email}:`, error.message)
      return false
    }

    return true
  } catch (error) {
    console.error(`   ❌ Errore aggiornamento password per ${email}:`, error)
    return false
  }
}

async function main() {
  console.log('🔐 Reimpostazione password di test per tutti gli utenti...\n')
  console.log('='.repeat(60))

  // 1. Recupera tutti i profili
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('user_id, email, nome, cognome, role')
    .order('email')

  if (profilesError) {
    console.error('❌ Errore nel recupero dei profili:', profilesError)
    process.exit(1)
  }

  if (!profiles || profiles.length === 0) {
    console.log('⚠️  Nessun profilo trovato nel database')
    process.exit(0)
  }

  console.log(`📋 Trovati ${profiles.length} profili\n`)

  // 2. Recupera tutti gli utenti da auth.users per verificare che esistano
  const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

  if (authError) {
    console.error('❌ Errore nel recupero degli utenti auth:', authError)
    process.exit(1)
  }

  const authUsersMap = new Map(authUsers?.users.map((u) => [u.id, u]) || [])

  // 3. Processa ogni profilo
  const credentials: UserCredential[] = []
  const results: Array<{ success: boolean; email: string; error?: string }> = []

  for (const profile of profiles) {
    const userId = profile.user_id
    const email = profile.email
    const nome = profile.nome || 'User'
    const cognome = profile.cognome || ''
    const role = profile.role || 'atleta'

    // Verifica che l'utente esista in auth.users
    if (!authUsersMap.has(userId)) {
      console.log(`⚠️  Utente ${email} non trovato in auth.users, saltato`)
      results.push({
        success: false,
        email,
        error: 'Utente non trovato in auth.users',
      })
      continue
    }

    // Genera password
    const password = generatePassword(nome, role)

    console.log(`\n📝 Aggiornamento password per: ${email}`)
    console.log(`   Nome: ${nome} ${cognome}`)
    console.log(`   Ruolo: ${role}`)
    console.log(`   Password: ${password}`)

    // Aggiorna password
    const success = await resetPasswordForUser(userId, email, password)

    if (success) {
      console.log(`   ✅ Password aggiornata con successo`)
      credentials.push({
        email,
        password,
        nome,
        cognome,
        role,
        userId,
      })
      results.push({ success: true, email })
    } else {
      results.push({
        success: false,
        email,
        error: 'Errore durante aggiornamento password',
      })
    }

    // Piccola pausa per evitare rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  // 4. Riepilogo
  console.log('\n' + '='.repeat(60))
  console.log('\n📊 Riepilogo:\n')

  const successful = results.filter((r) => r.success)
  const failed = results.filter((r) => !r.success)

  console.log(`✅ Password aggiornate con successo: ${successful.length}/${profiles.length}`)
  console.log(`❌ Fallite: ${failed.length}/${profiles.length}`)

  if (failed.length > 0) {
    console.log('\n❌ Errori:')
    failed.forEach((r) => {
      console.log(`   - ${r.email}: ${r.error}`)
    })
  }

  // 5. Stampa tutte le credenziali
  console.log('\n💡 Credenziali per il login:')
  console.log('='.repeat(60))

  // Raggruppa per ruolo
  const byRole = credentials.reduce(
    (acc, cred) => {
      const roleKey =
        cred.role === 'pt' || cred.role === 'trainer'
          ? 'Personal Trainer'
          : cred.role === 'admin'
            ? 'Admin'
            : 'Atleta'

      if (!acc[roleKey]) acc[roleKey] = []
      acc[roleKey].push(cred)
      return acc
    },
    {} as Record<string, UserCredential[]>,
  )

  // Stampa per ruolo
  if (byRole['Admin']) {
    console.log('\n👑 AMMINISTRATORI:')
    byRole['Admin'].forEach((cred) => {
      console.log(`   ${cred.email} / ${cred.password}`)
    })
  }

  if (byRole['Personal Trainer']) {
    console.log('\n💪 PERSONAL TRAINER:')
    byRole['Personal Trainer'].forEach((cred) => {
      console.log(`   ${cred.email} / ${cred.password}`)
    })
  }

  if (byRole['Atleta']) {
    console.log('\n🏃 ATLETI:')
    byRole['Atleta'].forEach((cred) => {
      console.log(`   ${cred.email} / ${cred.password}`)
    })
  }

  console.log('\n' + '='.repeat(60))

  // 6. Salva in un file (opzionale)
  const outputPath = path.join(process.cwd(), 'test-credentials.txt')
  const outputContent = credentials
    .map((cred) => `${cred.email} / ${cred.password} (${cred.nome} ${cred.cognome} - ${cred.role})`)
    .join('\n')

  fs.writeFileSync(outputPath, outputContent, 'utf-8')
  console.log(`\n💾 Credenziali salvate in: ${outputPath}`)

  console.log('\n✅ Script completato!')
}

main().catch((error) => {
  console.error('\n❌ Errore fatale:', error)
  process.exit(1)
})
