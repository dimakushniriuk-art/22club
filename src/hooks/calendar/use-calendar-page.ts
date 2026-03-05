// ============================================================
// Hook per gestione pagina calendario (FASE C - Split File Lunghi)
// ============================================================
// Estratto da calendario/page.tsx per migliorare manutenibilità
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
// Validazione sovrapposizione rimossa per permettere più atleti nello stesso orario
// import { checkAppointmentOverlap } from '@/lib/appointment-utils'
import { createLogger } from '@/lib/logger'
import { useNotify } from '@/lib/ui/notify'
import type {
  AppointmentUI,
  CreateAppointmentData,
  EditAppointmentData,
  AppointmentColor,
} from '@/types/appointment'
import type { Tables } from '@/types/supabase'

const logger = createLogger('hooks:calendar:use-calendar-page')

type AppointmentRow = Tables<'appointments'>
type ProfileRow = Tables<'profiles'>

const normalizeAppointmentStatus = (status?: string | null): AppointmentUI['status'] => {
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

/** Genera le coppie starts_at/ends_at per ripetizione settimanale (stesso giorno e orario). */
function getRecurrenceSlots(
  firstStartsAt: string,
  firstEndsAt: string,
  recurrence: '2_weeks' | '1_month' | '6_months' | '1_year',
): { starts_at: string; ends_at: string }[] {
  const firstStart = new Date(firstStartsAt)
  const firstEnd = new Date(firstEndsAt)
  const durationMs = firstEnd.getTime() - firstStart.getTime()
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000
  let endLimitMs: number
  switch (recurrence) {
    case '2_weeks':
      endLimitMs = 14 * 24 * 60 * 60 * 1000
      break
    case '1_month':
      endLimitMs = 30 * 24 * 60 * 60 * 1000
      break
    case '6_months':
      endLimitMs = 180 * 24 * 60 * 60 * 1000
      break
    case '1_year':
      endLimitMs = 365 * 24 * 60 * 60 * 1000
      break
    default:
      return [{ starts_at: firstStartsAt, ends_at: firstEndsAt }]
  }
  const slots: { starts_at: string; ends_at: string }[] = []
  const limitTime = firstStart.getTime() + endLimitMs
  for (let t = firstStart.getTime(); t <= limitTime; t += oneWeekMs) {
    const start = new Date(t)
    const end = new Date(t + durationMs)
    slots.push({ starts_at: start.toISOString(), ends_at: end.toISOString() })
  }
  return slots
}

export function useCalendarPage() {
  // Nota: router e searchParams potrebbero essere usati in futuro per navigazione/filtri URL
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const searchParams = useSearchParams()
  const { notify } = useNotify()

  const [appointments, setAppointments] = useState<AppointmentUI[]>([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)
  const [athletes, setAthletes] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [athletesLoading, setAthletesLoading] = useState(true)
  const [staffProfileId, setStaffProfileId] = useState<string | null>(null)
  const [staffOrgId, setStaffOrgId] = useState<string | null>(null)
  const [staffRole, setStaffRole] = useState<string | null>(null)
  const [staffDisplayName, setStaffDisplayName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Carica il profilo dello staff corrente (id, org_id, role per insert e lista atleti)
  useEffect(() => {
    async function fetchStaffProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('id, nome, cognome, org_id, role')
          .eq('user_id', user.id)
          .single()

        if (profile) {
          const p = profile as { id: string; nome?: string | null; cognome?: string | null; org_id?: string | null; role?: string | null }
          setStaffProfileId(p.id)
          if (p.org_id) setStaffOrgId(p.org_id)
          if (p.role) setStaffRole(p.role)
          const fullName = `${p.nome || ''} ${p.cognome || ''}`.trim()
          setStaffDisplayName(fullName || null)
        }
      } catch (err) {
        logger.error('Errore caricamento profilo staff', err)
      }
    }

    fetchStaffProfile()
  }, [])

  // Carica appuntamenti dal database (filtrati per profilo staff corrente)
  const fetchAppointments = useCallback(async () => {
    if (!staffProfileId) return

    try {
      setAppointmentsLoading(true)
      const { data: appointmentsData, error: appointmentsError } = await supabase
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
            is_open_booking_day,
            created_by_role
          `,
        )
        .eq('staff_id', staffProfileId)
        .order('starts_at', { ascending: true })

      if (appointmentsError) {
        const errMsg =
          typeof appointmentsError === 'object' && appointmentsError !== null && 'message' in appointmentsError
            ? (appointmentsError as { message?: string }).message
            : String(appointmentsError)
        logger.error(`Errore caricamento appuntamenti: ${errMsg ?? 'unknown'}`, appointmentsError)
        return
      }

      type AppointmentRowWithColor = AppointmentRow & {
        color?: string | null
        is_open_booking_day?: boolean
        created_by_role?: string | null
        service_type?: 'training' | 'nutrition' | 'massage' | null
      }
      const appointmentRows = (appointmentsData ?? []) as unknown as AppointmentRowWithColor[]
      const athleteIds = [...new Set(appointmentRows.map((apt) => apt.athlete_id).filter(Boolean))] as string[]

      // Carica nomi atleti (se fallisce RLS/profiles, continuiamo con nomi vuoti)
      const athleteNamesMap = new Map<string, string>()
      if (athleteIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, nome, cognome')
          .in('id', athleteIds)

        if (profilesError) {
          logger.error('Errore caricamento nomi atleti per calendario (ignorato)', profilesError)
        }
        profiles?.forEach((profile: { id: string; nome?: string | null; cognome?: string | null }) => {
          const p = profile
          const fullName = `${p.nome || ''} ${p.cognome || ''}`.trim()
          athleteNamesMap.set(p.id, fullName || 'Atleta')
        })
      }

      const mappedAppointments: AppointmentUI[] = appointmentRows.map(
        (apt: AppointmentRowWithColor) => {
          const isOpenSlot = apt.is_open_booking_day === true
          const athleteName = isOpenSlot
            ? 'Libera prenotazione'
            : (athleteNamesMap.get(apt.athlete_id!) || 'Atleta')

          const allowedTypes = [
            'allenamento',
            'prova',
            'valutazione',
            'prima_visita',
            'riunione',
            'massaggio',
            'nutrizionista',
          ] as const
          const appointmentType =
            apt.type && allowedTypes.includes(apt.type as (typeof allowedTypes)[number])
              ? (apt.type as (typeof allowedTypes)[number])
              : 'allenamento'

          const serviceType =
            (apt as AppointmentRowWithColor).service_type ??
            (appointmentType === 'nutrizionista' ? 'nutrition' : appointmentType === 'massaggio' ? 'massage' : 'training')

          return {
            id: apt.id,
            org_id: apt.org_id ?? staffOrgId ?? null,
            title: `${athleteName} - ${apt.notes || apt.type || 'Sessione'}`,
            start: apt.starts_at,
            end: apt.ends_at,
            athlete: athleteName,
            type: appointmentType,
            color: (apt.color as AppointmentColor) ?? undefined,
            location: apt.location,
            notes: apt.notes,
            cancelled_at: apt.cancelled_at,
            athlete_id: apt.athlete_id ?? null,
            staff_id: apt.staff_id,
            starts_at: apt.starts_at,
            ends_at: apt.ends_at,
            status: normalizeAppointmentStatus(apt.status),
            service_type: serviceType,
            athlete_name: athleteName,
            staff_name: staffDisplayName || 'Staff',
            created_at: apt.created_at ?? new Date().toISOString(),
            is_open_booking_day: isOpenSlot,
            created_by_role: (apt.created_by_role as 'athlete' | 'trainer' | 'admin') ?? undefined,
          }
        },
      )
      setAppointments(mappedAppointments)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : typeof err === 'object' && err != null && 'message' in err ? String((err as { message: unknown }).message) : String(err)
      logger.error(`Errore caricamento appuntamenti: ${errMsg}`, err)
    } finally {
      setAppointmentsLoading(false)
    }
  }, [staffProfileId, staffOrgId, staffDisplayName])

  useEffect(() => {
    void fetchAppointments()
  }, [fetchAppointments])

  // Carica atleti: trainer/admin = tutti atleti org (stato attivo); nutrizionista/massaggiatore = solo clienti in staff_atleti
  const fetchAthletes = useCallback(async () => {
    if (!staffProfileId) return
    try {
      setAthletesLoading(true)
      const isStaffNutrizionistaOrMassaggiatore =
        staffRole === 'nutrizionista' || staffRole === 'massaggiatore'

      if (isStaffNutrizionistaOrMassaggiatore) {
        const { data: links, error: linksError } = await supabase
          .from('staff_atleti')
          .select('atleta_id')
          .eq('staff_id', staffProfileId)
          .eq('status', 'active')

        if (linksError) {
          logger.error('Errore caricamento clienti staff', linksError)
          setAthletes([])
          return
        }
        const ids = [...new Set((links ?? []).map((r) => r.atleta_id).filter(Boolean))] as string[]
        if (ids.length === 0) {
          setAthletes([])
          return
        }
        const { data: profilesData, error: profilesErr } = await supabase
          .from('profiles')
          .select('id, nome, cognome, email')
          .in('id', ids)
          .order('nome', { ascending: true })
        if (profilesErr) {
          logger.error('Errore caricamento profili clienti', profilesErr)
          setAthletes([])
          return
        }
        const formatted =
          (profilesData as ProfileRow[] | null)?.map((a) => ({
            id: a.id,
            name: `${a.nome ?? ''} ${a.cognome ?? ''}`.trim() || 'Cliente',
            email: a.email || '',
          })) ?? []
        setAthletes(formatted)
      } else {
        const { data: athletesData, error: athletesError } = await supabase
          .from('profiles')
          .select('id, nome, cognome, email')
          .in('role', ['athlete', 'atleta'])
          .eq('stato', 'attivo')
          .order('nome', { ascending: true })

        if (athletesError) {
          logger.error('Errore caricamento atleti', athletesError)
          return
        }
        const formattedAthletes =
          (athletesData as ProfileRow[] | null)?.map((a) => ({
            id: a.id,
            name: `${a.nome ?? ''} ${a.cognome ?? ''}`.trim() || 'Sconosciuto',
            email: a.email || '',
          })) ?? []
        setAthletes(formattedAthletes)
      }
    } catch (err) {
      logger.error('Errore caricamento atleti', err)
    } finally {
      setAthletesLoading(false)
    }
  }, [staffProfileId, staffRole])

  useEffect(() => {
    void fetchAthletes()
  }, [fetchAthletes])

  const handleFormSubmit = useCallback(
    async (data: CreateAppointmentData, editingAppointment: EditAppointmentData | null) => {
      if (!staffProfileId) {
        logger.error('Profilo staff non disponibile')
        return
      }
      const orgId = staffOrgId ?? data.org_id ?? null
      if (!orgId && !editingAppointment) {
        notify('Organizzazione non disponibile. Riprova dopo il login.', 'error', 'Errore creazione appuntamento')
        setLoading(false)
        return
      }

      if (!data.is_open_booking_day && !data.athlete_id) {
        notify('Seleziona un atleta dalla lista prima di creare l\'appuntamento.', 'warning', 'Atleta richiesto')
        return
      }

      if (!data.starts_at || !data.ends_at) {
        notify('Inserisci data e ora di inizio e fine per l\'appuntamento.', 'warning', 'Data e ora richieste')
        return
      }

      setLoading(true)

      try {
        const isOpenBooking = data.is_open_booking_day === true
        const athleteName = data.athlete_id
          ? (athletes.find((a) => a.id === data.athlete_id)?.name || 'Atleta')
          : 'Libera prenotazione'
        const startsAt = new Date(data.starts_at).toISOString()
        const endsAt = new Date(data.ends_at).toISOString()

        if (isNaN(new Date(startsAt).getTime()) || isNaN(new Date(endsAt).getTime())) {
          throw new Error('Date non valide')
        }

        if (editingAppointment && editingAppointment.id) {
          if (isOpenBooking) {
            notify('Gli slot Libera prenotazione vanno modificati dal calendario (trascinamento).', 'info', 'Info')
            setLoading(false)
            return
          }
          const allowedStatuses = ['attivo', 'completato', 'annullato', 'in_corso', 'cancelled'] as const
          const updateStatus = data.status && allowedStatuses.includes(data.status as (typeof allowedStatuses)[number])
            ? data.status
            : 'attivo'
          const updatePayload = {
            athlete_id: data.athlete_id!,
            starts_at: startsAt,
            ends_at: endsAt,
            type: data.type || 'allenamento',
            status: updateStatus,
            color: data.color || null,
            notes: data.notes || null,
            location: data.location || null,
            athlete_name: athleteName,
          } as Partial<AppointmentRow>

          const { error } = await supabase
            .from('appointments')
            .update(updatePayload)
            .eq('id', editingAppointment.id)

          if (error) throw error
        } else if (isOpenBooking) {
          const slots =
            data.recurrence && data.recurrence !== 'none'
              ? getRecurrenceSlots(startsAt, endsAt, data.recurrence)
              : [{ starts_at: startsAt, ends_at: endsAt }]
          const rows = slots.map((slot) => ({
            org_id: orgId,
            org_id_text: orgId ?? null,
            athlete_id: null,
            staff_id: staffProfileId,
            starts_at: slot.starts_at,
            ends_at: slot.ends_at,
            type: data.type || 'allenamento',
            status: 'attivo',
            color: data.color || null,
            notes: data.notes || 'Libera prenotazione',
            location: data.location || null,
            is_open_booking_day: true,
            created_by_role: 'trainer',
          }))
          type AppointmentInsert = import('@/lib/supabase/types').Database['public']['Tables']['appointments']['Insert']
          const { error: insertError } = await supabase.from('appointments').insert(rows as AppointmentInsert[])
          if (insertError) throw insertError
          logger.info('Slot Libera prenotazione creati', undefined, { count: rows.length })
        } else {
          // DB ammette solo: attivo, completato, annullato, in_corso, cancelled
          const validStatus =
            data.status &&
            ['attivo', 'completato', 'annullato', 'in_corso', 'cancelled'].includes(data.status)
              ? data.status
              : 'attivo'

          const slots =
            data.recurrence && data.recurrence !== 'none'
              ? getRecurrenceSlots(startsAt, endsAt, data.recurrence)
              : [{ starts_at: startsAt, ends_at: endsAt }]
          const rows = slots.map((slot) => ({
            org_id: orgId,
            org_id_text: orgId ?? null,
            athlete_id: data.athlete_id ?? null,
            staff_id: staffProfileId,
            starts_at: slot.starts_at,
            ends_at: slot.ends_at,
            type: data.type || 'allenamento',
            status: validStatus,
            color: data.color || null,
            notes: data.notes || null,
            location: data.location || null,
            created_by_role: 'trainer',
          }))
          type AppointmentInsert = import('@/lib/supabase/types').Database['public']['Tables']['appointments']['Insert']
          const { error: insertError } = await supabase.from('appointments').insert(rows as AppointmentInsert[])
          if (insertError) throw insertError
          logger.info('Appuntamenti creati', undefined, { count: rows.length })
        }

        await fetchAppointments()
        setLoading(false)
      } catch (err: unknown) {
        logger.error('Errore salvataggio appuntamento', err)

        let errorMessage = "Errore durante il salvataggio dell'appuntamento"
        if (err instanceof Error) {
          errorMessage = err.message
        } else if (typeof err === 'object' && err !== null) {
          const o = err as { message?: string; details?: string; hint?: string }
          if (typeof o.message === 'string') {
            errorMessage = o.message
            if (o.details) errorMessage += ` — ${o.details}`
            if (o.hint) errorMessage += ` (${o.hint})`
          }
        }

        notify(errorMessage, 'error', 'Errore creazione appuntamento')
        setLoading(false)
        throw err
      }
    },
    [staffProfileId, staffOrgId, athletes, fetchAppointments, notify],
  )

  const handleCancel = useCallback(
    async (appointmentId: string) => {
      setLoading(true)
      try {
        const cancelPayload = {
          cancelled_at: new Date().toISOString(),
          status: 'annullato',
        } as Partial<AppointmentRow>

        const { error } = await supabase
          .from('appointments')
          .update(cancelPayload)
          .eq('id', appointmentId)

        if (error) throw error

        await fetchAppointments()
      } catch (err) {
        logger.error('Errore cancellazione appuntamento', err, { appointmentId })
        const msg =
          err instanceof Error ? err.message : (err as { message?: string })?.message
        notify(msg || 'Impossibile annullare l\'appuntamento', 'error', 'Errore annullamento')
      } finally {
        setLoading(false)
      }
    },
    [fetchAppointments, notify],
  )

  const handleDelete = useCallback(
    async (appointmentId: string) => {
      setLoading(true)
      try {
        const { error } = await supabase.from('appointments').delete().eq('id', appointmentId)

        if (error) throw error

        await fetchAppointments()
      } catch (err) {
        logger.error('Errore eliminazione appuntamento', err, { appointmentId })
        const msg =
          err instanceof Error ? err.message : (err as { message?: string })?.message
        notify(msg || 'Impossibile eliminare l\'appuntamento', 'error', 'Errore eliminazione')
      } finally {
        setLoading(false)
      }
    },
    [fetchAppointments, notify],
  )

  // Handler per drag & drop di eventi (spostamento)
  const handleEventDrop = useCallback(
    async (appointmentId: string, newStart: Date, newEnd: Date) => {
      try {
        const updatePayload = {
          starts_at: newStart.toISOString(),
          ends_at: newEnd.toISOString(),
        } as Partial<AppointmentRow>

        const { error } = await supabase
          .from('appointments')
          .update(updatePayload)
          .eq('id', appointmentId)

        if (error) throw error

        // Aggiorna lo stato locale immediatamente (optimistic update)
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === appointmentId
              ? { ...apt, starts_at: newStart.toISOString(), ends_at: newEnd.toISOString() }
              : apt,
          ),
        )

        logger.info('Appuntamento spostato', undefined, { appointmentId })
      } catch (err) {
        logger.error('Errore spostamento appuntamento', err, { appointmentId })
        // Ricarica per ripristinare lo stato corretto
        await fetchAppointments()
        throw err
      }
    },
    [fetchAppointments],
  )

  // Handler per ridimensionamento eventi
  const handleEventResize = useCallback(
    async (appointmentId: string, newStart: Date, newEnd: Date) => {
      try {
        const updatePayload = {
          starts_at: newStart.toISOString(),
          ends_at: newEnd.toISOString(),
        } as Partial<AppointmentRow>

        const { error } = await supabase
          .from('appointments')
          .update(updatePayload)
          .eq('id', appointmentId)

        if (error) throw error

        // Aggiorna lo stato locale immediatamente (optimistic update)
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === appointmentId
              ? { ...apt, starts_at: newStart.toISOString(), ends_at: newEnd.toISOString() }
              : apt,
          ),
        )

        logger.info('Appuntamento ridimensionato', undefined, { appointmentId })
      } catch (err) {
        logger.error('Errore ridimensionamento appuntamento', err, { appointmentId })
        // Ricarica per ripristinare lo stato corretto
        await fetchAppointments()
        throw err
      }
    },
    [fetchAppointments],
  )

  const handleComplete = useCallback(
    async (appointmentId: string) => {
      setLoading(true)
      try {
        const { error } = await supabase
          .from('appointments')
          .update({ status: 'completato' })
          .eq('id', appointmentId)

        if (error) throw error

        await fetchAppointments()
        notify('Seduta completata. È stato scalato 1 credito.', 'success', 'Completato')
      } catch (err) {
        logger.error('Errore completamento seduta', err, { appointmentId })
        const msg =
          err instanceof Error ? err.message : (err as { message?: string })?.message
        notify(msg || 'Impossibile completare la seduta', 'error', 'Errore')
      } finally {
        setLoading(false)
      }
    },
    [fetchAppointments, notify],
  )

  return {
    appointments,
    appointmentsLoading,
    athletes,
    athletesLoading,
    staffProfileId,
    staffDisplayName,
    loading,
    fetchAppointments,
    handleFormSubmit,
    handleCancel,
    handleDelete,
    handleComplete,
    handleEventDrop,
    handleEventResize,
  }
}
