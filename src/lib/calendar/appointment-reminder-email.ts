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
 * Costruisce HTML email promemoria (data, ora, tipo, luogo, staff, note) e link Google + allegato .ics.
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
  } = params
  const noteBlock = notes?.trim()
    ? `<p style="margin:0 0 12px;color:#666;font-size:14px;"><strong>Note:</strong> ${escapeHtml(notes.trim())}</p>`
    : ''
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
  } = params
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
