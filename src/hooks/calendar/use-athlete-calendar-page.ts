// ============================================================
// Hook calendario atleta: appuntamenti solo suoi, trainer da get_my_trainer_profile
// Creazione/eliminazione solo per created_by_role === 'athlete'
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { useNotify } from '@/lib/ui/notify'
import { DEFAULT_MAX_FREE_PASS_ATHLETES_PER_SLOT } from '@/lib/calendar-defaults'
import type {
  AppointmentUI,
  CreateAppointmentData,
  EditAppointmentData,
  AppointmentColor,
} from '@/types/appointment'
import type { Tables } from '@/types/supabase'
import { normalizeAppointmentStatus } from '@/lib/appointment-utils'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'

const logger = createLogger('hooks:calendar:use-athlete-calendar-page')

type AppointmentRow = Tables<'appointments'>

/** Stesso criterio della selezione slot in handleFormSubmit (intervallo prenotazione ⊆ intervallo slot). */
function isAthleteBookingInsideOpenSlot(
  bookingStart: string,
  bookingEnd: string,
  slotStart: string,
  slotEnd: string,
): boolean {
  const bs = new Date(bookingStart).getTime()
  const be = new Date(bookingEnd).getTime()
  const ss = new Date(slotStart).getTime()
  const se = new Date(slotEnd).getTime()
  return ss <= bs && be <= se
}

/** Colore evento creato dall'atleta vs dal trainer */
const ATHLETE_CREATED_COLOR: AppointmentColor = 'verde'
const TRAINER_CREATED_COLOR: AppointmentColor = 'azzurro'

export function useAthleteCalendarPage(profileId: string | null) {
  const { notify } = useNotify()
  const [appointments, setAppointments] = useState<AppointmentUI[]>([])
  const [slotBookingCounts, setSlotBookingCounts] = useState<Record<string, number>>({})
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)
  const [staffId, setStaffId] = useState<string | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [trainerName, setTrainerName] = useState<string | null>(null)
  const [trainerLoading, setTrainerLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  /** Allineato a staff_calendar_settings / trigger check_open_slot_capacity (default 4) */
  const [openBookingSlotMax, setOpenBookingSlotMax] = useState(
    DEFAULT_MAX_FREE_PASS_ATHLETES_PER_SLOT,
  )

  // org_id del profilo atleta (per insert appuntamenti)
  useEffect(() => {
    if (!profileId) return
    supabase
      .from('profiles')
      .select('org_id')
      .eq('id', profileId)
      .single()
      .then(({ data }) => {
        if (data?.org_id) setOrgId(data.org_id as string)
      })
  }, [profileId])

  // Trainer assegnato (pt_id = staff_id per creazione)
  useEffect(() => {
    let cancelled = false
    setTrainerLoading(true)
    supabase.rpc('get_my_trainer_profile').then(({ data, error }) => {
      if (cancelled) return
      setTrainerLoading(false)
      if (error || !Array.isArray(data) || data.length === 0) {
        setStaffId(null)
        setTrainerName(null)
        return
      }
      const row = data[0] as {
        pt_id?: string
        pt_nome?: string | null
        pt_cognome?: string | null
      }
      setStaffId(row?.pt_id ?? null)
      const name = [row?.pt_nome, row?.pt_cognome].filter(Boolean).join(' ').trim()
      setTrainerName(name || null)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!staffId) {
      setOpenBookingSlotMax(DEFAULT_MAX_FREE_PASS_ATHLETES_PER_SLOT)
      return
    }
    let cancelled = false
    void supabase
      .from('staff_calendar_settings')
      .select('max_free_pass_athletes_per_slot')
      .eq('staff_id', staffId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        const n = (data as { max_free_pass_athletes_per_slot?: number } | null)
          ?.max_free_pass_athletes_per_slot
        setOpenBookingSlotMax(
          typeof n === 'number' && n > 0 ? n : DEFAULT_MAX_FREE_PASS_ATHLETES_PER_SLOT,
        )
      })
    return () => {
      cancelled = true
    }
  }, [staffId])

  const fetchAppointments = useCallback(async () => {
    if (!profileId) return
    try {
      setAppointmentsLoading(true)
      // Nessun filtro athlete_id: RLS restituisce propri appuntamenti + sabato/domenica (visibili a tutti)
      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
          id,
          org_id,
          athlete_id,
          staff_id,
          starts_at,
          ends_at,
          type,
          status,
          color,
          location,
          notes,
          cancelled_at,
          created_at,
          created_by_role,
          is_open_booking_day
        `,
        )
        .order('starts_at', { ascending: true })

      if (error) {
        logger.error('Errore caricamento appuntamenti atleta', error)
        return
      }

      type Row = AppointmentRow & { created_by_role?: string | null; is_open_booking_day?: boolean }
      const rows = (data ?? []) as unknown as Row[]

      // Conteggio prenotazioni per slot Libera (chiave = marker slot) per UI "x/N" — allineato al matching per contenimento
      const slotBookingCounts: Record<string, number> = {}
      const openSlotKeys = new Set(
        rows
          .filter((r) => r.is_open_booking_day && r.starts_at && r.ends_at)
          .map((r) => `${r.starts_at}|${r.ends_at}`),
      )
      for (const key of openSlotKeys) {
        const [s, e] = key.split('|')
        slotBookingCounts[key] = rows.filter(
          (r) =>
            r.starts_at &&
            r.ends_at &&
            r.athlete_id != null &&
            r.cancelled_at == null &&
            r.status !== 'annullato' &&
            isAthleteBookingInsideOpenSlot(r.starts_at, r.ends_at, s, e),
        ).length
      }
      setSlotBookingCounts(slotBookingCounts)

      const staffIds = [...new Set(rows.map((r) => r.staff_id).filter(Boolean))]
      const athleteIds = [...new Set(rows.map((r) => r.athlete_id).filter(Boolean))] as string[]
      const staffNamesMap = new Map<string, string>()
      const athleteNamesMap = new Map<string, string>()
      if (staffIds.length > 0) {
        for (const idChunk of chunkForSupabaseIn(staffIds)) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, nome, cognome')
            .in('id', idChunk)
          profiles?.forEach((p: { id: string; nome?: string | null; cognome?: string | null }) => {
            staffNamesMap.set(
              p.id,
              [p.nome, p.cognome].filter(Boolean).join(' ').trim() || 'Trainer',
            )
          })
        }
      }
      const athleteAvatarMap = new Map<string, string | null>()
      if (athleteIds.length > 0) {
        for (const idChunk of chunkForSupabaseIn(athleteIds)) {
          const { data: athleteProfiles } = await supabase
            .from('profiles')
            .select('id, nome, cognome, avatar, avatar_url')
            .in('id', idChunk)
          athleteProfiles?.forEach(
            (p: {
              id: string
              nome?: string | null
              cognome?: string | null
              avatar?: string | null
              avatar_url?: string | null
            }) => {
              athleteNamesMap.set(
                p.id,
                [p.nome, p.cognome].filter(Boolean).join(' ').trim() || 'Atleta',
              )
              athleteAvatarMap.set(p.id, p.avatar_url ?? p.avatar ?? null)
            },
          )
        }
      }

      const mapped: AppointmentUI[] = rows.map((apt) => {
        const isOpenSlot = apt.is_open_booking_day === true
        const createdByRole = (
          apt.created_by_role === 'athlete'
            ? 'athlete'
            : apt.created_by_role === 'admin'
              ? 'admin'
              : 'trainer'
        ) as 'athlete' | 'trainer' | 'admin'
        const displayColor =
          createdByRole === 'athlete'
            ? ATHLETE_CREATED_COLOR
            : (apt.color as AppointmentColor) || TRAINER_CREATED_COLOR
        return {
          id: apt.id,
          org_id: apt.org_id ?? orgId ?? null,
          athlete_id: apt.athlete_id ?? null,
          staff_id: apt.staff_id,
          starts_at: apt.starts_at,
          ends_at: apt.ends_at,
          type: (apt.type as AppointmentUI['type']) || 'allenamento',
          status: normalizeAppointmentStatus(apt.status),
          color: displayColor,
          location: apt.location,
          notes: apt.notes,
          cancelled_at: apt.cancelled_at,
          created_at: apt.created_at ?? new Date().toISOString(),
          created_by_role: createdByRole,
          is_open_booking_day: isOpenSlot,
          athlete_name: isOpenSlot
            ? 'Libera prenotazione'
            : (athleteNamesMap.get(apt.athlete_id!) ?? 'Atleta'),
          athlete_avatar_url: isOpenSlot
            ? undefined
            : (athleteAvatarMap.get(apt.athlete_id!) ?? undefined),
          staff_name: staffNamesMap.get(apt.staff_id) ?? trainerName ?? 'Trainer',
          trainer_name: staffNamesMap.get(apt.staff_id) ?? trainerName ?? 'Trainer',
        }
      })
      setAppointments(mapped)
    } catch (err) {
      logger.error('Errore fetch appuntamenti atleta', err)
    } finally {
      setAppointmentsLoading(false)
    }
  }, [profileId, orgId, trainerName])

  useEffect(() => {
    void fetchAppointments()
  }, [fetchAppointments])

  /** Stessa regola della creazione: intervallo ⊆ slot Libera del trainer (pre-check prima del write). */
  const assertAthleteMoveInsideOpenSlot = useCallback(
    (newStartIso: string, newEndIso: string) => {
      if (!staffId) return
      const openSlots = appointments.filter(
        (a) => a.is_open_booking_day && a.staff_id === staffId && !a.cancelled_at,
      )
      const matchingSlot = openSlots.find((s) =>
        isAthleteBookingInsideOpenSlot(newStartIso, newEndIso, s.starts_at, s.ends_at),
      )
      if (!matchingSlot) {
        notify(
          'L’orario deve essere compreso in uno slot "Libera prenotazione" del tuo trainer.',
          'warning',
          'Attenzione',
        )
        throw new Error('ATHLETE_BOOKING_OUTSIDE_OPEN_SLOT')
      }
    },
    [appointments, staffId, notify],
  )

  const handleFormSubmit = useCallback(
    async (data: CreateAppointmentData, editing: EditAppointmentData | null) => {
      if (!staffId || !profileId) {
        notify("Nessun trainer assegnato. Contatta l'amministratore.", 'warning', 'Attenzione')
        return
      }
      if (!orgId && !editing?.id) {
        notify(
          'Organizzazione non disponibile. Riprova dopo il login.',
          'error',
          'Errore creazione appuntamento',
        )
        return
      }
      setLoading(true)
      try {
        const startsAt = new Date(data.starts_at).toISOString()
        const endsAt = new Date(data.ends_at).toISOString()
        if (!editing?.id) {
          const openSlots = appointments.filter(
            (a) => a.is_open_booking_day && a.staff_id === staffId && !a.cancelled_at,
          )
          const matchingSlot = openSlots.find(
            (s) =>
              new Date(s.starts_at).getTime() <= new Date(startsAt).getTime() &&
              new Date(endsAt).getTime() <= new Date(s.ends_at).getTime(),
          )
          if (!matchingSlot) {
            notify(
              'L’orario deve essere compreso in uno slot "Libera prenotazione" del tuo trainer.',
              'warning',
              'Attenzione',
            )
            setLoading(false)
            return
          }
          const slotKey = `${matchingSlot.starts_at}|${matchingSlot.ends_at}`
          const currentCount = slotBookingCounts[slotKey] ?? 0
          const maxPerSlot = openBookingSlotMax
          if (currentCount >= maxPerSlot) {
            notify(
              `Questo slot è al completo (${maxPerSlot}/${maxPerSlot}). Scegli un altro orario.`,
              'error',
              'Slot pieno',
            )
            setLoading(false)
            return
          }
        }
        if (editing?.id) {
          const { error } = await supabase
            .from('appointments')
            .update({
              starts_at: startsAt,
              ends_at: endsAt,
              type: data.type || 'allenamento',
              status: data.status || 'attivo',
              color: data.color ?? ATHLETE_CREATED_COLOR,
              notes: data.notes ?? null,
              location: data.location ?? null,
            })
            .eq('id', editing.id)
          if (error) throw error
        } else {
          const insertOrgId = orgId ?? data.org_id ?? null
          if (!insertOrgId) {
            notify(
              'Organizzazione non disponibile. Riprova dopo il login.',
              'error',
              'Errore creazione appuntamento',
            )
            setLoading(false)
            return
          }
          const insertPayload = {
            org_id: insertOrgId,
            org_id_text: insertOrgId,
            athlete_id: profileId,
            staff_id: staffId,
            starts_at: startsAt,
            ends_at: endsAt,
            type: data.type || 'allenamento',
            status: 'attivo',
            color: data.color ?? ATHLETE_CREATED_COLOR,
            notes: data.notes ?? null,
            location: data.location ?? null,
            created_by_role: 'athlete',
          }
          const { error } = await supabase.from('appointments').insert([insertPayload])
          if (error) throw error
        }
        await fetchAppointments()
      } catch (err) {
        logger.error('Errore salvataggio appuntamento', err)
        const msg =
          err instanceof Error
            ? err.message
            : typeof err === 'object' && err !== null && 'message' in err
              ? String((err as { message: unknown }).message)
              : ''
        const isSlotFull =
          typeof msg === 'string' && (msg.includes('SLOT_FULL') || msg.includes('al completo'))
        const slotFullUserMsg =
          typeof msg === 'string' && msg.includes('SLOT_FULL:')
            ? (msg.split('SLOT_FULL:')[1] ?? msg)
            : msg
        notify(
          isSlotFull
            ? slotFullUserMsg ||
                `Questo orario è al completo (${openBookingSlotMax}/${openBookingSlotMax}). Scegli un altro orario.`
            : msg || "Errore durante il salvataggio dell'appuntamento",
          'error',
          isSlotFull ? 'Slot pieno' : 'Errore',
        )
        throw err
      } finally {
        setLoading(false)
      }
    },
    [
      profileId,
      staffId,
      orgId,
      appointments,
      slotBookingCounts,
      fetchAppointments,
      notify,
      openBookingSlotMax,
    ],
  )

  const handleCancel = useCallback(
    async (appointmentId: string) => {
      setLoading(true)
      try {
        await supabase
          .from('appointments')
          .update({
            cancelled_at: new Date().toISOString(),
            status: 'annullato',
          })
          .eq('id', appointmentId)
        await fetchAppointments()
      } catch (err) {
        logger.error('Errore cancellazione appuntamento', err)
      } finally {
        setLoading(false)
      }
    },
    [fetchAppointments],
  )

  const handleDelete = useCallback(
    async (appointmentId: string) => {
      setLoading(true)
      try {
        const { error } = await supabase.from('appointments').delete().eq('id', appointmentId)
        if (error) throw error
        await fetchAppointments()
      } catch (err) {
        logger.error('Errore eliminazione appuntamento', err)
      } finally {
        setLoading(false)
      }
    },
    [fetchAppointments],
  )

  const handleEventDrop = useCallback(
    async (appointmentId: string, newStart: Date, newEnd: Date) => {
      const apt = appointments.find((a) => a.id === appointmentId)
      if (apt?.created_by_role !== 'athlete') return
      try {
        assertAthleteMoveInsideOpenSlot(newStart.toISOString(), newEnd.toISOString())
        const { error } = await supabase
          .from('appointments')
          .update({
            starts_at: newStart.toISOString(),
            ends_at: newEnd.toISOString(),
          })
          .eq('id', appointmentId)
        if (error) throw error
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === appointmentId
              ? { ...a, starts_at: newStart.toISOString(), ends_at: newEnd.toISOString() }
              : a,
          ),
        )
      } catch (err) {
        logger.error('Errore spostamento appuntamento', err)
        await fetchAppointments()
        throw err
      }
    },
    [appointments, fetchAppointments, assertAthleteMoveInsideOpenSlot],
  )

  const handleEventResize = useCallback(
    async (appointmentId: string, newStart: Date, newEnd: Date) => {
      const apt = appointments.find((a) => a.id === appointmentId)
      if (apt?.created_by_role !== 'athlete') return
      try {
        assertAthleteMoveInsideOpenSlot(newStart.toISOString(), newEnd.toISOString())
        const { error } = await supabase
          .from('appointments')
          .update({
            starts_at: newStart.toISOString(),
            ends_at: newEnd.toISOString(),
          })
          .eq('id', appointmentId)
        if (error) throw error
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === appointmentId
              ? { ...a, starts_at: newStart.toISOString(), ends_at: newEnd.toISOString() }
              : a,
          ),
        )
      } catch (err) {
        logger.error('Errore ridimensionamento appuntamento', err)
        await fetchAppointments()
        throw err
      }
    },
    [appointments, fetchAppointments, assertAthleteMoveInsideOpenSlot],
  )

  return {
    appointments,
    slotBookingCounts,
    openBookingSlotMax,
    appointmentsLoading,
    staffId,
    trainerName,
    trainerLoading,
    loading,
    fetchAppointments,
    handleFormSubmit,
    handleCancel,
    handleDelete,
    handleEventDrop,
    handleEventResize,
  }
}
