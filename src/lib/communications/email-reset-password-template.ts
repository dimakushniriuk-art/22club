// ============================================================
// Riferimento design per template Resend "password-reset-request"
// ============================================================
// Copia questo HTML nel dashboard Resend quando crei/aggiorni
// il template. Variabile obbligatoria: {{22club_reset_password_url}}
// ============================================================

import { EMAIL_DESIGN } from './email-design'

/**
 * HTML di riferimento per il template Resend "password-reset-request".
 * Nel dashboard Resend: crea un template con questo corpo e la variabile
 * {{22club_reset_password_url}} per il link di reset.
 */
export const RESEND_PASSWORD_RESET_HTML_REFERENCE = `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reimposta password - 22Club</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #0f172a; background-color: #f1f5f9; }
    .wrapper { width: 100%; background-color: #f1f5f9; padding: 24px 16px; }
    .container { max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #02B3BF 0%, #019aa6 100%); padding: 20px 24px; }
    .header-title { margin: 0; font-size: 20px; font-weight: 600; color: #ffffff; letter-spacing: -0.02em; }
    .body { padding: 28px 24px; color: #334155; font-size: 15px; }
    .btn-primary { display: inline-block; background: #02B3BF; color: #fff !important; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 16px 0; }
    .footer { padding: 20px 24px; background-color: rgba(2, 179, 191, 0.12); border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
    .footer p { margin: 0 0 6px 0; }
    .footer .brand { font-weight: 600; color: #0f766e; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <p class="header-title">${EMAIL_DESIGN.defaultOrgName}</p>
      </div>
      <div class="body">
        <p style="margin:0 0 16px 0;">Hai richiesto il reset della password. Clicca sul pulsante qui sotto per reimpostarla.</p>
        <p style="margin:0 0 8px 0;">Se non hai richiesto questa operazione, ignora questa email.</p>
        <div style="margin:24px 0;">
          <a href="{{22club_reset_password_url}}" class="btn-primary">Reimposta password</a>
        </div>
        <p style="font-size:13px; color:#64748b;">Se il pulsante non funziona, copia e incolla questo link nel browser:</p>
        <p style="word-break:break-all; font-size:12px; color:#02B3BF; margin:4px 0 0 0;">{{22club_reset_password_url}}</p>
      </div>
      <div class="footer">
        <p class="brand">${EMAIL_DESIGN.defaultOrgName}</p>
        <p>Questa email è stata inviata automaticamente. Non rispondere.</p>
      </div>
    </div>
  </div>
</body>
</html>
`.trim()
