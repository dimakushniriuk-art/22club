// ============================================================
// FASE 3: Invio Push per Comunicazioni
// ============================================================
// Integra il sistema push esistente con il sistema comunicazioni
// ============================================================

import { createClient } from '@supabase/supabase-js'
import { createLogger } from '@/lib/logger'
import type { Database } from '@/types/supabase'
import { sendPushNotification, getActivePushTokens } from '@/lib/notifications/push'
import { updateRecipientStatus, updateCommunicationStats } from './service'

const logger = createLogger('lib:communications:push')

// type CommunicationRecipientRow = Tables<'communication_recipients'> // non utilizzato

let serviceClient: ReturnType<typeof createClient<Database>> | null = null

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

function getSupabaseClient() {
  if (!serviceClient) {
    serviceClient = createClient<Database>(
      requiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
      requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: {
          persistSession: false,
        },
      },
    )
  }
  return serviceClient
}

// Configurazione batch processing (non utilizzato)
// const BATCH_SIZE = 50 // Numero di push da inviare per batch
// const BATCH_DELAY_MS = 1000 // Delay tra batch (1 secondo)

export interface SendCommunicationPushResult {
  success: boolean
  sent: number
  failed: number
  total: number
  errors?: string[]
  error?: string
}

/**
 * Invia una comunicazione push a tutti i recipients pendenti
 */
export async function sendCommunicationPush(
  communicationId: string,
): Promise<SendCommunicationPushResult> {
  try {
    const supabase = getSupabaseClient()

    // Ottieni la comunicazione
    const { data: communication, error: commError } = await supabase
      .from('communications')
      .select('*')
      .eq('id', communicationId)
      .single()

    if (commError || !communication) {
      return {
        success: false,
        sent: 0,
        failed: 0,
        total: 0,
        error: commError?.message || 'Communication not found',
      }
    }

    // Type assertion per communication
    type CommunicationData = {
      type?: string | null
      metadata?: Record<string, unknown> | null
      title?: string | null
      message?: string | null
      [key: string]: unknown
    }

    const typedCommunication = communication as CommunicationData

    // Verifica che sia una comunicazione push
    if (typedCommunication.type !== 'push' && typedCommunication.type !== 'all') {
      return {
        success: false,
        sent: 0,
        failed: 0,
        total: 0,
        error: 'Communication type is not push',
      }
    }

    // Aggiorna status a "sending"
    // Workaround necessario per inferenza tipo Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('communications') as any)
      .update({ status: 'sending' } as Record<string, unknown>)
      .eq('id', communicationId)

    // Ottieni tutti i recipients pendenti per push
    const { data: recipients, error: recipientsError } = await supabase
      .from('communication_recipients')
      .select('*')
      .eq('communication_id', communicationId)
      .eq('recipient_type', 'push')
      .eq('status', 'pending')

    if (recipientsError) {
      return {
        success: false,
        sent: 0,
        failed: 0,
        total: 0,
        error: recipientsError.message,
      }
    }

    // Type assertion per recipients
    type RecipientRow = {
      id?: string
      user_id?: string | null
      [key: string]: unknown
    }

    const typedRecipients = (recipients as RecipientRow[]) || []

    if (!typedRecipients || typedRecipients.length === 0) {
      return {
        success: true,
        sent: 0,
        failed: 0,
        total: 0,
      }
    }

    // Prepara payload push
    const pushData = typedCommunication.metadata as Record<string, unknown> | undefined
    const icon = pushData?.icon as string | undefined
    const badge = pushData?.badge as string | undefined
    const data = pushData?.data as Record<string, unknown> | undefined

    // Invia push in batch
    const BATCH_SIZE = 10
    const BATCH_DELAY_MS = 100

    let sentCount = 0
    let failedCount = 0
    const errors: string[] = []

    // Dividi recipients in batch
    const batches: RecipientRow[][] = []
    for (let i = 0; i < typedRecipients.length; i += BATCH_SIZE) {
      batches.push(typedRecipients.slice(i, i + BATCH_SIZE))
    }

    // Processa ogni batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]

      // Processa batch in parallelo (con limite)
      const batchPromises = batch.map(async (recipient) => {
        try {
          // Verifica che l'utente abbia token push attivi
          const { tokens } = await getActivePushTokens(recipient.user_id || '')

          if (tokens.length === 0) {
            // Nessun token attivo, marca come failed
            await updateRecipientStatus(recipient.id || '', 'failed', {
              failed_at: new Date().toISOString(),
              error_message: 'No active push tokens',
            })
            failedCount++
            return
          }

          // Invia push notification
          const pushResult = await sendPushNotification(
            recipient.user_id || '',
            typedCommunication.title || '',
            typedCommunication.message || '',
            icon,
            badge,
            {
              ...data,
              communication_id: communicationId,
              recipient_id: recipient.id || '',
            },
          )

          if (pushResult.success && pushResult.sent && pushResult.sent > 0) {
            // Push inviato con successo
            await updateRecipientStatus(recipient.id || '', 'sent', {
              sent_at: new Date().toISOString(),
              metadata: {
                tokens_sent: pushResult.sent,
                total_tokens: pushResult.total,
              },
            })
            sentCount++
          } else {
            // Push fallito
            await updateRecipientStatus(recipient.id || '', 'failed', {
              failed_at: new Date().toISOString(),
              error_message: pushResult.error || 'Push sending failed',
            })
            failedCount++
            if (pushResult.error) {
              errors.push(`User ${recipient.user_id || ''}: ${pushResult.error}`)
            }
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error'
          await updateRecipientStatus(recipient.id || '', 'failed', {
            failed_at: new Date().toISOString(),
            error_message: errorMessage,
          })
          failedCount++
          errors.push(`User ${recipient.user_id || ''}: ${errorMessage}`)
        }
      })

      // Attendi completamento batch
      await Promise.all(batchPromises)

      // Delay tra batch (tranne l'ultimo)
      if (batchIndex < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS))
      }
    }

    // Aggiorna statistiche comunicazione
    await updateCommunicationStats(communicationId)

    // Aggiorna status comunicazione
    const finalStatus = failedCount === recipients.length ? 'failed' : 'sent'
    // Workaround necessario per inferenza tipo Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('communications') as any)
      .update({
        status: finalStatus,
        sent_at: new Date().toISOString(),
      } as Record<string, unknown>)
      .eq('id', communicationId)

    logger.info('Communication push sent', undefined, {
      communicationId,
      sent: sentCount,
      failed: failedCount,
      total: recipients.length,
    })

    // Se tutti i recipients sono falliti, aggiungi un messaggio di errore
    const allFailed = sentCount === 0 && failedCount === recipients.length
    const errorMessage = allFailed
      ? `Tutti i ${recipients.length} destinatari sono falliti. Verifica i token push attivi.`
      : undefined

    return {
      success: sentCount > 0,
      sent: sentCount,
      failed: failedCount,
      total: recipients.length,
      errors: errors.length > 0 ? errors : undefined,
      error: errorMessage,
    }
  } catch (error) {
    logger.error('Error in sendCommunicationPush', error, { communicationId })

    // Aggiorna status comunicazione a failed
    const supabase = getSupabaseClient()
    // Workaround necessario per inferenza tipo Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('communications') as any)
      .update({ status: 'failed' } as Record<string, unknown>)
      .eq('id', communicationId)

    return {
      success: false,
      sent: 0,
      failed: 0,
      total: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Invia push per una comunicazione specifica a un recipient specifico
 * (utile per retry manuale)
 */
export async function sendPushToRecipient(
  recipientId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseClient()

    // Ottieni recipient
    const { data: recipient, error: recipientError } = await supabase
      .from('communication_recipients')
      .select('*, communications(*)')
      .eq('id', recipientId)
      .single()

    if (recipientError || !recipient) {
      return {
        success: false,
        error: recipientError?.message || 'Recipient not found',
      }
    }

    // Type assertion per recipient
    type CommunicationRecipient = {
      recipient_type?: string | null
      communications?:
        | {
            id: string
            title: string
            message: string
            metadata?: Record<string, unknown> | null
            [key: string]: unknown
          }
        | {
            id: string
            title: string
            message: string
            metadata?: Record<string, unknown> | null
            [key: string]: unknown
          }[]
        | null
      user_id?: string | null
      [key: string]: unknown
    }

    const typedRecipient = recipient as CommunicationRecipient

    if (typedRecipient.recipient_type !== 'push') {
      return {
        success: false,
        error: 'Recipient type is not push',
      }
    }

    const communication = Array.isArray(typedRecipient.communications)
      ? typedRecipient.communications[0]
      : typedRecipient.communications

    if (!communication) {
      return {
        success: false,
        error: 'Communication not found',
      }
    }

    type CommunicationDataSingle = {
      id: string
      title: string
      message: string
      metadata?: Record<string, unknown> | null
      [key: string]: unknown
    }

    const communicationDataSingle = communication as CommunicationDataSingle

    // Verifica token attivi
    const { tokens } = await getActivePushTokens(typedRecipient.user_id || '')

    if (tokens.length === 0) {
      await updateRecipientStatus(recipientId, 'failed', {
        failed_at: new Date().toISOString(),
        error_message: 'No active push tokens',
      })
      return {
        success: false,
        error: 'No active push tokens',
      }
    }

    // Prepara payload
    const pushData = communicationDataSingle.metadata as Record<string, unknown> | undefined
    const icon = pushData?.icon as string | undefined
    const badge = pushData?.badge as string | undefined
    const data = pushData?.data as Record<string, unknown> | undefined

    // Invia push
    const pushResult = await sendPushNotification(
      typedRecipient.user_id || '',
      communicationDataSingle.title,
      communicationDataSingle.message,
      icon,
      badge,
      {
        ...data,
        communication_id: communicationDataSingle.id,
        recipient_id: recipientId,
      },
    )

    if (pushResult.success && pushResult.sent && pushResult.sent > 0) {
      await updateRecipientStatus(recipientId, 'sent', {
        sent_at: new Date().toISOString(),
        metadata: {
          tokens_sent: pushResult.sent,
          total_tokens: pushResult.total,
        },
      })

      // Aggiorna statistiche comunicazione
      await updateCommunicationStats(communicationDataSingle.id)

      return { success: true }
    } else {
      await updateRecipientStatus(recipientId, 'failed', {
        failed_at: new Date().toISOString(),
        error_message: pushResult.error || 'Push sending failed',
      })
      return {
        success: false,
        error: pushResult.error || 'Push sending failed',
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Processa tutte le comunicazioni push programmate che devono essere inviate
 */
export async function processScheduledPushCommunications(): Promise<{
  success: boolean
  processed: number
  errors?: string[]
}> {
  try {
    const supabase = getSupabaseClient()

    // Ottieni comunicazioni programmate che devono essere inviate ora
    const now = new Date().toISOString()

    const { data: communications, error } = await supabase
      .from('communications')
      .select('*')
      .eq('status', 'scheduled')
      .eq('type', 'push')
      .lte('scheduled_for', now)

    if (error) {
      return {
        success: false,
        processed: 0,
        errors: [error.message],
      }
    }

    if (!communications || communications.length === 0) {
      return {
        success: true,
        processed: 0,
      }
    }

    type CommunicationData = {
      id: string
      type: string
      [key: string]: unknown
    }

    const communicationsData = (communications as CommunicationData[]) || []

    let processedCount = 0
    const errors: string[] = []

    // Processa ogni comunicazione
    for (const communication of communicationsData) {
      try {
        const result = await sendCommunicationPush(communication.id)

        if (result.success) {
          processedCount++
        } else {
          errors.push(`Communication ${communication.id}: ${result.error || 'Unknown error'}`)
        }
      } catch (err) {
        errors.push(
          `Communication ${communication.id}: ${err instanceof Error ? err.message : 'Unknown error'}`,
        )
      }
    }

    return {
      success: processedCount > 0,
      processed: processedCount,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error) {
    return {
      success: false,
      processed: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    }
  }
}
