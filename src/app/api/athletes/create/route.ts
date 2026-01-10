import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import type { SupabaseDatabase, TablesInsert } from '@/types/supabase'

const logger = createLogger('api:athletes:create')

const athleteSchema = z.object({
  nome: z.string().trim().min(1, 'Il nome è obbligatorio'),
  cognome: z.string().trim().min(1, 'Il cognome è obbligatorio'),
  email: z.string().trim().email('Email non valida'),
  phone: z.string().trim().nullable().optional(),
  password: z.string().min(6, 'La password deve essere di almeno 6 caratteri'),
  stato: z.string().trim().nullable().optional(),
  note: z.string().trim().nullable().optional(),
  data_iscrizione: z.string().trim().nullable().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione e permessi (solo admin/staff può creare atleti)
    const supabase = await createServerClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Verifica ruolo utente e recupera id profilo trainer
    const { data: trainerProfileCheck } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', session.user.id)
      .single()

    const currentUserProfile = trainerProfileCheck as { id?: string; role?: string } | null
    const userRole = currentUserProfile?.role ?? ''

    if (!currentUserProfile || !['admin', 'pt', 'trainer'].includes(userRole)) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    const trainerProfileId = currentUserProfile.id

    // Leggi e valida i dati del form
    const body = await request.json()
    const parsedBody = athleteSchema.safeParse(body)

    if (!parsedBody.success) {
      const [firstError] = parsedBody.error.issues
      return NextResponse.json({ error: firstError?.message ?? 'Dati non validi' }, { status: 400 })
    }

    const { nome, cognome, email, phone, password, stato, note, data_iscrizione } = parsedBody.data

    let normalizedDataIscrizione: string | undefined
    if (data_iscrizione) {
      const parsedDate = new Date(data_iscrizione)
      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: 'La data di iscrizione non è valida' }, { status: 400 })
      }
      normalizedDataIscrizione = parsedDate.toISOString()
    }

    // Crea client con service role key per creare utenti
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      logger.error('Service role key non configurata')
      return NextResponse.json({ error: 'Configurazione server mancante' }, { status: 500 })
    }

    const supabaseAdmin = createClient<SupabaseDatabase>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // 1. Crea utente in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true, // Email già confermata (creazione manuale)
      user_metadata: {
        nome,
        cognome,
      },
    })

    if (authError) {
      // Gestisci errori comuni di Supabase Auth
      const errorMessage = authError.message || ''
      const isEmailExistsError =
        errorMessage.toLowerCase().includes('already registered') ||
        errorMessage.toLowerCase().includes('already exists') ||
        errorMessage.toLowerCase().includes('duplicate') ||
        errorMessage.toLowerCase().includes('email address has already been registered') ||
        authError.code === 'email_exists'

      if (isEmailExistsError) {
        // L'email esiste già - verifica se l'utente auth ha un profilo
        // Se non ha un profilo, possiamo creare il profilo per l'utente auth esistente
        const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingAuthUsers?.users?.find((u) => u.email === email.trim())

        if (existingUser) {
          // Verifica se esiste già un profilo per questo utente auth
          const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id, user_id, email, role')
            .eq('user_id', existingUser.id)
            .maybeSingle()

          if (existingProfile) {
            // L'utente auth ha già un profilo - errore
            return NextResponse.json(
              { error: 'Questa email è già registrata nel sistema' },
              { status: 409 },
            )
          }

          // L'utente auth esiste ma non ha un profilo - aggiorna password e crea il profilo come atleta
          logger.info(
            'Utente auth esiste senza profilo, aggiorno password e creo il profilo atleta',
            {
              authUserId: existingUser.id,
              email: email.trim(),
            },
          )

          // Aggiorna la password dell'utente auth esistente se fornita
          if (password) {
            const { error: updatePasswordError } = await supabaseAdmin.auth.admin.updateUserById(
              existingUser.id,
              { password },
            )

            if (updatePasswordError) {
              logger.error(
                'Errore aggiornamento password per utente auth esistente',
                updatePasswordError,
                {
                  authUserId: existingUser.id,
                },
              )
              return NextResponse.json(
                {
                  error:
                    updatePasswordError.message ||
                    "Errore nell'aggiornamento della password. L'utente esiste già con una password diversa.",
                },
                { status: 500 },
              )
            }
          }

          // Crea il profilo per l'utente auth esistente
          const profileData: TablesInsert<'profiles'> = {
            user_id: existingUser.id,
            nome,
            cognome,
            email: email.trim(),
            phone: phone ?? null,
            role: 'atleta', // Prova prima 'atleta'
            stato: stato ?? 'attivo',
            note: note ?? null,
            documenti_scadenza: false,
          }

          // Aggiungi data_iscrizione se specificata
          if (normalizedDataIscrizione) {
            profileData.data_iscrizione = normalizedDataIscrizione
          }

          let profileResult = await supabaseAdmin
            .from('profiles')
            .insert(profileData)
            .select()
            .single()

          // Se fallisce con 'atleta', prova 'athlete'
          if (profileResult.error) {
            if (
              profileResult.error.message.includes('role') ||
              profileResult.error.message.includes('atleta')
            ) {
              profileData.role = 'athlete'
              profileResult = await supabaseAdmin
                .from('profiles')
                .insert(profileData)
                .select()
                .single()
            }

            if (profileResult.error) {
              logger.error(
                'Errore creazione profilo per utente auth esistente',
                profileResult.error,
                {
                  authUserId: existingUser.id,
                },
              )
              return NextResponse.json(
                {
                  error:
                    profileResult.error.message || 'Errore durante la creazione del profilo atleta',
                },
                { status: 500 },
              )
            }
          }

          if (!profileResult.data) {
            return NextResponse.json({ error: 'Profilo non creato correttamente' }, { status: 500 })
          }

          const athleteProfileId = profileResult.data.id

          // Crea la relazione pt_atleti (trainer-atleta) anche per utenti esistenti
          if (trainerProfileId) {
            // Crea la relazione pt_atleti (usa upsert per evitare duplicati)
            const { error: ptAtletiError } = await supabaseAdmin.from('pt_atleti').upsert(
              {
                pt_id: trainerProfileId,
                atleta_id: athleteProfileId,
              },
              { onConflict: 'pt_id,atleta_id' },
            )

            if (ptAtletiError) {
              logger.error(
                'Errore creazione relazione pt_atleti (utente esistente)',
                ptAtletiError,
                {
                  ptId: trainerProfileId,
                  athleteId: athleteProfileId,
                },
              )
              // Non blocchiamo la creazione dell'atleta, ma loggiamo l'errore
            } else {
              logger.info('Relazione pt_atleti creata con successo (utente esistente)', {
                ptId: trainerProfileId,
                athleteId: athleteProfileId,
              })
            }
          } else {
            logger.warn(
              'Trainer profile ID non trovato, relazione pt_atleti non creata (utente esistente)',
              {
                trainerUserId: session.user.id,
                athleteId: athleteProfileId,
              },
            )
          }

          return NextResponse.json({
            success: true,
            data: {
              userId: existingUser.id,
              profileId: athleteProfileId,
              message: 'Atleta creato con successo',
            },
          })
        }

        // Non riusciamo a trovare l'utente auth - errore generico
        return NextResponse.json(
          { error: 'Questa email è già registrata nel sistema' },
          { status: 409 },
        )
      }

      logger.error('Errore creazione utente', authError, { email })
      return NextResponse.json(
        { error: authError.message || "Errore durante la creazione dell'utente" },
        { status: 500 },
      )
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Utente non creato correttamente' }, { status: 500 })
    }

    const userId = authData.user.id

    // 2. Crea profilo nella tabella profiles
    const profileData: TablesInsert<'profiles'> = {
      user_id: userId,
      nome,
      cognome,
      email,
      phone: phone ?? null,
      role: 'atleta', // Prova prima 'atleta'
      stato: stato ?? 'attivo',
      note: note ?? null,
      documenti_scadenza: false,
    }

    // Aggiungi data_iscrizione se specificata
    if (normalizedDataIscrizione) {
      profileData.data_iscrizione = normalizedDataIscrizione
    }

    let profileResult = await supabaseAdmin.from('profiles').insert(profileData).select().single()

    // Se fallisce con 'atleta', prova 'athlete'
    if (profileResult.error) {
      if (
        profileResult.error.message.includes('role') ||
        profileResult.error.message.includes('atleta')
      ) {
        profileData.role = 'athlete'
        profileResult = await supabaseAdmin.from('profiles').insert(profileData).select().single()
      }

      if (profileResult.error) {
        // Se il profilo fallisce, elimina l'utente creato
        await supabaseAdmin.auth.admin.deleteUser(userId)
        logger.error('Errore creazione profilo', profileResult.error, { userId, email })
        return NextResponse.json(
          { error: profileResult.error.message || 'Errore durante la creazione del profilo' },
          { status: 500 },
        )
      }
    }

    if (!profileResult.data) {
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: 'Profilo non creato correttamente' }, { status: 500 })
    }

    const athleteProfileId = profileResult.data.id

    // 3. Crea la relazione pt_atleti (trainer-atleta)
    if (trainerProfileId) {
      const { error: ptAtletiError } = await supabaseAdmin.from('pt_atleti').insert({
        pt_id: trainerProfileId,
        atleta_id: athleteProfileId,
      })

      if (ptAtletiError) {
        logger.error('Errore creazione relazione pt_atleti', ptAtletiError, {
          ptId: trainerProfileId,
          athleteId: athleteProfileId,
        })
        // Non blocchiamo la creazione dell'atleta, ma loggiamo l'errore
      } else {
        logger.info('Relazione pt_atleti creata con successo', {
          ptId: trainerProfileId,
          athleteId: athleteProfileId,
        })
      }
    } else {
      logger.warn('Trainer profile ID non trovato, relazione pt_atleti non creata', {
        trainerUserId: session.user.id,
        athleteId: athleteProfileId,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        userId,
        profileId: athleteProfileId,
        message: 'Atleta creato con successo',
      },
    })
  } catch (error) {
    logger.error('Errore API creazione atleta', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Errore interno del server' },
      { status: 500 },
    )
  }
}
