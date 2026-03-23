/**
 * POST /api/calendar/notify-appointment-change
 * Comunicazione all'atleta (email + notifica in-app + push se previste dalle preferenze).
 * Body: { appointmentId, action: 'cancelled'|'modified'|'deleted', snapshot?, previous?, new? }
 */

import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { createLogger } from '@/lib/logger'
import { APPOINTMENT_TYPE_LABELS } from '@/lib/calendar-defaults'
import {
  sendAppointmentChangeEmail,
  type AppointmentChangeAction,
} from '@/lib/calendar/appointment-reminder-email'
import { NOTIFICATION_TYPES } from '@/lib/notifications/types'
import { sendPushNotification } from '@/lib/notifications/push'

const logger = createLogger('api:calendar:notify-appointment-change')

const DEDUP_MODIFIED_WINDOW_MS = 3 * 60 * 1000

type CustomType = { key: string; label: string }

type AppointmentNotifPrefs = {
  email: boolean
  push: boolean
  appointments: boolean
}

function mergeAppointmentNotifPrefs(raw: unknown): AppointmentNotifPrefs {
  const d: AppointmentNotifPrefs = { email: true, push: true, appointments: true }
  if (!raw || typeof raw !== 'object') return d
  const o = raw as Record<string, unknown>
  return {
    email: typeof o.email === 'boolean' ? o.email : d.email,
    push: typeof o.push === 'boolean' ? o.push : d.push,
    appointments: typeof o.appointments === 'boolean' ? o.appointments : d.appointments,
  }
}

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

async function isDuplicateModifiedNotification(params: {
  appointmentId: string
  athleteAuthUserId: string
  newStartsAt: string
}): Promise<boolean> {
  const admin = createAdminClient()
  const since = new Date(Date.now() - DEDUP_MODIFIED_WINDOW_MS).toISOString()
  const { data: rows, error } = await admin
    .from('notifications')
    .select('message')
    .eq('appointment_id', params.appointmentId)
    .eq('user_id', params.athleteAuthUserId)
    .eq('type', NOTIFICATION_TYPES.APPOINTMENTS)
    .gte('created_at', since)

  if (error) {
    logger.warn('Dedup notifiche: lettura fallita', undefined, { err: error.message })
    return false
  }

  for (const row of rows ?? []) {
    try {
      const j = JSON.parse((row as { message: string | null }).message || '{}') as {
        kind?: string
        newStartsAt?: string
      }
      if (j.kind === 'appointment_change' && j.newStartsAt === params.newStartsAt) return true
    } catch {
      /* ignore */
    }
  }
  return false
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)
    if (!user) {
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
        {
          error:
            'Per action=deleted è richiesto snapshot con athlete_id, starts_at, ends_at, type, staff_id',
        },
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
    /** ISO `starts_at` dopo modifica (drag/form); serve dedup e push */
    let modifiedNewStartsAt: string | undefined

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
        const nu = newData ?? {
          starts_at: row.starts_at,
          ends_at: row.ends_at,
          type: row.type,
          location: row.location,
        }
        modifiedNewStartsAt = nu.starts_at
        newDateFormatted = formatDate(nu.starts_at)
        newTimeFormatted = formatTimeRange(nu.starts_at, nu.ends_at)
        newTypeStr = nu.type
        newLocation = nu.location ?? '22 Club'
      }
    }

    if (!athleteId) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'no_athlete' }, { status: 200 })
    }

    const [profileRes, settingsRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, email, nome, cognome, user_id')
        .in('id', [athleteId, staffId!]),
      staffId
        ? supabase
            .from('staff_calendar_settings')
            .select('staff_id, custom_appointment_types')
            .eq('staff_id', staffId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ])

    const profiles = (profileRes.data ?? []) as {
      id: string
      email: string | null
      nome: string | null
      cognome: string | null
      user_id: string | null
    }[]
    const athleteProfile = profiles.find((p) => p.id === athleteId)
    const staffProfile = profiles.find((p) => p.id === staffId)
    const athleteAuthUserId = athleteProfile?.user_id?.trim() || null

    let notifPrefs: AppointmentNotifPrefs = mergeAppointmentNotifPrefs(null)
    if (athleteAuthUserId) {
      const { data: usRow } = await supabase
        .from('user_settings')
        .select('notification_settings')
        .eq('user_id', athleteAuthUserId)
        .maybeSingle()
      notifPrefs = mergeAppointmentNotifPrefs(usRow?.notification_settings)
    }

    if (!notifPrefs.appointments) {
      return NextResponse.json(
        { ok: true, skipped: true, reason: 'appointments_disabled' },
        {
          status: 200,
        },
      )
    }

    if (
      action === 'modified' &&
      modifiedNewStartsAt &&
      athleteAuthUserId &&
      (await isDuplicateModifiedNotification({
        appointmentId,
        athleteAuthUserId,
        newStartsAt: modifiedNewStartsAt,
      }))
    ) {
      return NextResponse.json({ ok: true, deduped: true }, { status: 200 })
    }

    const email = athleteProfile?.email?.trim() ?? ''

    const rawCustomTypes = (settingsRes.data as { custom_appointment_types?: unknown } | null)
      ?.custom_appointment_types
    const customTypes: CustomType[] = Array.isArray(rawCustomTypes)
      ? (rawCustomTypes as CustomType[])
      : []
    const typeLabelResolved = getTypeLabel(typeStr, customTypes)
    let newTypeLabelResolved: string | undefined =
      newTypeStr !== undefined ? getTypeLabel(newTypeStr, customTypes) : undefined
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
        const a = apt as {
          starts_at: string
          ends_at: string
          type: string
          location: string | null
        }
        modifiedNewStartsAt = a.starts_at
        newDateFormatted = formatDate(a.starts_at)
        newTimeFormatted = formatTimeRange(a.starts_at, a.ends_at)
        newTypeStr = a.type
        newTypeLabelResolved = getTypeLabel(a.type, customTypes)
        newLocation = a.location ?? '22 Club'
      }
    }

    let emailSent = false
    if (notifPrefs.email && email) {
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
        logger.error('Email notifica appuntamento fallita', undefined, {
          appointmentId,
          error: result.error,
        })
      } else {
        emailSent = true
      }
    } else if (notifPrefs.email && !email) {
      logger.debug('Email abilitata ma atleta senza indirizzo', undefined, {
        appointmentId,
        athleteId,
      })
    }

    let inAppCreated = false
    if (
      action === 'modified' &&
      notifPrefs.push &&
      athleteAuthUserId &&
      modifiedNewStartsAt &&
      newDateFormatted &&
      newTimeFormatted
    ) {
      const admin = createAdminClient()
      const metaJson = JSON.stringify({
        kind: 'appointment_change',
        action: 'modified',
        newStartsAt: modifiedNewStartsAt,
      })
      const notifTitle = 'Appuntamento aggiornato'
      const notifText = `Nuovo orario: ${newDateFormatted}, ${newTimeFormatted}`

      const { data: inserted, error: insErr } = await admin
        .from('notifications')
        .insert({
          user_id: athleteAuthUserId,
          title: notifTitle,
          body: notifText,
          message: metaJson,
          type: NOTIFICATION_TYPES.APPOINTMENTS,
          link: '/home/appuntamenti',
          action_text: 'Apri appuntamenti',
          appointment_id: appointmentId,
          sent_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (insErr) {
        logger.error('Inserimento notifica appuntamento fallito', insErr, { appointmentId })
      } else {
        inAppCreated = true
        const nid = (inserted as { id?: string } | null)?.id
        await sendPushNotification(
          athleteAuthUserId,
          notifTitle,
          notifText,
          undefined,
          undefined,
          { appointmentId, action: 'modified' },
          nid,
        )
      }
    }

    return NextResponse.json({
      ok: true,
      emailSent,
      inAppNotification: inAppCreated,
    })
  } catch (err) {
    logger.error('Errore notify-appointment-change', err)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
