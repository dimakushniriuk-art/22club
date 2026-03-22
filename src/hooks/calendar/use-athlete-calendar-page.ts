// ============================================================
// Hook calendario atleta: appuntamenti solo suoi, trainer da get_my_trainer_profile
// Creazione/eliminazione solo per created_by_role === 'athlete'
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { useNotify } from '@/lib/ui/notify'
import type {
  AppointmentUI,
  CreateAppointmentData,
  EditAppointmentData,
  AppointmentColor,
} from '@/types/appointment'
import type { Tables } from '@/types/supabase'

const logger = createLogger('hooks:calendar:use-athlete-calendar-page')

type AppointmentRow = Tables<'appointments'>

const normalizeStatus = (status?: string | null): AppointmentUI['status'] => {
  switch (status) {
    case 'completato':
    case 'completed':
      return 'completato'
    case 'annullato':
    case 'cancelled':
      return 'annullato'
    case 'in_corso':
    case 'in-progress':
    case 'in_progress':
      return 'in_corso'
    default:
      return 'attivo'
  }
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

      // Conteggio prenotazioni per slot Libera (starts_at|ends_at) per UI "x/6"
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
            r.starts_at === s &&
            r.ends_at === e &&
            r.athlete_id != null &&
            r.cancelled_at == null &&
            r.status !== 'annullato',
        ).length
      }
      setSlotBookingCounts(slotBookingCounts)

      const staffIds = [...new Set(rows.map((r) => r.staff_id).filter(Boolean))]
      const athleteIds = [...new Set(rows.map((r) => r.athlete_id).filter(Boolean))] as string[]
      const staffNamesMap = new Map<string, string>()
      const athleteNamesMap = new Map<string, string>()
      if (staffIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, nome, cognome')
          .in('id', staffIds)
        profiles?.forEach((p: { id: string; nome?: string | null; cognome?: string | null }) => {
          staffNamesMap.set(p.id, [p.nome, p.cognome].filter(Boolean).join(' ').trim() || 'Trainer')
        })
      }
      const athleteAvatarMap = new Map<string, string | null>()
      if (athleteIds.length > 0) {
        const { data: athleteProfiles } = await supabase
          .from('profiles')
          .select('id, nome, cognome, avatar, avatar_url')
          .in('id', athleteIds)
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
          status: normalizeStatus(apt.status),
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
          const { data: settingsRow } = await supabase
            .from('staff_calendar_settings')
            .select('max_free_pass_athletes_per_slot')
            .eq('staff_id', staffId)
            .maybeSingle()
          const maxPerSlot =
            (settingsRow as { max_free_pass_athletes_per_slot?: number } | null)
              ?.max_free_pass_athletes_per_slot ?? 4
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
          const insertPayload = {
            org_id: orgId ?? data.org_id ?? '',
            org_id_text: orgId ?? data.org_id ?? null,
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
        notify(
          isSlotFull
            ? 'Questo orario è al completo (6/6). Scegli un altro slot tra quelli disponibili.'
            : msg || "Errore durante il salvataggio dell'appuntamento",
          'error',
          isSlotFull ? 'Slot pieno' : 'Errore',
        )
        throw err
      } finally {
        setLoading(false)
      }
    },
    [profileId, staffId, orgId, appointments, slotBookingCounts, fetchAppointments, notify],
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
    [appointments, fetchAppointments],
  )

  const handleEventResize = useCallback(
    async (appointmentId: string, newStart: Date, newEnd: Date) => {
      const apt = appointments.find((a) => a.id === appointmentId)
      if (apt?.created_by_role !== 'athlete') return
      try {
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
    [appointments, fetchAppointments],
  )

  return {
    appointments,
    slotBookingCounts,
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
