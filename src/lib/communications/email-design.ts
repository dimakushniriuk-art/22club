// ============================================================
// Design system condiviso per tutte le email 22Club (proforme)
// ============================================================
// Colori, layout (header/footer/container), componenti (CTA, box)
// Usato da: comunicazioni, invito atleta, riferimento per reset password
// ============================================================

export const EMAIL_DESIGN = {
  /** Colore principale brand (teal) */
  brandColor: '#02B3BF',
  brandColorDark: '#019aa6',
  /** Sfondo header gradient */
  headerGradient: 'linear-gradient(135deg, #02B3BF 0%, #019aa6 100%)',
  /** Sfondo footer tenue */
  footerBg: 'rgba(2, 179, 191, 0.12)',
  /** Bordo / accento */
  borderAccent: '#0f766e',
  /** Testo */
  textPrimary: '#0f172a',
  textSecondary: '#334155',
  textMuted: '#64748b',
  /** Sfondo pagina */
  pageBg: '#f1f5f9',
  /** Container */
  containerBg: '#ffffff',
  containerShadow: '0 1px 3px rgba(0,0,0,0.08)',
  /** CTA button */
  buttonBg: '#02B3BF',
  buttonHover: '#019aa6',
  /** Box evidenziato (codice invito, info) */
  boxAccentBg: 'linear-gradient(135deg, #02B3BF 0%, #019aa6 100%)',
  boxInfoBorder: '#02B3BF',
  boxInfoBg: 'rgba(2, 179, 191, 0.08)',
  /** Nome default org */
  defaultOrgName: '22Club',
} as const

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export interface EmailLayoutOptions {
  /** Titolo in header (nome org o titolo email) */
  headerTitle: string
  /** Contenuto HTML del body (già escapato se necessario) */
  bodyHtml: string
  /** Testo footer prima riga (es. nome org) */
  footerBrand?: string
  /** Testo footer seconda riga (disclaimer) */
  footerDisclaimer?: string
  /** Pagina title */
  pageTitle?: string
  /** URL logo (header centrato). Se assente si mostra il nome org come testo */
  logoUrl?: string
}

/**
 * Wrapper HTML comune: header brand, container, body, footer.
 * Usa EMAIL_DESIGN per stili coerenti.
 */
export function wrapEmailLayout(options: EmailLayoutOptions): string {
  const {
    headerTitle,
    bodyHtml,
    footerBrand = EMAIL_DESIGN.defaultOrgName,
    footerDisclaimer = 'Questa email è stata inviata automaticamente. Non rispondere a questo messaggio.',
    pageTitle = headerTitle,
  } = options

  const safeTitle = escapeHtml(headerTitle)
  const safeFooterBrand = escapeHtml(footerBrand)
  const safeFooterDisclaimer = escapeHtml(footerDisclaimer)
  const safePageTitle = escapeHtml(pageTitle)

  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safePageTitle}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: ${EMAIL_DESIGN.textPrimary}; background-color: ${EMAIL_DESIGN.pageBg}; }
    .wrapper { width: 100%; background-color: ${EMAIL_DESIGN.pageBg}; padding: 24px 16px; }
    .container { max-width: 560px; margin: 0 auto; background-color: ${EMAIL_DESIGN.containerBg}; border-radius: 12px; overflow: hidden; box-shadow: ${EMAIL_DESIGN.containerShadow}; }
    .header { background: ${EMAIL_DESIGN.headerGradient}; padding: 20px 24px; }
    .header-title { margin: 0; font-size: 20px; font-weight: 600; color: #ffffff; letter-spacing: -0.02em; }
    .body { padding: 28px 24px; color: ${EMAIL_DESIGN.textSecondary}; font-size: 15px; }
    .footer { padding: 20px 24px; background-color: ${EMAIL_DESIGN.footerBg}; border-top: 1px solid #e2e8f0; font-size: 12px; color: ${EMAIL_DESIGN.textMuted}; text-align: center; }
    .footer p { margin: 0 0 6px 0; }
    .footer .brand { font-weight: 600; color: ${EMAIL_DESIGN.borderAccent}; }
    .btn-primary { display: inline-block; background: ${EMAIL_DESIGN.buttonBg}; color: #fff !important; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; }
    .box-accent { background: ${EMAIL_DESIGN.boxAccentBg}; color: #fff; padding: 24px; border-radius: 10px; text-align: center; margin: 20px 0; }
    .box-info { background: ${EMAIL_DESIGN.boxInfoBg}; border-left: 4px solid ${EMAIL_DESIGN.boxInfoBorder}; padding: 16px 20px; margin: 20px 0; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <p class="header-title">${safeTitle}</p>
      </div>
      <div class="body">
        ${bodyHtml}
      </div>
      <div class="footer">
        <p class="brand">${safeFooterBrand}</p>
        <p>${safeFooterDisclaimer}</p>
      </div>
    </div>
  </div>
</body>
</html>
`.trim()
}

/**
 * Layout email tema dark (template 22club-email-dark.html).
 * Sfondo nero, logo al centro, testo bianco, info-box e CTA opzionali.
 */
export function wrapEmailLayoutDark(options: EmailLayoutOptions): string {
  const {
    headerTitle,
    bodyHtml,
    footerBrand = EMAIL_DESIGN.defaultOrgName,
    footerDisclaimer = 'Questa email è stata inviata automaticamente dal sistema. Non rispondere a questo messaggio.',
    pageTitle = headerTitle,
    logoUrl,
  } = options

  const safeTitle = escapeHtml(headerTitle)
  const safeFooterBrand = escapeHtml(footerBrand)
  const safeFooterDisclaimer = escapeHtml(footerDisclaimer)
  const safePageTitle = escapeHtml(pageTitle)
  const rawLogo = logoUrl && typeof logoUrl === 'string' ? logoUrl.trim() : ''
  const isPublicLogoUrl = rawLogo.startsWith('https://') || rawLogo.startsWith('http://')
  const safeLogoUrl = rawLogo && isPublicLogoUrl ? escapeHtml(rawLogo) : ''

  const headerContent = safeLogoUrl
    ? `<img src="${safeLogoUrl}" class="logo" alt="${safeTitle}" width="160" height="auto" style="max-width:160px;width:160px;height:auto;display:block;margin:0 auto;border:0;">`
    : `<span style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">${safeTitle}</span>`

  return `
<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${safePageTitle}</title>
<style>
body{margin:0;padding:0;background:#000000;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#ffffff;}
.wrapper{width:100%;background:#000000;padding:40px 16px;}
.container{max-width:560px;margin:0 auto;background:#0b0b0b;border-radius:14px;overflow:hidden;border:1px solid #1f1f1f;}
.header{padding:32px 24px;text-align:center;border-bottom:1px solid #1f1f1f;}
.logo{width:160px;}
.body{padding:32px 28px;}
.greeting{font-size:15px;color:#9ca3af;margin-bottom:12px;}
.title{font-size:22px;font-weight:600;margin-bottom:16px;color:#ffffff;}
.message{font-size:15px;line-height:1.7;color:#d1d5db;margin-bottom:28px;}
.info-box{background:#050505;border:1px solid #1f1f1f;border-radius:10px;padding:16px;margin-bottom:26px;font-size:14px;color:#cbd5e1;}
.button{display:inline-block;background:#02B3BF;color:#ffffff !important;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:600;}
.footer{border-top:1px solid #1f1f1f;padding:20px 24px;text-align:center;}
.brand{color:#02B3BF;font-weight:600;margin-bottom:6px;}
.small{font-size:12px;color:#6b7280;}
</style>
</head>
<body style="margin:0;padding:0;background:#000000;color:#ffffff;">
<div class="wrapper" style="width:100%;background:#000000;padding:40px 16px;">
<div class="container" style="max-width:560px;margin:0 auto;background:#0b0b0b;border-radius:14px;overflow:hidden;border:1px solid #1f1f1f;">
<div class="header" style="padding:32px 24px;text-align:center;border-bottom:1px solid #1f1f1f;">${headerContent}</div>
<div class="body" style="padding:32px 28px;color:#d1d5db;font-size:15px;">${bodyHtml}</div>
<div class="footer" style="border-top:1px solid #1f1f1f;padding:20px 24px;text-align:center;">
<div class="brand" style="color:#02B3BF;font-weight:600;margin-bottom:6px;">${safeFooterBrand}</div>
<div class="small" style="font-size:12px;color:#6b7280;">${safeFooterDisclaimer.replace(/\n/g, '<br>')}</div>
</div>
</div>
</div>
</body>
</html>
`.trim()
}
