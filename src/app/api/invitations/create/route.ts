import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { resolveProfileByIdentifier } from '@/lib/utils/resolve-profile-by-identifier'
import { createLogger } from '@/lib/logger'
import type { Tables } from '@/types/supabase'

const logger = createLogger('api:invitations:create')

const ALLOWED_ROLES = ['admin', 'trainer']

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * POST /api/invitations/create
 * Crea un invito atleta lato server. Autorizzazione con client cookie; INSERT con
 * createAdminClient per evitare blocchi RLS quando il JWT non viene inoltrato a Postgres.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const profile = await resolveProfileByIdentifier(supabase, user.id, 'id, role')
    const profileId = profile?.id as string | undefined
    const role = profile?.role as string | undefined
    if (!profileId || !role || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Non autorizzato a creare inviti' }, { status: 403 })
    }

    const body = await request.json()
    const nome_atleta = typeof body.nome_atleta === 'string' ? body.nome_atleta.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const giorni_validita = typeof body.giorni_validita === 'number' ? body.giorni_validita : 7

    if (!nome_atleta) {
      return NextResponse.json({ error: 'Nome atleta obbligatorio' }, { status: 400 })
    }
    if (!email) {
      return NextResponse.json(
        { error: "Email obbligatoria per collegare l'atleta al trainer dopo la registrazione" },
        { status: 400 },
      )
    }

    const inviteCode = generateInviteCode()
    const expiresAt = new Date(Date.now() + giorni_validita * 24 * 60 * 60 * 1000).toISOString()

    const insertData = {
      codice: inviteCode,
      pt_id: profileId,
      invited_by: profileId,
      nome_atleta,
      email,
      token: inviteCode,
      stato: 'inviato',
      status: 'pending',
      expires_at: expiresAt,
    }

    const adminClient = createAdminClient()
    const { data: invitation, error: insertError } = await adminClient
      .from('inviti_atleti')
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      logger.error('Errore INSERT inviti_atleti', insertError, { profileId, nome_atleta })
      return NextResponse.json(
        { error: insertError.message || "Errore nella creazione dell'invito" },
        { status: 502 },
      )
    }

    return NextResponse.json(invitation as Tables<'inviti_atleti'>)
  } catch (error) {
    logger.error('Errore API create invitation', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
