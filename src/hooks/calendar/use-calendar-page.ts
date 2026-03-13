// ============================================================
// Hook per gestione pagina calendario (FASE C - Split File Lunghi)
// ============================================================
// Estratto da calendario/page.tsx per migliorare manutenibilità
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase/types'
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
import { useStaffCalendarSettings } from '@/hooks/calendar/use-staff-calendar-settings'
import { addDebitFromAppointment } from '@/lib/credits/ledger'
import type { CalendarBlock } from '@/types/calendar-block'

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

const UNTIL_LESSONS_MAX_SLOTS = 100

/** Verifica sovrapposizione per (staff_id, starts_at, ends_at). Ritorna true se c'è overlap (e non si può inserire senza "procedi comunque"). */
async function checkAppointmentOverlap(
  supabaseClient: SupabaseClient<Database>,
  staffId: string,
  startsAt: string,
  endsAt: string,
  options: {
    excludeAppointmentId?: string
    appointmentType?: string
    isCollaborator?: boolean
  },
): Promise<boolean> {
  const { data: existing } = await supabaseClient
    .from('appointments')
    .select('id, type')
    .eq('staff_id', staffId)
    .lt('starts_at', endsAt)
    .gt('ends_at', startsAt)
  const rows = (existing ?? []) as { id: string; type?: string }[]
  const filtered = options.excludeAppointmentId
    ? rows.filter((r) => r.id !== options.excludeAppointmentId)
    : rows
  if (filtered.length === 0) return false
  if (options.appointmentType === 'allenamento_doppio') {
    const doppioCount = filtered.filter((r) => r.type === 'allenamento_doppio').length
    return doppioCount >= 2
  }
  return filtered.length >= 1
}

/** Genera slot settimanali "fino a esaurimento lezioni": N = min(lesson_count, 100). */
async function getRecurrenceSlotsUntilLessons(
  supabaseClient: SupabaseClient<Database>,
  athleteId: string,
  firstStartsAt: string,
  firstEndsAt: string,
): Promise<{ starts_at: string; ends_at: string }[]> {
  const { data: row } = await supabaseClient
    .from('lesson_counters')
    .select('count')
    .eq('athlete_id', athleteId)
    .maybeSingle()
  const count = (row as { count?: number | null } | null)?.count ?? 0
  const N = Math.min(Math.max(0, count), UNTIL_LESSONS_MAX_SLOTS)
  if (N === 0) return []
  const firstStart = new Date(firstStartsAt)
  const firstEnd = new Date(firstEndsAt)
  const durationMs = firstEnd.getTime() - firstStart.getTime()
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000
  const slots: { starts_at: string; ends_at: string }[] = []
  for (let i = 0; i < N; i++) {
    const t = firstStart.getTime() + i * oneWeekMs
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
  const [calendarBlocks, setCalendarBlocks] = useState<CalendarBlock[]>([])
  const { settings: calendarSettings } = useStaffCalendarSettings()

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

  // Carica appuntamenti: propri + (se trainer/admin) Free Pass org + calendari collaboratori
  const fetchAppointments = useCallback(async () => {
    if (!staffProfileId) return

    try {
      setAppointmentsLoading(true)
      const selectFields = `
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
          `
      const isTrainerOrAdmin = staffRole === 'trainer' || staffRole === 'admin'
      const showFreePass = calendarSettings?.show_free_pass_calendar !== false
      const showCollaborators = calendarSettings?.show_collaborators_calendars !== false

      const { data: myData, error: myError } = await supabase
        .from('appointments')
        .select(selectFields)
        .eq('staff_id', staffProfileId)
        .order('starts_at', { ascending: true })

      if (myError) {
        const errMsg =
          typeof myError === 'object' && myError !== null && 'message' in myError
            ? (myError as { message?: string }).message
            : String(myError)
        logger.error(`Errore caricamento appuntamenti: ${errMsg ?? 'unknown'}`, myError)
        return
      }

      type AppointmentRowWithColor = AppointmentRow & {
        color?: string | null
        is_open_booking_day?: boolean
        created_by_role?: string | null
        service_type?: 'training' | 'nutrition' | 'massage' | null
      }
      const allRows = (myData ?? []) as unknown as AppointmentRowWithColor[]

      if (isTrainerOrAdmin && staffOrgId) {
        if (showFreePass) {
          const { data: freePassData } = await supabase
            .from('appointments')
            .select(selectFields)
            .eq('org_id', staffOrgId)
            .eq('is_open_booking_day', true)
            .order('starts_at', { ascending: true })
          const fpRows = (freePassData ?? []) as unknown as AppointmentRowWithColor[]
          const seen = new Set(allRows.map((r) => r.id))
          for (const r of fpRows) {
            if (!seen.has(r.id)) {
              seen.add(r.id)
              allRows.push(r)
            }
          }
        }
        if (showCollaborators) {
          const { data: collaboratorProfiles } = await supabase
            .from('profiles')
            .select('id')
            .eq('org_id', staffOrgId)
            .in('role', ['nutrizionista', 'massaggiatore'])
          const collIds = (collaboratorProfiles ?? []).map((p: { id: string }) => p.id).filter((id: string) => id !== staffProfileId)
          if (collIds.length > 0) {
            const { data: collData } = await supabase
              .from('appointments')
              .select(selectFields)
              .in('staff_id', collIds)
              .order('starts_at', { ascending: true })
            const collRows = (collData ?? []) as unknown as AppointmentRowWithColor[]
            const seen = new Set(allRows.map((r) => r.id))
            for (const r of collRows) {
              if (!seen.has(r.id)) {
                seen.add(r.id)
                allRows.push(r)
              }
            }
          }
        }
      }

      allRows.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
      // Escludi slot privati di altri staff: solo il proprietario vede i propri privati
      const appointmentRows = allRows.filter(
        (apt) => !(apt.type === 'privato' && apt.staff_id !== staffProfileId),
      )
      const athleteIds = [...new Set(appointmentRows.map((apt) => apt.athlete_id).filter(Boolean))] as string[]

      // Carica nomi atleti e lezioni rimanenti
      const athleteNamesMap = new Map<string, string>()
      const lessonsRemainingMap = new Map<string, number>()
      if (athleteIds.length > 0) {
        const [profilesRes, countersRes] = await Promise.all([
          supabase.from('profiles').select('id, nome, cognome').in('id', athleteIds),
          supabase.from('lesson_counters').select('athlete_id, count').in('athlete_id', athleteIds),
        ])
        const profilesError = profilesRes.error
        if (profilesError) {
          logger.error('Errore caricamento nomi atleti per calendario (ignorato)', profilesError)
        }
        ;(profilesRes.data ?? []).forEach((profile: { id: string; nome?: string | null; cognome?: string | null }) => {
          const p = profile
          const fullName = `${p.nome || ''} ${p.cognome || ''}`.trim()
          athleteNamesMap.set(p.id, fullName || 'Atleta')
        })
        ;(countersRes.data ?? []).forEach((r: { athlete_id: string; count: number | null }) => {
          lessonsRemainingMap.set(r.athlete_id, r.count ?? 0)
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
            'allenamento_singolo',
            'allenamento_doppio',
            'programma',
            'prova',
            'valutazione',
            'prima_visita',
            'riunione',
            'massaggio',
            'nutrizionista',
            'privato',
            'appuntamento_normale',
            'controllo',
            'slot_disponibile',
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
            lessons_remaining: apt.athlete_id ? lessonsRemainingMap.get(apt.athlete_id) : undefined,
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
  }, [staffProfileId, staffOrgId, staffDisplayName, staffRole, calendarSettings?.show_free_pass_calendar, calendarSettings?.show_collaborators_calendars])

  useEffect(() => {
    void fetchAppointments()
  }, [fetchAppointments])

  useEffect(() => {
    if (!staffOrgId || !staffProfileId) return
    let cancelled = false
    const from = new Date()
    from.setDate(from.getDate() - 30)
    const to = new Date()
    to.setDate(to.getDate() + 365)
    supabase
      .from('calendar_blocks')
      .select('id, org_id, staff_id, starts_at, ends_at, reason, created_at')
      .eq('org_id', staffOrgId)
      .or(`staff_id.eq.${staffProfileId},staff_id.is.null`)
      .gte('ends_at', from.toISOString())
      .lte('starts_at', to.toISOString())
      .then(({ data, error }) => {
        if (cancelled || error) return
        setCalendarBlocks((data ?? []) as CalendarBlock[])
      })
    return () => {
      cancelled = true
    }
  }, [staffOrgId, staffProfileId])

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
    async (
      data: CreateAppointmentData,
      editingAppointment: EditAppointmentData | null,
      options?: { forceOverwrite?: boolean },
    ): Promise<{ overlapDetected?: boolean } | void> => {
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
        const isCollaborator = staffRole === 'nutrizionista' || staffRole === 'massaggiatore'
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
          const overlapsBlock = (s: string, e: string) =>
            calendarBlocks.some(
              (b) => new Date(s) < new Date(b.ends_at) && new Date(e) > new Date(b.starts_at),
            )
          if (overlapsBlock(startsAt, endsAt)) {
            notify('Questo orario cade in un blocco calendario (ferie/chiusura). Scegli un altro slot.', 'error', 'Blocco calendario')
            setLoading(false)
            return
          }
          if (!options?.forceOverwrite) {
            const hasOverlap = await checkAppointmentOverlap(supabase, staffProfileId, startsAt, endsAt, {
              excludeAppointmentId: editingAppointment.id,
              appointmentType: data.type,
              isCollaborator,
            })
            if (hasOverlap) {
              const msg = isCollaborator
                ? 'Questo slot è già occupato.'
                : 'Questo slot è già occupato. Non è disponibile.'
              notify(msg, 'warning', 'Slot occupato')
              setLoading(false)
              return { overlapDetected: true }
            }
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
          if (data.athlete_id) {
            fetch('/api/calendar/notify-appointment-change', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                appointmentId: editingAppointment.id,
                action: 'modified',
                previous: {
                  starts_at: editingAppointment.starts_at,
                  ends_at: editingAppointment.ends_at,
                  type: editingAppointment.type,
                  location: editingAppointment.location ?? null,
                },
                new: {
                  starts_at: startsAt,
                  ends_at: endsAt,
                  type: data.type || 'allenamento',
                  location: data.location ?? null,
                },
              }),
            }).catch((e) => logger.error('Invio email modifica appuntamento atleta fallito', e))
          }
        } else if (isOpenBooking) {
          if (!orgId) {
            notify('Organizzazione non disponibile per creare slot Free Pass.', 'error', 'Errore')
            setLoading(false)
            return
          }
          const slots =
            data.recurrence && data.recurrence !== 'none' && data.recurrence !== 'until_lessons'
              ? getRecurrenceSlots(startsAt, endsAt, data.recurrence)
              : [{ starts_at: startsAt, ends_at: endsAt }]
          for (const slot of slots) {
            const { data: existing } = await supabase
              .from('appointments')
              .select('id')
              .eq('org_id', orgId)
              .eq('is_open_booking_day', true)
              .eq('starts_at', slot.starts_at)
              .eq('ends_at', slot.ends_at)
              .maybeSingle()
            if (existing) {
              notify('Esiste già uno slot Free Pass per questo orario. Un solo slot per orario per organizzazione.', 'error', 'Slot Free Pass')
              setLoading(false)
              return
            }
          }
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
          if (insertError) {
            if (insertError.code === '23505') {
              notify('Esiste già uno slot Free Pass per questo orario.', 'error', 'Slot Free Pass')
            } else {
              throw insertError
            }
            setLoading(false)
            return
          }
          logger.info('Slot Libera prenotazione creati', undefined, { count: rows.length })
        } else {
          // DB ammette solo: attivo, completato, annullato, in_corso, cancelled
          const validStatus =
            data.status &&
            ['attivo', 'completato', 'annullato', 'in_corso', 'cancelled'].includes(data.status)
              ? data.status
              : 'attivo'

          let slots: { starts_at: string; ends_at: string }[]
          if (data.recurrence === 'until_lessons' && data.athlete_id) {
            slots = await getRecurrenceSlotsUntilLessons(supabase, data.athlete_id, startsAt, endsAt)
            if (slots.length === 0) {
              notify('L\'atleta non ha lezioni disponibili o il conteggio è zero.', 'error', 'Ripetizione')
              setLoading(false)
              return
            }
          } else if (data.recurrence && data.recurrence !== 'none' && data.recurrence !== 'until_lessons') {
            slots = getRecurrenceSlots(startsAt, endsAt, data.recurrence)
          } else {
            slots = [{ starts_at: startsAt, ends_at: endsAt }]
          }
          const overlapsBlock = (s: string, e: string) =>
            calendarBlocks.some(
              (b) => new Date(s) < new Date(b.ends_at) && new Date(e) > new Date(b.starts_at),
            )
          for (const slot of slots) {
            if (overlapsBlock(slot.starts_at, slot.ends_at)) {
              notify('Questo orario cade in un blocco calendario (ferie/chiusura). Scegli un altro slot.', 'error', 'Blocco calendario')
              setLoading(false)
              return
            }
          }
          if (!options?.forceOverwrite) {
            for (const slot of slots) {
              const hasOverlap = await checkAppointmentOverlap(supabase, staffProfileId, slot.starts_at, slot.ends_at, {
                appointmentType: data.type,
                isCollaborator,
              })
              if (hasOverlap) {
                const msg =
                  data.type === 'allenamento_doppio'
                    ? 'Questo slot ha già due allenamenti doppi. Non è disponibile per un nuovo allenamento.'
                    : isCollaborator
                      ? 'Questo slot è già occupato.'
                      : 'Questo slot è già occupato. Non è disponibile per un nuovo allenamento.'
                notify(msg, 'warning', 'Slot occupato')
                setLoading(false)
                return { overlapDetected: true }
              }
            }
          }
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
          const { data: insertedRows, error: insertError } = await supabase
            .from('appointments')
            .insert(rows as AppointmentInsert[])
            .select('id')
          if (insertError) throw insertError
          const createdIds = (insertedRows ?? []).map((r) => (r as { id: string }).id)
          logger.info('Appuntamenti creati', undefined, { count: rows.length })
          if (createdIds.length > 0 && data.athlete_id) {
            fetch('/api/calendar/send-appointment-reminder', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ appointmentIds: createdIds }),
            }).catch((err) => logger.error('Invio promemoria atleta fallito', err))
          }
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
    [staffProfileId, staffOrgId, staffRole, athletes, calendarBlocks, fetchAppointments, notify],
  )

  const handleCancel = useCallback(
    async (
      appointmentId: string,
      options?: {
        deductLesson?: boolean
        /** true = "Annulla senza scalare" (eccezione) anche con < 24h */
        isException?: boolean
        appointment?: AppointmentUI
      },
    ) => {
      setLoading(true)
      try {
        let apt = options?.appointment
        if (!apt) {
          const { data } = await supabase
            .from('appointments')
            .select('id, athlete_id, staff_id, starts_at, service_type')
            .eq('id', appointmentId)
            .single()
          apt = data as unknown as AppointmentUI
        }
        const cancelledAt = new Date().toISOString()
        const cancelPayload = {
          cancelled_at: cancelledAt,
          status: 'annullato',
        } as Partial<AppointmentRow>

        const { error } = await supabase
          .from('appointments')
          .update(cancelPayload)
          .eq('id', appointmentId)

        if (error) throw error

        const athleteId = apt?.athlete_id ?? null
        const deductLesson = options?.deductLesson === true
        const isException = options?.isException === true
        let cancellationType: string
        if (deductLesson) {
          cancellationType = 'tardiva'
          if (athleteId) {
            await addDebitFromAppointment(
              { id: appointmentId, athlete_id: athleteId, service_type: (apt as { service_type?: 'training' | 'nutrition' | 'massage' })?.service_type },
              staffProfileId,
            )
          }
        } else {
          cancellationType = isException ? 'eccezionale' : 'anticipata'
        }

        if (athleteId) {
          await supabase.from('appointment_cancellations').insert({
            appointment_id: appointmentId,
            athlete_id: athleteId,
            cancelled_at: cancelledAt,
            cancelled_by_profile_id: staffProfileId!,
            cancellation_type: cancellationType,
            lesson_deducted: deductLesson,
          })
        }

        await fetchAppointments()
        if (athleteId) {
          fetch('/api/calendar/notify-appointment-change', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appointmentId, action: 'cancelled' }),
          }).catch((e) => logger.error('Invio email annullamento atleta fallito', e))
        }
      } catch (err) {
        logger.error('Errore cancellazione appuntamento', err, { appointmentId })
        const msg =
          err instanceof Error ? err.message : (err as { message?: string })?.message
        notify(msg || 'Impossibile annullare l\'appuntamento', 'error', 'Errore annullamento')
      } finally {
        setLoading(false)
      }
    },
    [staffProfileId, fetchAppointments, notify],
  )

  /** Elimina l'appuntamento da Supabase senza lasciare traccia. Pulizia correlati best-effort (non blocca se RLS/errore); fallisce solo se fallisce il delete su appointments. */
  const handleDelete = useCallback(
    async (appointmentId: string) => {
      setLoading(true)
      try {
        const { data: apt } = await supabase
          .from('appointments')
          .select('athlete_id, starts_at, ends_at, type, location, staff_id')
          .eq('id', appointmentId)
          .single()
        const snapshot =
          apt && (apt as { athlete_id: string | null }).athlete_id
            ? {
                athlete_id: (apt as { athlete_id: string }).athlete_id,
                starts_at: (apt as { starts_at: string }).starts_at,
                ends_at: (apt as { ends_at: string }).ends_at,
                type: (apt as { type: string }).type,
                location: (apt as { location?: string | null }).location ?? null,
                staff_id: (apt as { staff_id: string }).staff_id,
              }
            : null

        await supabase
          .from('appointment_cancellations')
          .delete()
          .eq('appointment_id', appointmentId)
        const { error: notifErr } = await supabase
          .from('notifications')
          .delete()
          .eq('appointment_id', appointmentId)
        if (notifErr) logger.warn('Pulizia notifications (best-effort)', undefined, { appointmentId, err: notifErr.message })
        const { error: ledgerErr } = await supabase
          .from('credit_ledger')
          .update({ appointment_id: null })
          .eq('appointment_id', appointmentId)
        if (ledgerErr) logger.warn('Pulizia credit_ledger (best-effort)', undefined, { appointmentId, err: ledgerErr.message })
        const { error } = await supabase.from('appointments').delete().eq('id', appointmentId)
        if (error) throw error
        await fetchAppointments()
        if (snapshot) {
          fetch('/api/calendar/notify-appointment-change', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appointmentId, action: 'deleted', snapshot }),
          }).catch((e) => logger.error('Invio email eliminazione atleta fallito', e))
        }
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

  const handleNoShow = useCallback(
    async (appointmentId: string, appointment?: AppointmentUI) => {
      setLoading(true)
      try {
        let apt = appointment
        if (!apt) {
          const { data } = await supabase
            .from('appointments')
            .select('id, athlete_id, service_type')
            .eq('id', appointmentId)
            .single()
          apt = data as unknown as AppointmentUI
        }
        const cancelledAt = new Date().toISOString()
        const { error: updateError } = await supabase
          .from('appointments')
          .update({ status: 'annullato', cancelled_at: cancelledAt })
          .eq('id', appointmentId)
        if (updateError) throw updateError
        const athleteId = apt?.athlete_id ?? null
        if (athleteId) {
          await addDebitFromAppointment(
            {
              id: appointmentId,
              athlete_id: athleteId,
              service_type: (apt as { service_type?: 'training' | 'nutrition' | 'massage' })?.service_type,
            },
            staffProfileId,
          )
          await supabase.from('appointment_cancellations').insert({
            appointment_id: appointmentId,
            athlete_id: athleteId,
            cancelled_at: cancelledAt,
            cancelled_by_profile_id: staffProfileId!,
            cancellation_type: 'no_show',
            lesson_deducted: true,
          })
        }
        await fetchAppointments()
        notify('No-show registrato. È stato scalato 1 credito.', 'success', 'No-show')
      } catch (err) {
        logger.error('Errore no-show', err, { appointmentId })
        const msg =
          err instanceof Error ? err.message : (err as { message?: string })?.message
        notify(msg || 'Impossibile registrare il no-show', 'error', 'Errore')
      } finally {
        setLoading(false)
      }
    },
    [staffProfileId, fetchAppointments, notify],
  )

  return {
    appointments,
    appointmentsLoading,
    athletes,
    athletesLoading,
    staffProfileId,
    staffDisplayName,
    calendarBlocks,
    loading,
    fetchAppointments,
    handleFormSubmit,
    handleCancel,
    handleDelete,
    handleComplete,
    handleNoShow,
    handleEventDrop,
    handleEventResize,
  }
}
