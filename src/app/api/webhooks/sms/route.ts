// ============================================================
// FASE 7: Webhook SMS Provider (Twilio)
// ============================================================
// Gestisce webhook da Twilio per delivery status e eventi
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createLogger } from '@/lib/logger'
import type { Database } from '@/types/supabase'
import { updateRecipientStatus, updateCommunicationStats } from '@/lib/communications/service'

const logger = createLogger('api:webhooks:sms')

function getSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
    },
  )
}

/**
 * POST /api/webhooks/sms
 *
 * Webhook handler per eventi Twilio (delivery status, etc.)
 *
 * Query params:
 * - recipient_id: ID del recipient (se fornito nel statusCallback)
 *
 * Body (form-urlencoded da Twilio):
 * - MessageSid: ID del messaggio Twilio
 * - MessageStatus: Status del messaggio (queued, sent, delivered, failed, undelivered)
 * - To: Numero di telefono destinatario
 * - From: Numero di telefono mittente
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica signature webhook (opzionale ma consigliato)
    const signature = request.headers.get('x-twilio-signature')
    const webhookSecret = process.env.TWILIO_WEBHOOK_SECRET

    if (webhookSecret && signature) {
      // TODO: Implementare verifica signature Twilio
      // }
    }

    // Twilio invia dati come form-urlencoded
    const formData = await request.formData()
    const messageSid = formData.get('MessageSid') as string
    const messageStatus = formData.get('MessageStatus') as string
    // Nota: to potrebbe essere usato in futuro per logging/tracking
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const to = formData.get('To') as string
    const recipientId = request.nextUrl.searchParams.get('recipient_id')

    if (!messageSid) {
      logger.warn('Webhook SMS: missing MessageSid')
      return new NextResponse('Missing MessageSid', { status: 400 })
    }

    const supabase = getSupabaseClient()

    // Trova recipient
    let recipient = null

    if (recipientId) {
      // Se recipient_id è fornito, usalo direttamente
      const { data, error } = await supabase
        .from('communication_recipients')
        .select('*, communications(id)')
        .eq('id', recipientId)
        .eq('recipient_type', 'sms')
        .single()

      if (!error && data) {
        recipient = data
      }
    }

    // Se non trovato tramite recipient_id, cerca tramite metadata.message_id
    if (!recipient) {
      const { data: recipients, error: recipientsError } = await supabase
        .from('communication_recipients')
        .select('*, communications(id)')
        .eq('recipient_type', 'sms')
        .eq('status', 'sent')
        .not('metadata', 'is', null)

      if (!recipientsError && recipients) {
        type RecipientData = {
          id: string
          metadata?: Record<string, unknown> | null
          [key: string]: unknown
        }
        const recipientsData = (recipients as RecipientData[]) || []
        recipient = recipientsData.find((r: RecipientData) => {
          const metadata = r.metadata as Record<string, unknown> | null
          return metadata?.message_id === messageSid
        })
      }
    }

    if (!recipient) {
      logger.warn('Webhook SMS: recipient not found', undefined, { messageSid })
      // Non è un errore critico, potrebbe essere un SMS non tracciato
      return new NextResponse('Recipient not found', { status: 200 })
    }

    type RecipientData = {
      id: string
      sent_at?: string | null
      delivered_at?: string | null
      failed_at?: string | null
      error_message?: string | null
      metadata?: Record<string, unknown> | null
      communications?: { id: string } | null
      [key: string]: unknown
    }

    type CommunicationRef = {
      id: string
    }

    const recipientData = recipient as RecipientData

    // Gestisci status
    switch (messageStatus) {
      case 'queued':
        // Messaggio in coda (già gestito durante l'invio)
        break

      case 'sent':
        // Messaggio inviato (già gestito durante l'invio, ma possiamo confermare)
        if (!recipientData.sent_at) {
          await updateRecipientStatus(recipientData.id, 'sent', {
            sent_at: new Date().toISOString(),
            metadata: {
              ...(recipientData.metadata as Record<string, unknown>),
              message_id: messageSid,
            },
          })
        }
        break

      case 'delivered':
        await updateRecipientStatus(recipientData.id, 'delivered', {
          delivered_at: new Date().toISOString(),
        })

        // Aggiorna statistiche comunicazione
        if (recipientData.communications && !Array.isArray(recipientData.communications)) {
          const commRef = recipientData.communications as CommunicationRef
          await updateCommunicationStats(commRef.id)
        }
        break

      case 'failed':
      case 'undelivered':
        await updateRecipientStatus(recipientData.id, 'failed', {
          failed_at: new Date().toISOString(),
          error_message: `SMS ${messageStatus}`,
        })

        // Aggiorna statistiche comunicazione
        if (recipientData.communications && !Array.isArray(recipientData.communications)) {
          const commRef = recipientData.communications as CommunicationRef
          await updateCommunicationStats(commRef.id)
        }
        break

      default:
        logger.warn('Unhandled SMS status', undefined, { messageStatus, messageSid })
    }

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    logger.error('Error processing SMS webhook', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
