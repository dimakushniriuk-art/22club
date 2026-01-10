// ============================================================
// FASE 4: Invio Email per Comunicazioni
// ============================================================
// Integra provider email (Resend) con sistema comunicazioni
// ============================================================

import { createClient } from '@supabase/supabase-js'
import { createLogger } from '@/lib/logger'
import type { Database, Tables } from '@/types/supabase'
import { updateCommunicationStats } from './service'
import { generateEmailHTML } from './email-template'
import { processEmailBatches } from './email-batch-processor'

const logger = createLogger('lib:communications:email')

// Nota: CommunicationRow potrebbe essere usato in futuro per type checking
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type CommunicationRow = Tables<'communications'>
type CommunicationRecipientRow = Tables<'communication_recipients'>

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

export interface SendCommunicationEmailResult {
  success: boolean
  sent: number
  failed: number
  total: number
  errors?: string[]
  error?: string
}

/**
 * Invia una comunicazione email a tutti i recipients pendenti
 */
export async function sendCommunicationEmail(
  communicationId: string,
): Promise<SendCommunicationEmailResult> {
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

    type CommunicationData = {
      id: string
      title: string
      message: string
      type: string
      metadata?: Record<string, unknown> | null
      [key: string]: unknown
    }

    const communicationData = communication as CommunicationData

    // Verifica che sia una comunicazione email
    if (communicationData.type !== 'email' && communicationData.type !== 'all') {
      return {
        success: false,
        sent: 0,
        failed: 0,
        total: 0,
        error: 'Communication type is not email',
      }
    }

    // Aggiorna status a "sending"
    // Workaround necessario per inferenza tipo Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('communications') as any)
      .update({ status: 'sending' } as Record<string, unknown>)
      .eq('id', communicationId)

    // Ottieni tutti i recipients pendenti per email
    const { data: recipients, error: recipientsError } = await supabase
      .from('communication_recipients')
      .select('*')
      .eq('communication_id', communicationId)
      .eq('recipient_type', 'email')
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

    if (!recipients || recipients.length === 0) {
      return {
        success: true,
        sent: 0,
        failed: 0,
        total: 0,
      }
    }

    // Genera HTML email
    const emailHTML = generateEmailHTML(
      communicationData.title,
      communicationData.message,
      communicationData.metadata as Record<string, unknown> | undefined,
    )

    // Processa batch
    const { sent, failed, errors } = await processEmailBatches(
      recipients as CommunicationRecipientRow[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      communicationData as any,
      emailHTML,
    )

    // Aggiorna statistiche comunicazione
    await updateCommunicationStats(communicationId)

    // Aggiorna status comunicazione
    const finalStatus = failed === recipients.length ? 'failed' : 'sent'
    // Workaround necessario per inferenza tipo Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('communications') as any)
      .update({
        status: finalStatus,
        sent_at: new Date().toISOString(),
      } as Record<string, unknown>)
      .eq('id', communicationId)

    logger.info('Communication email sent', undefined, {
      communicationId,
      sent,
      failed,
      total: recipients.length,
    })

    return {
      success: sent > 0,
      sent,
      failed,
      total: recipients.length,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error) {
    logger.error('Error in sendCommunicationEmail', error, { communicationId })

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
 * Invia email per una comunicazione specifica a un recipient specifico
 * (utile per retry manuale)
 */
export async function sendEmailToRecipient(
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
        | { id: string; title: string; message: string; [key: string]: unknown }
        | { id: string; title: string; message: string; [key: string]: unknown }[]
        | null
      user_id?: string | null
      [key: string]: unknown
    }

    const typedRecipient = recipient as CommunicationRecipient

    if (typedRecipient.recipient_type !== 'email') {
      return {
        success: false,
        error: 'Recipient type is not email',
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

    // Ottieni email dal profilo
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('user_id', typedRecipient.user_id || '')
      .single()

    // Type assertion per profile
    type ProfileRow = {
      email?: string | null
      [key: string]: unknown
    }

    const typedProfile = profile as ProfileRow | null

    if (profileError || !typedProfile || !typedProfile.email) {
      const { updateRecipientStatus } = await import('./service')
      await updateRecipientStatus(recipientId, 'failed', {
        failed_at: new Date().toISOString(),
        error_message: 'No email address',
      })
      return {
        success: false,
        error: 'No email address',
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

    // Genera HTML
    const emailHTML = generateEmailHTML(
      communicationDataSingle.title,
      communicationDataSingle.message,
      communicationDataSingle.metadata as Record<string, unknown> | undefined,
    )

    // Invia email
    const { sendEmailViaResend } = await import('./email-resend-client')
    const emailResult = await sendEmailViaResend(
      typedProfile.email,
      communicationDataSingle.title,
      emailHTML,
      recipientId,
    )

    if (emailResult.success) {
      const { updateRecipientStatus } = await import('./service')
      await updateRecipientStatus(recipientId, 'sent', {
        sent_at: new Date().toISOString(),
        metadata: {
          email_id: emailResult.emailId,
        },
      })

      // Aggiorna statistiche comunicazione
      await updateCommunicationStats(communicationDataSingle.id)

      return { success: true }
    } else {
      const { updateRecipientStatus } = await import('./service')
      await updateRecipientStatus(recipientId, 'failed', {
        failed_at: new Date().toISOString(),
        error_message: emailResult.error || 'Email sending failed',
      })
      return {
        success: false,
        error: emailResult.error || 'Email sending failed',
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
