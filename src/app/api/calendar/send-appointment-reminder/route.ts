/**
 * POST /api/calendar/send-appointment-reminder
 * Invia email promemoria + .ics all'atleta per gli appuntamenti creati (regola 1.15).
 * Body: { appointmentIds: string[] }
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { createLogger } from '@/lib/logger'
import { APPOINTMENT_TYPE_LABELS } from '@/lib/calendar-defaults'
import { sendAppointmentReminderEmail } from '@/lib/calendar/appointment-reminder-email'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'

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
type LessonCounterRow = { athlete_id: string; count: number | null; lesson_type?: string }

function getTypeLabel(type: string, customTypes: CustomType[]): string {
  const custom = customTypes?.find((c) => c.key === type)
  return custom?.label ?? APPOINTMENT_TYPE_LABELS[type] ?? type.replace(/_/g, ' ')
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)
    if (!user) {
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

    const appointmentsMerged: AppointmentRow[] = []
    for (const idChunk of chunkForSupabaseIn(ids)) {
      const { data: appointments, error: aptError } = await supabase
        .from('appointments')
        .select(
          'id, athlete_id, staff_id, starts_at, ends_at, type, location, notes, is_open_booking_day',
        )
        .in('id', idChunk)
      if (aptError) {
        logger.error('Errore fetch appuntamenti', aptError, { ids })
        return NextResponse.json({ error: 'Errore caricamento appuntamenti' }, { status: 500 })
      }
      appointmentsMerged.push(...((appointments ?? []) as AppointmentRow[]))
    }

    const list = appointmentsMerged
    const toProcess = list.filter((a) => a.athlete_id && !a.is_open_booking_day)
    if (toProcess.length === 0) {
      return NextResponse.json({ sent: 0, skipped: ids.length })
    }

    const staffIds = [...new Set(toProcess.map((a) => a.staff_id))]
    const athleteIds = [...new Set(toProcess.map((a) => a.athlete_id!).filter(Boolean))]
    const profileIdsForFetch = [...new Set([...staffIds, ...athleteIds])]

    const profilesFetch = async (): Promise<(ProfileRow & { id: string })[]> => {
      const merged: (ProfileRow & { id: string })[] = []
      for (const idChunk of chunkForSupabaseIn(profileIdsForFetch)) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, nome, cognome')
          .in('id', idChunk)
        if (error) {
          logger.error('Errore fetch profili reminder', error)
          return []
        }
        merged.push(...((data ?? []) as (ProfileRow & { id: string })[]))
      }
      return merged
    }

    const settingsFetch = async () => {
      const merged: {
        staff_id: string
        custom_appointment_types: unknown
      }[] = []
      for (const chunk of chunkForSupabaseIn(staffIds)) {
        const { data, error } = await supabase
          .from('staff_calendar_settings')
          .select('staff_id, custom_appointment_types')
          .in('staff_id', chunk)
        if (error) {
          logger.error('Errore fetch settings reminder', error)
          return []
        }
        merged.push(...((data ?? []) as typeof merged))
      }
      return merged
    }

    const countersFetch = async () => {
      const merged: LessonCounterRow[] = []
      for (const chunk of chunkForSupabaseIn(athleteIds)) {
        const { data, error } = await supabase
          .from('lesson_counters')
          .select('athlete_id, count, lesson_type')
          .in('athlete_id', chunk)
        if (error) {
          logger.error('Errore fetch lesson_counters reminder', error)
          return []
        }
        merged.push(...((data ?? []) as LessonCounterRow[]))
      }
      return merged
    }

    const completedFetch = async () => {
      const merged: { athlete_id: string | null }[] = []
      for (const chunk of chunkForSupabaseIn(athleteIds)) {
        const { data, error } = await supabase
          .from('appointments')
          .select('athlete_id')
          .in('athlete_id', chunk)
          .eq('status', 'completato')
        if (error) {
          logger.error('Errore fetch appointments completati reminder', error)
          return []
        }
        merged.push(...(data ?? []))
      }
      return merged
    }

    const [profiles, settingsList, countersRows, completedRows] = await Promise.all([
      profilesFetch(),
      settingsFetch(),
      countersFetch(),
      completedFetch(),
    ])
    const byAthlete = new Map<string, LessonCounterRow[]>()
    ;(countersRows ?? []).forEach((r: LessonCounterRow) => {
      const list = byAthlete.get(r.athlete_id) ?? []
      list.push(r)
      byAthlete.set(r.athlete_id, list)
    })
    const lessonCountMap = new Map<string, number>()
    byAthlete.forEach((rows, athleteId) => {
      const training = rows.find((r) => r.lesson_type === 'training')
      const row = training ?? rows[0]
      lessonCountMap.set(athleteId, row?.count ?? 0)
    })

    const lessonsCompletedByAthlete = new Map<string, number>()
    ;(completedRows ?? []).forEach((r: { athlete_id: string | null }) => {
      if (r.athlete_id == null) return
      lessonsCompletedByAthlete.set(
        r.athlete_id,
        (lessonsCompletedByAthlete.get(r.athlete_id) ?? 0) + 1,
      )
    })

    // Fallback: stesso calcolo del tab Amministrativo (payments - appuntamenti completati) se lesson_counters vuoto
    const missingAthletes = athleteIds.filter((id) => !lessonCountMap.has(id))
    if (missingAthletes.length > 0) {
      const paymentRows: { athlete_id: string; lessons_purchased?: number | null }[] = []
      for (const chunk of chunkForSupabaseIn(missingAthletes)) {
        const payRes = await supabase
          .from('payments')
          .select('athlete_id, lessons_purchased')
          .in('athlete_id', chunk)
          .eq('status', 'completed')
        paymentRows.push(...((payRes.data ?? []) as typeof paymentRows))
      }
      const purchasedByAthlete = new Map<string, number>()
      paymentRows.forEach((r: { athlete_id: string; lessons_purchased?: number | null }) => {
        const cur = purchasedByAthlete.get(r.athlete_id) ?? 0
        purchasedByAthlete.set(r.athlete_id, cur + (r.lessons_purchased ?? 0))
      })
      missingAthletes.forEach((aid) => {
        const used = lessonsCompletedByAthlete.get(aid) ?? 0
        const purchased = purchasedByAthlete.get(aid) ?? 0
        lessonCountMap.set(aid, Math.max(0, purchased - used))
      })
    }

    const profileMap = new Map(profiles.map((p) => [p.id, p]))
    const settingsByStaff = new Map<string, CustomType[]>(
      settingsList.map((s) => [
        s.staff_id,
        Array.isArray(s.custom_appointment_types)
          ? (s.custom_appointment_types as CustomType[]).filter(
              (c) => c && typeof c.key === 'string' && typeof c.label === 'string',
            )
          : [],
      ]),
    )

    let sent = 0
    for (const apt of toProcess) {
      const athlete = profileMap.get(apt.athlete_id!)
      const staff = profileMap.get(apt.staff_id)
      const email = athlete?.email?.trim()
      if (!email) {
        logger.debug('Atleta senza email, skip', undefined, {
          appointmentId: apt.id,
          athleteId: apt.athlete_id,
        })
        continue
      }
      const staffName = staff
        ? [staff.nome, staff.cognome].filter(Boolean).join(' ') || 'Staff'
        : 'Staff'
      const athleteName = athlete
        ? [athlete.nome, athlete.cognome].filter(Boolean).join(' ') || 'Atleta'
        : 'Atleta'
      const customTypes = settingsByStaff.get(apt.staff_id) ?? []
      const typeLabel = getTypeLabel(apt.type, customTypes)

      const lessonsRemaining = apt.athlete_id ? lessonCountMap.get(apt.athlete_id) : undefined
      const lessonsCompleted = apt.athlete_id
        ? (lessonsCompletedByAthlete.get(apt.athlete_id) ?? 0)
        : 0
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
        lessonsRemaining,
        lessonsCompleted,
      })
      if (result.success) sent++
    }

    return NextResponse.json({ sent, skipped: ids.length - sent })
  } catch (err) {
    logger.error('Errore send-appointment-reminder', err)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
