import { NextResponse } from 'next/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { coachedAppDebitReasonForWorkoutLog } from '@/lib/credits/coached-debit-reason'
import { hasOverlappingAppointmentTrainingDebit } from '@/lib/credits/session-debit-dedup'
import { createLogger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const logger = createLogger('api:athlete:coached-session-debit')

const PG_UNIQUE_VIOLATION = '23505'

type AthleteProfileRow = { id: string; role: string | null; org_id: string | null }

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Admin: lettura profilo + insert ledger (trigger richiede org_id = profiles.org_id::text, minuscolo)
    let admin: ReturnType<typeof createAdminClient>
    try {
      admin = createAdminClient()
    } catch (e) {
      logger.error('createAdminClient fallito (es. SUPABASE_SERVICE_ROLE_KEY mancante)', e)
      return NextResponse.json(
        { error: 'Server non configurato per scalatura lezioni (chiave service role)' },
        { status: 503 },
      )
    }

    let prof: AthleteProfileRow | null = null
    const { data: byUserId, error: errUserId } = await admin
      .from('profiles')
      .select('id, role, org_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (errUserId) {
      logger.error('Lettura profilo atleta (admin, user_id)', errUserId, { authUserId: user.id })
    } else if (byUserId?.id) {
      prof = byUserId as AthleteProfileRow
    }

    if (!prof?.id) {
      const { data: byEither, error: errEither } = await admin
        .from('profiles')
        .select('id, role, org_id')
        .or(`id.eq.${user.id},user_id.eq.${user.id}`)
        .limit(1)
        .maybeSingle()
      if (errEither) {
        logger.error('Lettura profilo atleta (admin, fallback)', errEither, { authUserId: user.id })
        return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
      }
      if (byEither?.id) {
        prof = byEither as AthleteProfileRow
      }
    }

    if (!prof?.id) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }

    const role = String(prof.role ?? '').toLowerCase()
    if (role !== 'athlete' && role !== 'atleta') {
      return NextResponse.json({ error: 'Solo atleti' }, { status: 403 })
    }

    const athleteProfileId = prof.id as string
    const orgRaw = prof.org_id as string | null | undefined
    if (orgRaw == null || String(orgRaw).trim() === '') {
      logger.error(
        'profiles.org_id mancante: insert credit_ledger fallirebbe (org mismatch)',
        undefined,
        {
          athleteProfileId,
        },
      )
      return NextResponse.json(
        { error: 'Profilo atleta senza organizzazione: impossibile scalare le lezioni' },
        { status: 500 },
      )
    }
    // Allinea a PostgreSQL uuid::text (minuscolo) per trg_credit_ledger_athlete_org_match
    const athleteOrgId = String(orgRaw).trim().toLowerCase()

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Body JSON non valido' }, { status: 400 })
    }

    const workout_log_id =
      body &&
      typeof body === 'object' &&
      body !== null &&
      'workout_log_id' in body &&
      typeof (body as { workout_log_id: unknown }).workout_log_id === 'string'
        ? (body as { workout_log_id: string }).workout_log_id.trim()
        : ''

    if (!workout_log_id) {
      return NextResponse.json({ error: 'workout_log_id obbligatorio' }, { status: 400 })
    }

    // ── Idempotenza: controlla se abbiamo già inserito un DEBIT per questo log ──
    const reason = coachedAppDebitReasonForWorkoutLog(workout_log_id)
    const { data: existing } = await admin
      .from('credit_ledger')
      .select('id')
      .eq('athlete_id', athleteProfileId)
      .eq('entry_type', 'DEBIT')
      .eq('service_type', 'training')
      .eq('reason', reason)
      .limit(1)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ ok: true, debited: false, already: true })
    }

    // ── Leggi il workout_log ──
    const { data: log, error: logErr } = await admin
      .from('workout_logs')
      .select(
        'id, atleta_id, athlete_id, stato, is_coached, execution_mode, coached_by_profile_id, completed_at, data',
      )
      .eq('id', workout_log_id)
      .maybeSingle()

    if (logErr) {
      logger.error('Lettura workout_log', logErr, { workout_log_id })
      return NextResponse.json({ error: 'Errore lettura log' }, { status: 502 })
    }

    if (!log) {
      return NextResponse.json({ error: 'Log non trovato' }, { status: 404 })
    }

    const owner =
      log.atleta_id === athleteProfileId ||
      (log.athlete_id != null && log.athlete_id === athleteProfileId)

    if (!owner) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    const stato = String(log.stato ?? '').toLowerCase()
    const completed = stato === 'completato' || stato === 'completed'
    const coached = Boolean(log.is_coached) || String(log.execution_mode ?? '') === 'coached'

    if (!completed || !coached) {
      return NextResponse.json(
        { error: 'Il log non è un allenamento completato con trainer' },
        { status: 400 },
      )
    }

    // ── Dedup: calendario ha già scalato per la stessa finestra? ──
    const skipForCalendar = await hasOverlappingAppointmentTrainingDebit(admin, athleteProfileId, {
      completed_at: log.completed_at ?? null,
      data: log.data ?? null,
    })
    if (skipForCalendar) {
      return NextResponse.json({ ok: true, debited: false, skipped_duplicate_calendar: true })
    }

    // ── Inserisci DEBIT: minimal set, stesso pattern di addDebitFromAppointment ──
    const insertPayload: Record<string, unknown> = {
      entry_type: 'DEBIT',
      qty: -1,
      athlete_id: athleteProfileId,
      org_id: athleteOrgId,
      service_type: 'training',
      created_by_profile_id: log.coached_by_profile_id ?? null,
      reason,
    }

    const { error: insErr } = await admin.from('credit_ledger').insert(insertPayload as never)

    if (!insErr) {
      return NextResponse.json({ ok: true, debited: true })
    }

    if (insErr.code === PG_UNIQUE_VIOLATION) {
      return NextResponse.json({ ok: true, debited: false, already: true })
    }

    logger.error('Insert credit_ledger coached workout', insErr, {
      workout_log_id,
      insErrCode: insErr.code,
      insErrMessage: insErr.message,
      insErrDetails: insErr.details,
      insErrHint: insErr.hint,
    })
    return NextResponse.json(
      { error: insErr.message || 'Errore scalatura crediti', code: insErr.code },
      { status: 502 },
    )
  } catch (err) {
    logger.error('coached-session-debit non gestito', err)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
