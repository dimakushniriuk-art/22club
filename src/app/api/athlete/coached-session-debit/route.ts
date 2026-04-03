import { NextResponse } from 'next/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { coachedAppDebitReasonForWorkoutLog } from '@/lib/credits/coached-debit-reason'
import { isAthleteAssignedToTrainerProfileIdAdmin } from '@/lib/credits/is-athlete-assigned-to-trainer-profile-admin'
import { hasOverlappingAppointmentTrainingDebit } from '@/lib/credits/session-debit-dedup'
import { createLogger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { resolveProfileByIdentifier } from '@/lib/utils/resolve-profile-by-identifier'

const logger = createLogger('api:athlete:coached-session-debit')

const PG_UNIQUE_VIOLATION = '23505'

type CallerProfileRow = { id: string; role: string | null; org_id: string | null }

/** Colonne minime per debit; lettura prima con sessione (RLS), poi admin. */
const WORKOUT_LOG_DEBIT_SELECT =
  'id, atleta_id, athlete_id, stato, is_coached, execution_mode, coached_by_profile_id, completed_at, data'

type WorkoutLogDebitRow = {
  id: string
  atleta_id?: string | null
  athlete_id?: string | null
  stato?: string | null
  is_coached?: boolean | null
  execution_mode?: string | null
  coached_by_profile_id?: string | null
  completed_at?: string | null
  data?: string | null
}

function normalizeOrgId(raw: string | null | undefined): string {
  return raw == null ? '' : String(raw).trim().toLowerCase()
}

function normUuidStr(s: string): string {
  return s.trim().toLowerCase()
}

async function trainerAndAthleteSameOrg(
  admin: ReturnType<typeof createAdminClient>,
  athleteProfileId: string,
  prof: CallerProfileRow,
): Promise<boolean> {
  let trainerOrg = normalizeOrgId(prof.org_id)
  if (trainerOrg === '') {
    const { data: admRow } = await admin
      .from('profiles')
      .select('org_id')
      .eq('id', normUuidStr(prof.id))
      .maybeSingle()
    trainerOrg = normalizeOrgId(admRow?.org_id as string | null | undefined)
  }
  const { data: athRow } = await admin
    .from('profiles')
    .select('org_id')
    .eq('id', normUuidStr(athleteProfileId))
    .maybeSingle()
  const athleteOrg = normalizeOrgId(athRow?.org_id as string | null | undefined)
  return athleteOrg !== '' && athleteOrg === trainerOrg
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

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

    /** Stessa risoluzione della dashboard: id profilo = auth.uid() oppure user_id (admin da solo spesso non basta). */
    let prof: CallerProfileRow | null = null
    const resolved = await resolveProfileByIdentifier(supabase, user.id, 'id, role, org_id')
    if (resolved && typeof resolved.id === 'string') {
      prof = {
        id: resolved.id,
        role: typeof resolved.role === 'string' ? resolved.role : null,
        org_id: typeof resolved.org_id === 'string' ? resolved.org_id : null,
      }
    }

    if (!prof?.id) {
      const { data: byUserId, error: errUserId } = await admin
        .from('profiles')
        .select('id, role, org_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

      if (errUserId) {
        logger.error('Lettura profilo (admin, user_id)', errUserId, { authUserId: user.id })
      } else if (byUserId?.id) {
        prof = byUserId as CallerProfileRow
      }
    }

    if (!prof?.id) {
      const { data: byEither, error: errEither } = await admin
        .from('profiles')
        .select('id, role, org_id')
        .or(`id.eq.${user.id},user_id.eq.${user.id}`)
        .limit(1)
        .maybeSingle()
      if (errEither) {
        logger.error('Lettura profilo (admin, fallback)', errEither, { authUserId: user.id })
        return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
      }
      if (byEither?.id) {
        prof = byEither as CallerProfileRow
      }
    }

    if (!prof?.id) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }

    let log: WorkoutLogDebitRow | null = null

    const sessionLogRes = await supabase
      .from('workout_logs')
      .select(WORKOUT_LOG_DEBIT_SELECT)
      .eq('id', workout_log_id)
      .maybeSingle()

    if (!sessionLogRes.error && sessionLogRes.data) {
      log = sessionLogRes.data as WorkoutLogDebitRow
    } else {
      if (sessionLogRes.error) {
        logger.warn('Lettura workout_log (sessione)', sessionLogRes.error, { workout_log_id })
      }
      const adminLogRes = await admin
        .from('workout_logs')
        .select(WORKOUT_LOG_DEBIT_SELECT)
        .eq('id', workout_log_id)
        .maybeSingle()

      if (adminLogRes.error) {
        logger.error('Lettura workout_log (admin)', adminLogRes.error, { workout_log_id })
        return NextResponse.json(
          {
            error:
              adminLogRes.error.message ||
              sessionLogRes.error?.message ||
              'Errore lettura log',
            code: adminLogRes.error.code,
          },
          { status: 502 },
        )
      }
      log = (adminLogRes.data as WorkoutLogDebitRow | null) ?? null
    }

    if (!log) {
      return NextResponse.json({ error: 'Log non trovato' }, { status: 404 })
    }

    const athleteProfileId =
      (typeof log.atleta_id === 'string' && log.atleta_id.trim()) ||
      (typeof log.athlete_id === 'string' && log.athlete_id.trim()) ||
      ''

    if (!athleteProfileId) {
      return NextResponse.json({ error: 'Log senza atleta' }, { status: 400 })
    }

    const role = String(prof.role ?? '').toLowerCase()

    const { data: isAdminRpc, error: isAdminErr } = await supabase.rpc('is_admin')
    if (isAdminErr) {
      logger.warn('is_admin rpc', isAdminErr, { workout_log_id })
    }
    const isAdminUser = Boolean(isAdminRpc)

    let authorized = false

    if (role === 'athlete' || role === 'atleta') {
      authorized = athleteProfileId === prof.id
    } else if (isAdminUser || role === 'admin' || role === 'owner') {
      const { data: athOrg } = await admin
        .from('profiles')
        .select('org_id')
        .eq('id', athleteProfileId)
        .maybeSingle()
      const { data: admOrg } = await admin
        .from('profiles')
        .select('org_id')
        .eq('id', prof.id)
        .maybeSingle()
      const a = normalizeOrgId(athOrg?.org_id as string | null | undefined)
      const b = normalizeOrgId(admOrg?.org_id as string | null | undefined)
      authorized = a !== '' && a === b
    } else if (role === 'trainer' || role === 'pt' || role === 'staff') {
      /**
       * 1) Legami formali (allineati a `is_athlete_assigned_to_trainer` sul DB).
       * 2) Se mancano in DB ma il log coachato ha `coached_by_profile_id` = chiamante e stessa org,
       *    consenti la scalatura (sessione effettivamente condotta da quel profilo).
       */
      try {
        authorized = await isAthleteAssignedToTrainerProfileIdAdmin(
          admin,
          prof.id,
          athleteProfileId,
        )
        if (!authorized) {
          const coachId =
            typeof log.coached_by_profile_id === 'string'
              ? log.coached_by_profile_id.trim()
              : ''
          const coachedSession =
            Boolean(log.is_coached) ||
            String(log.execution_mode ?? '').toLowerCase() === 'coached'
          if (
            coachedSession &&
            coachId &&
            normUuidStr(coachId) === normUuidStr(prof.id)
          ) {
            /**
             * Stesso profilo coach e chiamante: autorizzazione sufficiente (no check org qui;
             * `profiles.org_id` può essere assente in lettura sessione mentre l’insert ledger
             * usa comunque l’org dell’atleta letta dopo con admin).
             */
            authorized = true
          }
        }
        /** Staff trainer/pt nella stessa org dell’atleta: scalatura consentita anche senza riga in pt_atleti/assignments (es. secondo PT di palestra). */
        if (!authorized) {
          const ok = await trainerAndAthleteSameOrg(admin, athleteProfileId, prof)
          if (ok) {
            authorized = true
          }
        }
      } catch (e) {
        logger.error('Verifica assegnazione trainer (admin)', e, { athleteProfileId })
        return NextResponse.json({ error: 'Verifica assegnazione fallita' }, { status: 502 })
      }
    }

    if (!authorized) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    const { data: athleteProf, error: athProfErr } = await admin
      .from('profiles')
      .select('org_id')
      .eq('id', athleteProfileId)
      .maybeSingle()

    if (athProfErr) {
      logger.error('Lettura org atleta', athProfErr, { athleteProfileId })
      return NextResponse.json({ error: 'Errore lettura profilo atleta' }, { status: 502 })
    }

    const orgRaw = athleteProf?.org_id as string | null | undefined
    if (orgRaw == null || String(orgRaw).trim() === '') {
      logger.error(
        'profiles.org_id mancante: insert credit_ledger fallirebbe (org mismatch)',
        undefined,
        { athleteProfileId },
      )
      return NextResponse.json(
        { error: 'Profilo atleta senza organizzazione: impossibile scalare le lezioni' },
        { status: 500 },
      )
    }
    const athleteOrgId = String(orgRaw).trim().toLowerCase()

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

    const stato = String(log.stato ?? '').toLowerCase()
    const completed = stato === 'completato' || stato === 'completed'
    /** Allineato al ramo autorizzazione: `execution_mode` può arrivare con casing misto da client/app. */
    const coached =
      Boolean(log.is_coached) ||
      String(log.execution_mode ?? '').toLowerCase().trim() === 'coached'

    if (!completed || !coached) {
      return NextResponse.json(
        { error: 'Il log non è un allenamento completato con trainer' },
        { status: 400 },
      )
    }

    const skipForCalendar = await hasOverlappingAppointmentTrainingDebit(admin, athleteProfileId, {
      completed_at: log.completed_at ?? null,
      data: log.data ?? null,
    })
    if (skipForCalendar) {
      return NextResponse.json({ ok: true, debited: false, skipped_duplicate_calendar: true })
    }

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
