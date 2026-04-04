/**
 * PATCH / DELETE progress_logs per trainer/admin/nutrizionista su atleta assegnato.
 * Usa il client Supabase con sessione (stesse RLS della dashboard): niente service role.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { createClient } from '@/lib/supabase/server'
import { resolveProfileByIdentifier } from '@/lib/utils/resolve-profile-by-identifier'
import { normalizeRole } from '@/lib/utils/role-normalizer'
import { getProgressLogsDbColumnForMisurazioneField } from '@/lib/progressi/misurazione-progress-log-row'
import { createLogger } from '@/lib/logger'
import type { Database } from '@/lib/supabase/types'

const logger = createLogger('api:staff:progress-logs-id')

type ProgressLogsUpdate = Database['public']['Tables']['progress_logs']['Update']

/** UUID con dash (allineato a ciò che restituisce Postgres/PostgREST). */
function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
}

type AssertResult = { ok: true } | { ok: false; response: NextResponse }

async function assertStaffCanMutateProgressLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  logId: string,
): Promise<AssertResult> {
  const { user } = await getServerAuthUser(supabase)
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Non autenticato' }, { status: 401 }) }
  }

  const profileRow = await resolveProfileByIdentifier(supabase, user.id, 'id, role')
  if (!profileRow || typeof profileRow.id !== 'string') {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 }),
    }
  }

  const normalized = normalizeRole(profileRow.role as string | undefined)
  if (normalized !== 'trainer' && normalized !== 'admin' && normalized !== 'nutrizionista') {
    return { ok: false, response: NextResponse.json({ error: 'Non autorizzato' }, { status: 403 }) }
  }

  const { data: logRow, error: logErr } = await supabase
    .from('progress_logs')
    .select('id, athlete_id')
    .eq('id', logId)
    .maybeSingle()

  if (logErr) {
    logger.warn('progress_logs lookup', logErr, { logId })
    return {
      ok: false,
      response: NextResponse.json(
        { error: logErr.message || 'Errore lettura misurazione' },
        { status: 502 },
      ),
    }
  }

  if (!logRow?.athlete_id) {
    return { ok: false, response: NextResponse.json({ error: 'Log non trovato' }, { status: 404 }) }
  }

  const athleteUserId = logRow.athlete_id as string
  const { data: athleteProfile, error: apErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', athleteUserId)
    .maybeSingle()

  if (apErr || !athleteProfile?.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Profilo atleta non trovato' }, { status: 404 }),
    }
  }

  const athleteProfileId = athleteProfile.id as string
  const staffProfileId = profileRow.id as string

  const { data: isAdminRpc, error: adminErr } = await supabase.rpc('is_admin')
  if (adminErr) {
    logger.warn('is_admin rpc', adminErr, { logId })
  }
  const isAdminUser = Boolean(isAdminRpc)

  let allowed = false
  if (isAdminUser || normalized === 'admin') {
    allowed = true
  } else if (normalized === 'trainer') {
    const { data: assigned, error: rpcErr } = await supabase.rpc(
      'is_athlete_assigned_to_current_trainer',
      { athlete_profile_id: athleteProfileId },
    )
    if (rpcErr) {
      logger.warn('is_athlete_assigned_to_current_trainer', rpcErr, { athleteProfileId })
    }
    allowed = Boolean(assigned)
  } else if (normalized === 'nutrizionista') {
    const { data: link } = await supabase
      .from('staff_atleti')
      .select('atleta_id')
      .eq('atleta_id', athleteProfileId)
      .eq('staff_id', staffProfileId)
      .eq('status', 'active')
      .eq('staff_type', 'nutrizionista')
      .maybeSingle()
    allowed = Boolean(link)
  }

  if (!allowed) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Non autorizzato su questo atleta' }, { status: 403 }),
    }
  }

  return { ok: true }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: logId } = await params
    if (!logId || !isUuid(logId)) {
      return NextResponse.json({ error: 'ID non valido' }, { status: 400 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'JSON non valido' }, { status: 400 })
    }

    const raw =
      body && typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {}
    const misurazioneField =
      typeof raw.misurazioneField === 'string' ? raw.misurazioneField.trim() : ''
    const valueRaw = raw.value
    const value =
      typeof valueRaw === 'number'
        ? valueRaw
        : typeof valueRaw === 'string' && valueRaw.trim() !== ''
          ? Number.parseFloat(valueRaw.replace(',', '.'))
          : NaN

    if (!misurazioneField || !Number.isFinite(value)) {
      return NextResponse.json(
        { error: 'misurazioneField e value numerico validi sono obbligatori' },
        { status: 400 },
      )
    }

    const dbCol = getProgressLogsDbColumnForMisurazioneField(misurazioneField)
    if (!dbCol) {
      return NextResponse.json({ error: 'Campo misurazione non supportato' }, { status: 400 })
    }

    const supabase = await createClient()
    const auth = await assertStaffCanMutateProgressLog(supabase, logId)
    if (!auth.ok) {
      return auth.response
    }

    const patchPayload: ProgressLogsUpdate = {
      [dbCol]: value,
    } as ProgressLogsUpdate
    if (misurazioneField === 'coscia_media_cm') {
      patchPayload.thighs_cm = value
    }

    const { error: upErr } = await supabase
      .from('progress_logs')
      .update(patchPayload)
      .eq('id', logId)
    if (upErr) {
      logger.error('PATCH progress_logs', upErr, { logId })
      return NextResponse.json({ error: upErr.message }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    logger.error('PATCH staff progress-logs', e)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: logId } = await params
    if (!logId || !isUuid(logId)) {
      return NextResponse.json({ error: 'ID non valido' }, { status: 400 })
    }

    const supabase = await createClient()
    const auth = await assertStaffCanMutateProgressLog(supabase, logId)
    if (!auth.ok) {
      return auth.response
    }

    const { error: delErr } = await supabase.from('progress_logs').delete().eq('id', logId)
    if (delErr) {
      logger.error('DELETE progress_logs', delErr, { logId })
      return NextResponse.json({ error: delErr.message }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    logger.error('DELETE staff progress-logs', e)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
