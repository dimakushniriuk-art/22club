/**
 * Seed idempotente E2E: associa il trainer e l'atleta delle env Playwright
 * (stesse mail di tests/e2e/helpers/auth.ts) tramite athlete_trainer_assignments
 * e allinea pt_atleti (legacy).
 *
 * Prerequisiti: utenti Auth + righe profiles già presenti (creazione account non è in scope).
 *
 * Uso:
 *   npx tsx scripts/e2e-seed-trainer-athlete.ts
 *   npm run e2e:seed:trainer-athlete
 *
 * Env: .env.local con NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *      PLAYWRIGHT_TRAINER_EMAIL, PLAYWRIGHT_ATHLETE_EMAIL
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'node:fs'
import * as path from 'node:path'

const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8')
  for (const line of envFile.split('\n')) {
    const match = line.match(/^([^=#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = value
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const TRAINER_EMAIL = process.env.PLAYWRIGHT_TRAINER_EMAIL?.trim().toLowerCase()
const ATHLETE_EMAIL = process.env.PLAYWRIGHT_ATHLETE_EMAIL?.trim().toLowerCase()

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '❌ Servono NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (es. in .env.local)',
  )
  process.exit(1)
}
if (!TRAINER_EMAIL || !ATHLETE_EMAIL) {
  console.error('❌ Servono PLAYWRIGHT_TRAINER_EMAIL e PLAYWRIGHT_ATHLETE_EMAIL')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

type ProfileRow = {
  id: string
  user_id: string | null
  email: string | null
  role: string | null
  org_id: string | null
}

function canonicalTrainerRole(r: string | null): string | null {
  const x = r?.trim().toLowerCase() ?? ''
  if (x === 'pt' || x === 'trainer' || x === 'staff') return 'trainer'
  return null
}

function canonicalAthleteRole(r: string | null): string | null {
  const x = r?.trim().toLowerCase() ?? ''
  if (x === 'atleta' || x === 'athlete') return 'athlete'
  return null
}

async function loadProfileByEmail(email: string): Promise<ProfileRow | null> {
  const { data, error } = await admin
    .from('profiles')
    .select('id, user_id, email, role, org_id')
    .ilike('email', email)
    .maybeSingle()

  if (error) {
    console.error('Errore lettura profiles:', error.message)
    return null
  }
  return data as ProfileRow | null
}

async function resolveOrgId(trainer: ProfileRow, athlete: ProfileRow): Promise<string> {
  const t = trainer.org_id
  const a = athlete.org_id
  if (t && a && t !== a) {
    throw new Error(
      `org_id diversi: trainer ${t} vs atleta ${a}. Allinea manualmente prima del seed.`,
    )
  }
  if (t ?? a) return (t ?? a) as string

  const { data: org } = await admin
    .from('organizations')
    .select('id')
    .eq('slug', 'default-org')
    .maybeSingle()
  if (org?.id) return org.id
  return 'default-org'
}

async function ensureOrgOnProfiles(trainer: ProfileRow, athlete: ProfileRow, orgId: string) {
  if (!trainer.org_id) {
    const { error } = await admin.from('profiles').update({ org_id: orgId }).eq('id', trainer.id)
    if (error) throw new Error(`Update org_id trainer: ${error.message}`)
  }
  if (!athlete.org_id) {
    const { error } = await admin.from('profiles').update({ org_id: orgId }).eq('id', athlete.id)
    if (error) throw new Error(`Update org_id atleta: ${error.message}`)
  }
}

async function ensureTrainerRole(row: ProfileRow) {
  if (row.role === 'trainer') return
  const c = canonicalTrainerRole(row.role)
  if (c !== 'trainer') {
    throw new Error(
      `Profilo trainer ${row.email}: role="${row.role}" non riconosciuto come trainer/pt/staff`,
    )
  }
  const { error } = await admin.from('profiles').update({ role: 'trainer' }).eq('id', row.id)
  if (error) throw new Error(`Aggiornamento ruolo trainer: ${error.message}`)
  row.role = 'trainer'
}

async function ensureAthleteRole(row: ProfileRow) {
  if (row.role === 'athlete') return
  const c = canonicalAthleteRole(row.role)
  if (c !== 'athlete') {
    throw new Error(
      `Profilo atleta ${row.email}: role="${row.role}" non riconosciuto come athlete/atleta`,
    )
  }
  const { error } = await admin.from('profiles').update({ role: 'athlete' }).eq('id', row.id)
  if (error) throw new Error(`Aggiornamento ruolo atleta: ${error.message}`)
  row.role = 'athlete'
}

async function syncPtAtleti(trainerProfileId: string, athleteProfileId: string) {
  const { data: existing } = await admin
    .from('pt_atleti')
    .select('id')
    .eq('atleta_id', athleteProfileId)
    .maybeSingle()

  if (existing?.id) {
    const { error } = await admin
      .from('pt_atleti')
      .update({ pt_id: trainerProfileId, assigned_at: new Date().toISOString() })
      .eq('atleta_id', athleteProfileId)
    if (error) console.warn('⚠️ pt_atleti update:', error.message)
    return
  }

  const { error } = await admin.from('pt_atleti').insert({
    pt_id: trainerProfileId,
    atleta_id: athleteProfileId,
    assigned_at: new Date().toISOString(),
  })
  if (error) console.warn('⚠️ pt_atleti insert:', error.message)
}

async function ensureAssignment(trainer: ProfileRow, athlete: ProfileRow, orgId: string) {
  const { data: already } = await admin
    .from('athlete_trainer_assignments')
    .select('id')
    .eq('athlete_id', athlete.id)
    .eq('trainer_id', trainer.id)
    .eq('status', 'active')
    .maybeSingle()

  if (already?.id) {
    console.log('✅ Assegnazione attiva già presente (idempotente).')
    return
  }

  await admin
    .from('athlete_trainer_assignments')
    .update({ status: 'inactive', deactivated_at: new Date().toISOString() })
    .eq('athlete_id', athlete.id)
    .eq('status', 'active')

  const activated_at = new Date().toISOString()
  const { error } = await admin.from('athlete_trainer_assignments').insert({
    org_id: orgId,
    org_id_text: orgId,
    athlete_id: athlete.id,
    trainer_id: trainer.id,
    status: 'active',
    activated_at,
    created_by_profile_id: trainer.id,
  })

  if (error) throw new Error(`INSERT athlete_trainer_assignments: ${error.message}`)
  console.log('✅ Creata assegnazione athlete_trainer_assignments (active).')
}

async function main() {
  console.log('E2E seed trainer ↔ atleta\n')

  const trainer = await loadProfileByEmail(TRAINER_EMAIL)
  const athlete = await loadProfileByEmail(ATHLETE_EMAIL)

  if (!trainer?.id) {
    console.error(`❌ Nessun profile per trainer email: ${TRAINER_EMAIL}`)
    process.exit(1)
  }
  if (!athlete?.id) {
    console.error(`❌ Nessun profile per atleta email: ${ATHLETE_EMAIL}`)
    process.exit(1)
  }

  if (trainer.id === athlete.id) {
    console.error('❌ Trainer e atleta coincidono (stesso profile id).')
    process.exit(1)
  }

  await ensureTrainerRole(trainer)
  await ensureAthleteRole(athlete)

  const orgId = await resolveOrgId(trainer, athlete)
  await ensureOrgOnProfiles(trainer, athlete, orgId)

  await ensureAssignment(trainer, athlete, orgId)
  await syncPtAtleti(trainer.id, athlete.id)

  console.log('\nFatto.')
}

main().catch((e) => {
  console.error('❌', e instanceof Error ? e.message : e)
  process.exit(1)
})
