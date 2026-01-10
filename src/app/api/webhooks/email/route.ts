// ============================================================
// FASE 7: Webhook Email Provider (Resend)
// ============================================================
// Gestisce webhook da Resend per delivery status e eventi
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createLogger } from '@/lib/logger'
import type { Database } from '@/types/supabase'
import { updateRecipientStatus, updateCommunicationStats } from '@/lib/communications/service'

const logger = createLogger('api:webhooks:email')

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
 * POST /api/webhooks/email
 *
 * Webhook handler per eventi Resend (delivery, bounce, etc.)
 *
 * Eventi supportati:
 * - email.sent: Email inviata con successo
 * - email.delivered: Email consegnata
 * - email.delivery_delayed: Consegna ritardata
 * - email.complained: Segnalata come spam
 * - email.bounced: Rimbalzata
 * - email.opened: Aperta (alternativo al pixel tracking)
 * - email.clicked: Link cliccato
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica signature webhook (opzionale ma consigliato)
    const signature = request.headers.get('resend-signature')
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET

    if (webhookSecret && signature) {
      // TODO: Implementare verifica signature
      // }
    }

    const body = await request.json()

    // Resend webhook format
    const eventType = body.type // 'email.sent', 'email.delivered', etc.
    const emailId = body.data?.email_id || body.email_id
    // Nota: recipientEmail potrebbe essere usato in futuro per logging/tracking
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const recipientEmail = body.data?.to || body.to

    if (!emailId) {
      logger.warn('Webhook email: missing email_id')
      return new NextResponse('Missing email_id', { status: 400 })
    }

    const supabase = getSupabaseClient()

    // Trova recipient tramite metadata.email_id
    const { data: recipients, error: recipientsError } = await supabase
      .from('communication_recipients')
      .select('*, communications(id)')
      .eq('recipient_type', 'email')
      .eq('status', 'sent') // Solo quelli già inviati
      .not('metadata', 'is', null)

    if (recipientsError) {
      logger.error('Error finding recipient', recipientsError)
      return new NextResponse('Database error', { status: 500 })
    }

    type RecipientData = {
      id: string
      sent_at?: string | null
      delivered_at?: string | null
      opened_at?: string | null
      failed_at?: string | null
      error_message?: string | null
      status?: string
      metadata?: Record<string, unknown> | null
      communications?: { id: string } | null
      [key: string]: unknown
    }

    type CommunicationRef = {
      id: string
    }

    // Cerca recipient con email_id corrispondente
    const recipientsData = (recipients as RecipientData[]) || []
    const recipient = recipientsData.find((r: RecipientData) => {
      const metadata = r.metadata as Record<string, unknown> | null
      return metadata?.email_id === emailId
    })

    if (!recipient) {
      logger.warn('Webhook email: recipient not found', undefined, { emailId })
      // Non è un errore critico, potrebbe essere un'email non tracciata
      return new NextResponse('Recipient not found', { status: 200 })
    }

    // Gestisci eventi
    switch (eventType) {
      case 'email.sent':
        // Già gestito durante l'invio, ma possiamo confermare
        if (!recipient.sent_at) {
          await updateRecipientStatus(recipient.id, 'sent', {
            sent_at: new Date().toISOString(),
            metadata: {
              ...(recipient.metadata as Record<string, unknown>),
              email_id: emailId,
            },
          })
        }
        break

      case 'email.delivered':
        await updateRecipientStatus(recipient.id, 'delivered', {
          delivered_at: new Date().toISOString(),
        })

        // Aggiorna statistiche comunicazione
        if (recipient.communications && !Array.isArray(recipient.communications)) {
          const commRef = recipient.communications as CommunicationRef
          await updateCommunicationStats(commRef.id)
        }
        break

      case 'email.bounced':
      case 'email.complained':
        await updateRecipientStatus(recipient.id, 'bounced', {
          failed_at: new Date().toISOString(),
          error_message: eventType === 'email.bounced' ? 'Email bounced' : 'Email marked as spam',
        })

        // Aggiorna statistiche comunicazione
        if (recipient.communications && !Array.isArray(recipient.communications)) {
          const commRef = recipient.communications as CommunicationRef
          await updateCommunicationStats(commRef.id)
        }
        break

      case 'email.opened':
        // Alternativo al pixel tracking (se Resend lo supporta)
        if (!recipient.opened_at) {
          await updateRecipientStatus(recipient.id, 'opened', {
            opened_at: new Date().toISOString(),
          })

          // Aggiorna statistiche comunicazione
          if (recipient.communications && !Array.isArray(recipient.communications)) {
            const commRef = recipient.communications as CommunicationRef
            await updateCommunicationStats(commRef.id)
          }
        }
        break

      case 'email.clicked':
        // Traccia click (opzionale)
        const metadata = (recipient.metadata as Record<string, unknown>) || {}
        metadata.clicked_at = new Date().toISOString()
        metadata.clicked_url = body.data?.link || body.link

        const recipientStatus = (recipient.status as string) || 'opened'
        await updateRecipientStatus(recipient.id, recipientStatus, {
          metadata,
        })
        break

      default:
        logger.warn('Unhandled email event type', undefined, { eventType, emailId })
    }

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    logger.error('Error processing email webhook', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
