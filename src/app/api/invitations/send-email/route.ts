import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendInvitationEmail } from '@/lib/invitations/send-invitation-email'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:invitations:send-email')

const ALLOWED_ROLES = ['admin', 'trainer']

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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    const role = (profile as { role?: string } | null)?.role
    if (!role || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    const body = await request.json()
    const { email, nomeAtleta, codiceInvito, registrationLink, expiresAt } = body
    const registrationLinkStr =
      typeof registrationLink === 'string' && registrationLink.trim() ? registrationLink.trim() : ''

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: "Email obbligatoria per l'invio" }, { status: 400 })
    }
    if (!nomeAtleta || typeof nomeAtleta !== 'string' || !nomeAtleta.trim()) {
      return NextResponse.json({ error: 'Nome atleta obbligatorio' }, { status: 400 })
    }
    if (!codiceInvito || typeof codiceInvito !== 'string' || !codiceInvito.trim()) {
      return NextResponse.json({ error: 'Codice invito obbligatorio' }, { status: 400 })
    }

    const baseUrl =
      request.nextUrl?.origin ||
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    const linkToRegistrati = baseUrl
      ? `${baseUrl.replace(/\/$/, '')}/registrati?codice=${encodeURIComponent(codiceInvito.trim())}`
      : registrationLinkStr

    if (!linkToRegistrati) {
      return NextResponse.json(
        { error: 'Impossibile costruire il link di registrazione (baseUrl mancante)' },
        { status: 400 },
      )
    }

    const result = await sendInvitationEmail({
      email: email.trim(),
      nomeAtleta: nomeAtleta.trim(),
      codiceInvito: codiceInvito.trim(),
      registrationLink: linkToRegistrati,
      expiresAt: typeof expiresAt === 'string' ? expiresAt : null,
    })

    if (!result.success) {
      logger.warn('Invio email invito fallito', undefined, {
        email,
        error: result.error,
      })
      return NextResponse.json(
        { error: result.error || "Errore durante l'invio dell'email" },
        { status: 502 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Errore API send invitation email', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
