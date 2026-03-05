// ============================================================
// Template HTML per email (FASE C - Split File Lunghi)
// ============================================================
// Estratto da email.ts per migliorare manutenibilità
// ============================================================

/**
 * Genera HTML email da template
 */
export function generateEmailHTML(
  title: string,
  message: string,
  metadata?: Record<string, unknown>,
): string {
  const template = metadata?.email_template as string | undefined

  if (template) {
    // Se c'è un template personalizzato, usalo
    return template.replace('{{title}}', title).replace('{{message}}', message)
  }

  // Template HTML di default
  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
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
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #1a1a1a;
      margin-top: 0;
    }
    .message {
      color: #666;
      margin: 20px 0;
      white-space: pre-wrap;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <div class="message">${message.replace(/\n/g, '<br>')}</div>
    <div class="footer">
      <p>22Club - Il tuo centro fitness</p>
      <p>Questa email è stata inviata automaticamente. Non rispondere a questo messaggio.</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
