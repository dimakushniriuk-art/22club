// ============================================================
// Template HTML per email (FASE C - Split File Lunghi)
// ============================================================
// Layout di default: design condiviso da email-design.ts
// ============================================================

import { wrapEmailLayoutDark, EMAIL_DESIGN } from './email-design'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function applyPlaceholders(
  html: string,
  title: string,
  message: string,
  metadata?: Record<string, unknown>,
): string {
  let out = html
    .replace(/\{\{title\}\}/g, escapeHtml(title))
    .replace(/\{\{message\}\}/g, message.replace(/\n/g, '<br>'))

  if (!metadata) return out

  const athleteName = typeof metadata.athlete_name === 'string' ? metadata.athlete_name : ''
  const orgName = typeof metadata.org_name === 'string' ? metadata.org_name : '22Club'
  const senderName = typeof metadata.sender_name === 'string' ? metadata.sender_name : ''
  const infoBlock = typeof metadata.info_block === 'string' ? metadata.info_block : ''
  const ctaLink = typeof metadata.cta_link === 'string' ? metadata.cta_link : '#'
  const ctaText = typeof metadata.cta_text === 'string' ? metadata.cta_text : ''
  const rawLogo = typeof metadata.logo_url === 'string' ? metadata.logo_url.trim() : ''
  const isPublicUrl = (url: string) =>
    url.length > 0 && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(url)
  const logoUrl = rawLogo && isPublicUrl(rawLogo) ? rawLogo : ''
  const TRANSPARENT_PIXEL =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
  const logoSrc = logoUrl || TRANSPARENT_PIXEL

  out = out
    .replace(/\{\{athlete_name\}\}/g, escapeHtml(athleteName))
    .replace(/\{\{org_name\}\}/g, escapeHtml(orgName))
    .replace(/\{\{sender_name\}\}/g, escapeHtml(senderName))
    .replace(/\{\{info_block\}\}/g, infoBlock.replace(/\n/g, '<br>'))
    .replace(/\{\{cta_link\}\}/g, escapeHtml(ctaLink))
    .replace(/\{\{cta_text\}\}/g, escapeHtml(ctaText))
    .replace(/LOGO_URL_QUI/g, escapeHtml(logoSrc))

  return out
}

/**
 * Genera HTML email da template.
 * Se metadata.email_template è presente, usa quel HTML e sostituisce i placeholder.
 * Altrimenti usa il layout di default con branding 22Club.
 * Placeholder supportati: {{title}}, {{message}}, {{athlete_name}}, {{org_name}}, {{sender_name}}
 */
export function generateEmailHTML(
  title: string,
  message: string,
  metadata?: Record<string, unknown>,
): string {
  const customTemplate = metadata?.email_template as string | undefined

  if (customTemplate && typeof customTemplate === 'string') {
    return applyPlaceholders(customTemplate, title, message, metadata)
  }

  const athleteName = typeof metadata?.athlete_name === 'string' ? metadata.athlete_name.trim() : ''
  const orgName = typeof metadata?.org_name === 'string' ? metadata.org_name.trim() : EMAIL_DESIGN.defaultOrgName
  const explicitLogo =
    typeof process.env.NEXT_PUBLIC_EMAIL_LOGO_URL === 'string' && process.env.NEXT_PUBLIC_EMAIL_LOGO_URL.trim()
      ? process.env.NEXT_PUBLIC_EMAIL_LOGO_URL.trim()
      : ''
  const baseUrl =
    typeof process.env.NEXT_PUBLIC_APP_URL === 'string'
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
      : ''
  const isPublicUrl = (url: string) =>
    url.length > 0 && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(url)
  const defaultLogoUrl =
    explicitLogo ||
    (baseUrl && isPublicUrl(baseUrl) ? `${baseUrl}/logo.png` : '')
  const logoUrl =
    (typeof metadata?.logo_url === 'string' ? metadata.logo_url.trim() : '') || defaultLogoUrl || undefined
  const isDataUri = (url: string) => url.startsWith('data:')
  const logoUrlForEmail =
    logoUrl && (isPublicUrl(logoUrl) || isDataUri(logoUrl)) ? logoUrl : undefined
  const infoBlock = typeof metadata?.info_block === 'string' ? metadata.info_block.trim() : ''
  const ctaLink = typeof metadata?.cta_link === 'string' ? metadata.cta_link.trim() : ''
  const ctaText = typeof metadata?.cta_text === 'string' ? metadata.cta_text.trim() : ''

  const greetingBlock = `<p class="greeting" style="font-size:15px;color:#9ca3af;margin:0 0 12px 0;">Ciao ${escapeHtml(athleteName)},</p>`
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>')
  const infoBoxBlock =
    infoBlock !== ''
      ? `<div class="info-box" style="background:#050505;border:1px solid #1f1f1f;border-radius:10px;padding:16px;margin-bottom:26px;font-size:14px;color:#cbd5e1;">${infoBlock.replace(/\n/g, '<br>')}</div>`
      : ''
  const buttonBlock =
    ctaLink && ctaText
      ? `<a href="${escapeHtml(ctaLink)}" class="button" style="display:inline-block;background:#02B3BF;color:#ffffff !important;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:600;">${escapeHtml(ctaText)}</a>`
      : ''

  const bodyHtml = [
    greetingBlock,
    `<h1 class="title" style="font-size:22px;font-weight:600;margin:0 0 16px 0;color:#ffffff;">${escapeHtml(title)}</h1>`,
    `<div class="message" style="font-size:15px;line-height:1.7;color:#d1d5db;margin-bottom:28px;">${safeMessage}</div>`,
    infoBoxBlock,
    buttonBlock,
  ]
    .filter(Boolean)
    .join('\n')

  return wrapEmailLayoutDark({
    headerTitle: orgName,
    bodyHtml,
    footerBrand: orgName,
    footerDisclaimer: 'Questa email è stata inviata automaticamente dal sistema.\nNon rispondere a questo messaggio.',
    pageTitle: title,
    logoUrl: logoUrlForEmail,
  })
}
