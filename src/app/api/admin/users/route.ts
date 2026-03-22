import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import type { Tables } from '@/types/supabase'
import type { Database } from '@/lib/supabase/types'
import { z } from 'zod'

const logger = createLogger('api:admin:users')

/** Tipo per RPC admin non presenti nei tipi generati (migrazioni custom). */
type AdminRpc = (
  fn: string,
  params?: Record<string, unknown>,
) => Promise<{
  data: unknown
  error: { code?: string; message?: string; hint?: string; details?: string } | null
}>

// Schema validazione creazione utente
const createUserSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'Password deve essere di almeno 6 caratteri'),
  nome: z.string().optional(),
  cognome: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['admin', 'trainer', 'athlete', 'marketing', 'nutrizionista', 'massaggiatore']),
  stato: z.enum(['attivo', 'inattivo', 'sospeso']).optional().default('attivo'),
})

// Schema validazione aggiornamento utente (nullish = accetta null/undefined per campi opzionali)
const updateUserSchema = z.object({
  userId: z.string().uuid('userId deve essere un UUID valido'),
  email: z.string().email('Email non valida').optional(),
  password: z.string().min(6, 'Password deve essere di almeno 6 caratteri').optional(),
  nome: z.string().nullish(),
  cognome: z.string().nullish(),
  phone: z.string().nullish(),
  role: z
    .enum(['admin', 'trainer', 'athlete', 'marketing', 'nutrizionista', 'massaggiatore'])
    .optional(),
  stato: z.enum(['attivo', 'inattivo', 'sospeso']).optional(),
  trainerId: z.string().uuid().nullish(),
})

/**
 * GET /api/admin/users
 * Ottiene tutti gli utenti del sistema (solo admin)
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Verifica che l'utente sia admin
    type ProfileRow = Pick<Tables<'profiles'>, 'id' | 'org_id' | 'role'>
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, org_id, role')
      .eq('user_id', session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }
    const profileTyped = profile as ProfileRow

    if (profileTyped.role !== 'admin') {
      return NextResponse.json(
        { error: 'Solo admin può accedere a questa risorsa' },
        { status: 403 },
      )
    }

    // Se l'utente è admin, usa service role key per bypassare RLS e vedere TUTTO
    // REGOLA: Admin deve vedere tutto e poter fare tutto
    const supabaseAdmin = createAdminClient()

    // Ottieni tutti i profili non eliminati (soft delete: is_deleted = true esclusi)
    const { data: profiles, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .or('is_deleted.eq.false,is_deleted.is.null')
      .order('created_at', { ascending: false })

    if (fetchError) {
      logger.error('Errore durante il recupero degli utenti', fetchError)
      return NextResponse.json(
        { error: 'Errore durante il recupero degli utenti' },
        { status: 500 },
      )
    }

    // Ottieni trainer assegnati per ogni atleta (athlete_trainer_assignments, status=active)
    const usersWithTrainer = await Promise.all(
      (profiles || []).map(async (profile) => {
        if (profile.role === 'athlete') {
          const { data: assignment } = await supabaseAdmin
            .from('athlete_trainer_assignments')
            .select(
              'trainer_id, profiles!athlete_trainer_assignments_trainer_id_fkey(id, nome, cognome, email)',
            )
            .eq('athlete_id', profile.id)
            .eq('status', 'active')
            .limit(1)
            .maybeSingle()

          const trainerProfile = assignment?.profiles as {
            id: string
            nome: string | null
            cognome: string | null
          } | null
          return {
            ...profile,
            trainer: assignment
              ? {
                  id: assignment.trainer_id,
                  nome: trainerProfile?.nome ?? null,
                  cognome: trainerProfile?.cognome ?? null,
                }
              : null,
          }
        }
        return profile
      }),
    )

    return NextResponse.json({ users: usersWithTrainer || [] })
  } catch (error) {
    logger.error('Errore durante il recupero degli utenti', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

/**
 * POST /api/admin/users
 * Crea un nuovo utente (solo admin)
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

    // Verifica che l'utente sia admin
    type ProfileRow = Pick<Tables<'profiles'>, 'id' | 'org_id' | 'role'>
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, org_id, role')
      .eq('user_id', session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }
    const profileTyped = profile as ProfileRow

    if (profileTyped.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin può creare utenti' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Usa admin client per creare utente
    const adminClient = createAdminClient()

    // Verifica che l'email non sia già registrata
    const {
      data: { users },
    } = await adminClient.auth.admin.listUsers()
    const existingUser = users.find((u) => u.email === validatedData.email)

    if (existingUser) {
      return NextResponse.json({ error: 'Email già registrata' }, { status: 409 })
    }

    // Crea l'utente in auth.users
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true,
      user_metadata: {
        nome: validatedData.nome || '',
        cognome: validatedData.cognome || '',
      },
    })

    if (authError || !authData.user) {
      logger.error('Errore durante la creazione utente auth', authError)
      return NextResponse.json(
        { error: authError?.message || 'Errore durante la creazione utente' },
        { status: 500 },
      )
    }

    // Crea il profilo
    type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
    const profileData: ProfileInsert = {
      user_id: authData.user.id,
      email: validatedData.email,
      nome: validatedData.nome || null,
      cognome: validatedData.cognome || null,
      phone: validatedData.phone || null,
      role: validatedData.role,
      stato: validatedData.stato || 'attivo',
      org_id: profileTyped.org_id,
    }

    const { data: createdProfile, error: profileInsertError } = await adminClient
      .from('profiles')
      .insert(profileData)
      .select()
      .single()

    if (profileInsertError || !createdProfile) {
      // Rollback: elimina utente auth se creazione profilo fallisce
      await adminClient.auth.admin.deleteUser(authData.user.id)
      logger.error('Errore durante la creazione profilo', profileInsertError)
      return NextResponse.json(
        { error: profileInsertError?.message || 'Errore durante la creazione profilo' },
        { status: 500 },
      )
    }

    return NextResponse.json({ user: createdProfile })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dati non validi', details: error.issues }, { status: 400 })
    }
    logger.error('Errore durante la creazione utente', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/users
 * Aggiorna un utente (solo admin)
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

    // Verifica che l'utente sia admin
    type ProfileRow = Pick<Tables<'profiles'>, 'id' | 'org_id' | 'role'>
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, org_id, role')
      .eq('user_id', session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }
    const profileTyped = profile as ProfileRow

    if (profileTyped.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin può aggiornare utenti' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    if (!validatedData.userId) {
      return NextResponse.json({ error: 'userId è obbligatorio' }, { status: 400 })
    }

    // Usa admin client per aggiornare utente
    const adminClient = createAdminClient()

    // Verifica che l'utente esista
    type ProfileWithUserId = Pick<Tables<'profiles'>, 'id' | 'user_id'>
    const { data: existingProfile, error: fetchError } = await adminClient
      .from('profiles')
      .select('id, user_id')
      .eq('id', validatedData.userId)
      .single()

    if (fetchError || !existingProfile) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
    }
    const existingProfileTyped = existingProfile as ProfileWithUserId

    // Prepara dati aggiornamento profilo (solo se ci sono campi da aggiornare)
    type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
    const updateData: ProfileUpdate = {}
    if (validatedData.nome !== undefined)
      updateData.nome = validatedData.nome == null ? null : validatedData.nome.trim() || null
    if (validatedData.cognome !== undefined)
      updateData.cognome =
        validatedData.cognome == null ? null : validatedData.cognome.trim() || null
    if (validatedData.phone !== undefined)
      updateData.phone = validatedData.phone == null ? null : validatedData.phone.trim() || null
    if (validatedData.role !== undefined) updateData.role = validatedData.role
    if (validatedData.stato !== undefined) updateData.stato = validatedData.stato

    let updatedProfile: Tables<'profiles'> | null = null

    if (Object.keys(updateData).length > 0) {
      const { data: profileAfterUpdate, error: updateError } = await adminClient
        .from('profiles')
        .update(updateData)
        .eq('id', validatedData.userId)
        .select()
        .single()

      if (updateError) {
        logger.error("Errore durante l'aggiornamento profilo", updateError)
        return NextResponse.json({ error: "Errore durante l'aggiornamento" }, { status: 500 })
      }
      updatedProfile = profileAfterUpdate as Tables<'profiles'>
    }

    // Aggiorna auth.users se email o password cambiate
    if (existingProfileTyped.user_id) {
      if (validatedData.email) {
        const { error: emailError } = await adminClient.auth.admin.updateUserById(
          existingProfileTyped.user_id,
          {
            email: validatedData.email.trim(),
          },
        )
        if (emailError) {
          logger.warn('Errore durante aggiornamento email auth', emailError)
        }
      }

      if (validatedData.password) {
        const { error: passwordError } = await adminClient.auth.admin.updateUserById(
          existingProfileTyped.user_id,
          {
            password: validatedData.password,
          },
        )
        if (passwordError) {
          logger.error('Errore durante aggiornamento password auth', passwordError)
          return NextResponse.json(
            { error: passwordError.message || "Errore durante l'aggiornamento della password" },
            { status: 500 },
          )
        }
      }
    }

    // Se non abbiamo aggiornato il profilo (es. solo password), ritorna il profilo esistente
    if (!updatedProfile) {
      const { data: profileData } = await adminClient
        .from('profiles')
        .select('*')
        .eq('id', validatedData.userId)
        .single()
      updatedProfile = profileData as Tables<'profiles'>
    }

    // Assegnazione trainer (solo per atleti): usa athlete_trainer_assignments
    if (validatedData.trainerId !== undefined && validatedData.trainerId !== null) {
      const athleteId = validatedData.userId
      const trainerId = validatedData.trainerId
      const { data: athleteRow } = await adminClient
        .from('profiles')
        .select('id, role, org_id')
        .eq('id', athleteId)
        .single()
      const { data: trainerRow } = await adminClient
        .from('profiles')
        .select('id, role, org_id')
        .eq('id', trainerId)
        .single()
      if (athleteRow?.role !== 'athlete' || trainerRow?.role !== 'trainer') {
        return NextResponse.json(
          { error: 'Assegnazione consentita solo tra athlete e trainer' },
          { status: 400 },
        )
      }
      let orgId: string = athleteRow.org_id ?? trainerRow.org_id ?? ''
      if (!orgId) {
        const { data: defaultOrg } = await adminClient
          .from('organizations')
          .select('id')
          .eq('slug', 'default-org')
          .maybeSingle()
        orgId = defaultOrg?.id ?? 'default-org'
      }
      if (
        athleteRow.org_id != null &&
        trainerRow?.org_id != null &&
        athleteRow.org_id !== trainerRow.org_id
      ) {
        return NextResponse.json(
          { error: 'Athlete e trainer devono appartenere allo stesso org' },
          { status: 400 },
        )
      }
      await adminClient
        .from('athlete_trainer_assignments')
        .update({ status: 'inactive', deactivated_at: new Date().toISOString() })
        .eq('athlete_id', athleteId)
        .eq('status', 'active')
      const { error: insErr } = await adminClient.from('athlete_trainer_assignments').insert({
        org_id: orgId,
        org_id_text: orgId,
        athlete_id: athleteId,
        trainer_id: trainerId,
        status: 'active',
        activated_at: new Date().toISOString(),
        created_by_profile_id: profileTyped.id,
      })
      if (insErr) {
        logger.warn('Errore assegnazione trainer', insErr)
        return NextResponse.json(
          { error: "Errore durante l'assegnazione del trainer" },
          { status: 500 },
        )
      }
    } else if (validatedData.trainerId === null) {
      // Rimuovi trainer attivo (disattiva)
      await adminClient
        .from('athlete_trainer_assignments')
        .update({ status: 'inactive', deactivated_at: new Date().toISOString() })
        .eq('athlete_id', validatedData.userId)
        .eq('status', 'active')
    }

    return NextResponse.json({ user: updatedProfile })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dati non validi', details: error.issues }, { status: 400 })
    }
    logger.error("Errore durante l'aggiornamento utente", error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/users
 * Elimina un utente (solo admin)
 */
export async function DELETE(request: NextRequest) {
  let userId: string | null = null
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Verifica che l'utente sia admin
    type ProfileRow = Pick<Tables<'profiles'>, 'id' | 'org_id' | 'role'>
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, org_id, role')
      .eq('user_id', session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }
    const profileTyped = profile as ProfileRow

    if (profileTyped.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin può eliminare utenti' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    userId = searchParams.get('userId')
    const _reason = searchParams.get('reason') ?? undefined

    if (!userId) {
      return NextResponse.json({ error: 'userId è obbligatorio' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    type ProfileWithUserId = Pick<Tables<'profiles'>, 'id' | 'user_id'>
    const { data: userProfile, error: fetchError } = await adminClient
      .from('profiles')
      .select('id, user_id')
      .eq('id', userId)
      .single()

    if (fetchError || !userProfile) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
    }
    const userProfileTyped = userProfile as ProfileWithUserId
    const profileId = userId
    const authUserId = userProfileTyped.user_id ?? null

    // Hard delete: rimuovi tutte le dipendenze poi profilo e auth
    const safeDelete = async (table: string, filter: { column: string; value: string | null }) => {
      if (!filter.value) return
      try {
        const { error } = await adminClient
          .from(table as keyof Database['public']['Tables'])
          .delete()
          .eq(filter.column, filter.value)
        if (error && error.code !== 'PGRST116') {
          logger.warn(`Errore eliminazione ${table}`, error, { filter })
        }
      } catch (err) {
        logger.debug(`Tabella ${table} non esiste o errore non critico`, err)
      }
    }

    try {
      await safeDelete('athlete_trainer_assignments', { column: 'trainer_id', value: profileId })
      await safeDelete('athlete_trainer_assignments', { column: 'athlete_id', value: profileId })
      await safeDelete('trainer_athletes', { column: 'trainer_id', value: profileId })
      await safeDelete('trainer_athletes', { column: 'athlete_id', value: profileId })

      if (authUserId) {
        await safeDelete('athlete_medical_data', { column: 'user_id', value: authUserId })
        await safeDelete('athlete_fitness_data', { column: 'user_id', value: authUserId })
        await safeDelete('athlete_nutrition_data', { column: 'user_id', value: authUserId })
        await safeDelete('athlete_massage_data', { column: 'user_id', value: authUserId })
        await safeDelete('athlete_motivational_data', { column: 'user_id', value: authUserId })
        await safeDelete('athlete_administrative_data', { column: 'user_id', value: authUserId })
        await safeDelete('athlete_smart_tracking_data', { column: 'user_id', value: authUserId })
        await safeDelete('athlete_ai_data', { column: 'user_id', value: authUserId })
      }

      await (adminClient.rpc as unknown as AdminRpc)('soft_delete_payments_for_profile', {
        p_profile_id: profileId,
        p_actor_profile_id: profileTyped.id,
      })

      await safeDelete('appointments', { column: 'athlete_id', value: profileId })
      await safeDelete('appointments', { column: 'staff_id', value: profileId })
      await safeDelete('appointments', { column: 'trainer_id', value: profileId })
      await safeDelete('workout_logs', { column: 'atleta_id', value: profileId })
      await safeDelete('workout_logs', { column: 'athlete_id', value: profileId })
      await safeDelete('workouts', { column: 'athlete_id', value: profileId })
      await safeDelete('workouts', { column: 'created_by_staff_id', value: profileId })
      await safeDelete('workout_plans', { column: 'athlete_id', value: profileId })
      await safeDelete('workout_plans', { column: 'created_by_staff_id', value: profileId })
      await safeDelete('documents', { column: 'athlete_id', value: profileId })
      await safeDelete('documents', { column: 'uploaded_by_profile_id', value: profileId })
      await safeDelete('inviti_atleti', { column: 'pt_id', value: profileId })
      await safeDelete('inviti_atleti', { column: 'invited_by', value: profileId })
      if (authUserId) {
        await safeDelete('inviti_atleti', { column: 'atleta_user_id', value: authUserId })
      }
      await safeDelete('lesson_counters', { column: 'athlete_id', value: profileId })
      await safeDelete('progress_logs', { column: 'athlete_id', value: profileId })
      await safeDelete('progress_photos', { column: 'athlete_id', value: profileId })
      await safeDelete('chat_messages', { column: 'sender_id', value: profileId })
      await safeDelete('chat_messages', { column: 'receiver_id', value: profileId })
      await safeDelete('profiles_tags', { column: 'profile_id', value: profileId })
      if (authUserId) {
        await safeDelete('notifications', { column: 'user_id', value: authUserId })
      }
      await safeDelete('profile_tombstones', { column: 'profile_id', value: profileId })
    } catch (depsError) {
      logger.warn('Errore durante eliminazione dipendenze (continuo)', depsError, {
        userId: profileId,
      })
    }

    if (authUserId) {
      const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(authUserId)
      if (deleteAuthError) {
        logger.warn('Errore eliminazione auth.users', deleteAuthError, { authUserId })
      }
    }

    const { data: deleteResult, error: rpcError } = await (
      adminClient.rpc as unknown as (
        fn: string,
        params?: Record<string, unknown>,
      ) => Promise<{ data: unknown; error: { message?: string; code?: string } | null }>
    )('delete_profile_bypass_rls', { profile_id_to_delete: profileId })
    if (rpcError) {
      logger.error('Errore RPC delete_profile_bypass_rls', rpcError, { userId: profileId })
      return NextResponse.json(
        {
          error: 'Errore durante la cancellazione del profilo',
          details: rpcError.message,
          code: rpcError.code,
        },
        { status: 500 },
      )
    }
    const result = deleteResult as { success?: boolean; error?: string }
    if (result && result.success === false) {
      return NextResponse.json(
        { error: result?.error ?? 'Cancellazione non riuscita' },
        { status: 400 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorUserId = userId || 'unknown'
    logger.error("Errore durante l'eliminazione utente", error, {
      userId: errorUserId,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      {
        error: 'Errore interno del server',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
