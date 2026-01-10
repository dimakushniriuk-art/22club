import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isValidVideoUrl, VIDEO_URL_ERROR_MESSAGE } from '@/lib/validations/video-url'
import { deleteExerciseMediaFiles } from '@/lib/exercises-storage'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api/exercises')

const exerciseSchema = z.object({
  name: z.string().min(2).max(120),
  category: z.string().min(2).max(60).nullish(), // Cambiato da muscle_group a category per Supabase
  muscle_group: z.string().min(2).max(60).nullish(), // Mantenuto per compatibilità
  equipment: z.string().min(2).max(500).nullish(), // Aumentato per supportare più attrezzi separati da virgole
  difficulty: z.enum(['easy', 'medium', 'hard', 'bassa', 'media', 'alta']).optional(),
  description: z.string().max(2000).nullish(),
  video_url: z
    .union([
      z
        .string()
        .url()
        .refine((url) => isValidVideoUrl(url), {
          message: VIDEO_URL_ERROR_MESSAGE,
        }),
      z.literal(''),
      z.null(),
    ])
    .optional(),
  thumb_url: z.string().url().nullish(),
  image_url: z.string().url().nullish(),
  duration_seconds: z.number().int().positive().nullish(),
})

type ExerciseRow = Tables<'exercises'>

const difficultyMap: Record<
  | 'easy'
  | 'medium'
  | 'hard'
  | 'bassa'
  | 'media'
  | 'alta'
  | 'beginner'
  | 'intermediate'
  | 'advanced',
  ExerciseRow['difficulty']
> = {
  easy: 'bassa',
  medium: 'media',
  hard: 'alta',
  bassa: 'bassa',
  media: 'media',
  alta: 'alta',
  beginner: 'bassa',
  intermediate: 'media',
  advanced: 'alta',
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Verifica autenticazione per debug
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()
    if (sessionError) {
      logger.warn('Errore sessione in GET /api/exercises', { error: sessionError.message })
    } else if (!session) {
      logger.warn('Nessuna sessione attiva in GET /api/exercises')
    }

    // Prova prima con tutte le colonne, se fallisce usa solo quelle base
    // NOTA: updated_at potrebbe non esistere, quindi non lo includiamo inizialmente
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      logger.error('Errore query exercises', error, { code: error.code, details: error.details })

      // Se l'errore è dovuto a RLS o autenticazione
      if (
        error.code === 'PGRST116' ||
        error.message.includes('permission') ||
        error.message.includes('policy')
      ) {
        return NextResponse.json(
          { error: 'Accesso negato. Assicurati di essere autenticato.' },
          { status: 403 },
        )
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Arricchisci i dati con campi opzionali (saranno null se non esistono)
    // Aggiungi updated_at se non presente (usando created_at come fallback)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enrichedData: any[] = ((data ?? []) as any[]).map((item: any) => ({
      ...item,
      created_at: item.created_at ?? null,
      updated_at: item.updated_at ?? item.created_at ?? null,
      created_by: item.created_by ?? null,
      org_id: item.org_id ?? null,
      description: item.description ?? null,
      equipment: item.equipment ?? null,
      category: item.category ?? null,
      muscle_group: item.muscle_group ?? null,
      video_url: item.video_url ?? null,
      thumb_url: item.thumb_url ?? null,
      image_url: item.image_url ?? null,
      duration_seconds: item.duration_seconds ?? null,
    }))

    logger.info('GET /api/exercises completato', { count: enrichedData.length })

    return NextResponse.json({ data: enrichedData })
  } catch (err) {
    logger.error('Errore in GET /api/exercises', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Errore interno del server' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const json = await request.json()

    const parsed = exerciseSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const payload = parsed.data

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    if (userErr || !user) {
      return NextResponse.json({ error: 'Autenticazione richiesta' }, { status: 401 })
    }

    const difficultyKey = payload.difficulty ?? ('medium' as keyof typeof difficultyMap)

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('user_id', user.id)
      .single()

    const profileData = profile as { org_id?: string | null } | null
    const orgId: string | null = typeof profileData?.org_id === 'string' ? profileData.org_id : null

    const insertPayload: TablesInsert<'exercises'> = {
      name: payload.name,
      muscle_group: payload.muscle_group ?? payload.category ?? 'Generale',
      difficulty: difficultyMap[difficultyKey] ?? 'media',
      created_at: new Date().toISOString(),
      // created_by potrebbe non esistere se la migration non è stata eseguita
      // Aggiungiamolo solo se presente nello schema (gestito dalla migration)
      ...(user.id ? { created_by: user.id } : {}),
      description: payload.description ?? null,
      equipment: payload.equipment ?? null,
      image_url: payload.image_url ?? null,
      video_url: payload.video_url ?? null,
      thumb_url: payload.thumb_url ?? null,
      // duration_seconds potrebbe non esistere nel database, quindi lo omettiamo se null
      ...(payload.duration_seconds !== null && payload.duration_seconds !== undefined
        ? { duration_seconds: payload.duration_seconds }
        : {}),
      category: payload.category ?? payload.muscle_group ?? null,
      org_id: orgId,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let { error: insertError } = await (supabase.from('exercises') as any).insert(insertPayload)

    // Se l'errore è dovuto a created_by mancante, prova senza
    if (insertError && insertError.message?.includes('created_by')) {
      logger.warn('Colonna created_by non trovata, tentativo inserimento senza created_by')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { created_by, ...payloadWithoutCreatedBy } = insertPayload
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const retryResult = await (supabase.from('exercises') as any).insert(payloadWithoutCreatedBy)
      insertError = retryResult.error
      if (!insertError) {
        logger.info('Inserimento riuscito senza created_by (colonna mancante nel database)')
      }
    }

    if (insertError) {
      logger.error('Errore insert exercise', insertError)

      // Rollback: elimina file caricati se insert fallisce
      if (payload.video_url || payload.thumb_url) {
        const deletedCount = await deleteExerciseMediaFiles(
          supabase,
          payload.video_url ?? null,
          payload.thumb_url ?? null,
        )
        logger.info('Rollback: eliminati file multimediali dopo fallimento insert', {
          deletedCount,
          hadVideo: !!payload.video_url,
          hadThumb: !!payload.thumb_url,
        })
      }

      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    logger.error('Errore in POST /api/exercises', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Errore interno del server' },
      { status: 500 },
    )
  }
}

const updateSchema = exerciseSchema.extend({ id: z.string().uuid() })

export async function PUT(request: Request) {
  let id: string | undefined
  try {
    const supabase = await createClient()
    const json = await request.json()
    const parsed = updateSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    id = parsed.data.id
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _ignored, ...rest } = parsed.data
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    if (userErr || !user) {
      return NextResponse.json({ error: 'Autenticazione richiesta' }, { status: 401 })
    }

    // 1. Recupera esercizio esistente per confrontare URL file
    const { data: existingExercise, error: fetchError } = await supabase
      .from('exercises')
      .select('video_url, thumb_url')
      .eq('id', id)
      .single()

    if (fetchError) {
      logger.error('Errore fetch exercise per update', fetchError, { exerciseId: id })
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    type ExerciseMedia = {
      video_url?: string | null
      thumb_url?: string | null
    }

    const exerciseMediaData = existingExercise as ExerciseMedia | null

    // 2. Identifica file vecchi da eliminare (se URL cambiano)
    const oldVideoUrl = exerciseMediaData?.video_url
    const oldThumbUrl = exerciseMediaData?.thumb_url
    // Se rest.video_url è undefined, mantieni il vecchio; se è null, rimuovi; altrimenti usa il nuovo
    // Converti undefined in null per gestire correttamente la rimozione
    const newVideoUrl = rest.video_url !== undefined ? (rest.video_url ?? null) : oldVideoUrl
    const newThumbUrl = rest.thumb_url !== undefined ? (rest.thumb_url ?? null) : oldThumbUrl

    // 3. Elimina file vecchi se URL sono cambiati e diversi da null

    // Elimina video vecchio se:
    // 1. C'era un video vecchio (oldVideoUrl non è null/undefined)
    // 2. Il nuovo video è diverso dal vecchio (cambiato o rimosso)
    // 3. Il nuovo video non è lo stesso del vecchio (controllo ridondante rimosso)
    if (oldVideoUrl && newVideoUrl !== oldVideoUrl) {
      const deleted = await deleteExerciseMediaFiles(supabase, oldVideoUrl, null)
      if (deleted > 0) {
        logger.info('Eliminato video vecchio per esercizio', { exerciseId: id, oldVideoUrl })
      }
    }

    // Elimina thumbnail vecchia se:
    // 1. C'era una thumbnail vecchia (oldThumbUrl non è null/undefined)
    // 2. La nuova thumbnail è diversa dalla vecchia (cambiata o rimossa)
    if (oldThumbUrl && newThumbUrl !== oldThumbUrl) {
      const deleted = await deleteExerciseMediaFiles(supabase, null, oldThumbUrl)
      if (deleted > 0) {
        logger.info('Eliminata thumbnail vecchia per esercizio', { exerciseId: id, oldThumbUrl })
      }
    }

    // 4. Normalizza difficulty se presente
    const updatePayload: TablesUpdate<'exercises'> = {}

    if (rest.name !== undefined) updatePayload.name = rest.name
    if (rest.category !== undefined)
      updatePayload.category = rest.category ?? rest.muscle_group ?? null
    if (rest.muscle_group !== undefined)
      updatePayload.muscle_group = rest.muscle_group ?? rest.category ?? undefined
    if (rest.equipment !== undefined) updatePayload.equipment = rest.equipment ?? null
    if (rest.description !== undefined) updatePayload.description = rest.description ?? null

    // Gestisci video_url: se è undefined, non aggiornare; se è null, imposta null; altrimenti usa il valore
    if (rest.video_url !== undefined) {
      updatePayload.video_url = rest.video_url ?? null
    }
    // Gestisci thumb_url: se è undefined, non aggiornare; se è null, imposta null; altrimenti usa il valore
    if (rest.thumb_url !== undefined) {
      updatePayload.thumb_url = rest.thumb_url ?? null
    }
    if (rest.image_url !== undefined) updatePayload.image_url = rest.image_url ?? null
    // duration_seconds potrebbe non esistere nel database, quindi lo includiamo solo se presente
    if (rest.duration_seconds !== undefined && rest.duration_seconds !== null) {
      updatePayload.duration_seconds = rest.duration_seconds
    }

    if (rest.difficulty) {
      const normalizedDifficulty =
        difficultyMap[rest.difficulty as keyof typeof difficultyMap] ?? rest.difficulty
      updatePayload.difficulty = normalizedDifficulty
    }

    // 5. Aggiorna record nel database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase.from('exercises') as any)
      .update(updatePayload)
      .eq('id', id)
    if (updateError) {
      logger.error('Errore update exercise', updateError, { exerciseId: id })
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    logger.error('Errore in PUT /api/exercises', err, { exerciseId: id })
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Errore interno del server' },
      { status: 500 },
    )
  }
}

const deleteSchema = z.object({ id: z.string().uuid() })

export async function DELETE(request: Request) {
  let id: string | undefined
  try {
    const supabase = await createClient()
    const json = await request.json()
    const parsed = deleteSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'ID non valido' }, { status: 400 })
    }
    id = parsed.data.id
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    if (userErr || !user) {
      return NextResponse.json({ error: 'Autenticazione richiesta' }, { status: 401 })
    }

    // 1. Recupera esercizio esistente per ottenere URL file multimediali
    const { data: exercise, error: fetchError } = await supabase
      .from('exercises')
      .select('video_url, thumb_url')
      .eq('id', id)
      .single()

    if (fetchError) {
      logger.error('Errore fetch exercise per delete', fetchError, { exerciseId: id })
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    type ExerciseMedia = {
      video_url?: string | null
      thumb_url?: string | null
    }

    const exerciseMediaData = exercise as ExerciseMedia | null

    // 2. Elimina file multimediali dallo storage PRIMA di eliminare il record

    if (exerciseMediaData) {
      const deletedCount = await deleteExerciseMediaFiles(
        supabase,
        exerciseMediaData.video_url ?? null,
        exerciseMediaData.thumb_url ?? null,
      )

      logger.info('Eliminati file multimediali per esercizio', {
        exerciseId: id,
        deletedCount,
        hadVideo: !!exerciseMediaData.video_url,
        hadThumb: !!exerciseMediaData.thumb_url,
      })
    }

    // 3. Verifica se l'esercizio è utilizzato in qualche scheda di allenamento
    const { data: workoutExercises, error: checkError } = await supabase
      .from('workout_day_exercises')
      .select('id, workout_day_id')
      .eq('exercise_id', id)
      .limit(1)

    if (checkError) {
      logger.error('Errore verifica utilizzo esercizio', checkError, { exerciseId: id })
    }

    // 4. Elimina record dal database
    const { error } = await supabase.from('exercises').delete().eq('id', id)
    if (error) {
      logger.error('Errore delete exercise', error, { exerciseId: id })

      // Se l'errore è dovuto a foreign key constraint, fornisci un messaggio più chiaro
      if (
        error.message?.includes('foreign key constraint') &&
        workoutExercises &&
        workoutExercises.length > 0
      ) {
        return NextResponse.json(
          {
            error:
              "Impossibile eliminare l'esercizio perché è ancora utilizzato in una o più schede di allenamento. Rimuovi prima l'esercizio dalle schede.",
          },
          { status: 409 }, // Conflict
        )
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    logger.error('Errore in DELETE /api/exercises', err, { exerciseId: id })
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Errore interno del server' },
      { status: 500 },
    )
  }
}
