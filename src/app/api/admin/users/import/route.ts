import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api/admin/users/import')

const importUserSchema = z.object({
  email: z.string().trim().email('Email non valida'),
  password: z
    .string()
    .min(6, 'La password deve essere di almeno 6 caratteri')
    .default('Password123!')
    .transform((val) => {
      // Assicura che la password sia sempre valida
      if (!val || val.length < 6) {
        return 'Password123!'
      }
      return val
    }),
  nome: z.string().trim().nullable().optional(),
  cognome: z.string().trim().nullable().optional(),
  phone: z.string().trim().nullable().optional(),
  role: z
    .enum(['admin', 'pt', 'trainer', 'atleta', 'athlete', 'nutrizionista', 'massaggiatore'])
    .default('atleta'),
  stato: z.enum(['attivo', 'inattivo', 'sospeso']).default('attivo'),
  trainerAssegnato: z.string().trim().nullable().optional(), // Email o nome+cognome del trainer
})

const bulkImportSchema = z.object({
  users: z
    .array(importUserSchema)
    .min(1, 'Almeno un utente richiesto')
    .max(100, 'Massimo 100 utenti per import'),
})

interface ImportResult {
  success: boolean
  email: string
  nome?: string | null
  cognome?: string | null
  message: string
  index: number
}

// Funzione helper per cercare trainer per email o nome+cognome
async function findTrainerByIdentifier(
  supabaseAdmin: ReturnType<typeof createClient<Database>>,
  identifier: string,
): Promise<string | null> {
  if (!identifier || !identifier.trim()) {
    return null
  }

  const trimmed = identifier.trim().toLowerCase()

  // Cerca per email
  const { data: trainerByEmail } = await supabaseAdmin
    .from('profiles')
    .select('id, role')
    .eq('email', trimmed)
    .in('role', ['pt', 'trainer'])
    .maybeSingle()

  if (trainerByEmail) {
    return (trainerByEmail as { id: string }).id
  }

  // Cerca per nome+cognome (formato: "Nome Cognome" o "Nome,Cognome")
  const nameParts = trimmed.split(/[\s,]+/).filter((p) => p.length > 0)
  if (nameParts.length >= 2) {
    const nome = nameParts[0]
    const cognome = nameParts.slice(1).join(' ')

    const { data: trainerByName } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .ilike('nome', `%${nome}%`)
      .ilike('cognome', `%${cognome}%`)
      .in('role', ['pt', 'trainer'])
      .maybeSingle()

    if (trainerByName) {
      return (trainerByName as { id: string }).id
    }
  }

  return null
}

// POST - Import bulk utenti da CSV (solo admin)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Verifica ruolo admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    const adminProfile = profile as { role?: string } | null
    const userRole = adminProfile?.role ?? ''
    if (!adminProfile || userRole !== 'admin') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Valida input
    const body = await request.json()
    const parsedBody = bulkImportSchema.safeParse(body)

    if (!parsedBody.success) {
      const [firstError] = parsedBody.error.issues
      return NextResponse.json({ error: firstError?.message ?? 'Dati non validi' }, { status: 400 })
    }

    const { users } = parsedBody.data

    // Crea client con service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configurazione server mancante' }, { status: 500 })
    }

    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Importa utenti in batch (sequenziale per evitare rate limiting)
    const results: ImportResult[] = []
    const BATCH_SIZE = 5 // Processa 5 utenti alla volta per evitare sovraccarico

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE)

      // Processa batch in parallelo
      const batchPromises = batch.map(async (user, batchIndex) => {
        const globalIndex = i + batchIndex
        try {
          // Crea utente in auth.users
          // Assicurati che la password sia valida (minimo 6 caratteri)
          // Zod dovrebbe già aver validato, ma facciamo un doppio check
          const validPassword =
            user.password && typeof user.password === 'string' && user.password.length >= 6
              ? user.password
              : 'Password123!'

          // Log per debug
          logger.info('Creazione utente durante import', {
            email: user.email.trim(),
            passwordLength: validPassword.length,
            passwordProvided: !!user.password,
            passwordOriginalLength: user.password?.length || 0,
            role: user.role,
          })

          // Crea utente con password garantita valida
          const createUserPayload = {
            email: user.email.trim(),
            password: validPassword,
            email_confirm: true, // Importante: conferma email per permettere login immediato
            user_metadata: {
              nome: user.nome || '',
              cognome: user.cognome || '',
            },
          }

          logger.debug('Payload creazione utente', {
            email: createUserPayload.email,
            passwordLength: createUserPayload.password.length,
            emailConfirm: createUserPayload.email_confirm,
          })

          const { data: authData, error: authError } =
            await supabaseAdmin.auth.admin.createUser(createUserPayload)

          // Log risultato creazione
          if (authData?.user) {
            logger.info('✅ Utente creato con successo durante import', {
              userId: authData.user.id,
              email: authData.user.email,
              emailConfirmed: !!authData.user.email_confirmed_at,
              passwordLength: validPassword.length,
              createdAt: authData.user.created_at,
            })

            // Verifica che l'email sia confermata - se non lo è, fix automatico
            if (!authData.user.email_confirmed_at) {
              logger.warn('⚠️ Email non confermata dopo creazione, fix automatico...', {
                userId: authData.user.id,
                email: authData.user.email,
              })

              // Fix automatico: conferma email
              const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
                authData.user.id,
                {
                  email_confirm: true,
                },
              )

              if (confirmError) {
                logger.error('Errore conferma email automatica', confirmError, {
                  userId: authData.user.id,
                })
              } else {
                logger.info('✅ Email confermata automaticamente', {
                  userId: authData.user.id,
                })
              }
            }
          }

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
              // Verifica se l'utente auth ha un profilo
              const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers()
              const existingUser = existingAuthUsers?.users?.find(
                (u) => u.email === user.email.trim(),
              )

              if (existingUser) {
                // Verifica se esiste già un profilo
                const { data: existingProfile } = await supabaseAdmin
                  .from('profiles')
                  .select('id, user_id, email')
                  .eq('user_id', existingUser.id)
                  .maybeSingle()

                if (existingProfile) {
                  return {
                    success: false,
                    email: user.email,
                    nome: user.nome || null,
                    cognome: user.cognome || null,
                    message: 'Email già registrata nel sistema',
                    index: globalIndex,
                  } as ImportResult
                }

                // Utente auth esiste ma non ha profilo - aggiorna password e crea profilo
                const validPassword =
                  user.password && user.password.length >= 6 ? user.password : 'Password123!'

                logger.debug('Aggiornamento password per utente esistente', {
                  userId: existingUser.id,
                  email: user.email,
                  passwordLength: validPassword.length,
                })

                const { error: updatePasswordError } =
                  await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
                    password: validPassword,
                    email_confirm: true, // Assicura che l'email sia confermata
                  })

                if (updatePasswordError) {
                  logger.error('Errore aggiornamento password', updatePasswordError, {
                    userId: existingUser.id,
                    email: user.email,
                  })
                  return {
                    success: false,
                    email: user.email,
                    nome: user.nome || null,
                    cognome: user.cognome || null,
                    message: `Errore aggiornamento password: ${updatePasswordError.message}`,
                    index: globalIndex,
                  } as ImportResult
                }

                logger.debug('Password aggiornata con successo', {
                  userId: existingUser.id,
                  email: user.email,
                })

                // Cerca trainer se specificato
                let trainerId: string | null = null
                if (user.trainerAssegnato && (user.role === 'atleta' || user.role === 'athlete')) {
                  trainerId = await findTrainerByIdentifier(supabaseAdmin, user.trainerAssegnato)
                  if (!trainerId && user.trainerAssegnato) {
                    logger.warn('Trainer non trovato', {
                      trainerAssegnato: user.trainerAssegnato,
                      email: user.email,
                    })
                  }
                }

                // Crea profilo
                const profileInsertData = {
                  user_id: existingUser.id,
                  email: user.email.trim(),
                  nome: user.nome || null,
                  cognome: user.cognome || null,
                  phone: user.phone || null,
                  role: user.role as
                    | 'admin'
                    | 'pt'
                    | 'trainer'
                    | 'atleta'
                    | 'athlete'
                    | 'nutrizionista'
                    | 'massaggiatore',
                  stato: user.stato || 'attivo',
                }

                const { data: profileData, error: profileError } =
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  await (supabaseAdmin.from('profiles') as any)
                    .insert(profileInsertData as Record<string, unknown>)
                    .select()
                    .single()

                if (profileError) {
                  logger.error('Errore creazione profilo per utente auth esistente', profileError, {
                    authUserId: existingUser.id,
                    email: user.email,
                  })
                  return {
                    success: false,
                    email: user.email,
                    nome: user.nome || null,
                    cognome: user.cognome || null,
                    message: profileError.message || 'Errore nella creazione profilo',
                    index: globalIndex,
                  } as ImportResult
                }

                // Gestisci assegnazione trainer se è un atleta
                if (
                  (user.role === 'atleta' || user.role === 'athlete') &&
                  trainerId &&
                  profileData?.id
                ) {
                  const { data: trainerProfile } = await supabaseAdmin
                    .from('profiles')
                    .select('id, role')
                    .eq('id', trainerId)
                    .single()

                  if (
                    trainerProfile &&
                    ((trainerProfile as { role?: string }).role === 'pt' ||
                      (trainerProfile as { role?: string }).role === 'trainer')
                  ) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (supabaseAdmin.from('pt_atleti') as any).upsert(
                      {
                        pt_id: trainerId,
                        atleta_id: profileData.id,
                      },
                      {
                        onConflict: 'pt_id,atleta_id',
                      },
                    )
                  }
                }

                return {
                  success: true,
                  email: user.email,
                  nome: user.nome || null,
                  cognome: user.cognome || null,
                  message: 'Utente creato con successo (email esistente, profilo aggiunto)',
                  index: globalIndex,
                } as ImportResult
              }

              return {
                success: false,
                email: user.email,
                nome: user.nome || null,
                cognome: user.cognome || null,
                message: 'Email già registrata nel sistema',
                index: globalIndex,
              } as ImportResult
            }

            return {
              success: false,
              email: user.email,
              nome: user.nome || null,
              cognome: user.cognome || null,
              message: authError.message || 'Errore nella creazione utente',
              index: globalIndex,
            } as ImportResult
          }

          if (!authData.user) {
            return {
              success: false,
              email: user.email,
              nome: user.nome || null,
              cognome: user.cognome || null,
              message: 'Utente non creato correttamente',
              index: globalIndex,
            } as ImportResult
          }

          // Verifica se il profilo esiste già (potrebbe essere stato creato dal trigger)
          const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id, user_id, email, role, nome, cognome, phone, stato')
            .eq('user_id', authData.user.id)
            .maybeSingle()

          let profileData

          if (existingProfile) {
            // Il profilo esiste già (creato dal trigger) - aggiornalo con i dati forniti
            const profileUpdate: Record<string, unknown> = {
              email: user.email.trim(),
              nome: user.nome || null,
              cognome: user.cognome || null,
              phone: user.phone || null,
              role: user.role as
                | 'admin'
                | 'pt'
                | 'trainer'
                | 'atleta'
                | 'athlete'
                | 'nutrizionista'
                | 'massaggiatore',
              stato: user.stato || 'attivo',
            }

            const { data: updatedProfile, error: updateError } =
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (supabaseAdmin.from('profiles') as any)
                .update(profileUpdate)
                .eq('id', (existingProfile as { id: string } | null)?.id || '')
                .select()
                .single()

            if (updateError) {
              await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
              return {
                success: false,
                email: user.email,
                nome: user.nome || null,
                cognome: user.cognome || null,
                message: updateError.message || "Errore nell'aggiornamento profilo",
                index: globalIndex,
              } as ImportResult
            }

            profileData = updatedProfile

            // Fix: verifica che email sia confermata
            const { data: userCheck } = await supabaseAdmin.auth.admin.getUserById(authData.user.id)
            if (userCheck?.user && !userCheck.user.email_confirmed_at) {
              logger.warn('Email non confermata per profilo esistente, fix...', {
                userId: userCheck.user.id,
                email: userCheck.user.email,
              })
              await supabaseAdmin.auth.admin.updateUserById(userCheck.user.id, {
                email_confirm: true,
              })
            }

            // Gestisci assegnazione trainer se è un atleta
            if (
              (user.role === 'atleta' || user.role === 'athlete') &&
              user.trainerAssegnato &&
              profileData?.id
            ) {
              const trainerId = await findTrainerByIdentifier(supabaseAdmin, user.trainerAssegnato)

              if (trainerId) {
                const { data: trainerProfile } = await supabaseAdmin
                  .from('profiles')
                  .select('id, role')
                  .eq('id', trainerId)
                  .single()

                const trainer = trainerProfile as { role?: string } | null
                if (trainer && (trainer.role === 'pt' || trainer.role === 'trainer')) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  await (supabaseAdmin.from('pt_atleti') as any).upsert(
                    {
                      pt_id: trainerId,
                      atleta_id: profileData.id,
                    },
                    {
                      onConflict: 'pt_id,atleta_id',
                    },
                  )
                }
              }
            }
          } else {
            // Il profilo non esiste - crealo
            const profileInsertData = {
              user_id: authData.user.id,
              email: user.email.trim(),
              nome: user.nome || null,
              cognome: user.cognome || null,
              phone: user.phone || null,
              role: user.role as
                | 'admin'
                | 'pt'
                | 'trainer'
                | 'atleta'
                | 'athlete'
                | 'nutrizionista'
                | 'massaggiatore',
              stato: user.stato || 'attivo',
            }

            const { data: newProfileData, error: profileError } =
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (supabaseAdmin.from('profiles') as any)
                .insert(profileInsertData as Record<string, unknown>)
                .select()
                .single()

            if (profileError) {
              await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
              return {
                success: false,
                email: user.email,
                nome: user.nome || null,
                cognome: user.cognome || null,
                message: profileError.message || 'Errore nella creazione profilo',
                index: globalIndex,
              } as ImportResult
            }

            profileData = newProfileData
          }

          // Gestisci assegnazione trainer se è un atleta e trainerAssegnato è fornito
          if (
            (user.role === 'atleta' || user.role === 'athlete') &&
            user.trainerAssegnato &&
            profileData?.id
          ) {
            const trainerId = await findTrainerByIdentifier(supabaseAdmin, user.trainerAssegnato)

            if (trainerId) {
              // Verifica che il trainer esista
              const { data: trainerProfile } = await supabaseAdmin
                .from('profiles')
                .select('id, role')
                .eq('id', trainerId)
                .single()

              const trainer = trainerProfile as { role?: string } | null
              if (trainer && (trainer.role === 'pt' || trainer.role === 'trainer')) {
                // Crea o aggiorna la relazione pt_atleti
                const { error: ptAtletiError } =
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  await (supabaseAdmin.from('pt_atleti') as any).upsert(
                    {
                      pt_id: trainerId,
                      atleta_id: profileData.id,
                    },
                    {
                      onConflict: 'pt_id,atleta_id',
                    },
                  )

                if (ptAtletiError) {
                  logger.error('Errore creazione relazione pt_atleti', ptAtletiError, {
                    trainerId,
                    athleteId: profileData.id,
                  })
                  // Non falliamo la creazione utente se la relazione fallisce
                }
              }
            } else if (user.trainerAssegnato) {
              logger.warn('Trainer non trovato durante import', {
                trainerAssegnato: user.trainerAssegnato,
                email: user.email,
              })
            }
          }

          // Fix finale: verifica che email sia confermata e password sia corretta
          // Questo è importante per garantire che l'utente possa fare login
          if (authData.user) {
            const { data: finalUser } = await supabaseAdmin.auth.admin.getUserById(authData.user.id)

            if (finalUser?.user && !finalUser.user.email_confirmed_at) {
              logger.warn('Email non confermata, fix finale...', {
                userId: finalUser.user.id,
                email: finalUser.user.email,
              })

              await supabaseAdmin.auth.admin.updateUserById(finalUser.user.id, {
                email_confirm: true,
              })
            }

            // Verifica che la password sia stata impostata (non possiamo verificare il valore, ma possiamo verificare che l'utente esista)
            logger.info('✅ Import utente completato con successo', {
              userId: finalUser?.user?.id || authData.user.id,
              email: user.email,
              emailConfirmed: !!finalUser?.user?.email_confirmed_at,
              profileCreated: !!profileData,
            })
          }

          return {
            success: true,
            email: user.email,
            nome: user.nome || null,
            cognome: user.cognome || null,
            message: 'Utente creato con successo',
            index: globalIndex,
          } as ImportResult
        } catch (error) {
          logger.error('Errore import utente', error, { email: user.email, index: globalIndex })
          return {
            success: false,
            email: user.email,
            nome: user.nome || null,
            cognome: user.cognome || null,
            message: error instanceof Error ? error.message : 'Errore sconosciuto',
            index: globalIndex,
          } as ImportResult
        }
      })

      // Attendi completamento batch
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults.filter((r): r is ImportResult => r !== undefined))

      // Piccolo delay tra batch per evitare rate limiting
      if (i + BATCH_SIZE < users.length) {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }

    // Calcola statistiche
    const successCount = results.filter((r) => r.success).length
    const errorCount = results.filter((r) => !r.success).length

    return NextResponse.json({
      success: true,
      total: users.length,
      successCount,
      errorCount,
      results,
    })
  } catch (error: unknown) {
    logger.error('Errore import bulk utenti', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore durante l'import bulk" },
      { status: 500 },
    )
  }
}
