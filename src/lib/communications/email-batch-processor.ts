// ============================================================
// Batch processor per email (FASE C - Split File Lunghi)
// ============================================================
// Estratto da email.ts per migliorare manutenibilità
// ============================================================

import { createClient } from '@supabase/supabase-js'
import type { Database, Tables } from '@/types/supabase'
import { updateRecipientStatus } from './service'
import { sendEmailViaResend } from './email-resend-client'
// Nota: generateEmailHTML potrebbe essere usato in futuro per generazione HTML custom
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { generateEmailHTML } from './email-template'

type CommunicationRow = Tables<'communications'>
type CommunicationRecipientRow = Tables<'communication_recipients'>

const EMAIL_BATCH_SIZE = 100
const EMAIL_BATCH_DELAY_MS = 2000

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

/**
 * Processa un batch di recipients per l'invio email
 */
export async function processEmailBatch(
  batch: CommunicationRecipientRow[],
  communication: CommunicationRow,
  emailHTML: string,
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const supabase = getSupabaseClient()
  let sentCount = 0
  let failedCount = 0
  const errors: string[] = []

  const batchPromises = batch.map(async (recipient) => {
    try {
      // Ottieni email dal profilo
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('user_id', recipient.user_id)
        .single()

      // Type assertion per profile
      type ProfileRow = {
        email?: string | null
        [key: string]: unknown
      }

      const typedProfile = profile as ProfileRow | null

      if (profileError || !typedProfile || !typedProfile.email) {
        await updateRecipientStatus(recipient.id, 'failed', {
          failed_at: new Date().toISOString(),
          error_message: 'No email address',
        })
        failedCount++
        return
      }

      // Invia email
      const emailResult = await sendEmailViaResend(
        typedProfile.email,
        communication.title,
        emailHTML,
        recipient.id,
      )

      if (emailResult.success) {
        await updateRecipientStatus(recipient.id, 'sent', {
          sent_at: new Date().toISOString(),
          metadata: {
            email_id: emailResult.emailId,
          },
        })
        sentCount++
      } else {
        await updateRecipientStatus(recipient.id, 'failed', {
          failed_at: new Date().toISOString(),
          error_message: emailResult.error || 'Email sending failed',
        })
        failedCount++
        if (emailResult.error) {
          errors.push(`User ${recipient.user_id}: ${emailResult.error}`)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      await updateRecipientStatus(recipient.id, 'failed', {
        failed_at: new Date().toISOString(),
        error_message: errorMessage,
      })
      failedCount++
      errors.push(`User ${recipient.user_id}: ${errorMessage}`)
    }
  })

  await Promise.all(batchPromises)

  return { sent: sentCount, failed: failedCount, errors }
}

/**
 * Divide recipients in batch e processa sequenzialmente
 */
export async function processEmailBatches(
  recipients: CommunicationRecipientRow[],
  communication: CommunicationRow,
  emailHTML: string,
): Promise<{ sent: number; failed: number; errors: string[] }> {
  let totalSent = 0
  let totalFailed = 0
  const allErrors: string[] = []

  // Dividi recipients in batch
  const batches: CommunicationRecipientRow[][] = []
  for (let i = 0; i < recipients.length; i += EMAIL_BATCH_SIZE) {
    batches.push(recipients.slice(i, i + EMAIL_BATCH_SIZE) as CommunicationRecipientRow[])
  }

  // Processa ogni batch
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex]

    const result = await processEmailBatch(batch, communication, emailHTML)
    totalSent += result.sent
    totalFailed += result.failed
    allErrors.push(...result.errors)

    // Delay tra batch (tranne l'ultimo)
    if (batchIndex < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, EMAIL_BATCH_DELAY_MS))
    }
  }

  return {
    sent: totalSent,
    failed: totalFailed,
    errors: allErrors,
  }
}
