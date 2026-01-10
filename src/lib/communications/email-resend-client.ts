// ============================================================
// Client Resend per email (FASE C - Split File Lunghi)
// ============================================================
// Estratto da email.ts per migliorare manutenibilità
// ============================================================

import { createLogger } from '@/lib/logger'

const logger = createLogger('lib:communications:email-resend-client')

// Nota: requiredEnv potrebbe essere usato in futuro per validazione env vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

/**
 * Verifica se Resend è configurato
 */
export function isResendConfigured(): boolean {
  return !!(
    process.env.RESEND_API_KEY &&
    process.env.RESEND_FROM_EMAIL &&
    process.env.RESEND_FROM_NAME
  )
}

/**
 * Invia email tramite Resend
 */
export async function sendEmailViaResend(
  to: string,
  subject: string,
  html: string,
  trackingPixelId?: string,
): Promise<{ success: boolean; emailId?: string; error?: string }> {
  try {
    if (!isResendConfigured()) {
      // In sviluppo, simula l'invio
      logger.debug('Email simulata (Resend non configurato)', undefined, {
        to,
        subject,
        htmlLength: html.length,
        trackingPixelId,
      })
      return {
        success: true,
        emailId: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      }
    }

    // In produzione, usa Resend API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resend: any
    try {
      resend = await import('resend')
    } catch (error) {
      logger.warn('Resend package not installed, using mock', error)
      // Fallback: simula invio in sviluppo
      return { success: true, emailId: `mock-${Date.now()}` }
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      logger.error('RESEND_API_KEY non trovato', undefined)
      return {
        success: false,
        error: 'RESEND_API_KEY non configurato',
      }
    }

    const resendClient = new resend.Resend(apiKey)

    const fromEmail = process.env.RESEND_FROM_EMAIL!
    const fromName = process.env.RESEND_FROM_NAME || '22Club'

    logger.info('Invio email tramite Resend', undefined, {
      to,
      from: `${fromName} <${fromEmail}>`,
      subject,
      htmlLength: html.length,
    })

    // Aggiungi tracking pixel se fornito
    let finalHtml = html
    if (trackingPixelId) {
      const trackingPixel = `<img src="${process.env.NEXT_PUBLIC_APP_URL || 'https://22club.it'}/api/track/email-open/${trackingPixelId}" width="1" height="1" style="display:none;" alt="" />`
      finalHtml = finalHtml.replace('</body>', `${trackingPixel}</body>`)
    }

    const { data, error } = await resendClient.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject,
      html: finalHtml,
    })

    if (error) {
      logger.error('Errore invio email Resend', undefined, {
        to,
        error: error.message || 'Resend API error',
        errorCode: (error as { code?: string }).code,
      })
      return {
        success: false,
        error: error.message || 'Resend API error',
      }
    }

    logger.info('Email inviata con successo tramite Resend', undefined, {
      to,
      emailId: data?.id,
    })

    return {
      success: true,
      emailId: data?.id,
    }
  } catch (error) {
    logger.error('Errore durante invio email', error, {
      to,
      subject,
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
