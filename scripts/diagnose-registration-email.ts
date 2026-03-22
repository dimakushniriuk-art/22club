/**
 * Diagnostica registrazione: verifica policy RLS, tracce email (auth.users, profiles, inviti_atleti).
 * Esegui: npx tsx scripts/diagnose-registration-email.ts [email]
 * Default email: dklavoro@gmail.com
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import type { Database } from '@/lib/supabase/types'

const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8')
  envFile.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const match = trimmed.match(/^([^=]+)=(.*)$/)
    if (match) {
      let value = match[2].trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      )
        value = value.slice(1, -1)
      process.env[match[1].trim()] = value
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = (process.argv[2] || 'dklavoro@gmail.com').trim().toLowerCase()

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Imposta NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const admin = createClient<Database>(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  console.log('--- Diagnostica registrazione ---\n')
  console.log('Email:', email, '\n')

  // 1) Auth: utenti con questa email
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const authUsers = list?.users?.filter((u) => u.email?.toLowerCase() === email) ?? []
  console.log('1) auth.users (per email):', authUsers.length)
  authUsers.forEach((u) => {
    console.log('   id:', u.id, '| email:', u.email, '| created_at:', u.created_at)
  })

  // 2) Profiles per email
  const { data: profilesByEmail, error: e1 } = await admin
    .from('profiles')
    .select('id, user_id, email, role, stato, is_deleted, org_id, created_at')
    .ilike('email', email)

  console.log(
    '\n2) profiles (email =):',
    profilesByEmail?.length ?? 0,
    e1 ? `| errore: ${e1.message}` : '',
  )
  profilesByEmail?.forEach((p) => {
    console.log(
      '   id:',
      p.id,
      '| user_id:',
      p.user_id,
      '| role:',
      p.role,
      '| is_deleted:',
      p.is_deleted,
    )
  })

  // 3) Profiles per user_id (se trovato in auth)
  for (const u of authUsers) {
    const { data: prof, error: e2 } = await admin
      .from('profiles')
      .select('id, user_id, email, role, stato, is_deleted')
      .eq('user_id', u.id)
      .maybeSingle()
    console.log(
      '\n3) profiles (user_id =',
      u.id + '):',
      prof ? '1 riga' : '0 righe',
      e2 ? `| errore: ${e2.message}` : '',
    )
    if (prof) console.log('   ', prof)
  }

  // 4) Inviti per email
  const { data: inviti, error: e3 } = await admin
    .from('inviti_atleti')
    .select('id, codice, email, pt_id, stato, status, expires_at, created_at')
    .ilike('email', email)

  console.log(
    '\n4) inviti_atleti (email =):',
    inviti?.length ?? 0,
    e3 ? `| errore: ${e3.message}` : '',
  )
  inviti?.forEach((i) => {
    console.log(
      '   codice:',
      i.codice,
      '| stato:',
      i.stato,
      '| status:',
      i.status,
      '| expires_at:',
      i.expires_at,
    )
  })

  // 5) Organizations (default-org)
  const { data: org, error: e4 } = await admin
    .from('organizations')
    .select('id, slug, name')
    .eq('slug', 'default-org')
    .maybeSingle()
  console.log(
    '\n5) organizations (slug = default-org):',
    org ? org.id : 'nessuna',
    e4 ? `| errore: ${e4.message}` : '',
  )

  console.log('\n--- Fine diagnostica ---')
  console.log('\nSe complete-profile fallisce:')
  console.log(
    "- L'API usa service_role (bypass RLS). Se vedi 0 righe in (2)/(3) per questa email, l'INSERT può fallire per trigger (es. update_jwt_custom_claims) o vincoli.",
  )
  console.log(
    '- Esegui in Supabase SQL Editor: supabase_diagnose_registration_policies.sql per policy INSERT su profiles e possibili pulizie.',
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
