import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:athletes:[id]')

const updateAthleteSchema = z.object({
  nome: z.string().trim().min(1, 'Il nome è obbligatorio'),
  cognome: z.string().trim().min(1, 'Il cognome è obbligatorio'),
  email: z.string().trim().email('Email non valida'),
  phone: z.string().trim().min(1).optional(),
  stato: z.string().trim().min(1).optional(),
  note: z.string().trim().optional().nullable(),
  data_iscrizione: z.string().trim().optional(),
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Verifica autenticazione e permessi
    const supabase = await createServerClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Verifica ruolo utente
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    const profileData = profile as { role?: string } | null
    const userRole = profileData?.role ?? ''

    if (!profileData || !['admin', 'pt', 'trainer'].includes(userRole)) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Assicurati che il profilo esista
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, user_id, email')
      .eq('id', id)
      .single()

    if (fetchError || !existingProfile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }

    const existingProfileData = existingProfile as {
      id?: string
      user_id?: string
      email?: string
    } | null

    // Validazione input
    const body = await request.json()
    const parsedBody = updateAthleteSchema.safeParse(body)

    if (!parsedBody.success) {
      const [firstError] = parsedBody.error.issues
      return NextResponse.json({ error: firstError?.message ?? 'Dati non validi' }, { status: 400 })
    }

    const { nome, cognome, email, phone, stato, note, data_iscrizione } = parsedBody.data

    let normalizedDataIscrizione: string | undefined
    if (data_iscrizione) {
      const parsedDate = new Date(data_iscrizione)
      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: 'La data di iscrizione non è valida' }, { status: 400 })
      }
      normalizedDataIscrizione = parsedDate.toISOString()
    }

    // Aggiorna profilo nella tabella profiles
    const updateData = {
      nome,
      cognome,
      email,
      phone: phone ?? null,
      stato: stato ?? 'attivo',
      note: note ?? null,
      data_iscrizione: normalizedDataIscrizione ?? null,
    }

    // Aggiorna il profilo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updatedProfile, error: updateError } = await (supabase.from('profiles') as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(updateData as any)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      logger.error('Errore aggiornamento profilo', updateError, { athleteId: id })
      return NextResponse.json(
        { error: updateError.message || "Errore durante l'aggiornamento del profilo" },
        { status: 500 },
      )
    }

    // Se l'email è cambiata, aggiorna anche l'utente in auth (se necessario)
    if (existingProfileData?.user_id && existingProfileData.email !== email) {
      // Nota: l'aggiornamento dell'email in auth.users richiede service role
      // Per ora aggiorniamo solo il profilo, l'email in auth.users può essere aggiornata separatamente se necessario
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: updatedProfile,
        message: 'Atleta aggiornato con successo',
      },
    })
  } catch (error) {
    logger.error('Errore API aggiornamento atleta', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Errore interno del server' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    // Verifica autenticazione e permessi
    const supabase = await createServerClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Verifica ruolo utente
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', session.user.id)
      .single()

    const profileData = profile as { id?: string; role?: string } | null
    const userRole = profileData?.role ?? ''

    if (!profileData || !['admin', 'pt', 'trainer'].includes(userRole)) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Verifica che il profilo atleta esista
    const { data: athleteProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, user_id, email, nome, cognome, role')
      .eq('id', id)
      .single()

    if (fetchError || !athleteProfile) {
      return NextResponse.json({ error: 'Atleta non trovato' }, { status: 404 })
    }

    const athleteProfileData = athleteProfile as {
      id?: string
      user_id?: string
      email?: string
      nome?: string
      cognome?: string
      role?: string
    }

    // Se non è admin, verifica che l'atleta sia assegnato al trainer
    if (userRole !== 'admin') {
      const trainerProfileId = profileData.id
      if (!trainerProfileId) {
        return NextResponse.json({ error: 'Profilo trainer non trovato' }, { status: 404 })
      }

      // Verifica relazione pt_atleti
      const { data: relationship, error: relationshipError } = await supabase
        .from('pt_atleti')
        .select('id')
        .eq('pt_id', trainerProfileId)
        .eq('atleta_id', id)
        .single()

      if (relationshipError || !relationship) {
        return NextResponse.json(
          { error: 'Non autorizzato: atleta non assegnato a questo trainer' },
          { status: 403 },
        )
      }
    }

    // Crea client con service role key per eliminazione
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configurazione server mancante' }, { status: 500 })
    }

    // Importa createClient per service role
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Verifica se l'utente esiste in auth.users
    if (!athleteProfileData.user_id) {
      logger.error('User ID non trovato nel profilo atleta', null, {
        athleteId: id,
        profileId: athleteProfileData.id,
      })
      return NextResponse.json(
        { error: 'User ID non trovato nel profilo atleta' },
        { status: 404 },
      )
    }

    const { error: getUserError } = await supabaseAdmin.auth.admin.getUserById(
      athleteProfileData.user_id,
    )

    // Se l'utente non esiste in auth.users, elimina solo il profilo orfano
    if (getUserError && getUserError.message?.includes('not found')) {
      logger.warn('Utente non trovato in auth.users, elimino solo il profilo orfano', {
        authUserId: athleteProfileData.user_id,
        profileId: athleteProfileData.id,
      })

      const { error: profileDeleteError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', athleteProfileData.id)

      if (profileDeleteError) {
        logger.error('Errore eliminazione profilo orfano', profileDeleteError, {
          profileId: athleteProfileData.id,
        })
        return NextResponse.json(
          { error: profileDeleteError.message || "Errore nell'eliminazione del profilo" },
          { status: 500 },
        )
      }

      return NextResponse.json({ success: true, message: 'Atleta eliminato con successo' })
    }

    if (getUserError) {
      logger.error('Errore verifica utente auth prima eliminazione', getUserError, {
        authUserId: athleteProfileData.user_id,
        profileId: athleteProfileData.id,
      })
      return NextResponse.json(
        {
          error:
            getUserError.message || "Errore nella verifica dell'utente prima dell'eliminazione",
        },
        { status: 500 },
      )
    }

    // Elimina manualmente le dipendenze critiche PRIMA di eliminare il profilo
    // Questo evita problemi con trigger ricorsivi e foreign key constraints
    // Ignoriamo errori per tabelle che potrebbero non esistere o essere vuote
    logger.debug('Eliminazione dipendenze critiche prima del profilo', {
      profileId: athleteProfileData.id,
    })

    const deleteDependency = async (table: string, condition: string, value: string) => {
      try {
        const { error } = await supabaseAdmin.from(table).delete().eq(condition, value)
        if (error && !error.message.includes('does not exist')) {
          logger.warn(`Errore eliminazione ${table}`, error, { condition, value })
        }
      } catch (err) {
        // Ignora errori per tabelle che potrebbero non esistere
        logger.debug(`Errore eliminazione ${table} (ignorato)`, err)
      }
    }

    // 1. Elimina relazioni pt_atleti (sia come trainer che come atleta)
    await deleteDependency('pt_atleti', 'pt_id', athleteProfileData.id)
    await deleteDependency('pt_atleti', 'atleta_id', athleteProfileData.id)

    // 2. Elimina chat_messages (potrebbe avere trigger)
    try {
      await supabaseAdmin
        .from('chat_messages')
        .delete()
        .or(`sender_id.eq.${athleteProfileData.id},receiver_id.eq.${athleteProfileData.id}`)
    } catch (err) {
      logger.debug('Errore eliminazione chat_messages (ignorato)', err)
    }

    // 3. Elimina tabelle athlete_*_data
    await deleteDependency('athlete_medical_data', 'athlete_id', athleteProfileData.id)
    await deleteDependency('athlete_fitness_data', 'athlete_id', athleteProfileData.id)
    await deleteDependency('athlete_nutrition_data', 'athlete_id', athleteProfileData.id)
    await deleteDependency('athlete_motivational_data', 'athlete_id', athleteProfileData.id)
    await deleteDependency('athlete_administrative_data', 'athlete_id', athleteProfileData.id)
    await deleteDependency('athlete_massage_data', 'athlete_id', athleteProfileData.id)
    await deleteDependency('athlete_smart_tracking_data', 'athlete_id', athleteProfileData.id)
    await deleteDependency('athlete_ai_data', 'athlete_id', athleteProfileData.id)

    // 4. Elimina payments (CRITICO - ha ON DELETE RESTRICT)
    await deleteDependency('payments', 'athlete_id', athleteProfileData.id)

    // 5. Elimina appointments
    await deleteDependency('appointments', 'athlete_id', athleteProfileData.id)

    // 6. Elimina workout logs e plans
    await deleteDependency('workout_logs', 'atleta_id', athleteProfileData.id)
    await deleteDependency('workout_plans', 'athlete_id', athleteProfileData.id)

    // 7. Elimina documents
    await deleteDependency('documents', 'athlete_id', athleteProfileData.id)

    // 8. Elimina progress logs e photos
    await deleteDependency('progress_logs', 'athlete_id', athleteProfileData.id)
    await deleteDependency('progress_photos', 'athlete_id', athleteProfileData.id)

    // 9. Elimina altre dipendenze
    await deleteDependency('inviti_atleti', 'atleta_id', athleteProfileData.id)
    await deleteDependency('lesson_counters', 'athlete_id', athleteProfileData.id)
    await deleteDependency('profiles_tags', 'profile_id', athleteProfileData.id)

    logger.debug('Dipendenze critiche eliminate, procedo con eliminazione', {
      profileId: athleteProfileData.id,
    })

    // Elimina anche i record di audit_logs che potrebbero causare problemi con i trigger
    // Questo è CRITICO perché audit_profiles_trigger potrebbe cercare di inserire in audit_logs
    // durante l'eliminazione, causando ricorsione
    try {
      const { error: auditDeleteError } = await supabaseAdmin
        .from('audit_logs')
        .delete()
        .or(`target_user_id.eq.${athleteProfileData.user_id},target_profile_id.eq.${athleteProfileData.id}`)
      
      if (auditDeleteError) {
        logger.warn('Errore eliminazione audit_logs (non critico)', auditDeleteError, {
          profileId: athleteProfileData.id,
          authUserId: athleteProfileData.user_id,
        })
      } else {
        logger.debug('Audit logs eliminati con successo', {
          profileId: athleteProfileData.id,
        })
      }
    } catch (err) {
      logger.warn('Errore eliminazione audit_logs (ignorato)', err)
    }

    // STRATEGIA: Usa una funzione RPC che disabilita i trigger prima di eliminare
    // Se la funzione non esiste, prova a eliminare direttamente il profilo con una query SQL che disabilita i trigger
    logger.debug('Tentativo eliminazione profilo con trigger disabilitati', {
      authUserId: athleteProfileData.user_id,
      profileId: athleteProfileData.id,
    })

    // Prova prima a usare una funzione RPC che disabilita i trigger (se esiste)
    // Questa funzione dovrebbe disabilitare sia RLS che trigger per evitare ricorsione
    logger.debug('Tentativo eliminazione profilo tramite RPC con trigger disabilitati', {
      profileId: athleteProfileData.id,
    })

    let deleteResult: unknown = null
    let rpcError: { code?: string; message?: string } | null = null

    // Prova con diverse funzioni RPC in ordine di priorità
    // 1. delete_profile_simple (versione semplificata)
    // 2. delete_profile_bypass_rls_and_triggers (disabilita trigger + RLS)
    // 3. delete_profile_bypass_rls (solo RLS)

    let rpcFunctionName = 'delete_profile_simple'
    const { data: deleteResultSimple, error: rpcErrorSimple } = await supabaseAdmin.rpc(
      'delete_profile_simple',
      { profile_id_to_delete: athleteProfileData.id },
    )

    if (!rpcErrorSimple && deleteResultSimple) {
      deleteResult = deleteResultSimple
      rpcError = null
      logger.debug('RPC delete_profile_simple chiamata con successo', {
        profileId: athleteProfileData.id,
        result: deleteResultSimple,
      })
    } else {
      // Fallback 1: prova delete_profile_bypass_rls_and_triggers
      rpcFunctionName = 'delete_profile_bypass_rls_and_triggers'
      const { data: deleteResultWithTriggers, error: rpcErrorWithTriggers } = await supabaseAdmin.rpc(
        'delete_profile_bypass_rls_and_triggers',
        { profile_id_to_delete: athleteProfileData.id },
      )

      if (!rpcErrorWithTriggers && deleteResultWithTriggers) {
        deleteResult = deleteResultWithTriggers
        rpcError = null
        logger.debug('RPC delete_profile_bypass_rls_and_triggers chiamata con successo', {
          profileId: athleteProfileData.id,
          result: deleteResultWithTriggers,
        })
      } else {
        // Fallback 2: usa la funzione originale che disabilita solo RLS
        rpcFunctionName = 'delete_profile_bypass_rls'
        logger.debug('Fallback: uso delete_profile_bypass_rls (solo RLS)', {
          profileId: athleteProfileData.id,
        })

        const { data: deleteResultOriginal, error: rpcErrorOriginal } = await supabaseAdmin.rpc(
          'delete_profile_bypass_rls',
          { profile_id_to_delete: athleteProfileData.id },
        )
        deleteResult = deleteResultOriginal
        rpcError = rpcErrorOriginal

        if (rpcErrorOriginal) {
          logger.error('Tutte le funzioni RPC fallite', rpcErrorOriginal, {
            profileId: athleteProfileData.id,
            errorCode: rpcErrorOriginal.code,
            errorMessage: rpcErrorOriginal.message,
            triedFunctions: ['delete_profile_simple', 'delete_profile_bypass_rls_and_triggers', 'delete_profile_bypass_rls'],
          })
        }
      }
    }

    let profileDeleted = false

    if (!rpcError && deleteResult) {
      // Verifica il risultato della funzione RPC
      let result: { success?: boolean; error?: string; deleted_count?: number } | null = null

      if (typeof deleteResult === 'string') {
        try {
          result = JSON.parse(deleteResult)
        } catch (parseError) {
          logger.debug('Errore parsing risultato RPC (ignorato)', parseError)
          result = null
        }
      } else if (typeof deleteResult === 'object' && deleteResult !== null) {
        result = deleteResult as { success?: boolean; error?: string; deleted_count?: number }
      }

      if (result && result.success) {
        profileDeleted = true
        logger.debug('Profilo eliminato con successo tramite RPC', {
          profileId: athleteProfileData.id,
          deletedCount: result.deleted_count,
        })
      } else if (result && !result.success) {
        // La funzione è stata chiamata ma ha fallito
        logger.error('Funzione RPC ha fallito', null, {
          profileId: athleteProfileData.id,
          result,
          error: result.error,
        })
      }
    } else if (rpcError) {
      // La funzione RPC non è stata chiamata correttamente
      logger.error('Errore chiamata RPC', rpcError, {
        profileId: athleteProfileData.id,
        errorCode: rpcError.code,
        errorMessage: rpcError.message,
      })
    }

    // Se la funzione RPC non ha funzionato, prova a eliminare l'utente da auth.users
    // Il CASCADE dovrebbe eliminare il profilo, ma potrebbe ancora attivare i trigger
    if (!profileDeleted) {
      logger.debug('RPC non ha eliminato il profilo, provo eliminazione da auth.users', {
        authUserId: athleteProfileData.user_id,
        profileId: athleteProfileData.id,
      })

      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(
        athleteProfileData.user_id,
      )

      if (deleteAuthError) {
      logger.error('Errore eliminazione utente da auth.users', deleteAuthError, {
        authUserId: athleteProfileData.user_id,
        profileId: athleteProfileData.id,
      })

      // Fallback: prova a eliminare il profilo direttamente usando la funzione RPC
      logger.warn('Fallback: tentativo eliminazione profilo tramite RPC', {
        profileId: athleteProfileData.id,
      })

      const { data: deleteResult, error: rpcError } = await supabaseAdmin.rpc(
        'delete_profile_bypass_rls',
        { profile_id_to_delete: athleteProfileData.id },
      )

      if (rpcError) {
        logger.error('Errore chiamata RPC delete_profile_bypass_rls', rpcError, {
          profileId: athleteProfileData.id,
          authUserId: athleteProfileData.user_id,
          rpcErrorCode: rpcError.code,
          rpcErrorMessage: rpcError.message,
        })

        // Fallback finale: prova eliminazione diretta
        logger.warn('Fallback finale: tentativo eliminazione diretta profilo', {
          profileId: athleteProfileData.id,
        })

        const { error: profileDeleteError } = await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('id', athleteProfileData.id)

        if (profileDeleteError) {
          logger.error('Errore eliminazione profilo atleta (fallback finale)', profileDeleteError, {
            profileId: athleteProfileData.id,
            authUserId: athleteProfileData.user_id,
            errorCode: profileDeleteError.code,
            errorMessage: profileDeleteError.message,
          })

          let errorMessage = profileDeleteError.message || "Errore nell'eliminazione del profilo"

          if (
            profileDeleteError.code === '23503' ||
            errorMessage.toLowerCase().includes('violates foreign key constraint') ||
            errorMessage.toLowerCase().includes('constraint') ||
            errorMessage.toLowerCase().includes('foreign key') ||
            errorMessage.toLowerCase().includes('still referenced') ||
            errorMessage.toLowerCase().includes('stack depth limit exceeded')
          ) {
            errorMessage =
              "Impossibile eliminare l'atleta: esistono dati collegati nel database (appuntamenti, schede, pagamenti, chat, ecc.) che impediscono l'eliminazione. Elimina prima i dati collegati oppure contatta un amministratore."
          }

          return NextResponse.json(
            {
              error: errorMessage,
              details: profileDeleteError.details || null,
              hint: profileDeleteError.hint || null,
            },
            { status: 500 },
          )
        }

        // Profilo eliminato con successo nel fallback
        logger.debug('Profilo eliminato con successo (fallback diretto)', {
          profileId: athleteProfileData.id,
        })
      } else {
        // Verifica il risultato della funzione RPC
        let result: { success?: boolean; error?: string; deleted_count?: number } | null = null

        if (typeof deleteResult === 'string') {
          try {
            result = JSON.parse(deleteResult)
          } catch (parseError) {
            logger.error('Errore parsing risultato RPC', parseError, {
              profileId: athleteProfileData.id,
              rawResult: deleteResult,
            })
            result = null
          }
        } else if (typeof deleteResult === 'object' && deleteResult !== null) {
          result = deleteResult as { success?: boolean; error?: string; deleted_count?: number }
        }

        if (!result || !result.success) {
          logger.error('Funzione delete_profile_bypass_rls fallita', null, {
            profileId: athleteProfileData.id,
            result,
            rawResult: deleteResult,
          })

          return NextResponse.json(
            {
              error:
                result?.error ||
                "Errore nell'eliminazione del profilo. La funzione SQL ha fallito.",
            },
            { status: 500 },
          )
        }

        logger.debug('Profilo eliminato con successo tramite RPC', {
          profileId: athleteProfileData.id,
          deletedCount: result.deleted_count,
        })
      }

        // Il profilo è stato eliminato, ma l'utente auth potrebbe ancora esistere
        return NextResponse.json({
          success: true,
          message: 'Atleta eliminato con successo (profilo rimosso)',
          warning: 'Utente auth potrebbe ancora esistere',
        })
      }

      // Se arriviamo qui, l'eliminazione da auth.users ha avuto successo
      // Il CASCADE dovrebbe aver eliminato automaticamente il profilo senza attivare i trigger problematici
      logger.debug('Utente eliminato completamente da auth.users (CASCADE elimina profilo)', {
        profileId: athleteProfileData.id,
        authUserId: athleteProfileData.user_id,
      })
    }

    // Se arriviamo qui, il profilo è stato eliminato (tramite RPC o CASCADE)
    return NextResponse.json({
      success: true,
      message: 'Atleta eliminato con successo',
    })
  } catch (error) {
    logger.error('Errore API eliminazione atleta', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Errore interno del server' },
      { status: 500 },
    )
  }
}
