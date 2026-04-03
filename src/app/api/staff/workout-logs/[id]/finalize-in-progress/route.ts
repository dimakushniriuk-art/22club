/**
 * POST /api/staff/workout-logs/[id]/finalize-in-progress
 * Chiude un workout_log bloccato in `in_corso` ricalcolando volumi e conteggi da `workout_sets`.
 * Solo trainer/admin su atleta assegnato (stesse garanzie delle altre API staff).
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { createClient } from '@/lib/supabase/server'
import { resolveProfileByIdentifier } from '@/lib/utils/resolve-profile-by-identifier'
import { normalizeRole } from '@/lib/utils/role-normalizer'
import { createLogger } from '@/lib/logger'
import type { Database } from '@/lib/supabase/types'

const logger = createLogger('api:staff:workout-logs:finalize-in-progress')

type WorkoutLogUpdate = Database['public']['Tables']['workout_logs']['Update']

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
}

function athleteProfileIdFromLog(log: {
  atleta_id?: string | null
  athlete_id?: string | null
}): string {
  const a = typeof log.atleta_id === 'string' ? log.atleta_id.trim() : ''
  const b = typeof log.athlete_id === 'string' ? log.athlete_id.trim() : ''
  return a || b
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: logId } = await params
    if (!logId || !isUuid(logId)) {
      return NextResponse.json({ error: 'ID non valido' }, { status: 400 })
    }

    let body: Record<string, unknown> = {}
    try {
      const raw = await request.json()
      if (raw && typeof raw === 'object' && raw !== null) {
        body = raw as Record<string, unknown>
      }
    } catch {
      /* body opzionale */
    }

    const coachedExplicit = typeof body.coached === 'boolean' ? body.coached : undefined

    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const profileRow = await resolveProfileByIdentifier(supabase, user.id, 'id, role')
    if (!profileRow || typeof profileRow.id !== 'string') {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }

    const normalized = normalizeRole(profileRow.role as string | undefined)
    if (normalized !== 'trainer' && normalized !== 'admin') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    const { data: logRow, error: logErr } = await supabase
      .from('workout_logs')
      .select(
        'id, atleta_id, athlete_id, stato, started_at, data, esercizi_totali, esercizi_completati, note, is_coached, execution_mode, coached_by_profile_id',
      )
      .eq('id', logId)
      .maybeSingle()

    if (logErr) {
      logger.warn('workout_logs lookup', logErr, { logId })
      return NextResponse.json(
        { error: logErr.message || 'Errore lettura log' },
        { status: 502 },
      )
    }

    if (!logRow?.id) {
      return NextResponse.json({ error: 'Log non trovato' }, { status: 404 })
    }

    const athleteProfileId = athleteProfileIdFromLog(logRow)
    if (!athleteProfileId) {
      return NextResponse.json({ error: 'Log senza atleta' }, { status: 400 })
    }

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
      allowed = assigned === true
    }

    if (!allowed) {
      return NextResponse.json({ error: 'Non autorizzato su questo atleta' }, { status: 403 })
    }

    const stato = String(logRow.stato ?? '').toLowerCase()
    if (stato !== 'in_corso' && stato !== 'in_progress') {
      return NextResponse.json(
        { error: 'Il log non è in corso: impossibile finalizzarlo da qui.' },
        { status: 409 },
      )
    }

    const { data: setsRows, error: setsErr } = await supabase
      .from('workout_sets')
      .select('workout_day_exercise_id, reps, weight_kg')
      .eq('workout_log_id', logId)

    if (setsErr) {
      logger.warn('workout_sets read', setsErr, { logId })
      return NextResponse.json(
        { error: setsErr.message || 'Errore lettura serie' },
        { status: 502 },
      )
    }

    const rows = setsRows ?? []
    if (rows.length === 0) {
      return NextResponse.json(
        {
          error:
            'Nessuna serie salvata per questa sessione: non c’è nulla da finalizzare sul database.',
        },
        { status: 400 },
      )
    }

    const distinctWde = new Set<string>()
    let volumeTotale = 0
    for (const row of rows) {
      const wde = typeof row.workout_day_exercise_id === 'string' ? row.workout_day_exercise_id : ''
      if (wde) distinctWde.add(wde)
      const r = row.reps ?? 0
      const w = row.weight_kg != null ? Number(row.weight_kg) : 0
      if (r > 0 && w >= 0) volumeTotale += r * w
    }

    const eserciziCompletati = distinctWde.size
    const totFromLog =
      logRow.esercizi_totali != null && Number.isFinite(Number(logRow.esercizi_totali))
        ? Number(logRow.esercizi_totali)
        : 0
    const eserciziTotali = Math.max(totFromLog, eserciziCompletati)

    const completedAt = new Date().toISOString()
    const today = completedAt.split('T')[0]

    let durataMinuti: number | null = null
    if (logRow.started_at) {
      const t0 = new Date(logRow.started_at).getTime()
      if (Number.isFinite(t0)) {
        durataMinuti = Math.max(0, Math.round((Date.now() - t0) / 60000))
      }
    }

    const coached =
      coachedExplicit !== undefined ? coachedExplicit : Boolean(logRow.is_coached)

    let coachedByProfileId: string | null =
      typeof logRow.coached_by_profile_id === 'string' ? logRow.coached_by_profile_id.trim() : null

    let executionMode: 'solo' | 'coached' =
      logRow.execution_mode === 'coached' ? 'coached' : 'solo'

    if (coached) {
      executionMode = 'coached'
      if (!coachedByProfileId && normalized === 'trainer') {
        const { data: tid, error: tidErr } = await supabase.rpc('get_current_trainer_profile_id')
        if (tidErr) {
          logger.warn('get_current_trainer_profile_id', tidErr)
        }
        const pid = typeof tid === 'string' ? tid.trim() : ''
        coachedByProfileId = pid || null
      }
    } else {
      executionMode = 'solo'
      coachedByProfileId = null
    }

    const prevNote = typeof logRow.note === 'string' ? logRow.note.trim() : ''
    const noteSuffix = 'Finalizzato da staff (sessione recuperata)'
    const note = prevNote ? `${prevNote} · ${noteSuffix}` : noteSuffix

    const patch: WorkoutLogUpdate = {
      stato: 'completato',
      completato: true,
      completed_at: completedAt,
      data: logRow.data ?? today,
      esercizi_completati: eserciziCompletati,
      esercizi_totali: eserciziTotali,
      durata_minuti: durataMinuti,
      volume_totale: volumeTotale > 0 ? volumeTotale : null,
      note,
      execution_mode: executionMode,
      is_coached: coached,
      coached_by_profile_id: coachedByProfileId,
    }

    const { error: updErr } = await supabase.from('workout_logs').update(patch).eq('id', logId)

    if (updErr) {
      logger.error('workout_logs finalize update', updErr, { logId })
      return NextResponse.json({ error: updErr.message || 'Aggiornamento fallito' }, { status: 502 })
    }

    return NextResponse.json({
      ok: true,
      workout_log_id: logId,
      esercizi_completati: eserciziCompletati,
      esercizi_totali: eserciziTotali,
      volume_totale: volumeTotale > 0 ? volumeTotale : null,
      coached,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Errore interno'
    logger.error('finalize-in-progress', e)
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === 'development'
            ? message
            : 'Errore interno. Controlla i log server o riprova.',
      },
      { status: 500 },
    )
  }
}
