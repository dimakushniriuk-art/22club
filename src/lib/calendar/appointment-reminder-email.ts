/**
 * Promemoria appuntamento: generazione .ics e invio email all'atleta (regola 1.15).
 * Dopo creazione appuntamento da staff: email con data/ora/tipo/luogo/staff + allegato .ics per Google Calendar.
 */

import { createLogger } from '@/lib/logger'
import { sendEmailViaResendWithAttachments } from '@/lib/communications/email-resend-client'

const logger = createLogger('lib:calendar:appointment-reminder-email')

/** Design system email dark premium 22Club — vedi `docs/22club-email-master-spec.md`. */
const EMAIL_FONT =
  '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif'

const LOGO_22CLUB_EMAIL_URL =
  'https://icibqnmtacibgnhaidlz.supabase.co/storage/v1/object/public/logo/LOGO%2022club%20per%20sfondo%20nero.png'

const E = {
  outer: '#000000',
  card: '#0f1115',
  border: '#1d2430',
  block: '#12161c',
  primary: '#02B3BF',
  textMain: '#f5f7fa',
  textSec: '#a7b0bc',
  muted: '#6b7280',
  micro: '#7c8796',
} as const

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderKvRows(rows: { k: string; v: string }[]): string {
  return rows
    .map((row, i) => {
      const bottom = i < rows.length - 1 ? `border-bottom:1px solid ${E.border};` : ''
      return `<tr>
  <td style="padding:12px 0;${bottom}font-family:${EMAIL_FONT};font-size:13px;color:${E.micro};vertical-align:top;width:42%;">${escapeHtml(row.k)}</td>
  <td align="right" style="padding:12px 0;${bottom}font-family:${EMAIL_FONT};font-size:16px;font-weight:600;color:${E.textMain};text-align:right;vertical-align:top;">${escapeHtml(row.v)}</td>
</tr>`
    })
    .join('')
}

function renderKvInfoCard(rows: { k: string; v: string }[]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 24px 0;background-color:${E.block};border:1px solid ${E.border};border-radius:14px;">
<tr><td style="padding:18px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${renderKvRows(rows)}</table>
</td></tr></table>`
}

function renderSubsectionKvCard(heading: string, rows: { k: string; v: string }[]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 20px 0;background-color:${E.block};border:1px solid ${E.border};border-radius:14px;">
<tr><td style="padding:18px;">
<p style="margin:0 0 14px;font-family:${EMAIL_FONT};font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${E.primary};">${escapeHtml(heading)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${renderKvRows(rows)}</table>
</td></tr></table>`
}

/**
 * Wrapper master: table layout, stili inline, card dark premium (spec 22Club email).
 */
function wrap22ClubMasterEmail(opts: {
  metaTitle: string
  label: string
  title: string
  introHtml: string
  mainHtml: string
  cta?: { href: string; label: string }
  linkFallbackUrl?: string
  preFooterHtml?: string
}): string {
  const f = EMAIL_FONT
  const ctaAndFallback = opts.cta
    ? `<tr>
  <td align="center" style="padding:12px 28px 16px 28px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;">
      <tr>
        <td align="center" bgcolor="${E.primary}" style="border-radius:12px;background-color:${E.primary};">
          <a href="${escapeHtml(opts.cta.href)}" style="display:inline-block;padding:14px 26px;font-family:${f};font-size:16px;font-weight:700;line-height:1.2;color:#ffffff !important;text-decoration:none;border-radius:12px;">${escapeHtml(opts.cta.label)}</a>
        </td>
      </tr>
    </table>
  </td>
</tr>
${
  opts.linkFallbackUrl
    ? `<tr>
  <td style="padding:0 28px 28px 28px;">
    <p style="margin:0 0 10px;font-family:${f};font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${E.micro};">Link diretto</p>
    <p style="margin:0 0 10px;font-family:${f};font-size:15px;line-height:1.7;color:${E.textSec};">Se il pulsante non funziona, copia e incolla questo indirizzo nel browser.</p>
    <p style="margin:0;word-break:break-all;font-family:${f};font-size:13px;line-height:1.5;">
      <a href="${escapeHtml(opts.linkFallbackUrl)}" style="color:${E.primary};text-decoration:underline;">${escapeHtml(opts.linkFallbackUrl)}</a>
    </p>
  </td>
</tr>`
    : ''
}`
    : ''

  const preFooter = opts.preFooterHtml
    ? `<tr><td style="padding:0 28px 28px 28px;">${opts.preFooterHtml}</td></tr>`
    : ''

  const footerRow = `<tr>
  <td style="padding:24px 28px 32px 28px;border-top:1px solid ${E.border};">
    <p style="margin:0 0 12px;font-family:${f};font-size:12px;line-height:1.65;color:${E.muted};text-align:center;">Questa è un'email automatica di sistema. Ti chiediamo di non rispondere a questo messaggio, salvo diversa indicazione.</p>
    <p style="margin:0;font-family:${f};font-size:12px;font-weight:600;color:${E.primary};text-align:center;">22Club</p>
  </td>
</tr>`

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${escapeHtml(opts.metaTitle)}</title>
</head>
<body style="margin:0;padding:0;background-color:${E.outer};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${E.outer};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;max-width:560px;width:100%;background-color:${E.card};border:1px solid ${E.border};border-radius:20px;overflow:hidden;">
          <tr>
            <td align="center" style="padding:32px 28px 8px 28px;">
              <img src="${LOGO_22CLUB_EMAIL_URL}" width="140" height="auto" alt="22Club" style="display:block;margin:0 auto;border:0;outline:none;text-decoration:none;max-width:140px;height:auto;">
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:8px 28px 12px 28px;">
              <p style="margin:0;font-family:${f};font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${E.primary};">${escapeHtml(opts.label)}</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 28px 20px 28px;">
              <h1 style="margin:0;font-family:${f};font-size:30px;font-weight:700;line-height:1.2;letter-spacing:-0.02em;color:${E.textMain};">${escapeHtml(opts.title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 16px 28px;">${opts.introHtml}</td>
          </tr>
          <tr>
            <td style="padding:0 28px 0 28px;">${opts.mainHtml}</td>
          </tr>
          ${ctaAndFallback}
          ${preFooter}
          ${footerRow}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/** Escape per contenuti testo in .ics (CRLF, virgole, backslash). */
function icsEscape(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '')
}

/**
 * Genera contenuto iCalendar (.ics) per un appuntamento.
 * Formato VCALENDAR con un VEVENT.
 */
export function generateIcs(params: {
  title: string
  description: string
  location: string
  startsAt: string
  endsAt: string
  /** UID univoco (es. appointment id) */
  uid: string
}): string {
  const { title, description, location, startsAt, endsAt, uid } = params
  const formatDt = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const dtStart = formatDt(startsAt)
  const dtEnd = formatDt(endsAt)
  const now = formatDt(new Date().toISOString())
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//22Club//Appuntamento//IT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}@22club`,
    `DTSTAMP:${now}Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${icsEscape(title)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    `LOCATION:${icsEscape(location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}

/**
 * Link "Aggiungi a Google Calendar" (apre il form precompilato di Google).
 */
export function getGoogleCalendarUrl(params: {
  title: string
  description: string
  location: string
  startsAt: string
  endsAt: string
}): string {
  const { title, description, location, startsAt, endsAt } = params
  const formatDt = (iso: string) => {
    const d = new Date(iso)
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    const h = String(d.getUTCHours()).padStart(2, '0')
    const min = String(d.getUTCMinutes()).padStart(2, '0')
    const s = String(d.getUTCSeconds()).padStart(2, '0')
    return `${y}${m}${day}T${h}${min}${s}Z`
  }
  const base = 'https://calendar.google.com/calendar/render'
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: description,
    location,
    dates: `${formatDt(startsAt)}/${formatDt(endsAt)}`,
  })
  return `${base}?${q.toString()}`
}

/**
 * Costruisce HTML email promemoria (data, ora, tipo, luogo, staff, note, allenamenti rimasti) e link Google + allegato .ics.
 */
function buildReminderHtml(params: {
  athleteName: string
  staffName: string
  typeLabel: string
  dateFormatted: string
  timeFormatted: string
  location: string
  notes: string | null
  googleCalendarUrl: string
  /** Data di riferimento per il conteggio (es. "giovedì 12 marzo 2026") */
  referenceDateFormatted?: string
  /** Allenamenti/lezioni rimanenti al momento dell'invio; se undefined non si mostra il blocco */
  lessonsRemaining?: number
  /** Allenamenti già svolti (appuntamenti completati); per blocco ringraziamento dal trainer */
  lessonsCompleted?: number
}): string {
  const {
    athleteName,
    staffName,
    typeLabel,
    dateFormatted,
    timeFormatted,
    location,
    notes,
    googleCalendarUrl,
    referenceDateFormatted,
    lessonsRemaining,
    lessonsCompleted = 0,
  } = params
  const f = EMAIL_FONT

  const introHtml = `<p style="margin:0 0 18px;font-family:${f};font-size:16px;line-height:1.7;color:${E.textSec};">Ciao ${escapeHtml(athleteName)},</p>
<p style="margin:0;font-family:${f};font-size:16px;line-height:1.7;color:${E.textSec};">Ti confermiamo il seguente appuntamento.</p>`

  const detailCard = renderKvInfoCard([
    { k: 'Servizio', v: typeLabel },
    { k: 'Data', v: dateFormatted },
    { k: 'Ora', v: timeFormatted },
    { k: 'Luogo', v: location },
    { k: 'Referente', v: staffName },
  ])

  const thanksBlock =
    lessonsCompleted > 0
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 24px 0;background-color:${E.block};border:1px solid ${E.border};border-left:3px solid ${E.primary};border-radius:14px;">
<tr><td style="padding:18px;">
<p style="margin:0 0 10px;font-family:${f};font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${E.primary};">Messaggio dal trainer</p>
<p style="margin:0;font-family:${f};font-size:16px;line-height:1.7;color:${E.textSec};">Un messaggio da <strong style="color:${E.textMain};">${escapeHtml(staffName)}</strong>. Grazie per l'impegno: hai già completato <strong style="color:${E.textMain};">${String(lessonsCompleted)}</strong> allenament${lessonsCompleted === 1 ? 'o' : 'i'}. Continua così.</p>
</td></tr></table>`
      : ''

  const hasCount = lessonsRemaining !== undefined
  const isLowCredits = hasCount && lessonsRemaining <= 1
  const refDate =
    referenceDateFormatted ??
    new Date().toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  const creditsMain = hasCount
    ? `Ad oggi (${escapeHtml(refDate)}) ti rimangono <strong style="color:${E.textMain};">${String(lessonsRemaining)}</strong> allenamenti.`
    : `Ad oggi (${escapeHtml(refDate)}) il numero di allenamenti rimasti non è al momento disponibile.`

  const creditsLeftRule = isLowCredits ? `border-left:3px solid #f59e0b;` : ''
  const creditsTitle = isLowCredits
    ? `<p style="margin:0 0 10px;font-family:${f};font-size:13px;font-weight:700;color:${E.textMain};">Attenzione</p>`
    : ''

  const creditsBlock = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 24px 0;background-color:${E.block};border:1px solid ${E.border};${creditsLeftRule}border-radius:14px;">
<tr><td style="padding:18px;">
${creditsTitle}
<p style="margin:0 0 8px;font-family:${f};font-size:16px;line-height:1.65;color:${E.textSec};">${creditsMain}</p>
<p style="margin:0;font-family:${f};font-size:12px;line-height:1.5;color:${E.muted};">Il numero non include gli appuntamenti già prenotati e si riferisce ai crediti al momento dell'invio di questa email.</p>
</td></tr></table>`

  const noteBlock = notes?.trim()
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 24px 0;background-color:${E.block};border:1px solid ${E.border};border-radius:14px;">
<tr><td style="padding:18px;">
<p style="margin:0 0 10px;font-family:${f};font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${E.primary};">Note</p>
<p style="margin:0;font-family:${f};font-size:15px;line-height:1.65;color:${E.textSec};">${escapeHtml(notes.trim())}</p>
</td></tr></table>`
    : ''

  const calendarIntro = `<p style="margin:0 0 20px;font-family:${f};font-size:16px;line-height:1.7;color:${E.textSec};">Puoi aggiungere l'evento al calendario con il pulsante qui sotto.</p>`

  const mainHtml =
    detailCard + thanksBlock + creditsBlock + noteBlock + calendarIntro

  const preFooterHtml = `<p style="margin:0;font-family:${f};font-size:13px;line-height:1.65;color:${E.muted};text-align:center;">In allegato trovi il file <strong style="color:${E.textSec};">.ics</strong> per importare l'evento in Google Calendar, Apple Calendar o Outlook.</p>`

  return wrap22ClubMasterEmail({
    metaTitle: `Promemoria appuntamento — 22Club`,
    label: 'Promemoria',
    title: 'Il tuo appuntamento',
    introHtml,
    mainHtml,
    cta: { href: googleCalendarUrl, label: 'Aggiungi a Google Calendar' },
    linkFallbackUrl: googleCalendarUrl,
    preFooterHtml,
  })
}

export interface SendAppointmentReminderParams {
  appointmentId: string
  athleteEmail: string
  athleteName: string
  staffName: string
  typeLabel: string
  startsAt: string
  endsAt: string
  location: string | null
  notes: string | null
  /** Allenamenti rimanenti (lesson_counters) al momento dell'invio; opzionale */
  lessonsRemaining?: number
  /** Allenamenti già svolti (appuntamenti completati); per blocco ringraziamento dal trainer */
  lessonsCompleted?: number
}

/**
 * Invia email promemoria all'atleta con allegato .ics.
 */
export async function sendAppointmentReminderEmail(
  params: SendAppointmentReminderParams,
): Promise<{ success: boolean; error?: string }> {
  const {
    appointmentId,
    athleteEmail,
    athleteName,
    staffName,
    typeLabel,
    startsAt,
    endsAt,
    location,
    notes,
    lessonsRemaining,
    lessonsCompleted = 0,
  } = params
  const referenceDateFormatted = new Date().toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const title = `${typeLabel} - 22Club`
  const description =
    `Appuntamento con ${staffName}. ${notes?.trim() ? `Note: ${notes.trim()}` : ''}`.trim()
  const dateFormatted = new Date(startsAt).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const timeFormatted = `${new Date(startsAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', hour12: false })} – ${new Date(endsAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', hour12: false })}`
  const googleCalendarUrl = getGoogleCalendarUrl({
    title,
    description,
    location: location || '22 Club',
    startsAt,
    endsAt,
  })
  const html = buildReminderHtml({
    athleteName,
    staffName,
    typeLabel,
    dateFormatted,
    timeFormatted,
    location: location || '22 Club',
    notes,
    googleCalendarUrl,
    referenceDateFormatted,
    lessonsRemaining,
    lessonsCompleted,
  })
  const icsContent = generateIcs({
    title,
    description,
    location: location || '22 Club',
    startsAt,
    endsAt,
    uid: appointmentId,
  })
  const subject = `Promemoria: ${typeLabel} il ${dateFormatted}`

  const result = await sendEmailViaResendWithAttachments(athleteEmail, subject, html, [
    { filename: 'appuntamento.ics', content: Buffer.from(icsContent, 'utf-8') },
  ])
  if (!result.success) {
    logger.error('Invio promemoria appuntamento fallito', undefined, {
      appointmentId,
      to: athleteEmail,
      error: result.error,
    })
    return { success: false, error: result.error }
  }
  logger.info('Promemoria appuntamento inviato', undefined, {
    appointmentId,
    to: athleteEmail,
    emailId: result.emailId,
  })
  return { success: true }
}

// ---------------------------------------------------------------------------
// Notifica cambio appuntamento (annullato / modificato / eliminato)
// ---------------------------------------------------------------------------

export type AppointmentChangeAction = 'cancelled' | 'modified' | 'deleted'

export interface SendAppointmentChangeParams {
  athleteEmail: string
  athleteName: string
  staffName: string
  action: AppointmentChangeAction
  /** Dati appuntamento (originali per cancelled/deleted; precedenti per modified) */
  dateFormatted: string
  timeFormatted: string
  typeLabel: string
  location: string
  /** Solo per modified: nuovi data/ora/tipo/luogo */
  newDateFormatted?: string
  newTimeFormatted?: string
  newTypeLabel?: string
  newLocation?: string
}

function buildAppointmentChangeHtml(params: SendAppointmentChangeParams): string {
  const {
    athleteName,
    staffName,
    action,
    dateFormatted,
    timeFormatted,
    typeLabel,
    location,
    newDateFormatted,
    newTimeFormatted,
    newTypeLabel,
    newLocation,
  } = params
  const f = EMAIL_FONT
  const calendarUrl = 'https://calendar.google.com/calendar/u/0/r'

  const titleMap: Record<AppointmentChangeAction, string> = {
    cancelled: 'Appuntamento annullato',
    modified: 'Appuntamento modificato',
    deleted: 'Appuntamento eliminato',
  }

  const baseRows = [
    { k: 'Data', v: dateFormatted },
    { k: 'Ora', v: timeFormatted },
    { k: 'Servizio', v: typeLabel },
    { k: 'Luogo', v: location || '—' },
    { k: 'Referente', v: staffName },
  ]

  let introSecond = ''
  let mainHtml = ''

  if (action === 'modified') {
    introSecond = `L'appuntamento è stato aggiornato da <strong style="color:${E.textMain};">${escapeHtml(staffName)}</strong>. Qui sotto trovi il riepilogo prima e dopo la modifica.`
    const afterRows = [
      { k: 'Data', v: newDateFormatted ?? dateFormatted },
      { k: 'Ora', v: newTimeFormatted ?? timeFormatted },
      { k: 'Servizio', v: newTypeLabel ?? typeLabel },
      {
        k: 'Luogo',
        v:
          newLocation !== undefined && newLocation.trim()
            ? newLocation.trim()
            : location || '—',
      },
      { k: 'Referente', v: staffName },
    ]
    mainHtml =
      renderSubsectionKvCard('Situazione precedente', baseRows) +
      renderSubsectionKvCard('Nuovo appuntamento', afterRows) +
      `<p style="margin:0;font-family:${f};font-size:16px;line-height:1.7;color:${E.textSec};">Aggiorna o crea l'evento nel calendario con le nuove informazioni.</p>`
  } else if (action === 'cancelled') {
    introSecond = `Il seguente appuntamento è stato <strong style="color:${E.textMain};">annullato</strong>.`
    mainHtml =
      renderKvInfoCard(baseRows) +
      `<p style="margin:0;font-family:${f};font-size:16px;line-height:1.7;color:${E.textSec};">Se avevi salvato l'evento, ti invitiamo a <strong style="color:${E.textMain};">rimuoverlo</strong> da Google Calendar.</p>`
  } else {
    introSecond = `Il seguente appuntamento è stato <strong style="color:${E.textMain};">eliminato definitivamente</strong>.`
    mainHtml =
      renderKvInfoCard(baseRows) +
      `<p style="margin:0;font-family:${f};font-size:16px;line-height:1.7;color:${E.textSec};">Se era presente sul calendario, ti invitiamo a <strong style="color:${E.textMain};">rimuovere l'evento</strong>.</p>`
  }

  const introHtml = `<p style="margin:0 0 18px;font-family:${f};font-size:16px;line-height:1.7;color:${E.textSec};">Ciao ${escapeHtml(athleteName)},</p>
<p style="margin:0;font-family:${f};font-size:16px;line-height:1.7;color:${E.textSec};">${introSecond}</p>`

  return wrap22ClubMasterEmail({
    metaTitle: `${titleMap[action]} — 22Club`,
    label: 'Appuntamento',
    title: titleMap[action],
    introHtml,
    mainHtml,
    cta: { href: calendarUrl, label: 'Apri Google Calendar' },
    linkFallbackUrl: calendarUrl,
  })
}

export async function sendAppointmentChangeEmail(
  params: SendAppointmentChangeParams,
): Promise<{ success: boolean; error?: string }> {
  const { athleteEmail, action } = params
  const subjectMap: Record<AppointmentChangeAction, string> = {
    cancelled: '22Club – Appuntamento annullato',
    modified: '22Club – Appuntamento modificato',
    deleted: '22Club – Appuntamento eliminato',
  }
  const subject = subjectMap[action]
  const html = buildAppointmentChangeHtml(params)
  const result = await sendEmailViaResendWithAttachments(athleteEmail, subject, html)
  if (!result.success) {
    logger.error('Invio email cambio appuntamento fallito', undefined, {
      to: athleteEmail,
      action,
      error: result.error,
    })
    return { success: false, error: result.error }
  }
  logger.info('Email cambio appuntamento inviata', undefined, {
    to: athleteEmail,
    action,
    emailId: result.emailId,
  })
  return { success: true }
}
