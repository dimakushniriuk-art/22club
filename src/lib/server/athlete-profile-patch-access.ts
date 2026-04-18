import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import { normalizeRole } from '@/lib/utils/role-normalizer'
import type { Tables } from '@/types/supabase'

const logger = createLogger('lib:athlete-profile-patch-access')

export type ProfileActor = Pick<Tables<'profiles'>, 'id' | 'org_id' | 'role'>
export type ProfileTarget = Pick<Tables<'profiles'>, 'id' | 'org_id' | 'user_id' | 'role'>

type ResolveSource = 'admin' | 'session'

function profileRowHasAuthId(row: unknown): row is ProfileTarget {
  return (
    !!row &&
    typeof row === 'object' &&
    'user_id' in row &&
    typeof (row as { user_id: unknown }).user_id === 'string' &&
    (row as { user_id: string }).user_id.length > 0
  )
}

async function resolveAthleteProfileByIdentifier(
  admin: ReturnType<typeof createAdminClient>,
  userSupabase: Awaited<ReturnType<typeof createClient>>,
  identifier: string,
): Promise<{ profile: ProfileTarget; source: ResolveSource } | null> {
  const tryOnce = async (
    label: string,
    client: ReturnType<typeof createAdminClient> | Awaited<ReturnType<typeof createClient>>,
    column: 'user_id' | 'id',
  ): Promise<ProfileTarget | null> => {
    const { data, error } = await client
      .from('profiles')
      .select('id, org_id, user_id, role')
      .eq(column, identifier)
      .maybeSingle()

    if (error) {
      logger.warn('resolveAthleteProfileByIdentifier', {
        label,
        column,
        identifier,
        code: error.code,
        message: error.message,
      })
    }
    if (profileRowHasAuthId(data)) {
      return data
    }
    return null
  }

  const adminHit =
    (await tryOnce('admin+user_id', admin, 'user_id')) || (await tryOnce('admin+id', admin, 'id'))
  if (adminHit) {
    return { profile: adminHit, source: 'admin' }
  }

  const sessionHit =
    (await tryOnce('session+user_id', userSupabase, 'user_id')) ||
    (await tryOnce('session+id', userSupabase, 'id'))
  if (sessionHit) {
    return { profile: sessionHit, source: 'session' }
  }

  return null
}

export type AthleteWriteDbClient =
  | ReturnType<typeof createAdminClient>
  | Awaited<ReturnType<typeof createClient>>

/**
 * Verifica sessione + permessi staff/self e restituisce `athlete_id` (auth uid) e client DB per upsert.
 */
export async function assertAthleteProfileWriteAllowed(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: User,
  athleteIdentifier: string,
  logPrefix: string,
): Promise<
  | { ok: false; response: NextResponse }
  | { ok: true; athleteAuthId: string; writeDb: AthleteWriteDbClient }
> {
  let admin: ReturnType<typeof createAdminClient>
  try {
    admin = createAdminClient()
  } catch (e) {
    logger.error('SUPABASE_SERVICE_ROLE_KEY mancante o admin client non inizializzato', e)
    return {
      ok: false,
      response: NextResponse.json({ error: 'Configurazione server incompleta' }, { status: 500 }),
    }
  }

  const resolved = await resolveAthleteProfileByIdentifier(admin, supabase, athleteIdentifier)
  if (!resolved) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Atleta non trovato o profilo senza user_id' },
        { status: 404 },
      ),
    }
  }

  if (resolved.source === 'session') {
    logger.warn(
      `${logPrefix}: profilo risolto solo con sessione JWT (admin non ha trovato la riga). Upsert via RLS — allineare SUPABASE_SERVICE_ROLE_KEY a NEXT_PUBLIC_SUPABASE_URL.`,
      { identifier: athleteIdentifier },
    )
  }

  const writeDb = resolved.source === 'admin' ? admin : supabase
  const target = resolved.profile
  const athleteAuthId = target.user_id
  if (!athleteAuthId) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Profilo atleta senza user_id' }, { status: 404 }),
    }
  }

  if (user.id === athleteAuthId) {
    return { ok: true, athleteAuthId, writeDb }
  }

  const { data: actorRow, error: actorErr } = await supabase
    .from('profiles')
    .select('id, org_id, role')
    .eq('user_id', user.id)
    .single()

  if (actorErr || !actorRow) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 }),
    }
  }
  const actor = actorRow as ProfileActor

  const actorNorm = normalizeRole(actor.role)
  if (actorNorm === 'athlete') {
    return { ok: false, response: NextResponse.json({ error: 'Accesso negato' }, { status: 403 }) }
  }

  if (target.org_id !== actor.org_id) {
    return { ok: false, response: NextResponse.json({ error: 'Accesso negato' }, { status: 403 }) }
  }

  if (actorNorm === 'trainer') {
    const { data: relation } = await supabase
      .from('athlete_trainer_assignments')
      .select('id')
      .eq('trainer_id', actor.id)
      .eq('athlete_id', target.id)
      .eq('status', 'active')
      .maybeSingle()

    if (!relation) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Atleta non assegnato' }, { status: 403 }),
      }
    }
  }

  return { ok: true, athleteAuthId, writeDb }
}
