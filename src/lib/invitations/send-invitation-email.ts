// ============================================================
// Invio email per invito atleta
// ============================================================
// Design condiviso: email-design.ts (layout e colori 22Club)
// ============================================================

import { sendEmailViaResend } from '@/lib/communications/email-resend-client'
import { wrapEmailLayout, EMAIL_DESIGN } from '@/lib/communications/email-design'
import { createLogger } from '@/lib/logger'

const logger = createLogger('lib:invitations:send-invitation-email')

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export interface SendInvitationEmailParams {
  email: string
  nomeAtleta: string
  codiceInvito: string
  registrationLink: string
  expiresAt?: string | null
}

/**
 * Genera il template HTML per l'email di invito (stesso design delle altre proforme)
 */
function generateInvitationEmailHTML(params: SendInvitationEmailParams): string {
  const { nomeAtleta, codiceInvito, registrationLink, expiresAt } = params

  const expiresDate = expiresAt
    ? new Date(expiresAt).toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const safeNome = escapeHtml(nomeAtleta)
  const safeCodice = escapeHtml(codiceInvito)
  const safeExpires = expiresDate ? escapeHtml(expiresDate) : ''
  const safeLink = escapeHtml(registrationLink)

  const bodyHtml = `
    <p style="margin:0 0 16px 0; font-size:15px;">Ciao <strong>${safeNome}</strong>,</p>
    <p style="margin:0 0 20px 0;">Sei stato invitato a unirti a <strong>${EMAIL_DESIGN.defaultOrgName}</strong>, la piattaforma di gestione fitness per monitorare i tuoi progressi e rimanere in contatto con il tuo trainer.</p>
    <div class="box-accent">
      <div style="font-size:12px; text-transform:uppercase; letter-spacing:1px; opacity:0.95; margin-bottom:8px;">Codice invito</div>
      <div style="font-size:28px; font-weight:700; font-family: 'Courier New', monospace; letter-spacing:3px;">${safeCodice}</div>
    </div>
    <div style="text-align:center; margin:24px 0;">
      <a href="${registrationLink}" class="btn-primary">Registrati ora</a>
    </div>
    <div class="box-info">
      <p style="margin:0 0 8px 0; font-weight:600;">Come utilizzare il codice</p>
      <ol style="margin:8px 0 0 0; padding-left:20px;">
        <li>Clicca su "Registrati ora" qui sopra</li>
        <li>Inserisci il codice invito quando richiesto</li>
        <li>Completa la registrazione con i tuoi dati</li>
      </ol>
      ${expiresDate ? `<p style="margin:12px 0 0 0; color:#dc2626; font-weight:600;">⚠️ Questo invito scade il ${safeExpires}</p>` : ''}
    </div>
    <p style="margin:20px 0 0 0; font-size:14px; color:${EMAIL_DESIGN.textMuted};">Se il pulsante non funziona, copia questo link nel browser:</p>
    <p style="word-break:break-all; font-size:13px; color:${EMAIL_DESIGN.brandColor}; margin:8px 0 0 0;">${safeLink}</p>
  `.trim()

  return wrapEmailLayout({
    headerTitle: EMAIL_DESIGN.defaultOrgName,
    bodyHtml,
    footerBrand: `${EMAIL_DESIGN.defaultOrgName} – Il tuo centro fitness`,
    footerDisclaimer:
      'Questa email è stata inviata automaticamente. Se non hai richiesto questo invito, puoi ignorarla. Per supporto contatta il tuo trainer.',
    pageTitle: 'Invito a 22Club',
  })
}

/**
 * Invia email di invito atleta
 */
export async function sendInvitationEmail(
  params: SendInvitationEmailParams,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { email, nomeAtleta, codiceInvito } = params

    const subject = `🎉 Invito a 22Club - ${nomeAtleta}`
    const html = generateInvitationEmailHTML(params)

    logger.info('Invio email invito atleta', undefined, {
      email,
      nomeAtleta,
      codiceInvito,
    })

    const result = await sendEmailViaResend(email, subject, html)

    if (result.success) {
      logger.info('Email invito inviata con successo', undefined, {
        email,
        emailId: result.emailId,
      })
      return { success: true }
    } else {
      logger.error('Errore invio email invito', undefined, {
        email,
        error: result.error,
      })
      return {
        success: false,
        error: result.error || "Errore durante l'invio dell'email",
      }
    }
  } catch (error) {
    logger.error('Errore in sendInvitationEmail', error, {
      email: params.email,
      nomeAtleta: params.nomeAtleta,
      codiceInvito: params.codiceInvito,
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
    }
  }
}
