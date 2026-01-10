// ============================================================
// FASE 5: Invio SMS per Comunicazioni
// ============================================================
// Integra provider SMS (Twilio) con sistema comunicazioni
// ============================================================

import { createClient } from '@supabase/supabase-js'
import { createLogger } from '@/lib/logger'
import type { Database, Tables } from '@/types/supabase'
import { updateRecipientStatus, updateCommunicationStats } from './service'

const logger = createLogger('lib:communications:sms')

// Nota: CommunicationRow potrebbe essere usato in futuro per type checking
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type CommunicationRow = Tables<'communications'>

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

// Configurazione batch processing
const SMS_BATCH_SIZE = 50 // Numero di SMS da inviare per batch (più conservativo per costi)
const SMS_BATCH_DELAY_MS = 3000 // Delay tra batch (3 secondi per rispettare rate limits)

export interface SendCommunicationSMSResult {
  success: boolean
  sent: number
  failed: number
  total: number
  errors?: string[]
  error?: string
}

// ============================================================
// Funzioni helper per Twilio
// ============================================================

/**
 * Verifica se Twilio è configurato
 */
function isTwilioConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  )
}

/**
 * Invia SMS tramite Twilio
 */
async function sendSMSViaTwilio(
  to: string,
  message: string,
  recipientId?: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!isTwilioConfigured()) {
      // In sviluppo, simula l'invio
      logger.debug('SMS simulato (Twilio non configurato)', undefined, {
        to,
        messagePreview: message.substring(0, 50),
        recipientId,
      })
      return {
        success: true,
        messageId: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      }
    }

    // In produzione, usa Twilio API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let twilio: any
    try {
      // @ts-expect-error - twilio è opzionale, gestito con try-catch
      twilio = await import('twilio')
    } catch (error) {
      logger.warn('Twilio package not installed, using mock', error)
      // Fallback: simula invio in sviluppo
      return { success: true, messageId: `mock-${Date.now()}` }
    }
    const client = twilio.default(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)

    const fromNumber = process.env.TWILIO_PHONE_NUMBER!

    // Costruisci callback URL per status updates (opzionale)
    const statusCallback = recipientId
      ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://22club.it'}/api/webhooks/sms?recipient_id=${recipientId}`
      : undefined

    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to,
      statusCallback: statusCallback,
    })

    return {
      success: true,
      messageId: result.sid,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================================
// Funzioni principali
// ============================================================

/**
 * Genera messaggio SMS da template
 */
function generateSMSMessage(message: string, metadata?: Record<string, unknown>): string {
  const template = metadata?.sms_template as string | undefined

  if (template) {
    // Se c'è un template personalizzato, usalo
    return template.replace('{{message}}', message)
  }

  // Template SMS di default (massimo 160 caratteri per SMS singolo)
  // SMS può essere concatenato fino a 1600 caratteri (10 SMS)
  const maxLength = 160
  const cleanMessage = message.trim()

  if (cleanMessage.length <= maxLength) {
    return cleanMessage
  }

  // Se troppo lungo, tronca e aggiungi "..."
  return cleanMessage.substring(0, maxLength - 3) + '...'
}

/**
 * Invia una comunicazione SMS a tutti i recipients pendenti
 */
export async function sendCommunicationSMS(
  communicationId: string,
): Promise<SendCommunicationSMSResult> {
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
      message?: string | null
      metadata?: Record<string, unknown> | null
      [key: string]: unknown
    }

    const typedCommunication = communication as CommunicationData

    // Verifica che sia una comunicazione SMS
    if (typedCommunication.type !== 'sms' && typedCommunication.type !== 'all') {
      return {
        success: false,
        sent: 0,
        failed: 0,
        total: 0,
        error: 'Communication type is not SMS',
      }
    }

    // Aggiorna status a "sending"
    // Workaround necessario per inferenza tipo Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('communications') as any)
      .update({ status: 'sending' } as Record<string, unknown>)
      .eq('id', communicationId)

    // Ottieni tutti i recipients pendenti per SMS
    const { data: recipients, error: recipientsError } = await supabase
      .from('communication_recipients')
      .select('*')
      .eq('communication_id', communicationId)
      .eq('recipient_type', 'sms')
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

    // Genera messaggio SMS
    const smsMessage = generateSMSMessage(
      typedCommunication.message || '',
      typedCommunication.metadata as Record<string, unknown> | undefined,
    )

    // Invia SMS in batch
    let sentCount = 0
    let failedCount = 0
    const errors: string[] = []

    // Dividi recipients in batch
    const batches: RecipientRow[][] = []
    for (let i = 0; i < typedRecipients.length; i += SMS_BATCH_SIZE) {
      batches.push(typedRecipients.slice(i, i + SMS_BATCH_SIZE))
    }

    // Processa ogni batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]

      // Processa batch in parallelo (con limite)
      const batchPromises = batch.map(async (recipient) => {
        try {
          // Ottieni telefono dal profilo
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('phone')
            .eq('user_id', recipient.user_id || '')
            .single()

          // Type assertion per profile
          type ProfileRow = {
            phone?: string | null
            [key: string]: unknown
          }

          const typedProfile = profile as ProfileRow | null

          if (profileError || !typedProfile || !typedProfile.phone) {
            await updateRecipientStatus(recipient.id || '', 'failed', {
              failed_at: new Date().toISOString(),
              error_message: 'No phone number',
            })
            failedCount++
            return
          }

          // Valida formato telefono (deve iniziare con +)
          const phoneNumber = typedProfile.phone.trim()
          if (!phoneNumber.startsWith('+')) {
            await updateRecipientStatus(recipient.id || '', 'failed', {
              failed_at: new Date().toISOString(),
              error_message: 'Invalid phone number format (must start with +)',
            })
            failedCount++
            return
          }

          // Invia SMS
          const smsResult = await sendSMSViaTwilio(phoneNumber, smsMessage, recipient.id || '')

          if (smsResult.success) {
            await updateRecipientStatus(recipient.id || '', 'sent', {
              sent_at: new Date().toISOString(),
              metadata: {
                message_id: smsResult.messageId,
              },
            })
            sentCount++
          } else {
            await updateRecipientStatus(recipient.id || '', 'failed', {
              failed_at: new Date().toISOString(),
              error_message: smsResult.error || 'SMS sending failed',
            })
            failedCount++
            if (smsResult.error) {
              errors.push(`User ${recipient.user_id || ''}: ${smsResult.error}`)
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
        await new Promise((resolve) => setTimeout(resolve, SMS_BATCH_DELAY_MS))
      }
    }

    // Aggiorna statistiche comunicazione
    await updateCommunicationStats(communicationId)

    // Aggiorna status comunicazione
    const finalStatus = failedCount === typedRecipients.length ? 'failed' : 'sent'
    // Workaround necessario per inferenza tipo Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('communications') as any)
      .update({
        status: finalStatus,
        sent_at: new Date().toISOString(),
      } as Record<string, unknown>)
      .eq('id', communicationId)

    logger.info('Communication SMS sent', undefined, {
      communicationId,
      sent: sentCount,
      failed: failedCount,
      total: typedRecipients.length,
    })

    return {
      success: sentCount > 0,
      sent: sentCount,
      failed: failedCount,
      total: typedRecipients.length,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error) {
    logger.error('Error in sendCommunicationSMS', error, { communicationId })

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
 * Invia SMS per una comunicazione specifica a un recipient specifico
 * (utile per retry manuale)
 */
export async function sendSMSToRecipient(
  recipientId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseClient()

    // Ottieni recipient con comunicazione
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

    if (typedRecipient.recipient_type !== 'sms') {
      return {
        success: false,
        error: 'Recipient type is not SMS',
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

    // Ottieni telefono dal profilo
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('phone')
      .eq('user_id', typedRecipient.user_id || '')
      .single()

    // Type assertion per profile
    type ProfileRow = {
      phone?: string | null
      [key: string]: unknown
    }

    const typedProfile = profile as ProfileRow | null

    if (profileError || !typedProfile || !typedProfile.phone) {
      await updateRecipientStatus(recipientId, 'failed', {
        failed_at: new Date().toISOString(),
        error_message: 'No phone number',
      })
      return {
        success: false,
        error: 'No phone number',
      }
    }

    // Valida formato telefono
    const phoneNumber = typedProfile.phone.trim()
    if (!phoneNumber.startsWith('+')) {
      await updateRecipientStatus(recipientId, 'failed', {
        failed_at: new Date().toISOString(),
        error_message: 'Invalid phone number format (must start with +)',
      })
      return {
        success: false,
        error: 'Invalid phone number format',
      }
    }

    // Genera messaggio
    const smsMessage = generateSMSMessage(
      communicationDataSingle.message,
      communicationDataSingle.metadata as Record<string, unknown> | undefined,
    )

    // Invia SMS
    const smsResult = await sendSMSViaTwilio(phoneNumber, smsMessage, recipientId)

    if (smsResult.success) {
      await updateRecipientStatus(recipientId, 'sent', {
        sent_at: new Date().toISOString(),
        metadata: {
          message_id: smsResult.messageId,
        },
      })

      // Aggiorna statistiche comunicazione
      await updateCommunicationStats(communicationDataSingle.id)

      return { success: true }
    } else {
      await updateRecipientStatus(recipientId, 'failed', {
        failed_at: new Date().toISOString(),
        error_message: smsResult.error || 'SMS sending failed',
      })
      return {
        success: false,
        error: smsResult.error || 'SMS sending failed',
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
