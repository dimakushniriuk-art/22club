import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import { buildLegacyOrgWriteContext, requireCurrentOrgId } from '@/lib/organizations/current-org'
import type { Tables } from '@/types/supabase'
import type { Database } from '@/lib/supabase/types'

const logger = createLogger('api:athletes:create')

/**
 * POST /api/athletes/create
 * Crea un nuovo atleta
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
    if (!body.nome || !body.cognome || !body.email || !body.password) {
      return NextResponse.json(
        { error: 'Nome, cognome, email e password sono richiesti' },
        { status: 400 },
      )
    }

    // Ottieni il profilo dello staff corrente
    type ProfileRow = Pick<Tables<'profiles'>, 'id' | 'org_id' | 'role'>
    const { data: profile, error: staffProfileError } = await supabase
      .from('profiles')
      .select('id, org_id, role')
      .eq('user_id', session.user.id)
      .single()

    if (staffProfileError || !profile) {
      logger.warn('Profilo non trovato', staffProfileError, { userId: session.user.id })
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }
    const profileTyped = profile as ProfileRow

    if (profileTyped.role !== 'admin' && profileTyped.role !== 'trainer') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    let trainerOrgId: string | null = null
    if (profileTyped.role === 'trainer') {
      try {
        trainerOrgId = requireCurrentOrgId(
          profileTyped.org_id,
          'Organizzazione non disponibile per assegnazione trainer',
        )
      } catch {
        return NextResponse.json(
          { error: 'Organizzazione non disponibile per assegnazione trainer' },
          { status: 400 },
        )
      }
    }

    // Usa admin client per operazioni auth.admin
    const adminClient = createAdminClient()

    // Verifica che l'email non sia già registrata
    // Nota: getUserByEmail non esiste, usiamo listUsers con filtro
    const {
      data: { users },
    } = await adminClient.auth.admin.listUsers()
    const existingUser = users.find((u) => u.email === body.email)

    if (existingUser) {
      return NextResponse.json(
        { error: 'Questa email è già registrata nel sistema' },
        { status: 409 },
      )
    }

    // Crea l'utente in auth.users
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true, // Auto-conferma email
    })

    if (authError || !authData.user) {
      logger.error('Errore durante la creazione utente auth', authError)
      return NextResponse.json(
        { error: authError?.message || 'Errore durante la creazione utente' },
        { status: 500 },
      )
    }

    // Il trigger handle_new_user crea già il profilo (con nome/cognome vuoti) → aggiorniamo con UPDATE esplicito
    // così nome e cognome vengono sempre salvati (l'upsert a volte non aggiornava la riga del trigger)
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('user_id', authData.user.id)
      .single()

    const nome = body.nome.trim()
    const cognome = body.cognome.trim()
    type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
    const profileUpdate: ProfileUpdate = {
      nome,
      cognome,
      first_name: nome,
      last_name: cognome,
      email: body.email.trim(),
      phone: body.phone?.trim() || null,
      role: 'athlete',
      org_id: profileTyped.org_id ?? null,
      stato: body.stato || 'attivo',
      data_iscrizione: body.data_iscrizione || new Date().toISOString(),
      note: body.note?.trim() || null,
    }

    let athleteProfile: { id: string } | null = null

    if (existingProfile?.id) {
      const { data: updated, error: updateErr } = await adminClient
        .from('profiles')
        .update(profileUpdate as Database['public']['Tables']['profiles']['Update'])
        .eq('id', existingProfile.id)
        .select()
        .single()
      if (updateErr) {
        await adminClient.auth.admin.deleteUser(authData.user.id)
        logger.error('Errore aggiornamento profilo atleta (nome/cognome)', updateErr)
        return NextResponse.json(
          { error: updateErr.message || 'Errore durante la creazione del profilo' },
          { status: 500 },
        )
      }
      athleteProfile = updated
    } else {
      type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
      const { data: inserted, error: insertErr } = await adminClient
        .from('profiles')
        .insert({
          ...profileUpdate,
          user_id: authData.user.id,
        } as ProfileInsert)
        .select()
        .single()
      if (insertErr || !inserted) {
        await adminClient.auth.admin.deleteUser(authData.user.id)
        logger.error('Errore creazione profilo atleta (fallback)', insertErr)
        return NextResponse.json(
          { error: insertErr?.message || 'Errore durante la creazione del profilo' },
          { status: 500 },
        )
      }
      athleteProfile = inserted
    }

    // Type assertion per athleteProfile
    type AthleteProfileRow = Pick<Tables<'profiles'>, 'id'>
    const athleteProfileTyped = athleteProfile as AthleteProfileRow | null

    // Se lo staff è un trainer, crea l'assegnazione in athlete_trainer_assignments (bypassa RLS)
    if (profileTyped.role === 'trainer' && athleteProfileTyped) {
      const orgWriteContext = buildLegacyOrgWriteContext({
        profile: { org_id: trainerOrgId },
        message: 'Organizzazione non disponibile per assegnazione trainer',
      })
      const { error: relationError } = await adminClient
        .from('athlete_trainer_assignments')
        .insert({
          ...orgWriteContext,
          athlete_id: athleteProfileTyped.id,
          trainer_id: profileTyped.id,
          status: 'active',
          activated_at: new Date().toISOString(),
          created_by_profile_id: profileTyped.id,
        })

      if (relationError) {
        logger.warn('Errore creazione assegnazione trainer', relationError, {
          trainerId: profileTyped.id,
          athleteId: athleteProfileTyped.id,
        })
      }
    }

    if (!athleteProfileTyped) {
      return NextResponse.json(
        { error: 'Errore durante la creazione del profilo' },
        { status: 500 },
      )
    }
    type AthleteProfileResponse = Pick<Tables<'profiles'>, 'id' | 'nome' | 'cognome' | 'email'>
    const athleteProfileResponse = athleteProfile as AthleteProfileResponse
    return NextResponse.json(
      {
        data: {
          id: athleteProfileResponse.id,
          user_id: authData.user.id,
          nome: athleteProfileResponse.nome,
          cognome: athleteProfileResponse.cognome,
          email: athleteProfileResponse.email,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    logger.error("Errore durante la creazione dell'atleta", error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
