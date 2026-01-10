import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import type { Database, Tables } from '@/types/supabase'
import { createLogger } from '@/lib/logger'
import { rateLimit } from '@/lib/rate-limit'
import { logAuditWithContext, AUDIT_EVENTS } from '@/lib/audit'

const logger = createLogger('api/admin/users')

const createUserSchema = z.object({
  email: z.string().trim().email('Email non valida'),
  password: z.string().min(6, 'La password deve essere di almeno 6 caratteri'),
  nome: z.string().trim().nullable().optional(),
  cognome: z.string().trim().nullable().optional(),
  phone: z.string().trim().nullable().optional(),
  role: z.enum(['admin', 'pt', 'trainer', 'atleta', 'athlete']),
  stato: z.enum(['attivo', 'inattivo', 'sospeso']).default('attivo'),
})

const updateUserSchema = z.object({
  email: z.string().trim().email('Email non valida').optional(),
  password: z.string().min(6, 'La password deve essere di almeno 6 caratteri').optional(),
  nome: z.string().trim().nullable().optional(),
  cognome: z.string().trim().nullable().optional(),
  phone: z.string().trim().nullable().optional(),
  role: z.enum(['admin', 'pt', 'trainer', 'atleta', 'athlete']).optional(),
  stato: z.enum(['attivo', 'inattivo', 'sospeso']).optional(),
})

// GET - Lista tutti gli utenti (solo admin) con paginazione server-side
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Verifica ruolo admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const adminProfile = profile as { role?: string } | null
    const userRole = adminProfile?.role ?? ''
    if (!adminProfile || userRole !== 'admin') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Service role client per bypassare RLS (admin deve vedere tutto)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      logger.error('Variabili ambiente Supabase mancanti')
      return NextResponse.json({ error: 'Configurazione server errata' }, { status: 500 })
    }

    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Parse query parameters per paginazione
    const searchParams = request.nextUrl.searchParams
    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const searchParam = searchParams.get('search')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const roleFilterParam = searchParams.get('roleFilter')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const statoFilterParam = searchParams.get('statoFilter')

    // Valida e calcola paginazione
    const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1
    const limit = limitParam
      ? Math.min(100, Math.max(1, parseInt(limitParam, 10)))
      : undefined // Se non specificato, ritorna tutti (backward compatibility)
    const offset = limit ? (page - 1) * limit : undefined

    // Query base (usa supabaseAdmin per bypassare RLS)
    let dataQuery = supabaseAdmin.from('profiles').select('*')

    // Applica filtri se presenti (solo per dataQuery, backward compatibility)
    // Nota: i filtri search/role/stato sono gestiti client-side nel componente per ora
    // per mantenere backward compatibility. La paginazione server-side può essere aggiunta in futuro.

    // Applica ordinamento
    dataQuery = dataQuery.order('created_at', { ascending: false })

    // Applica paginazione solo se limit è specificato
    if (limit !== undefined) {
      if (offset !== undefined) {
        dataQuery = dataQuery.range(offset, offset + limit - 1)
      } else {
        dataQuery = dataQuery.limit(limit)
      }
    }

    const { data: users, error } = await dataQuery

    if (error) throw error

    // Enrich: trainer assegnato per atleti (pt_atleti → trainer profile)
    const usersData = (users || []) as Tables<'profiles'>[]
    const athleteIds = usersData
      .filter((u) => u.role === 'atleta' || u.role === 'athlete')
      .map((u) => u.id)
      .filter(Boolean)

    let trainerMap = new Map<string, { id: string; nome: string | null; cognome: string | null; email: string | null }>()

    if (athleteIds.length > 0) {
      const { data: rels, error: relError } = await supabaseAdmin
        .from('pt_atleti')
        .select('pt_id, atleta_id')
        .in('atleta_id', athleteIds)

      if (relError) throw relError

      const trainerIds = Array.from(
        new Set((rels || []).map((r) => (r as Tables<'pt_atleti'>).pt_id).filter(Boolean)),
      )

      if (trainerIds.length > 0) {
        const { data: trainers, error: trainerError } = await supabaseAdmin
          .from('profiles')
          .select('id, nome, cognome, email')
          .in('id', trainerIds)

        if (trainerError) throw trainerError

        trainerMap = new Map(
          (trainers || []).map((t) => [
            (t as Tables<'profiles'>).id,
            {
              id: (t as Tables<'profiles'>).id,
              nome: (t as Tables<'profiles'>).nome ?? null,
              cognome: (t as Tables<'profiles'>).cognome ?? null,
              email: (t as Tables<'profiles'>).email ?? null,
            },
          ]),
        )
      }

      // Mappa atleta -> trainer assegnato (primo match)
      const athleteTrainer = new Map<string, string>()
      for (const rel of rels || []) {
        const atletaId = (rel as Tables<'pt_atleti'>).atleta_id
        const ptId = (rel as Tables<'pt_atleti'>).pt_id
        if (atletaId && ptId && !athleteTrainer.has(atletaId)) {
          athleteTrainer.set(atletaId, ptId)
        }
      }

      // Arricchisci users
      for (const u of usersData) {
        if (athleteTrainer.has(u.id)) {
          const trainerId = athleteTrainer.get(u.id)!
          const trainer = trainerMap.get(trainerId)
          ;(u as unknown as { trainerAssegnato?: unknown }).trainerAssegnato = trainer ?? null
        } else {
          ;(u as unknown as { trainerAssegnato?: unknown }).trainerAssegnato = null
        }
      }
    }

    // Backward compatibility: ritorna sempre { users } per compatibilità con frontend esistente
    return NextResponse.json({
      users: usersData,
    })
  } catch (error: unknown) {
    logger.error('Errore nel recupero utenti', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Errore nel recupero utenti' },
      { status: 500 },
    )
  }
}

// POST - Crea nuovo utente (solo admin)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: max 10 richieste/minuto per operazioni sensibili (create user)
    const rateLimitResponse = await rateLimit({ windowMs: 60000, maxRequests: 10 })(request)
    if (rateLimitResponse.response) {
      return rateLimitResponse.response
    }

    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Estrai IP e User Agent per audit logging
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      null
    const userAgent = request.headers.get('user-agent') || null

    // Verifica ruolo admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const adminProfile = profile as { role?: string } | null
    const userRole = adminProfile?.role ?? ''
    if (!adminProfile || userRole !== 'admin') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Valida input
    const body = await request.json()
    const parsedBody = createUserSchema.safeParse(body)

    if (!parsedBody.success) {
      const [firstError] = parsedBody.error.issues
      return NextResponse.json({ error: firstError?.message ?? 'Dati non validi' }, { status: 400 })
    }

    const { email, password, nome, cognome, phone, role, stato } = parsedBody.data

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

    // Crea utente in auth.users
    const { data: authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: {
        nome,
        cognome,
      },
    })

    if (createUserError) {
      // Gestisci errori comuni di Supabase Auth
      const errorMessage = createUserError.message || ''
      const isEmailExistsError =
        errorMessage.toLowerCase().includes('already registered') ||
        errorMessage.toLowerCase().includes('already exists') ||
        errorMessage.toLowerCase().includes('duplicate') ||
        errorMessage.toLowerCase().includes('email address has already been registered') ||
        createUserError.code === 'email_exists'

      if (isEmailExistsError) {
        // L'email esiste già - verifica se l'utente auth ha un profilo
        // Se non ha un profilo, possiamo creare il profilo per l'utente auth esistente
        const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingAuthUsers?.users?.find((u) => u.email === email.trim())

        if (existingUser) {
          // Verifica se esiste già un profilo per questo utente auth
          const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id, user_id, email')
            .eq('user_id', existingUser.id)
            .maybeSingle()

          if (existingProfile) {
            // L'utente auth ha già un profilo - errore
            return NextResponse.json(
              { error: 'Questa email è già registrata nel sistema' },
              { status: 409 },
            )
          }

          // L'utente auth esiste ma non ha un profilo - aggiorna password e crea il profilo
          logger.info('Utente auth esiste senza profilo, aggiorno password e creo il profilo', {
            authUserId: existingUser.id,
            email: email.trim(),
          })

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
          const profileInsertData = {
            user_id: existingUser.id,
            email: email.trim(),
            nome: nome ?? null,
            cognome: cognome ?? null,
            phone: phone ?? null,
            role: role as 'admin' | 'pt' | 'trainer' | 'atleta' | 'athlete',
            stato: stato || 'attivo',
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
            })
            return NextResponse.json(
              { error: profileError.message || 'Errore nella creazione profilo' },
              { status: 500 },
            )
          }

          return NextResponse.json({ user: profileData })
        }

        // Non riusciamo a trovare l'utente auth - errore generico
        return NextResponse.json(
          { error: 'Questa email è già registrata nel sistema' },
          { status: 409 },
        )
      }
      return NextResponse.json(
        { error: createUserError.message || 'Errore nella creazione utente' },
        { status: 500 },
      )
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Utente non creato correttamente' }, { status: 500 })
    }

    // Verifica se il profilo esiste già (potrebbe essere stato creato dal trigger handle_new_user)
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, user_id, email, role, nome, cognome, phone, stato')
      .eq('user_id', authData.user.id)
      .maybeSingle()

    let profileData

    if (existingProfile) {
      // Il profilo esiste già (creato dal trigger) - aggiornalo con i dati forniti
      const profileUpdate: Record<string, unknown> = {
        email: email.trim(),
        nome: nome ?? null,
        cognome: cognome ?? null,
        phone: phone ?? null,
        role: role as 'admin' | 'pt' | 'trainer' | 'atleta' | 'athlete',
        stato: stato || 'attivo',
      }

      type ProfileRow = Tables<'profiles'>
      const existingProfileTyped = existingProfile as ProfileRow

      const { data: updatedProfile, error: updateError } =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabaseAdmin.from('profiles') as any)
          .update(profileUpdate)
          .eq('id', existingProfileTyped.id)
          .select()
          .single()

      if (updateError) {
        // Se l'aggiornamento fallisce, elimina anche l'utente auth per mantenere consistenza
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        return NextResponse.json(
          { error: updateError.message || "Errore nell'aggiornamento profilo" },
          { status: 500 },
        )
      }

      profileData = updatedProfile
    } else {
      // Il profilo non esiste - crealo
      // Crea profilo
      // Nota: id non è incluso perché generato automaticamente dal database
      const profileInsertData = {
        user_id: authData.user.id,
        email: email.trim(),
        nome: nome ?? null,
        cognome: cognome ?? null,
        phone: phone ?? null,
        role: role as 'admin' | 'pt' | 'trainer' | 'atleta' | 'athlete',
        stato: stato || 'attivo',
      }
      // Workaround necessario per inferenza tipo Supabase
      const { data: newProfileData, error: profileError } =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabaseAdmin.from('profiles') as any)
          .insert(profileInsertData as Record<string, unknown>)
          .select()
          .single()

      if (profileError) {
        // Se il profilo fallisce, elimina anche l'utente auth per mantenere consistenza
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        return NextResponse.json(
          { error: profileError.message || 'Errore nella creazione profilo' },
          { status: 500 },
        )
      }

      profileData = newProfileData
    }

    // Audit logging per creazione utente
    await logAuditWithContext(
      AUDIT_EVENTS.CLIENT_INVITE,
      {
        action: 'user_created',
        targetUserId: authData.user.id,
        targetEmail: email,
        targetRole: role,
        createdBy: user.id,
        createdByEmail: user.email,
      },
      ipAddress || undefined,
      userAgent || undefined,
    )

    return NextResponse.json({ user: profileData })
  } catch (error: unknown) {
    logger.error('Errore nella creazione utente', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Errore nella creazione utente' },
      { status: 500 },
    )
  }
}

// PUT - Aggiorna utente (solo admin)
export async function PUT(request: NextRequest) {
  try {
    // Estrai IP e User Agent per audit logging
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      null
    const userAgent = request.headers.get('user-agent') || null

    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Verifica ruolo admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const adminProfile = profile as { role?: string } | null
    const userRole = adminProfile?.role ?? ''
    if (!adminProfile || userRole !== 'admin') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Valida input
    const body = await request.json()
    const { userId, ...updateData } = body

    if (!userId) {
      return NextResponse.json({ error: 'ID utente richiesto' }, { status: 400 })
    }

    const parsedBody = updateUserSchema.safeParse(updateData)

    if (!parsedBody.success) {
      const [firstError] = parsedBody.error.issues
      return NextResponse.json({ error: firstError?.message ?? 'Dati non validi' }, { status: 400 })
    }

    // Recupera profilo esistente
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('user_id, email')
      .eq('id', userId)
      .single()

    if (fetchError || !existingProfile) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
    }

    const existingProfileData = existingProfile as { user_id?: string; email?: string } | null

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

    // Aggiorna profilo
    const profileUpdate: Record<string, unknown> = {}
    if (parsedBody.data.nome !== undefined) profileUpdate.nome = parsedBody.data.nome || null
    if (parsedBody.data.cognome !== undefined)
      profileUpdate.cognome = parsedBody.data.cognome || null
    if (parsedBody.data.phone !== undefined) profileUpdate.phone = parsedBody.data.phone || null
    if (parsedBody.data.role !== undefined) profileUpdate.role = parsedBody.data.role
    if (parsedBody.data.stato !== undefined) profileUpdate.stato = parsedBody.data.stato

    // Workaround necessario per inferenza tipo Supabase
    const { data: updatedProfile, error: profileError } =
      await // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabaseAdmin.from('profiles') as any)
        .update(profileUpdate)
        .eq('id', userId)
        .select()
        .single()

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message || "Errore nell'aggiornamento profilo" },
        { status: 500 },
      )
    }

    // Aggiorna auth.users se email o password sono cambiate
    const authUpdate: Record<string, unknown> = {}
    if (parsedBody.data.email && parsedBody.data.email !== existingProfileData?.email) {
      authUpdate.email = parsedBody.data.email
    }
    if (parsedBody.data.password) {
      authUpdate.password = parsedBody.data.password
    }

    if (Object.keys(authUpdate).length > 0 && existingProfileData?.user_id) {
      const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
        existingProfileData.user_id,
        authUpdate,
      )

      if (updateAuthError) {
        return NextResponse.json(
          { error: updateAuthError.message || "Errore nell'aggiornamento autenticazione" },
          { status: 500 },
        )
      }
    }

    // Audit logging per aggiornamento utente
    await logAuditWithContext(
      AUDIT_EVENTS.PROFILE_UPDATE,
      {
        action: 'user_updated',
        targetUserId: userId,
        updatedBy: user.id,
        updatedByEmail: user.email,
        changes: Object.keys(parsedBody.data),
      },
      ipAddress || undefined,
      userAgent || undefined,
    )

    return NextResponse.json({ user: updatedProfile })
  } catch (error: unknown) {
    logger.error("Errore nell'aggiornamento utente", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore nell'aggiornamento utente" },
      { status: 500 },
    )
  }
}

// DELETE - Elimina utente (solo admin)
export async function DELETE(request: NextRequest) {
  let userId: string | null = null
  let deletedUserEmail: string | null = null
  try {
    // Rate limiting: max 5 richieste/minuto per operazioni critiche (delete user)
    const rateLimitResponse = await rateLimit({ windowMs: 60000, maxRequests: 5 })(request)
    if (rateLimitResponse.response) {
      return rateLimitResponse.response
    }

    // Estrai IP e User Agent per audit logging
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      null
    const userAgent = request.headers.get('user-agent') || null

    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Verifica ruolo admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const adminProfile = profile as { role?: string } | null
    const userRole = adminProfile?.role ?? ''
    if (!adminProfile || userRole !== 'admin') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'ID utente richiesto' }, { status: 400 })
    }

    // Crea client con service role key PRIMA di recuperare il profilo
    // (necessario per bypassare RLS policies)
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

    // Recupera profilo per ottenere user_id usando service role (bypass RLS)
    // Log per debug
    logger.debug('Recupero profilo per eliminazione', { userId, userIdType: typeof userId })

    // Prova prima con id (ID del profilo)
    let { data: userProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('id, user_id, email, nome, cognome')
      .eq('id', userId)
      .maybeSingle()

    // Se non trovato per id, prova con user_id (ID auth.users)
    if (fetchError || !userProfile) {
      logger.debug('Profilo non trovato per id, provo con user_id', {
        userId,
        fetchError: fetchError?.message,
      })

      const { data: userProfileByUserId, error: fetchErrorByUserId } = await supabaseAdmin
        .from('profiles')
        .select('id, user_id, email, nome, cognome')
        .eq('user_id', userId)
        .maybeSingle()

      if (userProfileByUserId && !fetchErrorByUserId) {
        userProfile = userProfileByUserId
        fetchError = null
        // Tipizza esplicitamente per evitare problemi di inferenza TypeScript
        const typedProfile = userProfileByUserId as Pick<
          Tables<'profiles'>,
          'id' | 'user_id' | 'email' | 'nome' | 'cognome'
        >
        logger.debug('Profilo trovato per user_id', {
          profileId: typedProfile.id,
          userId: typedProfile.user_id,
        })
      } else {
        fetchError = fetchErrorByUserId || fetchError
      }
    }

    if (fetchError) {
      logger.error('Errore recupero profilo per eliminazione', fetchError, {
        userId,
        errorCode: fetchError.code,
        errorMessage: fetchError.message,
        errorDetails: fetchError.details,
        errorHint: fetchError.hint,
      })

      return NextResponse.json(
        { error: fetchError.message || 'Errore nel recupero del profilo' },
        { status: 500 },
      )
    }

    if (!userProfile) {
      logger.error('Profilo non trovato', null, {
        userId,
        searchedBy: 'id e user_id',
      })
      return NextResponse.json({ error: `Utente non trovato con ID: ${userId}` }, { status: 404 })
    }

    const userProfileData = userProfile as {
      id: string
      user_id?: string
      email?: string
      nome?: string
      cognome?: string
    }

    // Salva email per audit logging
    deletedUserEmail = userProfileData.email || null

    // Verifica che id sia presente (dovrebbe sempre esserlo, ma TypeScript richiede il check)
    if (!userProfileData.id) {
      logger.error('ID profilo non trovato', null, {
        userId,
        profile: userProfile,
      })
      return NextResponse.json({ error: 'ID profilo non trovato' }, { status: 404 })
    }

    logger.debug('Profilo recuperato', {
      profileId: userProfileData.id,
      userId: userProfileData.user_id,
      email: userProfileData.email,
    })

    // Elimina utente (cascade eliminerà anche il profilo)
    if (!userProfileData.user_id) {
      logger.error('User ID non trovato nel profilo', null, {
        userId,
        profileId: userProfileData.id,
        profile: userProfile,
      })
      return NextResponse.json(
        {
          error: `User ID non trovato nel profilo. Profilo ID: ${userProfileData.id}`,
        },
        { status: 404 },
      )
    }

    // Verifica se l'utente esiste in auth.users prima di tentare l'eliminazione
    const { error: getUserError } = await supabaseAdmin.auth.admin.getUserById(
      userProfileData.user_id,
    )

    if (getUserError && getUserError.message?.includes('not found')) {
      // L'utente non esiste in auth.users - questo è un caso anomalo
      // Eliminiamo il profilo orfano e restituiamo successo
      logger.warn('Utente non trovato in auth.users, elimino solo il profilo orfano', {
        authUserId: userProfileData.user_id,
        profileId: userProfileData.id,
      })

      const { error: profileDeleteError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userProfileData.id)

      if (profileDeleteError) {
        logger.error('Errore eliminazione profilo orfano', profileDeleteError, {
          profileId: userProfileData.id,
        })
        return NextResponse.json(
          {
            error: profileDeleteError.message || "Errore nell'eliminazione del profilo",
          },
          { status: 500 },
        )
      }

      logger.debug('Profilo orfano eliminato con successo (utente auth non esisteva)', {
        profileId: userProfileData.id,
        authUserId: userProfileData.user_id,
      })

      // Audit logging per eliminazione profilo orfano
      await logAuditWithContext(
        AUDIT_EVENTS.CLIENT_REMOVE,
        {
          action: 'user_deleted_orphan_profile',
          targetUserId: userProfileData.user_id || null,
          targetEmail: deletedUserEmail,
          deletedBy: user.id,
          deletedByEmail: user.email,
          note: 'Profilo orfano (utente auth non esisteva)',
        },
        ipAddress || undefined,
        userAgent || undefined,
      )

      return NextResponse.json({ success: true })
    }

    if (getUserError) {
      // Errore diverso da "not found" - logga e fallisci
      logger.error('Errore verifica utente auth prima eliminazione', getUserError, {
        authUserId: userProfileData.user_id,
        profileId: userProfileData.id,
      })
      return NextResponse.json(
        {
          error:
            getUserError.message || "Errore nella verifica dell'utente prima dell'eliminazione",
        },
        { status: 500 },
      )
    }

    // L'utente esiste in auth.users, procedi con l'eliminazione
    // IMPORTANTE: Eliminiamo prima il profilo per evitare problemi con trigger audit
    // che potrebbero causare ricorsione infinita durante DELETE su profiles
    // Poi eliminiamo l'utente da auth.users
    
    // Passo 1: Elimina PRIMA il profilo per evitare problemi con trigger ricorsivi
    // Questo evita che il trigger audit_profiles_trigger causi "stack depth limit exceeded"
    const { error: profileDeleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userProfileData.id)

    if (profileDeleteError) {
      // Errore durante eliminazione del profilo - potrebbe essere un constraint
      logger.error('Errore eliminazione profilo', profileDeleteError, {
        profileId: userProfileData.id,
        authUserId: userProfileData.user_id,
        errorCode: profileDeleteError.code,
        errorMessage: profileDeleteError.message,
        errorDetails: profileDeleteError.details,
        errorHint: profileDeleteError.hint,
      })
      
      // Formatta un messaggio di errore più descrittivo
      let errorMessage = profileDeleteError.message || "Errore nell'eliminazione del profilo"
      
      // Verifica se l'errore è causato da foreign key constraints
      if (
        profileDeleteError.code === '23503' || 
        errorMessage.toLowerCase().includes('violates foreign key constraint') || 
        errorMessage.toLowerCase().includes('constraint') ||
        errorMessage.toLowerCase().includes('foreign key') ||
        errorMessage.toLowerCase().includes('still referenced')
      ) {
        errorMessage = "Impossibile eliminare l'utente: esistono dati collegati nel database (appuntamenti, schede, pagamenti, chat, ecc.) che impediscono l'eliminazione. Elimina prima i dati collegati oppure contatta un amministratore del database."
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

    // Passo 2: Ora elimina l'utente da auth.users (il profilo è già stato eliminato)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      userProfileData.user_id,
    )

    if (deleteError) {
      // Errore durante eliminazione da auth.users
      // Potrebbe essere causato da foreign key constraints sul profilo
      logger.error('Errore eliminazione utente da auth.users', deleteError, {
        userId,
        authUserId: userProfileData.user_id,
        profileId: userProfileData.id,
        errorCode: deleteError.code,
        errorMessage: deleteError.message,
        // errorDetails: deleteError.details, // AuthError non ha proprietà details
        // errorHint: deleteError.hint, // AuthError non ha proprietà hint
      })

      // Passo 2: Fallback - Prova a eliminare almeno il profilo
      // Questo rimuove l'utente dalla lista anche se l'utente auth rimane
      const { error: profileDeleteError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userProfileData.id)

      if (profileDeleteError) {
        // Anche l'eliminazione del profilo fallisce - questo indica constraint del database
        logger.error('Errore eliminazione profilo (fallback)', profileDeleteError, {
          profileId: userProfileData.id,
          originalAuthError: deleteError.message,
          profileErrorCode: profileDeleteError.code,
          profileErrorMessage: profileDeleteError.message,
          // profileErrorDetails: profileDeleteError.details, // Possono non esistere in tutti i tipi di errore
          // profileErrorHint: profileDeleteError.hint, // Possono non esistere in tutti i tipi di errore
        })
        
        // Formatta un messaggio di errore più descrittivo
        let errorMessage = profileDeleteError.message || deleteError.message || "Errore nell'eliminazione utente"
        
        // Verifica se l'errore è causato da foreign key constraints
        if (
          profileDeleteError.code === '23503' || 
          errorMessage.includes('violates foreign key constraint') || 
          errorMessage.includes('constraint') ||
          errorMessage.includes('foreign key')
        ) {
          errorMessage = "Impossibile eliminare l'utente: esistono dati collegati nel database (appuntamenti, schede, pagamenti, chat, ecc.) che impediscono l'eliminazione. Elimina prima i dati collegati oppure contatta un amministratore del database."
        }
        
        return NextResponse.json(
          {
            error: errorMessage,
            // details: profileDeleteError.details || deleteError.details || null, // AuthError non ha proprietà details
            // hint: profileDeleteError.hint || deleteError.hint || null, // AuthError non ha proprietà hint
          },
          { status: 500 },
        )
      }

      // Il profilo è stato eliminato con successo, ma l'utente auth potrebbe ancora esistere
      logger.warn('Profilo eliminato ma utente auth potrebbe ancora esistere', {
        profileId: userProfileData.id,
        authUserId: userProfileData.user_id,
        originalError: deleteError.message,
      })

      // Audit logging per eliminazione parziale (solo profilo)
      await logAuditWithContext(
        AUDIT_EVENTS.CLIENT_REMOVE,
        {
          action: 'user_deleted_partial',
          targetUserId: userProfileData.user_id || null,
          targetEmail: deletedUserEmail,
          deletedBy: user.id,
          deletedByEmail: user.email,
          warning: 'Profilo eliminato ma utente auth potrebbe ancora esistere',
        },
        ipAddress || undefined,
        userAgent || undefined,
      )

      return NextResponse.json({
        success: true,
        warning:
          "L'utente è stato rimosso dalla lista, ma potrebbe ancora esistere in auth.users a causa di constraint del database. Verifica manualmente in Supabase se necessario.",
      })
    }

    // Verifica che il profilo sia stato eliminato (dovrebbe essere eliminato dal CASCADE)
    const { data: remainingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userProfileData.id)
      .maybeSingle()

    if (remainingProfile) {
      // Il profilo esiste ancora - eliminalo manualmente (il CASCADE potrebbe non essere configurato)
      logger.warn('Profilo non eliminato automaticamente dal CASCADE, elimino manualmente', {
        profileId: userProfileData.id,
        authUserId: userProfileData.user_id,
      })

      const { error: profileDeleteError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userProfileData.id)

      if (profileDeleteError) {
        logger.error(
          'Errore eliminazione profilo dopo eliminazione auth.users',
          profileDeleteError,
          {
            profileId: userProfileData.id,
            authUserId: userProfileData.user_id,
          },
        )
        // Non falliamo qui - l'utente auth è stato eliminato, che è l'obiettivo principale
        // Il profilo può essere eliminato manualmente dopo
      }
    }

    logger.debug('Utente eliminato con successo da auth.users e profilo', {
      userId,
      authUserId: userProfileData.user_id,
      profileId: userProfileData.id,
    })

    // Audit logging per eliminazione utente completata
    await logAuditWithContext(
      AUDIT_EVENTS.CLIENT_REMOVE,
      {
        action: 'user_deleted',
        targetUserId: userProfileData.user_id || null,
        targetEmail: deletedUserEmail,
        deletedBy: user.id,
        deletedByEmail: user.email,
      },
      ipAddress || undefined,
      userAgent || undefined,
    )

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorDetails = error instanceof Error ? { stack: error.stack, name: error.name } : {}

    // Estrai informazioni aggiuntive se disponibili
    const supabaseError = error as {
      code?: string
      message?: string
      details?: string
      hint?: string
    } | null
    const errorCode = supabaseError?.code
    const errorDetailsMsg = supabaseError?.details
    const errorHint = supabaseError?.hint

    logger.error("Errore nell'eliminazione utente", error, {
      errorMessage,
      errorCode,
      errorDetails: errorDetailsMsg,
      errorHint,
      errorStack: errorDetails,
      userId,
    })

    // Costruisci messaggio errore più dettagliato
    let finalErrorMessage = errorMessage || "Errore nell'eliminazione utente"

    if (errorCode) {
      finalErrorMessage += ` (Codice: ${errorCode})`
    }

    if (errorHint) {
      finalErrorMessage += `. ${errorHint}`
    }

    return NextResponse.json(
      {
        error: finalErrorMessage,
        errorCode,
        errorDetails: errorDetailsMsg,
      },
      { status: 500 },
    )
  }
}
