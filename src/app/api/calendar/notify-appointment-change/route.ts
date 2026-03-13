/**
 * POST /api/calendar/notify-appointment-change
 * Invia email all'atleta quando un appuntamento è annullato, modificato o eliminato.
 * Chiede di aggiornare/rimuovere l'evento nel Google Calendar.
 * Body: { appointmentId, action: 'cancelled'|'modified'|'deleted', snapshot?, previous?, new? }
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import { APPOINTMENT_TYPE_LABELS } from '@/lib/calendar-defaults'
import {
  sendAppointmentChangeEmail,
  type AppointmentChangeAction,
} from '@/lib/calendar/appointment-reminder-email'

const logger = createLogger('api:calendar:notify-appointment-change')

type CustomType = { key: string; label: string }

function getTypeLabel(type: string, customTypes: CustomType[]): string {
  const custom = customTypes?.find((c) => c.key === type)
  return custom?.label ?? APPOINTMENT_TYPE_LABELS[type] ?? type.replace(/_/g, ' ')
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTimeRange(startsAt: string, endsAt: string): string {
  const s = new Date(startsAt).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const e = new Date(endsAt).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  return `${s} – ${e}`
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

    let body: {
      appointmentId?: string
      action?: AppointmentChangeAction
      snapshot?: {
        athlete_id: string
        starts_at: string
        ends_at: string
        type: string
        location?: string | null
        staff_id: string
      }
      previous?: { starts_at: string; ends_at: string; type: string; location?: string | null }
      new?: { starts_at: string; ends_at: string; type: string; location?: string | null }
    }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Body JSON non valido' }, { status: 400 })
    }

    const { appointmentId, action, snapshot, previous, new: newData } = body
    if (!appointmentId || !action || !['cancelled', 'modified', 'deleted'].includes(action)) {
      return NextResponse.json(
        { error: 'Parametri mancanti: appointmentId e action (cancelled|modified|deleted)' },
        { status: 400 },
      )
    }

    if (action === 'deleted' && !snapshot?.athlete_id) {
      return NextResponse.json(
        { error: 'Per action=deleted è richiesto snapshot con athlete_id, starts_at, ends_at, type, staff_id' },
        { status: 400 },
      )
    }

    let athleteId: string | null = null
    let staffId: string | null = null
    let dateFormatted: string
    let timeFormatted: string
    let typeStr: string
    let location: string
    let newDateFormatted: string | undefined
    let newTimeFormatted: string | undefined
    let newTypeStr: string | undefined
    let newLocation: string | undefined

    if (action === 'deleted' && snapshot) {
      athleteId = snapshot.athlete_id
      staffId = snapshot.staff_id
      dateFormatted = formatDate(snapshot.starts_at)
      timeFormatted = formatTimeRange(snapshot.starts_at, snapshot.ends_at)
      typeStr = snapshot.type
      location = snapshot.location ?? '22 Club'
    } else {
      const { data: apt, error: aptError } = await supabase
        .from('appointments')
        .select('id, athlete_id, staff_id, starts_at, ends_at, type, location')
        .eq('id', appointmentId)
        .single()

      if (aptError || !apt) {
        logger.warn('Appuntamento non trovato', undefined, { appointmentId, action })
        return NextResponse.json(
          { error: action === 'deleted' ? 'Snapshot richiesto' : 'Appuntamento non trovato' },
          { status: 404 },
        )
      }

      const row = apt as {
        athlete_id: string | null
        staff_id: string
        starts_at: string
        ends_at: string
        type: string
        location: string | null
      }
      athleteId = row.athlete_id
      staffId = row.staff_id
      location = row.location ?? '22 Club'
      if (action === 'modified' && previous) {
        dateFormatted = formatDate(previous.starts_at)
        timeFormatted = formatTimeRange(previous.starts_at, previous.ends_at)
        typeStr = previous.type
      } else {
        dateFormatted = formatDate(row.starts_at)
        timeFormatted = formatTimeRange(row.starts_at, row.ends_at)
        typeStr = row.type
      }
      if (action === 'modified') {
        const nu = newData ?? { starts_at: row.starts_at, ends_at: row.ends_at, type: row.type, location: row.location }
        newDateFormatted = formatDate(nu.starts_at)
        newTimeFormatted = formatTimeRange(nu.starts_at, nu.ends_at)
        newTypeStr = nu.type
        newLocation = nu.location ?? '22 Club'
      }
    }

    if (!athleteId) {
      return NextResponse.json(
        { error: 'Appuntamento senza atleta; email non inviata' },
        { status: 200 },
      )
    }

    const [profileRes, settingsRes] = await Promise.all([
      supabase.from('profiles').select('id, email, nome, cognome').in('id', [athleteId, staffId!]),
      staffId
        ? supabase
            .from('staff_calendar_settings')
            .select('staff_id, custom_appointment_types')
            .eq('staff_id', staffId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ])

    const profiles = (profileRes.data ?? []) as { id: string; email: string | null; nome: string | null; cognome: string | null }[]
    const athleteProfile = profiles.find((p) => p.id === athleteId)
    const staffProfile = profiles.find((p) => p.id === staffId)
    const email = athleteProfile?.email?.trim()
    if (!email) {
      logger.debug('Atleta senza email, skip', undefined, { appointmentId, athleteId })
      return NextResponse.json({ sent: false, reason: 'no_email' })
    }

    const rawCustomTypes = (settingsRes.data as { custom_appointment_types?: unknown } | null)?.custom_appointment_types
    const customTypes: CustomType[] = Array.isArray(rawCustomTypes) ? (rawCustomTypes as CustomType[]) : []
    const typeLabelResolved = getTypeLabel(typeStr, customTypes)
    let newTypeLabelResolved: string | undefined = newTypeStr !== undefined ? getTypeLabel(newTypeStr, customTypes) : undefined
    const staffName = staffProfile
      ? [staffProfile.nome, staffProfile.cognome].filter(Boolean).join(' ') || 'Staff'
      : 'Staff'
    const athleteName = athleteProfile
      ? [athleteProfile.nome, athleteProfile.cognome].filter(Boolean).join(' ') || 'Atleta'
      : 'Atleta'

    if (action === 'modified' && !newDateFormatted) {
      const { data: apt } = await supabase
        .from('appointments')
        .select('starts_at, ends_at, type, location')
        .eq('id', appointmentId)
        .single()
      if (apt) {
        const a = apt as { starts_at: string; ends_at: string; type: string; location: string | null }
        newDateFormatted = formatDate(a.starts_at)
        newTimeFormatted = formatTimeRange(a.starts_at, a.ends_at)
        newTypeStr = a.type
        newTypeLabelResolved = getTypeLabel(a.type, customTypes)
        newLocation = a.location ?? '22 Club'
      }
    }

    const result = await sendAppointmentChangeEmail({
      athleteEmail: email,
      athleteName,
      staffName,
      action,
      dateFormatted,
      timeFormatted,
      typeLabel: typeLabelResolved,
      location,
      newDateFormatted,
      newTimeFormatted,
      newTypeLabel: newTypeLabelResolved,
      newLocation,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    return NextResponse.json({ sent: true })
  } catch (err) {
    logger.error('Errore notify-appointment-change', err)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
