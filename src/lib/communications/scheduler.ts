// ============================================================
// FASE 6: Scheduler Comunicazioni
// ============================================================
// Gestisce l'invio automatico di comunicazioni programmate
// ============================================================

import { createClient } from '@supabase/supabase-js'
import { createLogger } from '@/lib/logger'
import type { Database } from '@/types/supabase'
import { sendCommunicationPush } from './push'
import { sendCommunicationEmail } from './email'
import { sendCommunicationSMS } from './sms'

const logger = createLogger('lib:communications:scheduler')

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

export interface ProcessScheduledCommunicationsResult {
  success: boolean
  processed: number
  sent: number
  failed: number
  errors?: string[]
}

/**
 * Processa tutte le comunicazioni programmate che devono essere inviate ora
 */
export async function processScheduledCommunications(): Promise<ProcessScheduledCommunicationsResult> {
  try {
    const supabase = getSupabaseClient()

    // Ottieni comunicazioni programmate che devono essere inviate ora
    const now = new Date().toISOString()

    const { data: communications, error } = await supabase
      .from('communications')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now)
      .not('scheduled_for', 'is', null)

    if (error) {
      logger.error('Error fetching scheduled communications', error)
      return {
        success: false,
        processed: 0,
        sent: 0,
        failed: 0,
        errors: [error.message],
      }
    }

    if (!communications || communications.length === 0) {
      return {
        success: true,
        processed: 0,
        sent: 0,
        failed: 0,
      }
    }

    type CommunicationData = {
      id: string
      type: string
      [key: string]: unknown
    }

    const communicationsData = (communications as CommunicationData[]) || []

    logger.debug('Processing scheduled communications', undefined, {
      count: communicationsData.length,
    })

    let processedCount = 0
    let sentCount = 0
    let failedCount = 0
    const errors: string[] = []

    // Processa ogni comunicazione
    for (const communication of communicationsData) {
      try {
        // Prima, crea i recipients se non esistono ancora
        await ensureRecipientsCreated(communication.id, {
          type: communication.type as string,
          recipient_filter: communication.recipient_filter as unknown,
        })

        // Poi, invia in base al tipo
        let result

        switch (communication.type) {
          case 'push':
            result = await sendCommunicationPush(communication.id)
            break

          case 'email':
            result = await sendCommunicationEmail(communication.id)
            break

          case 'sms':
            result = await sendCommunicationSMS(communication.id)
            break

          case 'all':
            // Invia su tutti i canali
            const pushResult = await sendCommunicationPush(communication.id)
            const emailResult = await sendCommunicationEmail(communication.id)
            const smsResult = await sendCommunicationSMS(communication.id)

            result = {
              success: pushResult.success || emailResult.success || smsResult.success,
              sent: (pushResult.sent || 0) + (emailResult.sent || 0) + (smsResult.sent || 0),
              failed:
                (pushResult.failed || 0) + (emailResult.failed || 0) + (smsResult.failed || 0),
              total: (pushResult.total || 0) + (emailResult.total || 0) + (smsResult.total || 0),
              errors: [
                ...(pushResult.errors || []),
                ...(emailResult.errors || []),
                ...(smsResult.errors || []),
              ],
            }
            break

          default:
            throw new Error(`Unknown communication type: ${communication.type}`)
        }

        processedCount++

        if (result.success) {
          sentCount++
        } else {
          failedCount++
          if (result.error) {
            errors.push(`Communication ${communication.id}: ${result.error}`)
          }
        }

        if (result.errors && result.errors.length > 0) {
          errors.push(...result.errors)
        }
      } catch (err) {
        processedCount++
        failedCount++
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        errors.push(`Communication ${communication.id}: ${errorMessage}`)
        logger.error('Error processing communication', err, { communicationId: communication.id })
      }
    }

    logger.info('Processed scheduled communications', undefined, {
      processed: processedCount,
      sent: sentCount,
      failed: failedCount,
    })

    return {
      success: sentCount > 0,
      processed: processedCount,
      sent: sentCount,
      failed: failedCount,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error) {
    logger.error('Error in processScheduledCommunications', error)
    return {
      success: false,
      processed: 0,
      sent: 0,
      failed: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    }
  }
}

/**
 * Assicura che i recipients siano stati creati per una comunicazione
 * (utile se la comunicazione è stata creata senza generare i recipients)
 */
export async function ensureRecipientsCreated(
  communicationId: string,
  communication: {
    type: string
    recipient_filter: unknown
  },
): Promise<void> {
  const supabase = getSupabaseClient()

  // Verifica se ci sono già recipients
  const { data: existingRecipients, error: checkError } = await supabase
    .from('communication_recipients')
    .select('id')
    .eq('communication_id', communicationId)
    .limit(1)

  if (checkError) {
    logger.error('Error checking recipients', checkError, { communicationId })
    return
  }

  // Se ci sono già recipients, non fare nulla
  if (existingRecipients && existingRecipients.length > 0) {
    return
  }

  // Crea i recipients
  const { getRecipientsByFilter, generateRecipientTypes } = await import('./recipients')
  const { createCommunicationRecipients } = await import('./service')

  const recipientFilter = communication.recipient_filter as {
    role?: 'admin' | 'pt' | 'trainer' | 'staff' | 'atleta'
    athlete_ids?: string[]
    all_users?: boolean
  }

  const { data: recipients, error: recipientsError } = await getRecipientsByFilter(recipientFilter)

  if (recipientsError) {
    logger.error('Error getting recipients for communication', recipientsError, { communicationId })
    return
  }

  if (!recipients || recipients.length === 0) {
    logger.warn('No recipients found for communication', undefined, {
      communicationId,
      filter: recipientFilter,
    })
    // Aggiorna comunque total_recipients a 0 per chiarezza
    // Workaround necessario per inferenza tipo Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('communications') as any)
      .update({ total_recipients: 0 } as Record<string, unknown>)
      .eq('id', communicationId)
    return
  }

  // Determina i tipi di recipient in base al tipo di comunicazione
  const recipientTypes = generateRecipientTypes(
    recipients,
    communication.type as 'push' | 'email' | 'sms' | 'all',
  )

  if (recipientTypes.length === 0) {
    logger.warn('No valid recipient types for communication', undefined, {
      communicationId,
      recipientsCount: recipients.length,
      filter: recipientFilter,
    })
    // Aggiorna comunque total_recipients a 0 per chiarezza
    // Workaround necessario per inferenza tipo Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('communications') as any)
      .update({ total_recipients: 0 } as Record<string, unknown>)
      .eq('id', communicationId)
    return
  }

  // Crea i recipients
  const { error: createError } = await createCommunicationRecipients(
    communicationId,
    recipientTypes,
  )

  if (createError) {
    logger.error('Error creating recipients for communication', createError, { communicationId })
  } else {
    logger.debug('Created recipients for communication', undefined, {
      communicationId,
      count: recipientTypes.length,
    })
  }
}

/**
 * Programma una comunicazione per l'invio futuro
 */
export async function scheduleCommunication(
  communicationId: string,
  scheduledFor: Date | string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseClient()

    const scheduledForISO = scheduledFor instanceof Date ? scheduledFor.toISOString() : scheduledFor

    // Workaround necessario per inferenza tipo Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('communications') as any)
      .update({
        status: 'scheduled',
        scheduled_for: scheduledForISO,
      } as Record<string, unknown>)
      .eq('id', communicationId)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
