/**
 * GET /api/athlete/progress-logs — elenco misurazioni (sessione JWT, stesse RLS del client).
 * POST /api/athlete/progress-logs — inserisce progress_logs per l'atleta autenticato.
 */
import { NextResponse } from 'next/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { createClient } from '@/lib/supabase/server'
import { resolveProfileByIdentifier } from '@/lib/utils/resolve-profile-by-identifier'
import { createLogger } from '@/lib/logger'
import type { Database } from '@/lib/supabase/types'

const logger = createLogger('api:athlete:progress-logs')

type ProgressLogInsert = Database['public']['Tables']['progress_logs']['Insert']

/** Chiavi ammesse dal body (allineate a progress_logs.Insert); id/timestamp/creatore si impostano lato server. */
const ALLOWED_PAYLOAD_KEYS = new Set<string>(
  [
    'addome_basso_cm',
    'adiposita_centrale',
    'apertura_braccia_cm',
    'area_superficie_corporea_m2',
    'avambraccio_cm',
    'biceps_cm',
    'braccio_contratto_cm',
    'braccio_corretto_cm',
    'braccio_rilassato_cm',
    'capacita_dispersione_calore',
    'caviglia_cm',
    'chest_cm',
    'collo_cm',
    'coscia_alta_cm',
    'coscia_bassa_cm',
    'coscia_corretta_cm',
    'coscia_media_cm',
    'date',
    'diametro_bistiloideo_cm',
    'diametro_femore_cm',
    'diametro_omero_cm',
    'dispendio_energetico_totale_kcal',
    'ectomorfia',
    'endomorfia',
    'gamba_corretta_cm',
    'ginocchio_cm',
    'glutei_cm',
    'hips_cm',
    'imc',
    'indice_adiposo_muscolare',
    'indice_conicita',
    'indice_cormico',
    'indice_manouvrier',
    'indice_muscolo_osseo',
    'indice_vita_fianchi',
    'livello_attivita',
    'massa_grassa_kg',
    'massa_grassa_percentuale',
    'massa_magra_kg',
    'massa_muscolare_kg',
    'massa_muscolare_scheletrica_kg',
    'massa_ossea_kg',
    'massa_residuale_kg',
    'max_bench_kg',
    'max_deadlift_kg',
    'max_squat_kg',
    'mesomorfia',
    'metabolismo_basale_kcal',
    'mood_text',
    'note',
    'plica_addominale_mm',
    'plica_bicipite_mm',
    'plica_coscia_mm',
    'plica_cresta_iliaca_mm',
    'plica_gamba_mm',
    'plica_sopraspinale_mm',
    'plica_sottoscapolare_mm',
    'plica_tricipite_mm',
    'polpaccio_cm',
    'polso_cm',
    'rischio_cardiometabolico',
    'source',
    'spalle_cm',
    'statura_allungata_cm',
    'statura_seduto_cm',
    'struttura_muscolo_scheletrica',
    'thighs_cm',
    'torace_inspirazione_cm',
    'vita_alta_cm',
    'waist_cm',
    'weight_kg',
  ] as const,
)

function pickPayload(raw: Record<string, unknown>): Partial<ProgressLogInsert> {
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(raw)) {
    if (!ALLOWED_PAYLOAD_KEYS.has(key)) continue
    out[key] = raw[key]
  }
  return out as Partial<ProgressLogInsert>
}

function isRlsDenied(code: string | undefined, message: string | undefined): boolean {
  if (code === '42501') return true
  const m = (message ?? '').toLowerCase()
  return m.includes('row-level security') || m.includes('rls')
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const profileRow = await resolveProfileByIdentifier(supabase, user.id, 'id, role')
    if (!profileRow) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }

    const role = String((profileRow as { role?: string }).role ?? '').toLowerCase()
    if (role !== 'athlete' && role !== 'atleta') {
      return NextResponse.json({ error: 'Solo atleti possono consultare lo storico da qui' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limitRaw = searchParams.get('limit')
    const limit = Math.min(Math.max(parseInt(limitRaw ?? '50', 10) || 50, 1), 100)

    const { data, error } = await supabase
      .from('progress_logs')
      .select('*')
      .eq('athlete_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      logger.warn('GET progress_logs', error, { userId: user.id })
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: 502 },
      )
    }

    return NextResponse.json({ data: data ?? [] })
  } catch (e) {
    logger.error('GET progress-logs', e)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const profileRow = await resolveProfileByIdentifier(supabase, user.id, 'id, user_id, role')
    if (!profileRow) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }

    const role = String((profileRow as { role?: string }).role ?? '').toLowerCase()
    if (role !== 'athlete' && role !== 'atleta') {
      return NextResponse.json({ error: 'Solo atleti possono registrare misurazioni da qui' }, { status: 403 })
    }

    const profileId = (profileRow as { id: string }).id
    const userId = user.id

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'JSON non valido' }, { status: 400 })
    }

    const payload =
      body && typeof body === 'object' && body !== null && 'payload' in body
        ? (body as { payload: unknown }).payload
        : body

    if (!payload || typeof payload !== 'object' || payload === null) {
      return NextResponse.json({ error: 'Campo payload mancante' }, { status: 400 })
    }

    const picked = pickPayload(payload as Record<string, unknown>)
    const dateVal = typeof picked.date === 'string' && picked.date.trim() ? picked.date.trim() : ''
    if (!dateVal) {
      return NextResponse.json({ error: 'Data misurazione obbligatoria' }, { status: 400 })
    }

    // Inserimento atleta: athlete_id = profiles.user_id (= auth.uid()). created_by_profile_id opzionale;
    // alcune installazioni DB hanno policy/FK sensibili: prima prova senza creatore (WITH CHECK più semplice).
    const baseRow: ProgressLogInsert = {
      ...picked,
      date: dateVal,
      athlete_id: userId,
    }

    let sessionInsert = await supabase
      .from('progress_logs')
      .insert({ ...baseRow, created_by_profile_id: profileId })

    if (sessionInsert.error && isRlsDenied(sessionInsert.error.code, sessionInsert.error.message)) {
      sessionInsert = await supabase
        .from('progress_logs')
        .insert({ ...baseRow })
    }

    if (!sessionInsert.error) {
      return NextResponse.json({ ok: true })
    }

    const err0 = sessionInsert.error
    logger.error('Insert progress_logs (session)', err0, { userId, profileId })
    if (isRlsDenied(err0.code, err0.message)) {
      return NextResponse.json(
        {
          error: err0.message,
          code: err0.code,
          details: err0.details,
          hint:
            'Controlla in pg_policies se esistono policy INSERT restrictive su progress_logs. La policy SELECT atleta usa spesso profiles.id = athlete_id (inconsistente se athlete_id è user_id): allinea le policy o verifica permissive/restrictive.',
        },
        { status: 403 },
      )
    }

    return NextResponse.json(
      {
        error: err0.message,
        code: err0.code,
        details: err0.details,
        hint: err0.hint,
      },
      { status: 502 },
    )
  } catch (e) {
    logger.error('POST progress-logs', e)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
