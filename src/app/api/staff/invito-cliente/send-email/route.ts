import { NextRequest, NextResponse } from 'next/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { createClient } from '@/lib/supabase/server'
import { resolveProfileByIdentifier } from '@/lib/utils/resolve-profile-by-identifier'
import { sendEmailViaResend } from '@/lib/communications/email-resend-client'
import { buildInvitoClienteEmailHtml } from '@/lib/staff/invito-cliente-email-html'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:staff:invito-cliente:send-email')

const ALLOWED_STAFF_ROLES = new Set(['massaggiatore', 'nutrizionista', 'trainer', 'admin'])
const EMAIL_SUBJECT_PREFIX = '22Club — '

function baseUrlFromRequest(request: NextRequest): string {
  const fromHeader = request.headers.get('origin')?.trim()
  if (fromHeader) return fromHeader.replace(/\/$/, '')
  const nu = request.nextUrl
  if (nu?.origin) return nu.origin.replace(/\/$/, '')
  const env = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (env) return env.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`
  return 'http://localhost:3000'
}

function buildInvitoPaths(base: string, invitoId: string) {
  const homeQsAccetta = `/home?invito_cliente=${encodeURIComponent(invitoId)}&azione=accetta`
  const homeQsRifiuta = `/home?invito_cliente=${encodeURIComponent(invitoId)}&azione=rifiuta`
  const acceptDirect = `${base}${homeQsAccetta}`
  const declineDirect = `${base}${homeQsRifiuta}`
  const encAcc = encodeURIComponent(homeQsAccetta)
  const encRif = encodeURIComponent(homeQsRifiuta)
  const acceptViaLogin = `${base}/login?redirectedFrom=${encAcc}`
  const declineViaLogin = `${base}/login?redirectedFrom=${encRif}`
  const homeOnly = `${base}/home`
  return { acceptDirect, declineDirect, acceptViaLogin, declineViaLogin, homeOnly }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const profile = await resolveProfileByIdentifier(supabase, user.id, 'id, role, nome, cognome')
    const role = (profile?.role as string | undefined)?.toLowerCase()
    const staffProfileId = profile?.id as string | undefined
    if (!staffProfileId || !role || !ALLOWED_STAFF_ROLES.has(role)) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    const body = (await request.json()) as { invito_id?: unknown }
    const invitoId = typeof body.invito_id === 'string' ? body.invito_id.trim() : ''
    if (!invitoId) {
      return NextResponse.json({ error: 'invito_id obbligatorio' }, { status: 400 })
    }

    const { data: invRow, error: invErr } = await supabase
      .from('inviti_cliente')
      .select('id, staff_id, atleta_id, stato')
      .eq('id', invitoId)
      .maybeSingle()

    if (invErr || !invRow) {
      logger.warn('Invito non trovato o accesso negato', undefined, { invErr, invitoId })
      return NextResponse.json({ error: 'Invito non trovato' }, { status: 404 })
    }

    if (invRow.staff_id !== staffProfileId && role !== 'admin') {
      return NextResponse.json({ error: 'Non autorizzato su questo invito' }, { status: 403 })
    }

    if (invRow.stato !== 'in_attesa') {
      return NextResponse.json(
        { error: "L'invito non è più in attesa: non è possibile inviare l'email." },
        { status: 409 },
      )
    }

    const { data: atleta, error: atletaErr } = await supabase
      .from('profiles')
      .select('email, nome, cognome')
      .eq('id', invRow.atleta_id)
      .maybeSingle()

    if (atletaErr || !atleta?.email?.trim()) {
      logger.warn('Email atleta mancante', undefined, { atletaErr, atleta_id: invRow.atleta_id })
      return NextResponse.json({ error: 'Email del cliente non disponibile' }, { status: 400 })
    }

    const base = baseUrlFromRequest(request)
    const { acceptDirect, declineDirect, acceptViaLogin, declineViaLogin, homeOnly } =
      buildInvitoPaths(base, invitoId)

    const staffNome =
      [profile?.nome, profile?.cognome].filter(Boolean).join(' ').trim() || 'Il tuo professionista'
    const atletaNome = [atleta.nome, atleta.cognome].filter(Boolean).join(' ').trim() || 'Cliente'

    const html = buildInvitoClienteEmailHtml({
      atletaNome,
      staffNome,
      acceptUrlDirect: acceptDirect,
      declineUrlDirect: declineDirect,
      acceptUrlViaLogin: acceptViaLogin,
      declineUrlViaLogin: declineViaLogin,
      homeUrl: homeOnly,
    })

    const subject = `${EMAIL_SUBJECT_PREFIX}${atletaNome} — invito da ${staffNome}`
    const send = await sendEmailViaResend(atleta.email.trim(), subject, html)

    if (!send.success) {
      logger.warn('Resend fallito', undefined, { error: send.error })
      return NextResponse.json(
        { error: send.error || 'Errore invio email' },
        { status: send.error?.includes('RESEND') ? 503 : 502 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    logger.error('Errore API invito-cliente send-email', e)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
