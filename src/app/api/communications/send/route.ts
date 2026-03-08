import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ensureRecipientsCreated } from '@/lib/communications/scheduler'
import { sendCommunicationEmail } from '@/lib/communications/email'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:communications:send')

/**
 * POST /api/communications/send
 * Body: { communicationId: string }
 * Crea i recipients se mancanti e invia la comunicazione email.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ success: false, error: 'Non autenticato' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', session.user.id)
      .maybeSingle()

    const profileRow = profile as { id?: string; role?: string } | null
    const role = profileRow?.role
    const canSend = role && ['admin', 'trainer', 'nutrizionista', 'massaggiatore', 'marketing'].includes(role)
    if (!canSend) {
      return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 403 })
    }

    let body: { communicationId?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ success: false, error: 'Body JSON non valido' }, { status: 400 })
    }

    const communicationId = typeof body.communicationId === 'string' ? body.communicationId.trim() : ''
    if (!communicationId) {
      return NextResponse.json({ success: false, error: 'communicationId obbligatorio' }, { status: 400 })
    }

    const { data: communication, error: commError } = await supabase
      .from('communications')
      .select('id, type, recipient_filter, status, created_by_profile_id')
      .eq('id', communicationId)
      .single()

    if (commError || !communication) {
      return NextResponse.json(
        { success: false, error: commError?.message || 'Comunicazione non trovata' },
        { status: 404 },
      )
    }

    const comm = communication as { type: string; recipient_filter: unknown }
    if (comm.type !== 'email' && comm.type !== 'all') {
      return NextResponse.json(
        { success: false, error: 'Tipo comunicazione non supportato per l\'invio' },
        { status: 400 },
      )
    }

    await ensureRecipientsCreated(communicationId, {
      type: comm.type,
      recipient_filter: comm.recipient_filter,
      created_by_profile_id: (communication as { created_by_profile_id?: string }).created_by_profile_id,
    })

    const result = await sendCommunicationEmail(communicationId)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Invio fallito',
          message: result.errors?.join(' ') || result.error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      sent: result.sent,
      failed: result.failed,
      total: result.total,
      message: result.total === 0 ? 'Nessun destinatario' : `Inviate ${result.sent} email`,
    })
  } catch (err) {
    logger.error('Errore POST /api/communications/send', err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Errore interno',
      },
      { status: 500 },
    )
  }
}
