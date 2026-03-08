/**
 * POST /api/calendar/send-appointment-reminder
 * Invia email promemoria + .ics all'atleta per gli appuntamenti creati (regola 1.15).
 * Body: { appointmentIds: string[] }
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import { APPOINTMENT_TYPE_LABELS } from '@/lib/calendar-defaults'
import { sendAppointmentReminderEmail } from '@/lib/calendar/appointment-reminder-email'

const logger = createLogger('api:calendar:send-appointment-reminder')

type AppointmentRow = {
  id: string
  athlete_id: string | null
  staff_id: string
  starts_at: string
  ends_at: string
  type: string
  location: string | null
  notes: string | null
  is_open_booking_day?: boolean
}

type ProfileRow = { email: string | null; nome: string | null; cognome: string | null }
type CustomType = { key: string; label: string }

function getTypeLabel(type: string, customTypes: CustomType[]): string {
  const custom = customTypes?.find((c) => c.key === type)
  return custom?.label ?? APPOINTMENT_TYPE_LABELS[type] ?? type.replace(/_/g, ' ')
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    let body: { appointmentIds?: string[] }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Body JSON non valido' }, { status: 400 })
    }
    const ids = Array.isArray(body?.appointmentIds) ? body.appointmentIds : []
    if (ids.length === 0) {
      return NextResponse.json({ sent: 0, skipped: 0 })
    }

    const { data: appointments, error: aptError } = await supabase
      .from('appointments')
      .select('id, athlete_id, staff_id, starts_at, ends_at, type, location, notes, is_open_booking_day')
      .in('id', ids)

    if (aptError) {
      logger.error('Errore fetch appuntamenti', aptError, { ids })
      return NextResponse.json({ error: 'Errore caricamento appuntamenti' }, { status: 500 })
    }

    const list = (appointments ?? []) as AppointmentRow[]
    const toProcess = list.filter(
      (a) => a.athlete_id && !a.is_open_booking_day,
    )
    if (toProcess.length === 0) {
      return NextResponse.json({ sent: 0, skipped: ids.length })
    }

    const staffIds = [...new Set(toProcess.map((a) => a.staff_id))]
    const athleteIds = [...new Set(toProcess.map((a) => a.athlete_id!).filter(Boolean))]

    const [profilesRes, settingsRes] = await Promise.all([
      supabase.from('profiles').select('id, email, nome, cognome').in('id', [...staffIds, ...athleteIds]),
      supabase.from('staff_calendar_settings').select('staff_id, custom_appointment_types').in('staff_id', staffIds),
    ])

    const profiles = (profilesRes.data ?? []) as (ProfileRow & { id: string })[]
    const profileMap = new Map(profiles.map((p) => [p.id, p]))
    const settingsList = (settingsRes.data ?? []) as { staff_id: string; custom_appointment_types: unknown }[]
    const settingsByStaff = new Map<string, CustomType[]>(
      settingsList.map((s) => [
        s.staff_id,
        Array.isArray(s.custom_appointment_types)
          ? (s.custom_appointment_types as CustomType[]).filter((c) => c && typeof c.key === 'string' && typeof c.label === 'string')
          : [],
      ]),
    )

    let sent = 0
    for (const apt of toProcess) {
      const athlete = profileMap.get(apt.athlete_id!)
      const staff = profileMap.get(apt.staff_id)
      const email = athlete?.email?.trim()
      if (!email) {
        logger.debug('Atleta senza email, skip', undefined, { appointmentId: apt.id, athleteId: apt.athlete_id })
        continue
      }
      const staffName = staff ? [staff.nome, staff.cognome].filter(Boolean).join(' ') || 'Staff' : 'Staff'
      const athleteName = athlete ? [athlete.nome, athlete.cognome].filter(Boolean).join(' ') || 'Atleta' : 'Atleta'
      const customTypes = settingsByStaff.get(apt.staff_id) ?? []
      const typeLabel = getTypeLabel(apt.type, customTypes)

      const result = await sendAppointmentReminderEmail({
        appointmentId: apt.id,
        athleteEmail: email,
        athleteName,
        staffName,
        typeLabel,
        startsAt: apt.starts_at,
        endsAt: apt.ends_at,
        location: apt.location ?? null,
        notes: apt.notes ?? null,
      })
      if (result.success) sent++
    }

    return NextResponse.json({ sent, skipped: ids.length - sent })
  } catch (err) {
    logger.error('Errore send-appointment-reminder', err)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
