// API route per inviare una comunicazione
// Gestisce: creazione recipients + invio effettivo

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api/communications/send')
import { ensureRecipientsCreated } from '@/lib/communications/scheduler'
import { sendCommunicationPush } from '@/lib/communications/push'
import { sendCommunicationEmail } from '@/lib/communications/email'
import { sendCommunicationSMS } from '@/lib/communications/sms'

// Timeout per invio comunicazione (dinamico basato su numero recipients)
// Formula: 1 minuto per 100 recipients, minimo 2 minuti, massimo 10 minuti
function calculateSendTimeout(totalRecipients: number): number {
  const baseTimeout = Math.max(totalRecipients / 100, 2) * 60 * 1000 // 1 min per 100, min 2 min
  return Math.min(baseTimeout, 10 * 60 * 1000) // Max 10 minuti
}

const DEFAULT_SEND_TIMEOUT_MS = 5 * 60 * 1000 // Fallback se non si riesce a determinare

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  let communicationId: string | null = null

  try {
    // Verifica autenticazione
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verifica che sia staff
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const profileData = profile as { role?: string } | null
    if (
      profileError ||
      !profileData ||
      !['admin', 'pt', 'trainer', 'staff'].includes(profileData.role || '')
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Leggi communication ID dal body
    const body = await request.json()
    const bodyCommunicationId = body.communicationId

    if (!bodyCommunicationId || typeof bodyCommunicationId !== 'string') {
      return NextResponse.json({ error: 'communicationId is required' }, { status: 400 })
    }

    communicationId = bodyCommunicationId

    // Ottieni la comunicazione
    const { data: communication, error: commError } = await supabase
      .from('communications')
      .select('*')
      .eq('id', communicationId)
      .single()

    if (commError || !communication) {
      return NextResponse.json({ error: 'Communication not found' }, { status: 404 })
    }

    type CommunicationData = {
      id: string
      status: string
      type: string
      recipient_filter?: unknown
      total_recipients?: number
      [key: string]: unknown
    }

    const communicationData = communication as CommunicationData

    // Verifica che sia in stato draft, scheduled, sending o failed (per retry)
    // Se è in stato failed, resettalo a draft prima di procedere
    if (!['draft', 'scheduled', 'sending', 'failed'].includes(communicationData.status)) {
      return NextResponse.json(
        { error: 'Communication is not in draft, scheduled, sending, or failed status' },
        { status: 400 },
      )
    }

    // Se è in stato failed, resettalo a draft per permettere il retry
    if (communicationData.status === 'failed') {
      // Workaround necessario per inferenza tipo Supabase
      await // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('communications') as any).update({ status: 'draft' }).eq('id', communicationId)
    }

    // Step 1: Assicura che i recipients siano stati creati
    await ensureRecipientsCreated(communicationId, {
      type: communicationData.type,
      recipient_filter: communicationData.recipient_filter,
    })

    // Verifica che i recipients siano stati creati
    const { data: recipientsCheck, error: recipientsCheckError } = await supabase
      .from('communication_recipients')
      .select('id')
      .eq('communication_id', communicationId)
      .limit(1)

    if (recipientsCheckError) {
      return NextResponse.json(
        { error: `Error checking recipients: ${recipientsCheckError.message}` },
        { status: 500 },
      )
    }

    if (!recipientsCheck || recipientsCheck.length === 0) {
      // Aggiorna status a failed con messaggio chiaro
      // Workaround necessario per inferenza tipo Supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('communications') as any)
        .update({
          status: 'failed',
          metadata: {
            error:
              'Nessun destinatario valido trovato. Verifica che ci siano utenti che corrispondono ai criteri selezionati.',
            failed_at: new Date().toISOString(),
          } as Record<string, unknown>,
        } as Record<string, unknown>)
        .eq('id', communicationId)

      return NextResponse.json(
        {
          success: false,
          sent: 0,
          failed: 0,
          total: 0,
          error:
            'Nessun destinatario valido trovato. Verifica che ci siano utenti che corrispondono ai criteri selezionati.',
          message: 'Nessun destinatario valido trovato',
        },
        { status: 400 },
      )
    }

    // Step 2: Invia la comunicazione in base al tipo (con timeout)
    let result: {
      success: boolean
      sent: number
      failed: number
      total: number
      errors?: string[]
      error?: string
    } = {
      success: false,
      sent: 0,
      failed: 0,
      total: 0,
    }

    // Calcola timeout dinamico basato su numero recipients
    // Usa total_recipients dalla comunicazione o conta i recipients creati
    const recipientsCount = communicationData.total_recipients || 0
    const sendTimeoutMs =
      recipientsCount > 0 ? calculateSendTimeout(recipientsCount) : DEFAULT_SEND_TIMEOUT_MS

    // Timeout wrapper per evitare che l'invio si blocchi
    const sendWithTimeout = async () => {
      if (!communicationId) {
        throw new Error('communicationId is required')
      }

      switch (communicationData.type) {
        case 'push':
          return await sendCommunicationPush(communicationId)
        case 'email':
          return await sendCommunicationEmail(communicationId)
        case 'sms':
          return await sendCommunicationSMS(communicationId)
        case 'all':
          // Invia tutti i tipi
          const pushResult = await sendCommunicationPush(communicationId)
          const emailResult = await sendCommunicationEmail(communicationId)
          const smsResult = await sendCommunicationSMS(communicationId)

          return {
            success: pushResult.success || emailResult.success || smsResult.success,
            sent: (pushResult.sent || 0) + (emailResult.sent || 0) + (smsResult.sent || 0),
            failed: (pushResult.failed || 0) + (emailResult.failed || 0) + (smsResult.failed || 0),
            total: (pushResult.total || 0) + (emailResult.total || 0) + (smsResult.total || 0),
            errors: [
              ...(Array.isArray(pushResult.errors) ? pushResult.errors : []),
              ...(Array.isArray(emailResult.errors) ? emailResult.errors : []),
              ...(Array.isArray(smsResult.errors) ? smsResult.errors : []),
            ],
          }
        default:
          throw new Error(`Invalid communication type: ${communicationData.type}`)
      }
    }

    try {
      // Race tra invio e timeout
      result = await Promise.race([
        sendWithTimeout(),
        new Promise<typeof result>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  `Send timeout: operation exceeded ${Math.round(sendTimeoutMs / 60000)} minutes`,
                ),
              ),
            sendTimeoutMs,
          ),
        ),
      ])
    } catch (timeoutError) {
      // Se timeout, aggiorna status a failed
      if (communicationId) {
        // Workaround necessario per inferenza tipo Supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('communications') as any)
          .update({
            status: 'failed',
            metadata: {
              error: timeoutError instanceof Error ? timeoutError.message : 'Timeout error',
              failed_at: new Date().toISOString(),
            } as Record<string, unknown>,
          } as Record<string, unknown>)
          .eq('id', communicationId)
      }

      return NextResponse.json(
        {
          success: false,
          sent: 0,
          failed: 0,
          total: 0,
          error: timeoutError instanceof Error ? timeoutError.message : 'Timeout error',
          message: 'Invio interrotto per timeout',
        },
        { status: 408 }, // Request Timeout
      )
    }

    // Se l'invio è fallito completamente, aggiorna status a failed
    if (!result.success && result.total === result.failed && communicationId) {
      // Workaround necessario per inferenza tipo Supabase
      await // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('communications') as any)
        .update({
          status: 'failed',
          metadata: {
            error: result.error || 'All recipients failed',
            errors: result.errors,
            failed_at: new Date().toISOString(),
          } as Record<string, unknown>,
        } as Record<string, unknown>)
        .eq('id', communicationId)
    }

    return NextResponse.json({
      success: result.success,
      sent: result.sent,
      failed: result.failed,
      total: result.total,
      errors: result.errors,
      error: result.error,
      message: result.success
        ? `Communication sent: ${result.sent}/${result.total} recipients`
        : result.error || `Invio fallito: ${result.failed}/${result.total} destinatari falliti`,
    })
  } catch (error) {
    logger.error('Error sending communication', error)

    // Aggiorna status a failed in caso di errore
    if (communicationId) {
      try {
        // Workaround necessario per inferenza tipo Supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('communications') as any)
          .update({
            status: 'failed',
            metadata: {
              error: error instanceof Error ? error.message : 'Unknown error',
              failed_at: new Date().toISOString(),
            } as Record<string, unknown>,
          } as Record<string, unknown>)
          .eq('id', communicationId)
      } catch (updateError) {
        logger.error('Error updating communication status to failed', updateError, {
          communicationId,
        })
      }
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        sent: 0,
        failed: 0,
        total: 0,
        message: "Errore durante l'invio della comunicazione",
      },
      { status: 500 },
    )
  }
}
