import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import type { Tables } from '@/types/supabase'
import type { Database } from '@/lib/supabase/types'
import {
  DEFAULT_EXERCISE_CATEGORY,
  EXERCISE_CATEGORIES,
  isExerciseManagerRole,
} from '@/lib/exercises-data'
import {
  validateExerciseThumbUrl,
  validateExerciseVideoUrl,
} from '@/lib/validations/exercise-media-urls'

const logger = createLogger('api:exercises')

type ProfileStaffRow = Pick<Tables<'profiles'>, 'id' | 'org_id' | 'org_id_text' | 'role'>

function parseCategoryInput(
  raw: unknown,
): { ok: true; value: string } | { ok: false; error: string } {
  if (raw === undefined || raw === null || raw === '') {
    return { ok: true, value: DEFAULT_EXERCISE_CATEGORY }
  }
  if (typeof raw !== 'string') return { ok: false, error: 'Categoria non valida' }
  const t = raw.trim()
  if (!t) return { ok: true, value: DEFAULT_EXERCISE_CATEGORY }
  if ((EXERCISE_CATEGORIES as readonly string[]).includes(t)) return { ok: true, value: t }
  return { ok: false, error: 'Categoria esercizio non riconosciuta' }
}

/**
 * GET /api/exercises
 * Ottiene tutti gli esercizi disponibili
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      logger.error('Errore durante il recupero degli esercizi', error)
      return NextResponse.json({ error: 'Errore durante il recupero' }, { status: 500 })
    }

    return NextResponse.json({ data: exercises || [] })
  } catch (error) {
    logger.error('Errore durante il recupero degli esercizi', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

/**
 * POST /api/exercises
 * Crea un nuovo esercizio
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const body = (await request.json()) as Record<string, unknown>

    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'Nome esercizio richiesto' }, { status: 400 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, org_id, org_id_text, role')
      .eq('user_id', session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }
    const profileTyped = profile as ProfileStaffRow

    if (!isExerciseManagerRole(profileTyped.role)) {
      return NextResponse.json(
        { error: 'Permesso negato: solo trainer, PT o admin possono creare esercizi.' },
        { status: 403 },
      )
    }

    const muscleGroupValue =
      body.muscle_groups !== undefined
        ? Array.isArray(body.muscle_groups)
          ? body.muscle_groups.join(', ')
          : String(body.muscle_groups)
        : body.muscle_group !== undefined
          ? typeof body.muscle_group === 'string'
            ? body.muscle_group
            : String(body.muscle_group)
          : null

    const trimmedMg = typeof muscleGroupValue === 'string' ? muscleGroupValue.trim() : ''
    if (!trimmedMg) {
      return NextResponse.json({ error: 'Gruppo muscolare richiesto' }, { status: 400 })
    }

    const catParsed = parseCategoryInput(body.category)
    if (!catParsed.ok) {
      return NextResponse.json({ error: catParsed.error }, { status: 400 })
    }

    let difficulty: 'bassa' | 'media' | 'alta' = 'media'
    if (body.difficulty === 'bassa' || body.difficulty === 'media' || body.difficulty === 'alta') {
      difficulty = body.difficulty
    }

    const videoErr = validateExerciseVideoUrl(
      typeof body.video_url === 'string' ? body.video_url : null,
    )
    if (videoErr) {
      return NextResponse.json({ error: videoErr }, { status: 400 })
    }
    const thumbErr = validateExerciseThumbUrl(
      typeof body.thumb_url === 'string' ? body.thumb_url : null,
    )
    if (thumbErr) {
      return NextResponse.json({ error: thumbErr }, { status: 400 })
    }

    let durationSeconds: number | null = null
    if (body.duration_seconds !== undefined && body.duration_seconds !== null) {
      const n = Number(body.duration_seconds)
      if (!Number.isFinite(n) || n < 0) {
        return NextResponse.json({ error: 'Durata (secondi) non valida' }, { status: 400 })
      }
      durationSeconds = Math.round(n)
    }

    const exerciseData: Database['public']['Tables']['exercises']['Insert'] = {
      name: body.name.trim(),
      description: typeof body.description === 'string' ? body.description || null : null,
      muscle_group: trimmedMg,
      equipment: typeof body.equipment === 'string' ? body.equipment || null : null,
      difficulty,
      category: catParsed.value,
      duration_seconds: durationSeconds,
      video_url: typeof body.video_url === 'string' ? body.video_url || null : null,
      image_url: typeof body.image_url === 'string' ? body.image_url || null : null,
      thumb_url: typeof body.thumb_url === 'string' ? body.thumb_url || null : null,
      created_by_profile_id: profileTyped.id,
      org_id: profileTyped.org_id,
      org_id_text:
        profileTyped.org_id_text != null && profileTyped.org_id_text !== ''
          ? profileTyped.org_id_text
          : null,
    }

    const { data: exercise, error } = await supabase
      .from('exercises')
      .insert(exerciseData as Database['public']['Tables']['exercises']['Insert'])
      .select()
      .single()

    if (error) {
      logger.error("Errore durante la creazione dell'esercizio", error, { exerciseData })
      return NextResponse.json({ error: 'Errore durante la creazione' }, { status: 500 })
    }

    return NextResponse.json({ data: exercise }, { status: 201 })
  } catch (error) {
    logger.error("Errore durante la creazione dell'esercizio", error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

/**
 * PUT /api/exercises
 * Aggiorna un esercizio esistente
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const body = (await request.json()) as Record<string, unknown>

    if (!body.id || typeof body.id !== 'string') {
      return NextResponse.json({ error: 'ID esercizio richiesto' }, { status: 400 })
    }
    const exerciseId = body.id

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, org_id, org_id_text, role')
      .eq('user_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }
    const profileTyped = profile as ProfileStaffRow

    if (!isExerciseManagerRole(profileTyped.role)) {
      return NextResponse.json(
        { error: 'Permesso negato: solo trainer, PT o admin possono modificare esercizi.' },
        { status: 403 },
      )
    }

    type ExerciseRow = Pick<Tables<'exercises'>, 'id' | 'org_id' | 'org_id_text'>
    const { data: existingExercise, error: fetchError } = await supabase
      .from('exercises')
      .select('id, org_id, org_id_text')
      .eq('id', exerciseId)
      .single()

    if (fetchError || !existingExercise) {
      return NextResponse.json({ error: 'Esercizio non trovato' }, { status: 404 })
    }
    const existingExerciseTyped = existingExercise as ExerciseRow

    // Verifica che l'esercizio appartenga alla stessa organizzazione
    if (existingExerciseTyped.org_id !== profileTyped.org_id) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    if (body.video_url !== undefined) {
      const ve = validateExerciseVideoUrl(
        typeof body.video_url === 'string' ? body.video_url : null,
      )
      if (ve) return NextResponse.json({ error: ve }, { status: 400 })
    }
    if (body.thumb_url !== undefined) {
      const te = validateExerciseThumbUrl(
        typeof body.thumb_url === 'string' ? body.thumb_url : null,
      )
      if (te) return NextResponse.json({ error: te }, { status: 400 })
    }

    // Prepara i dati per l'aggiornamento
    type ExerciseUpdate = Database['public']['Tables']['exercises']['Update']
    const updateData: ExerciseUpdate = {}
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return NextResponse.json({ error: 'Nome esercizio non valido' }, { status: 400 })
      }
      updateData.name = body.name.trim()
    }
    if (body.description !== undefined) {
      if (body.description === null) {
        updateData.description = null
      } else {
        updateData.description =
          typeof body.description === 'string'
            ? body.description || null
            : String(body.description ?? '')
      }
    }
    if (body.muscle_groups !== undefined) {
      const joined = Array.isArray(body.muscle_groups)
        ? body.muscle_groups.join(', ')
        : String(body.muscle_groups)
      updateData.muscle_group = joined.trim()
    } else if (body.muscle_group !== undefined) {
      updateData.muscle_group = (
        typeof body.muscle_group === 'string' ? body.muscle_group : String(body.muscle_group)
      ).trim()
    }
    if (body.muscle_group !== undefined || body.muscle_groups !== undefined) {
      const mg = updateData.muscle_group
      if (typeof mg === 'string' && !mg.trim()) {
        return NextResponse.json(
          { error: 'Gruppo muscolare non può essere vuoto' },
          { status: 400 },
        )
      }
    }
    if (body.equipment !== undefined) {
      updateData.equipment =
        typeof body.equipment === 'string' ? body.equipment || null : String(body.equipment)
    }
    if (body.difficulty !== undefined) {
      if (
        body.difficulty === 'bassa' ||
        body.difficulty === 'media' ||
        body.difficulty === 'alta'
      ) {
        updateData.difficulty = body.difficulty
      } else {
        return NextResponse.json({ error: 'Difficoltà non valida' }, { status: 400 })
      }
    }
    if (body.video_url !== undefined) {
      updateData.video_url = typeof body.video_url === 'string' ? body.video_url || null : null
    }
    if (body.image_url !== undefined) {
      updateData.image_url = typeof body.image_url === 'string' ? body.image_url || null : null
    }
    if (body.thumb_url !== undefined) {
      updateData.thumb_url = typeof body.thumb_url === 'string' ? body.thumb_url || null : null
    }
    if (body.category !== undefined) {
      const catParsed = parseCategoryInput(body.category)
      if (!catParsed.ok) {
        return NextResponse.json({ error: catParsed.error }, { status: 400 })
      }
      updateData.category = catParsed.value
    }
    if (body.duration_seconds !== undefined) {
      if (body.duration_seconds === null) {
        updateData.duration_seconds = null
      } else {
        const n = Number(body.duration_seconds)
        if (!Number.isFinite(n) || n < 0) {
          return NextResponse.json({ error: 'Durata (secondi) non valida' }, { status: 400 })
        }
        updateData.duration_seconds = Math.round(n)
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nessun campo da aggiornare' }, { status: 400 })
    }

    // Allinea sempre org_id_text al profilo quando valorizzato: le policy spesso confrontano
    // exercises.org_id_text con profiles.org_id_text; senza questo campo nell'UPDATE il WITH CHECK può fallire (PGRST116).
    if (profileTyped.org_id_text != null && profileTyped.org_id_text !== '') {
      updateData.org_id_text = profileTyped.org_id_text
    }

    const updatePayload = updateData as Database['public']['Tables']['exercises']['Update']

    // 1) Client sessione: niente service role se le policy RLS sono corrette.
    let { data: exercise, error: updateError } = await supabase
      .from('exercises')
      .update(updatePayload)
      .eq('id', exerciseId)
      .select()
      .single()

    // 2) Solo se RLS restituisce 0 righe (PGRST116): ripiego admin dopo stesso controllo org in app.
    if (updateError?.code === 'PGRST116') {
      try {
        const admin = createAdminClient()
        const retry = await admin
          .from('exercises')
          .update(updatePayload)
          .eq('id', exerciseId)
          .select()
          .single()
        exercise = retry.data
        updateError = retry.error
      } catch (e) {
        logger.error('PUT exercises: PGRST116 e createAdminClient fallito (chiave mancante?)', e)
        return NextResponse.json(
          {
            error:
              'Aggiornamento bloccato da RLS (nessuna riga). Applica la migration Supabase su public.exercises (policy UPDATE) oppure imposta SUPABASE_SERVICE_ROLE_KEY valida in .env.local per il ripiego server-side.',
          },
          { status: 503 },
        )
      }
    }

    if (updateError) {
      logger.error("Errore durante l'aggiornamento dell'esercizio", updateError, {
        exerciseId,
        updateData,
      })
      const msg = (updateError.message ?? '').toLowerCase()
      if (msg.includes('invalid api key') || msg.includes('jwt')) {
        return NextResponse.json(
          {
            error:
              'Service role non valida dopo errore RLS: controlla SUPABASE_SERVICE_ROLE_KEY in .env.local oppure correggi le policy su public.exercises così il primo passaggio (sessione) riesce.',
          },
          { status: 503 },
        )
      }
      const resBody: {
        error: string
        supabase?: {
          code?: string
          message?: string
          details?: string | null
          hint?: string | null
        }
      } = { error: "Errore durante l'aggiornamento" }
      if (process.env.NODE_ENV === 'development') {
        resBody.supabase = {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details ?? null,
          hint: updateError.hint ?? null,
        }
      }
      return NextResponse.json(resBody, { status: 500 })
    }

    return NextResponse.json({ data: exercise })
  } catch (error) {
    logger.error("Errore durante l'aggiornamento dell'esercizio", error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

/**
 * DELETE /api/exercises
 * Elimina un esercizio
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Supporta sia query params che body
    const { searchParams } = new URL(request.url)
    let id = searchParams.get('id')

    // Se non c'è nei query params, prova nel body
    if (!id) {
      try {
        const body = await request.json()
        id = body.id
      } catch {
        // Body non valido o vuoto, continua
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'ID esercizio richiesto' }, { status: 400 })
    }

    type ProfileDeleteRow = Pick<Tables<'profiles'>, 'id' | 'org_id' | 'role'>
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, org_id, role')
      .eq('user_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }
    const profileTyped = profile as ProfileDeleteRow

    if (!isExerciseManagerRole(profileTyped.role)) {
      return NextResponse.json(
        { error: 'Permesso negato: solo trainer, PT o admin possono eliminare esercizi.' },
        { status: 403 },
      )
    }

    type ExerciseRow = Pick<Tables<'exercises'>, 'id' | 'org_id'>
    const { data: existingExercise, error: fetchError } = await supabase
      .from('exercises')
      .select('id, org_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingExercise) {
      return NextResponse.json({ error: 'Esercizio non trovato' }, { status: 404 })
    }
    const existingExerciseTyped = existingExercise as ExerciseRow

    // Verifica che l'esercizio appartenga alla stessa organizzazione
    if (existingExerciseTyped.org_id !== profileTyped.org_id) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    const { data: deleted, error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id)
      .select('id')
      .single()

    if (error || !deleted) {
      logger.error(
        "Errore durante l'eliminazione dell'esercizio",
        error ?? 'Nessuna riga eliminata',
        {
          exerciseId: id,
        },
      )
      return NextResponse.json(
        { error: 'Esercizio non eliminato. Verifica i permessi (RLS).' },
        { status: 403 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Errore durante l'eliminazione dell'esercizio", error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
