// ============================================================
// Email reset password via Resend (template dashboard: password-reset-request)
// ============================================================
// Genera il link di recovery con Supabase Admin e invia via Resend template
// ============================================================

import { createAdminClient } from '@/lib/supabase/server'
import {
  sendEmailViaResendTemplate,
  RESEND_TEMPLATE_PASSWORD_RESET,
} from '@/lib/communications/email-resend-client'
import { createLogger } from '@/lib/logger'

const logger = createLogger('lib:communications:send-reset-password-email')

export interface SendResetPasswordEmailParams {
  email: string
  redirectTo: string
}

/**
 * Nome variabile univoco per il link di reset nel template Resend "password-reset-request".
 * Prefisso 22club_ evita conflitti con altri template/servizi. Nel dashboard usa {{22club_reset_password_url}}.
 */
const TEMPLATE_VAR_RESET_LINK = '22club_reset_password_url'

/**
 * Genera il link di recovery con Supabase Admin e invia l'email tramite Resend
 * usando il template "password-reset-request". Se Resend non è configurato,
 * in sviluppo l'email viene simulata.
 */
export async function sendResetPasswordEmail(
  params: SendResetPasswordEmailParams,
): Promise<{ success: boolean; error?: string }> {
  const { email, redirectTo } = params
  const trimmedEmail = email.trim()

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: trimmedEmail,
      options: { redirectTo },
    })

    if (error) {
      logger.error('Errore generateLink recovery', error, { email: trimmedEmail })
      return {
        success: false,
        error: error.message || 'Errore durante la generazione del link',
      }
    }

    const actionLink = data?.properties?.action_link
    if (!actionLink || typeof actionLink !== 'string') {
      logger.error('action_link mancante in generateLink response', undefined, {
        email: trimmedEmail,
        hasData: !!data,
      })
      return {
        success: false,
        error: 'Link di reset non disponibile',
      }
    }

    // URL assoluto e pulito per il bottone nell'email (niente newline/spazi che rompono l'href)
    const rawUrl =
      /^https?:\/\//i.test(actionLink.trim())
        ? actionLink.trim()
        : (() => {
            try {
              const base = new URL(redirectTo).origin
              const path = actionLink.startsWith('/') ? actionLink : `/${actionLink}`
              return `${base}${path}`
            } catch {
              return actionLink
            }
          })()
    const fullResetUrl = rawUrl.replace(/\s+/g, '').trim()

    const subject = 'Reimposta la password - 22Club'

    logger.info('Invio email reset password via Resend (template)', undefined, {
      email: trimmedEmail,
      templateId: RESEND_TEMPLATE_PASSWORD_RESET,
    })

    const result = await sendEmailViaResendTemplate(
      trimmedEmail,
      RESEND_TEMPLATE_PASSWORD_RESET,
      { [TEMPLATE_VAR_RESET_LINK]: fullResetUrl },
      subject,
    )

    if (result.success) {
      logger.info('Email reset password inviata', undefined, {
        email: trimmedEmail,
        emailId: result.emailId,
      })
      return { success: true }
    }

    logger.error('Invio email reset password fallito', undefined, {
      email: trimmedEmail,
      error: result.error,
    })
    return {
      success: false,
      error: result.error || "Errore durante l'invio dell'email",
    }
  } catch (err) {
    logger.error('Errore in sendResetPasswordEmail', err, {
      email: trimmedEmail,
    })
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }
}
