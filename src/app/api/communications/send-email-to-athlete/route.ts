import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmailViaResend } from '@/lib/communications/email-resend-client'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:communications:send-email-to-athlete')

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
      .select('id, role')
      .eq('user_id', session.user.id)
      .single()

    const profileRow = profile as { id?: string; role?: string } | null
    const role = profileRow?.role
    const createdByProfileId = profileRow?.id
    const canSend = role && ['admin', 'trainer', 'nutrizionista', 'massaggiatore', 'marketing'].includes(role)
    if (!canSend || !createdByProfileId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    const json = await request.json()
    const { athlete_id, subject, body: textBody, athlete_name } = json

    if (!athlete_id || typeof athlete_id !== 'string' || !athlete_id.trim()) {
      return NextResponse.json({ error: 'athlete_id obbligatorio' }, { status: 400 })
    }
    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return NextResponse.json({ error: 'Oggetto obbligatorio' }, { status: 400 })
    }
    const bodyText = typeof textBody === 'string' ? textBody.trim() : ''
    if (!bodyText) {
      return NextResponse.json({ error: 'Messaggio obbligatorio' }, { status: 400 })
    }

    const { data: athlete } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', athlete_id.trim())
      .single()

    const email = (athlete as { email?: string | null } | null)?.email
    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Email atleta non trovata o non impostata' },
        { status: 400 },
      )
    }

    const html = bodyText
      .split('\n')
      .map((line: string) => `<p>${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
      .join('')

    const result = await sendEmailViaResend(email.trim(), subject.trim(), `<!DOCTYPE html><html><body>${html}</body></html>`)

    if (!result.success) {
      logger.warn('Invio email ad atleta fallito', undefined, { to: email, error: result.error })
      return NextResponse.json(
        { error: result.error || "Errore durante l'invio dell'email" },
        { status: 502 },
      )
    }

    const now = new Date().toISOString()
    const athleteId = athlete_id.trim()

    // Cataloga in communications e communication_recipients per la pagina Comunicazioni
    const { data: newComm, error: insertCommError } = await (
      supabase as import('@supabase/supabase-js').SupabaseClient<import('@/lib/supabase/types').Database>
    )
      .from('communications')
      .insert({
        created_by_profile_id: createdByProfileId,
        title: subject.trim(),
        message: bodyText,
        type: 'email',
        status: 'sent',
        sent_at: now,
        total_recipients: 1,
        total_sent: 1,
        total_delivered: 0,
        total_opened: 0,
        total_failed: 0,
        recipient_filter: { source: 'email_to_athlete', athlete_id: athleteId },
        metadata: {
          to_email: email.trim(),
          athlete_id: athleteId,
          ...(typeof athlete_name === 'string' && athlete_name.trim()
            ? { athlete_name: athlete_name.trim() }
            : {}),
        },
      })
      .select('id')
      .single()

    if (insertCommError) {
      logger.warn('Salvataggio comunicazione fallito (email comunque inviata)', undefined, {
        error: insertCommError.message,
        athlete_id: athleteId,
      })
      return NextResponse.json({ success: true })
    }

    const communicationId = (newComm as { id: string } | null)?.id
    if (communicationId) {
      await (
        supabase as import('@supabase/supabase-js').SupabaseClient<import('@/lib/supabase/types').Database>
      )
        .from('communication_recipients')
        .insert({
        communication_id: communicationId,
        recipient_profile_id: athleteId,
        recipient_type: 'email',
        status: 'sent',
        sent_at: now,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Errore API send-email-to-athlete', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 },
    )
  }
}
