import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import type { Tables } from '@/types/supabase'
import type { Database } from '@/lib/supabase/types'
import { z } from 'zod'

const logger = createLogger('api:admin:users:marketing')

const createMarketingUserSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'Password almeno 6 caratteri'),
  nome: z.string().optional(),
  cognome: z.string().optional(),
  org_id: z.string().optional(),
})

/**
 * POST /api/admin/users/marketing
 * Crea un utente con ruolo marketing (solo admin).
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

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
      return NextResponse.json({ error: 'Solo admin può creare utenti marketing' }, { status: 403 })
    }

    const body = await request.json()
    const validated = createMarketingUserSchema.parse(body)
    const orgId = validated.org_id ?? profileTyped.org_id ?? null

    const adminClient = createAdminClient()

    const {
      data: { users },
    } = await adminClient.auth.admin.listUsers()
    const existingUser = users.find((u) => u.email === validated.email)
    if (existingUser) {
      return NextResponse.json({ error: 'Email già registrata' }, { status: 409 })
    }

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: true,
      user_metadata: {
        nome: validated.nome ?? '',
        cognome: validated.cognome ?? '',
      },
    })

    if (authError || !authData.user) {
      logger.error('Creazione auth user marketing', authError)
      return NextResponse.json(
        { error: authError?.message ?? 'Errore creazione utente' },
        { status: 500 },
      )
    }

    type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
    const profileData: ProfileInsert = {
      user_id: authData.user.id,
      email: validated.email,
      nome: validated.nome ?? null,
      cognome: validated.cognome ?? null,
      role: 'marketing',
      stato: 'attivo',
      org_id: orgId,
    }

    const { data: createdProfile, error: profileInsertError } = await adminClient
      .from('profiles')
      .insert(profileData)
      .select('id')
      .single()

    if (profileInsertError || !createdProfile) {
      await adminClient.auth.admin.deleteUser(authData.user.id)
      logger.error('Creazione profilo marketing', profileInsertError)
      return NextResponse.json(
        { error: profileInsertError?.message ?? 'Errore creazione profilo' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      user_id: authData.user.id,
      profile_id: createdProfile.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dati non validi', details: error.issues }, { status: 400 })
    }
    logger.error('POST /api/admin/users/marketing', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
