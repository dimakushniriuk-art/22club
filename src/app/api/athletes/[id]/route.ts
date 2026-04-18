import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import type { Tables } from '@/types/supabase'
import type { Database } from '@/lib/supabase/types'

const logger = createLogger('api:athletes:[id]')

/**
 * GET /api/athletes/[id]
 * Ottiene i dettagli di un atleta
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const { id } = await params

    // Ottieni il profilo dello staff corrente
    type ProfileRow = Pick<Tables<'profiles'>, 'id' | 'org_id' | 'role'>
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, org_id, role')
      .eq('user_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }
    const profileTyped = profile as ProfileRow

    // Ottieni il profilo atleta
    const { data: athleteProfile, error: fetchError } = await supabase
      .from('profiles')
      .select(
        'id, org_id, user_id, nome, cognome, email, phone, role, stato, data_iscrizione, note, created_at, updated_at',
      )
      .eq('id', id)
      .single()

    if (fetchError || !athleteProfile) {
      return NextResponse.json({ error: 'Atleta non trovato' }, { status: 404 })
    }

    // Type assertion per risolvere problema TypeScript con .single()
    const athlete = athleteProfile as {
      id: string
      org_id: string | null
      user_id: string | null
      nome: string | null
      cognome: string | null
      email: string | null
      phone: string | null
      role: string | null
      stato: string | null
      data_iscrizione: string | null
      note: string | null
      created_at: string | null
      updated_at: string | null
    }

    // Verifica che l'atleta appartenga alla stessa organizzazione
    if (athlete.org_id !== profileTyped.org_id) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    // Se è un trainer, verifica che l'atleta sia assegnato a lui (athlete_trainer_assignments, status=active)
    if (profileTyped.role === 'trainer') {
      const { data: relation } = await supabase
        .from('athlete_trainer_assignments')
        .select('id')
        .eq('trainer_id', profileTyped.id)
        .eq('athlete_id', id)
        .eq('status', 'active')
        .maybeSingle()

      if (!relation) {
        return NextResponse.json({ error: 'Atleta non assegnato' }, { status: 403 })
      }
    }

    return NextResponse.json({ data: athleteProfile })
  } catch (error) {
    logger.error("Errore durante il recupero dell'atleta", error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

/**
 * PUT /api/athletes/[id]
 * Aggiorna un atleta
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Ottieni il profilo dello staff corrente
    type ProfileRow = Pick<Tables<'profiles'>, 'id' | 'org_id' | 'role'>
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, org_id, role')
      .eq('user_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }
    const profileTyped = profile as ProfileRow

    // Verifica che l'atleta esista e appartenga all'organizzazione
    type AthleteRow = Pick<Tables<'profiles'>, 'id' | 'org_id' | 'user_id'>
    const { data: existingAthlete, error: fetchError } = await supabase
      .from('profiles')
      .select('id, org_id, user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingAthlete) {
      return NextResponse.json({ error: 'Atleta non trovato' }, { status: 404 })
    }
    const existingAthleteTyped = existingAthlete as AthleteRow

    if (existingAthleteTyped.org_id !== profileTyped.org_id) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    // Se è un trainer, verifica che l'atleta sia assegnato a lui (athlete_trainer_assignments, status=active)
    if (profileTyped.role === 'trainer') {
      const { data: relation } = await supabase
        .from('athlete_trainer_assignments')
        .select('id')
        .eq('trainer_id', profileTyped.id)
        .eq('athlete_id', id)
        .eq('status', 'active')
        .maybeSingle()

      if (!relation) {
        return NextResponse.json({ error: 'Atleta non assegnato' }, { status: 403 })
      }
    }

    // Prepara i dati per l'aggiornamento
    type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
    const updateData: ProfileUpdate = {}
    if (body.nome !== undefined) updateData.nome = body.nome.trim()
    if (body.cognome !== undefined) updateData.cognome = body.cognome.trim()
    if (body.email !== undefined) updateData.email = body.email.trim()
    if (body.phone !== undefined) updateData.phone = body.phone?.trim() || null
    if (body.stato !== undefined) updateData.stato = body.stato
    if (body.data_iscrizione !== undefined) updateData.data_iscrizione = body.data_iscrizione
    if (body.note !== undefined) updateData.note = body.note?.trim() || null

    // Se l'email è cambiata, aggiorna anche auth.users
    if (body.email && existingAthleteTyped.user_id) {
      const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
        existingAthleteTyped.user_id,
        { email: body.email.trim() },
      )

      if (updateAuthError) {
        logger.warn('Errore durante aggiornamento email auth', updateAuthError, {
          userId: existingAthleteTyped.user_id,
        })
        // Non blocchiamo l'aggiornamento se l'email auth fallisce
      }
    }

    const { data: athleteProfile, error } = await supabase
      .from('profiles')
      .update(updateData as Database['public']['Tables']['profiles']['Update'])
      .eq('id', id)
      .select(
        'id, org_id, user_id, nome, cognome, email, phone, role, stato, data_iscrizione, note, created_at, updated_at',
      )
      .single()

    if (error) {
      logger.error("Errore durante l'aggiornamento dell'atleta", error, {
        athleteId: id,
        updateData,
      })
      return NextResponse.json({ error: "Errore durante l'aggiornamento" }, { status: 500 })
    }

    if (!athleteProfile) {
      return NextResponse.json({ error: 'Atleta non trovato' }, { status: 404 })
    }

    return NextResponse.json({ data: athleteProfile })
  } catch (error) {
    logger.error("Errore durante l'aggiornamento dell'atleta", error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

/**
 * DELETE /api/athletes/[id]
 * Elimina un atleta
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Ottieni il profilo dello staff corrente
    type ProfileRow = Pick<Tables<'profiles'>, 'id' | 'org_id' | 'role'>
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, org_id, role')
      .eq('user_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }
    const profileTyped = profile as ProfileRow

    // Verifica che l'atleta esista e appartenga all'organizzazione
    type AthleteRow = Pick<Tables<'profiles'>, 'id' | 'org_id' | 'user_id'>
    const { data: existingAthlete, error: fetchError } = await supabase
      .from('profiles')
      .select('id, org_id, user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingAthlete) {
      return NextResponse.json({ error: 'Atleta non trovato' }, { status: 404 })
    }
    const existingAthleteTyped = existingAthlete as AthleteRow

    if (existingAthleteTyped.org_id !== profileTyped.org_id) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    // Admin: può eliminare qualsiasi atleta. Trainer/staff: solo atleti assegnati (athlete_trainer_assignments, active)
    if (profileTyped.role !== 'admin') {
      const { data: relation } = await supabase
        .from('athlete_trainer_assignments')
        .select('id')
        .eq('trainer_id', profileTyped.id)
        .eq('athlete_id', id)
        .eq('status', 'active')
        .maybeSingle()
      if (!relation) {
        return NextResponse.json(
          { error: 'Puoi eliminare solo gli atleti assegnati al tuo profilo' },
          { status: 403 },
        )
      }
    }

    // Usa admin client per bypassare RLS durante eliminazione dipendenze
    const adminClient = createAdminClient()

    // IMPORTANTE: Elimina TUTTE le dipendenze prima di eliminare il profilo
    // Ordine critico: eliminare prima le dipendenze, poi il profilo
    // Funzione helper per eliminare senza bloccare se la tabella non esiste
    const safeDelete = async (table: string, filter: { column: string; value: string | null }) => {
      if (!filter.value) return
      try {
        const { error } = await (
          adminClient as unknown as {
            from: (t: string) => {
              delete: () => {
                eq: (c: string, v: string | null) => Promise<{ error: { code?: string } | null }>
              }
            }
          }
        )
          .from(table)
          .delete()
          .eq(filter.column, filter.value)
        if (error && error.code !== 'PGRST116') {
          // PGRST116 = tabella non trovata, ignoriamo
          logger.warn(`Errore eliminazione ${table}`, error, { filter })
        }
      } catch (err) {
        // Ignora errori di tabelle inesistenti
        logger.debug(`Tabella ${table} non esiste o errore non critico`, err)
      }
    }

    try {
      // 1. Assegnazioni trainer-atleta e legacy
      await safeDelete('athlete_trainer_assignments', { column: 'trainer_id', value: id })
      await safeDelete('athlete_trainer_assignments', { column: 'athlete_id', value: id })
      await safeDelete('trainer_athletes', { column: 'trainer_id', value: id })
      await safeDelete('trainer_athletes', { column: 'athlete_id', value: id })

      // 2. Tabelle athlete_* (athlete_id = profiles.user_id, non profiles.id)
      const athleteAuthId = existingAthleteTyped.user_id
      if (athleteAuthId) {
        await safeDelete('athlete_medical_data', { column: 'athlete_id', value: athleteAuthId })
        await safeDelete('athlete_fitness_data', { column: 'athlete_id', value: athleteAuthId })
        await safeDelete('athlete_nutrition_data', { column: 'athlete_id', value: athleteAuthId })
        await safeDelete('athlete_massage_data', { column: 'athlete_id', value: athleteAuthId })
        await safeDelete('athlete_motivational_data', {
          column: 'athlete_id',
          value: athleteAuthId,
        })
        await safeDelete('athlete_administrative_data', {
          column: 'athlete_id',
          value: athleteAuthId,
        })
        await safeDelete('athlete_smart_tracking_data', {
          column: 'athlete_id',
          value: athleteAuthId,
        })
        await safeDelete('athlete_ai_data', { column: 'athlete_id', value: athleteAuthId })
      }

      // 3. Payments: soft delete (no DELETE fisico)
      const { error: paymentsSoftErr } = await adminClient.rpc('soft_delete_payments_for_profile', {
        p_profile_id: id,
        p_actor_profile_id: profileTyped.id,
      })
      if (paymentsSoftErr)
        logger.warn('Soft delete payments per profile', paymentsSoftErr, { athleteId: id })

      // 4. Appuntamenti
      await safeDelete('appointments', { column: 'athlete_id', value: id })
      await safeDelete('appointments', { column: 'staff_id', value: id })
      await safeDelete('appointments', { column: 'trainer_id', value: id })

      // 5. Workouts e workout_logs
      await safeDelete('workout_logs', { column: 'atleta_id', value: id })
      await safeDelete('workout_logs', { column: 'athlete_id', value: id })
      await safeDelete('workouts', { column: 'athlete_id', value: id })
      await safeDelete('workouts', { column: 'created_by_trainer_id', value: id })
      await safeDelete('workout_plans', { column: 'athlete_id', value: id })
      await safeDelete('workout_plans', { column: 'created_by_profile_id', value: id })

      // 6. Documents (tabella ha athlete_id e uploaded_by_profile_id, non user_id)
      await safeDelete('documents', { column: 'athlete_id', value: id })
      await safeDelete('documents', { column: 'uploaded_by_profile_id', value: id })

      // 7. Inviti atleti (pt_id e invited_by = profile id, evita trigger ricorsione al DELETE profiles)
      await safeDelete('inviti_atleti', { column: 'pt_id', value: id })
      await safeDelete('inviti_atleti', { column: 'invited_by', value: id })

      // 8. Lesson counters
      await safeDelete('lesson_counters', { column: 'athlete_id', value: id })

      // 9. Progress logs e photos
      await safeDelete('progress_logs', { column: 'athlete_id', value: id })
      await safeDelete('progress_photos', { column: 'athlete_id', value: id })

      // 10. Chat messages
      await safeDelete('chat_messages', { column: 'sender_id', value: id })
      await safeDelete('chat_messages', { column: 'receiver_id', value: id })

      // 11. Profiles tags
      await safeDelete('profiles_tags', { column: 'profile_id', value: id })

      // 12. Notifications
      if (existingAthleteTyped.user_id) {
        await safeDelete('notifications', {
          column: 'user_id',
          value: existingAthleteTyped.user_id,
        })
      }

      logger.debug('Dipendenze eliminate con successo', { athleteId: id })
    } catch (depsError) {
      // Log errore ma continua - alcune dipendenze potrebbero non esistere
      logger.warn('Errore durante eliminazione dipendenze (continuo comunque)', depsError, {
        athleteId: id,
      })
    }

    // Elimina l'utente auth se esiste (PRIMA del profilo)
    if (existingAthleteTyped.user_id) {
      const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(
        existingAthleteTyped.user_id,
      )

      if (deleteAuthError) {
        logger.warn('Errore durante eliminazione utente auth', deleteAuthError, {
          userId: existingAthleteTyped.user_id,
        })
        // Continuiamo comunque con l'eliminazione del profilo
      }
    }

    // Elimina il profilo tramite RPC che disabilita il trigger check_expired_invites_trigger
    // per evitare "stack depth limit exceeded" (ricorsione su inviti_atleti)
    try {
      const { data: deletedCount, error: rpcError } = await adminClient.rpc(
        'delete_athlete_profile_safe',
        {
          p_profile_id: id,
        },
      )

      if (rpcError) {
        logger.error("Errore durante l'eliminazione del profilo (RPC)", rpcError, {
          athleteId: id,
          errorCode: rpcError.code,
          errorMessage: rpcError.message,
        })
        const detailMsg = rpcError.message || rpcError.details?.toString() || 'Errore sconosciuto'
        return NextResponse.json(
          {
            error: `Errore durante l'eliminazione del profilo: ${detailMsg}`,
            details: detailMsg,
            code: rpcError.code,
            hint: rpcError.hint,
          },
          { status: 500 },
        )
      }

      if (deletedCount === 0) {
        logger.warn('Nessun profilo eliminato (potrebbe essere già stato eliminato)', {
          athleteId: id,
        })
        const { data: checkProfile } = await adminClient
          .from('profiles')
          .select('id')
          .eq('id', id)
          .single()

        if (checkProfile) {
          logger.error('Profilo ancora presente dopo RPC eliminazione', { athleteId: id })
          return NextResponse.json(
            {
              error: "Errore durante l'eliminazione del profilo",
              details: 'Il profilo non è stato eliminato (nessuna riga eliminata)',
            },
            { status: 500 },
          )
        }
      } else {
        logger.info('Profilo eliminato con successo', { athleteId: id, deletedCount })
      }
    } catch (profileDeleteError) {
      logger.error('Eccezione durante eliminazione profilo', profileDeleteError, {
        athleteId: id,
        errorMessage:
          profileDeleteError instanceof Error
            ? profileDeleteError.message
            : String(profileDeleteError),
        errorStack: profileDeleteError instanceof Error ? profileDeleteError.stack : undefined,
      })
      return NextResponse.json(
        {
          error: "Errore durante l'eliminazione del profilo",
          details:
            profileDeleteError instanceof Error
              ? profileDeleteError.message
              : 'Errore sconosciuto durante eliminazione profilo',
        },
        { status: 500 },
      )
    }

    logger.info('Atleta eliminato con successo', {
      athleteId: id,
      userId: existingAthleteTyped.user_id,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Errore durante l'eliminazione dell'atleta", error, {
      athleteId: id,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      {
        error: "Errore durante l'eliminazione dell'atleta",
        details: error instanceof Error ? error.message : 'Errore sconosciuto',
      },
      { status: 500 },
    )
  }
}
