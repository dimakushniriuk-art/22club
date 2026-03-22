/**
 * Diagnostica completa registrazione: auth, profiles, inviti, org, utenti senza profilo.
 * Richiede: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY in .env.local
 * Esegui: npx tsx scripts/diagnose-registration-full.ts
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

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Imposta NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const admin = createClient<Database>(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  console.log('=== DIAGNOSTICA REGISTRAZIONE COMPLETA ===\n')
  console.log('Progetto:', supabaseUrl.replace('https://', '').split('.')[0], '\n')

  // 1) Organizations (default-org)
  const { data: orgs, error: eOrg } = await admin
    .from('organizations')
    .select('id, slug, name')
    .limit(10)
  console.log('1) ORGANIZATIONS')
  if (eOrg) {
    console.log('   Errore:', eOrg.message)
  } else {
    console.log('   Righe:', orgs?.length ?? 0)
    orgs?.forEach((o) => console.log('   ', o.slug, '| id:', o.id))
    const defaultOrg = orgs?.find((o) => o.slug === 'default-org')
    if (!defaultOrg) console.log('   ⚠️ Nessuna organization con slug = default-org')
  }

  // 2) Ultimi utenti auth
  const { data: listData } = await admin.auth.admin.listUsers({ perPage: 20 })
  const authUsers = listData?.users ?? []
  console.log('\n2) AUTH.USERS (ultimi 20)')
  console.log('   Totale:', authUsers.length)
  authUsers.slice(0, 10).forEach((u) => {
    console.log(
      '   ',
      u.id,
      '|',
      u.email,
      '| confirmed:',
      !!u.email_confirmed_at,
      '|',
      u.created_at,
    )
  })
  if (authUsers.length > 10) console.log('   ... e altri', authUsers.length - 10)

  // 3) Profili (tutti o ultimi)
  const { data: profiles, error: eProf } = await admin
    .from('profiles')
    .select('id, user_id, email, role, org_id, stato, created_at')
    .order('created_at', { ascending: false })
    .limit(20)
  console.log('\n3) PROFILES (ultimi 20)')
  if (eProf) {
    console.log('   Errore:', eProf.message)
  } else {
    console.log('   Righe:', profiles?.length ?? 0)
    profiles?.forEach((p) =>
      console.log('   ', p.email, '| user_id:', p.user_id, '| role:', p.role),
    )
  }

  // 4) Inviti (ultimi)
  const { data: inviti, error: eInv } = await admin
    .from('inviti_atleti')
    .select('id, email, codice, stato, status, accepted_at, pt_id, created_at')
    .order('created_at', { ascending: false })
    .limit(15)
  console.log('\n4) INVITI_ATLETI (ultimi 15)')
  if (eInv) {
    console.log('   Errore:', eInv.message)
  } else {
    console.log('   Righe:', inviti?.length ?? 0)
    inviti?.forEach((i) =>
      console.log(
        '   ',
        i.email,
        '|',
        i.codice,
        '| stato:',
        i.stato,
        '| status:',
        i.status,
        '| accepted_at:',
        i.accepted_at ?? 'null',
      ),
    )
  }

  // 5) Utenti auth SENZA profilo (possibile causa "atleta non registrato")
  const _userIds = authUsers.map((u) => u.id)
  const profileUserIds = new Set((profiles ?? []).map((p) => p.user_id))
  const withoutProfile = authUsers.filter((u) => !profileUserIds.has(u.id))
  console.log('\n5) AUTH USERS SENZA PROFILO (problema registrazione)')
  console.log('   Totale:', withoutProfile.length)
  withoutProfile.forEach((u) => {
    console.log('   ', u.id, '|', u.email, '| created:', u.created_at)
  })

  // 6) Email note (dial, shoppinghouseitaly, dklavoro)
  const knownEmails = [
    'dial.system2016@gmail.com',
    'shoppinghouseitaly@gmail.com',
    'dklavoro@gmail.com',
  ]
  console.log('\n6) RIEPILOGO EMAIL NOTE')
  for (const email of knownEmails) {
    const authU = authUsers.find((u) => u.email?.toLowerCase() === email)
    const prof = (profiles ?? []).find((p) => p.email?.toLowerCase() === email)
    const inv = (inviti ?? []).filter((i) => i.email?.toLowerCase() === email)
    console.log('   ', email)
    console.log('      auth:', authU ? `sì (${authU.id})` : 'no')
    console.log('      profile:', prof ? `sì (${prof.id})` : 'no')
    console.log(
      '      inviti:',
      inv.length,
      inv.length ? inv.map((i) => `${i.codice}=${i.stato}`).join(', ') : '',
    )
  }

  console.log('\n=== FINE DIAGNOSTICA ===')
  if (withoutProfile.length > 0) {
    console.log(
      '\n💡 Ci sono utenti in auth senza profilo. Il trigger handle_new_user potrebbe non essere stato eseguito',
    )
    console.log(
      '   (migration applicata dopo la creazione utente) o aver fallito (es. tipo org_id uuid vs text).',
    )
    console.log(
      '   Applica la funzione handle_new_user corretta (uuid) in Supabase SQL Editor e usa lo script di riparazione per gli utenti esistenti.',
    )
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
