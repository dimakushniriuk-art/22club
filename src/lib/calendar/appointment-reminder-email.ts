/**
 * Promemoria appuntamento: generazione .ics e invio email all'atleta (regola 1.15).
 * Dopo creazione appuntamento da staff: email con data/ora/tipo/luogo/staff + allegato .ics per Google Calendar.
 */

import { createLogger } from '@/lib/logger'
import { sendEmailViaResendWithAttachments } from '@/lib/communications/email-resend-client'

const logger = createLogger('lib:calendar:appointment-reminder-email')

/** Escape per contenuti testo in .ics (CRLF, virgole, backslash). */
function icsEscape(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n').replace(/\r/g, '')
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
  const noteBlock = notes?.trim()
    ? `<p style="margin:0 0 12px;color:#666;font-size:14px;"><strong>Note:</strong> ${escapeHtml(notes.trim())}</p>`
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
  const creditsLine = hasCount
    ? `Ad oggi (${escapeHtml(refDate)}) ti rimangono <strong>${lessonsRemaining}</strong> allenamenti.`
    : `Ad oggi (${escapeHtml(refDate)}) il numero di allenamenti rimasti non è al momento disponibile.`
  const thanksBlock =
    lessonsCompleted > 0
      ? `
  <div style="background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);border:1px solid #86efac;border-radius:8px;padding:16px;margin-bottom:20px;">
    <p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#166534;">Un messaggio da ${escapeHtml(staffName)}</p>
    <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.5;">Grazie per l'impegno e i progressi fatti finora: hai già portato a termine <strong>${lessonsCompleted}</strong> allenament${lessonsCompleted === 1 ? 'o' : 'i'}. Continua così!</p>
  </div>`
      : ''
  const creditsBlock = `
  <div style="background:${isLowCredits ? '#fef3c7' : hasCount ? '#ecfdf5' : '#f3f4f6'};border:1px solid ${isLowCredits ? '#f59e0b' : hasCount ? '#10b981' : '#d1d5db'};border-radius:8px;padding:16px;margin-bottom:20px;">
    ${isLowCredits ? '<p style="margin:0 0 8px;font-size:14px;color:#92400e;"><span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:#f59e0b;color:#fff;border-radius:4px;font-weight:700;margin-right:8px;">!</span><strong>Attenzione</strong></p>' : ''}
    <p style="margin:0 0 6px;font-size:16px;font-weight:600;color:#1a1a1a;">${creditsLine}</p>
    <p style="margin:8px 0 0;font-size:12px;color:#6b7280;">Il numero non include gli appuntamenti già prenotati e si riferisce ai crediti al momento dell'invio di questa email.</p>
  </div>`
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px;">
  <p style="margin:0 0 16px;">Ciao ${escapeHtml(athleteName)},</p>
  <p style="margin:0 0 20px;">Ti confermiamo il seguente appuntamento:</p>
  <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin-bottom:20px;">
    <p style="margin:0 0 8px;"><strong>${escapeHtml(typeLabel)}</strong></p>
    <p style="margin:0 0 8px;">📅 ${escapeHtml(dateFormatted)}</p>
    <p style="margin:0 0 8px;">🕐 ${escapeHtml(timeFormatted)}</p>
    <p style="margin:0 0 8px;">📍 ${escapeHtml(location)}</p>
    <p style="margin:0;">👤 ${escapeHtml(staffName)}</p>
  </div>
  ${thanksBlock}
  ${creditsBlock}
  ${noteBlock}
  <p style="margin:0 0 16px;">Puoi aggiungere l'evento al tuo calendario:</p>
  <p style="margin:0 0 24px;">
    <a href="${escapeHtml(googleCalendarUrl)}" style="display:inline-block;background:#14b8a6;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;">Aggiungi a Google Calendar</a>
  </p>
  <p style="margin:0;font-size:12px;color:#888;">In allegato trovi anche il file .ics da importare in qualsiasi calendario (Google, Apple, Outlook).</p>
  <p style="margin:24px 0 0;font-size:13px;color:#666;">A presto,<br><strong>22Club</strong></p>
</body>
</html>
`.trim()
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
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
  const description = `Appuntamento con ${staffName}. ${notes?.trim() ? `Note: ${notes.trim()}` : ''}`.trim()
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

  const result = await sendEmailViaResendWithAttachments(
    athleteEmail,
    subject,
    html,
    [{ filename: 'appuntamento.ics', content: Buffer.from(icsContent, 'utf-8') }],
  )
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
  const calendarUrl = 'https://calendar.google.com/calendar/u/0/r'
  const titleMap: Record<AppointmentChangeAction, string> = {
    cancelled: 'Appuntamento annullato',
    modified: 'Appuntamento modificato',
    deleted: 'Appuntamento eliminato',
  }
  const introMap: Record<AppointmentChangeAction, string> = {
    cancelled: `Il tuo appuntamento del <strong>${escapeHtml(dateFormatted)}</strong> alle <strong>${escapeHtml(timeFormatted)}</strong> (${escapeHtml(typeLabel)} con ${escapeHtml(staffName)}) è stato <strong>annullato</strong>.`,
    deleted: `Il tuo appuntamento del <strong>${escapeHtml(dateFormatted)}</strong> alle <strong>${escapeHtml(timeFormatted)}</strong> (${escapeHtml(typeLabel)} con ${escapeHtml(staffName)}) è stato <strong>eliminato definitivamente</strong>.`,
    modified: `Il tuo appuntamento è stato <strong>modificato</strong> da ${escapeHtml(staffName)}.<br><br>Prima: ${escapeHtml(dateFormatted)} – ${escapeHtml(timeFormatted)}, ${escapeHtml(typeLabel)}${location ? `, ${escapeHtml(location)}` : ''}.<br>Nuova data/ora: <strong>${escapeHtml(newDateFormatted ?? dateFormatted)}</strong> – <strong>${escapeHtml(newTimeFormatted ?? timeFormatted)}</strong>${newTypeLabel ? `, ${escapeHtml(newTypeLabel)}` : ''}${newLocation !== undefined && newLocation ? `, ${escapeHtml(newLocation)}` : ''}.`,
  }
  const ctaMap: Record<AppointmentChangeAction, string> = {
    cancelled: 'Ti invitiamo a <strong>rimuovere l\'evento</strong> dal tuo Google Calendar.',
    deleted: 'Ti invitiamo a <strong>rimuovere l\'evento</strong> dal tuo Google Calendar.',
    modified: 'Ti invitiamo ad <strong>aggiornare l\'evento</strong> nel tuo Google Calendar con le nuove date e orari.',
  }
  const _title = titleMap[action]
  const intro = introMap[action]
  const cta = ctaMap[action]
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px;">
  <p style="margin:0 0 16px;">Ciao ${escapeHtml(athleteName)},</p>
  <p style="margin:0 0 20px;">${intro}</p>
  <p style="margin:0 0 20px;">${cta}</p>
  <p style="margin:0 0 24px;">
    <a href="${escapeHtml(calendarUrl)}" style="display:inline-block;background:#14b8a6;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;">Apri Google Calendar</a>
  </p>
  <p style="margin:24px 0 0;font-size:13px;color:#666;">A presto,<br><strong>22Club</strong></p>
</body>
</html>
`.trim()
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
