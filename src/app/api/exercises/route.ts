import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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
    type ProfileRow = Pick<Tables<'profiles'>, 'id' | 'org_id'>
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, org_id')
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
          ? (typeof body.muscle_group === 'string' ? body.muscle_group : String(body.muscle_group))
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
    }

    const { data: exercise, error } = await supabase
      .from('exercises')
      .insert(exerciseData as Database['public']['Tables']['exercises']['Insert'])
      .select()
      .single()

    if (error) {
      logger.error('Errore durante la creazione dell\'esercizio', error, { exerciseData })
      return NextResponse.json({ error: 'Errore durante la creazione' }, { status: 500 })
    }

    return NextResponse.json({ data: exercise }, { status: 201 })
  } catch (error) {
    logger.error('Errore durante la creazione dell\'esercizio', error)
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
      updateData.muscle_group = Array.isArray(body.muscle_groups) ? body.muscle_groups.join(', ') : body.muscle_groups
    } else if (body.muscle_group !== undefined) {
      updateData.muscle_group = typeof body.muscle_group === 'string' ? body.muscle_group : String(body.muscle_group)
    }
    if (body.equipment !== undefined) updateData.equipment = body.equipment
    if (body.difficulty !== undefined) updateData.difficulty = body.difficulty
    if (body.video_url !== undefined) updateData.video_url = body.video_url
    if (body.image_url !== undefined) updateData.image_url = body.image_url
    if (body.thumb_url !== undefined) updateData.thumb_url = body.thumb_url

    const { data: exercise, error } = await supabase
      .from('exercises')
      .update(updateData as Database['public']['Tables']['exercises']['Update'])
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      logger.error('Errore durante l\'aggiornamento dell\'esercizio', error, {
        exerciseId: body.id,
        updateData,
      })
      return NextResponse.json({ error: 'Errore durante l\'aggiornamento' }, { status: 500 })
    }

    return NextResponse.json({ data: exercise })
  } catch (error) {
    logger.error('Errore durante l\'aggiornamento dell\'esercizio', error)
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
      logger.error('Errore durante l\'eliminazione dell\'esercizio', error ?? 'Nessuna riga eliminata', {
        exerciseId: id,
      })
      return NextResponse.json(
        { error: 'Esercizio non eliminato. Verifica i permessi (RLS).' },
        { status: 403 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Errore durante l\'eliminazione dell\'esercizio', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
