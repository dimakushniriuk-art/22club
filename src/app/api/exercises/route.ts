import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import type { Tables } from '@/types/supabase'
import type { Database } from '@/lib/supabase/types'

const logger = createLogger('api:exercises')

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

    const body = await request.json()

    // Valida campi obbligatori
    if (!body.name) {
      return NextResponse.json({ error: 'Nome esercizio richiesto' }, { status: 400 })
    }

    // Ottieni il profilo dello staff corrente
    type ProfileRow = Pick<Tables<'profiles'>, 'id' | 'org_id' | 'org_id_text'>
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, org_id, org_id_text')
      .eq('user_id', session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }
    const profileTyped = profile as ProfileRow

    // muscle_group: form invia muscle_group (string), API accetta anche muscle_groups (array)
    const muscleGroupValue =
      body.muscle_groups !== undefined
        ? Array.isArray(body.muscle_groups)
          ? body.muscle_groups.join(', ')
          : body.muscle_groups
        : body.muscle_group !== undefined
          ? typeof body.muscle_group === 'string'
            ? body.muscle_group
            : String(body.muscle_group)
          : null

    const exerciseData: Database['public']['Tables']['exercises']['Insert'] = {
      name: body.name,
      description: body.description || null,
      muscle_group: muscleGroupValue,
      equipment: body.equipment || null,
      difficulty: body.difficulty || null,
      video_url: body.video_url || null,
      image_url: body.image_url || null,
      thumb_url: body.thumb_url || null,
      created_by_profile_id: profileTyped.id,
      org_id: profileTyped.org_id ?? undefined,
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

    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'ID esercizio richiesto' }, { status: 400 })
    }

    // Verifica che l'esercizio esista e appartenga all'organizzazione dell'utente
    type ProfileRow = Pick<Tables<'profiles'>, 'id' | 'org_id' | 'org_id_text'>
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, org_id, org_id_text')
      .eq('user_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }
    const profileTyped = profile as ProfileRow

    type ExerciseRow = Pick<Tables<'exercises'>, 'id' | 'org_id' | 'org_id_text'>
    const { data: existingExercise, error: fetchError } = await supabase
      .from('exercises')
      .select('id, org_id, org_id_text')
      .eq('id', body.id)
      .single()

    if (fetchError || !existingExercise) {
      return NextResponse.json({ error: 'Esercizio non trovato' }, { status: 404 })
    }
    const existingExerciseTyped = existingExercise as ExerciseRow

    // Verifica che l'esercizio appartenga alla stessa organizzazione
    if (existingExerciseTyped.org_id !== profileTyped.org_id) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    // Prepara i dati per l'aggiornamento
    type ExerciseUpdate = Database['public']['Tables']['exercises']['Update']
    const updateData: ExerciseUpdate = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.muscle_groups !== undefined) {
      updateData.muscle_group = Array.isArray(body.muscle_groups)
        ? body.muscle_groups.join(', ')
        : body.muscle_groups
    } else if (body.muscle_group !== undefined) {
      updateData.muscle_group =
        typeof body.muscle_group === 'string' ? body.muscle_group : String(body.muscle_group)
    }
    if (body.equipment !== undefined) updateData.equipment = body.equipment
    if (body.difficulty !== undefined) updateData.difficulty = body.difficulty
    if (body.video_url !== undefined) updateData.video_url = body.video_url
    if (body.image_url !== undefined) updateData.image_url = body.image_url
    if (body.thumb_url !== undefined) updateData.thumb_url = body.thumb_url
    if (body.category !== undefined) updateData.category = body.category
    if (body.duration_seconds !== undefined) {
      updateData.duration_seconds = body.duration_seconds
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
      .eq('id', body.id)
      .select()
      .single()

    // 2) Solo se RLS restituisce 0 righe (PGRST116): ripiego admin dopo stesso controllo org in app.
    if (updateError?.code === 'PGRST116') {
      try {
        const admin = createAdminClient()
        const retry = await admin
          .from('exercises')
          .update(updatePayload)
          .eq('id', body.id)
          .select()
          .single()
        exercise = retry.data
        updateError = retry.error
      } catch (e) {
        logger.error('PUT exercises: PGRST116 e createAdminClient fallito (chiave mancante?)', e)
        return NextResponse.json(
          {
            error:
              'Aggiornamento bloccato da RLS (nessuna riga). Correggi le policy UPDATE su public.exercises (vedi supabase/manual_exercises_update_rls.sql) oppure imposta SUPABASE_SERVICE_ROLE_KEY valida in .env.local per il ripiego server-side.',
          },
          { status: 503 },
        )
      }
    }

    if (updateError) {
      logger.error("Errore durante l'aggiornamento dell'esercizio", updateError, {
        exerciseId: body.id,
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

    // Verifica che l'esercizio esista e appartenga all'organizzazione dell'utente
    type ProfileRow = Pick<Tables<'profiles'>, 'id' | 'org_id'>
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, org_id')
      .eq('user_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }
    const profileTyped = profile as ProfileRow

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
