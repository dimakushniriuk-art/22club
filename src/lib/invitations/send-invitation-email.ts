// ============================================================
// Invio email per invito atleta
// ============================================================

import { sendEmailViaResend } from '@/lib/communications/email-resend-client'
import { createLogger } from '@/lib/logger'

const logger = createLogger('lib:invitations:send-invitation-email')

export interface SendInvitationEmailParams {
  email: string
  nomeAtleta: string
  codiceInvito: string
  registrationLink: string
  expiresAt?: string | null
}

/**
 * Genera il template HTML per l'email di invito
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

  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invito a 22Club</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    h1 {
      color: #1a1a1a;
      margin-top: 0;
      font-size: 28px;
    }
    .greeting {
      font-size: 18px;
      color: #666;
      margin-bottom: 30px;
    }
    .code-box {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      text-align: center;
      margin: 30px 0;
    }
    .code-label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .code-value {
      font-size: 32px;
      font-weight: bold;
      font-family: 'Courier New', monospace;
      letter-spacing: 4px;
      margin: 10px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 30px 0;
      text-align: center;
    }
    .button:hover {
      opacity: 0.9;
    }
    .info-box {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .info-box p {
      margin: 10px 0;
      color: #666;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
    .warning {
      color: #dc3545;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Invito a 22Club</h1>
    </div>
    
    <div class="greeting">
      Ciao <strong>${nomeAtleta}</strong>,
    </div>
    
    <p>Sei stato invitato a unirti a <strong>22Club</strong>, la piattaforma di gestione fitness che ti permetterà di monitorare i tuoi progressi e rimanere in contatto con il tuo trainer.</p>
    
    <div class="code-box">
      <div class="code-label">Codice Invito</div>
      <div class="code-value">${codiceInvito}</div>
    </div>
    
    <div style="text-align: center;">
      <a href="${registrationLink}" class="button">Registrati Ora</a>
    </div>
    
    <div class="info-box">
      <p><strong>Come utilizzare il codice:</strong></p>
      <ol style="margin: 10px 0; padding-left: 20px; color: #666;">
        <li>Clicca sul pulsante "Registrati Ora" qui sopra</li>
        <li>Inserisci il codice invito quando richiesto</li>
        <li>Completa la registrazione con i tuoi dati</li>
        <li>Inizia a utilizzare 22Club!</li>
      </ol>
      ${expiresDate ? `<p class="warning">⚠️ Questo invito scade il ${expiresDate}</p>` : ''}
    </div>
    
    <p>Se non riesci a cliccare sul pulsante, copia e incolla questo link nel tuo browser:</p>
    <p style="word-break: break-all; color: #667eea; font-size: 14px;">${registrationLink}</p>
    
    <div class="footer">
      <p><strong>22Club</strong> - Il tuo centro fitness</p>
      <p>Questa email è stata inviata automaticamente. Se non hai richiesto questo invito, puoi ignorare questa email.</p>
      <p>Per domande o supporto, contatta il tuo trainer.</p>
    </div>
  </div>
</body>
</html>
  `.trim()
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
