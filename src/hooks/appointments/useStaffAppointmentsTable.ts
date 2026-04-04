// ============================================================
// Hook semplificato per gestione appuntamenti
// Approccio diretto con insert/update/delete via Supabase client
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { addDebitFromAppointment } from '@/lib/credits/ledger'
import { hasOverlappingAppCoachedWorkoutDebit } from '@/lib/credits/session-debit-dedup'
import { coerceLedgerServiceType } from '@/lib/abbonamenti-service-type'

import type {
  AppointmentTable,
  CreateAppointmentData,
  EditAppointmentData,
} from '@/types/appointment'
import {
  appointmentSlotOverlapsAnyCalendarBlock,
  CALENDAR_BLOCK_CONFLICT_UI,
  checkStaffCalendarSlotOverlap,
  fetchStaffCalendarBlocksForUiValidation,
  normalizeAppointmentStatus,
} from '@/lib/appointment-utils'
import type { CalendarBlock } from '@/types/calendar-block'
import { useNotify } from '@/lib/ui/notify'
import { listStaffAppointmentsForTable } from '@/lib/appointments/queries'
import {
  requireCurrentOrgId,
  resolveOrgIdForAppointmentWrite,
} from '@/lib/organizations/current-org'
import { STAFF_APPOINTMENTS_INVALIDATE_EVENT } from '@/lib/staff-cross-tab-events'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'
import { useAuth } from '@/providers/auth-provider'

const logger = createLogger('hooks:appointments:useStaffAppointmentsTable')
export function useStaffAppointmentsTable() {
  const { user: authUser, actorProfile, isImpersonating, loading: authLoading } = useAuth()
  const [appointments, setAppointments] = useState<AppointmentTable[]>([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)
  const [athletes, setAthletes] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [athletesLoading, setAthletesLoading] = useState(true)
  const [staffId, setStaffId] = useState<string | null>(null)
  const [staffOrgId, setStaffOrgId] = useState<string | null>(null)
  const [calendarBlocks, setCalendarBlocks] = useState<CalendarBlock[]>([])
  const [staffName, setStaffName] = useState<string | null>(null)
  const [staffRole, setStaffRole] = useState<string | null>(null)
  const { notify } = useNotify()

  /** Stesso vincolo della vecchia getUser()+profiles: in impersonation usa l’attore (admin). */
  const staffSource = isImpersonating && actorProfile ? actorProfile : authUser

  useEffect(() => {
    if (authLoading) return
    if (!staffSource) {
      setStaffId(null)
      setStaffOrgId(null)
      setStaffRole(null)
      setStaffName(null)
      setAppointments([])
      setAppointmentsLoading(false)
      setAthletes([])
      setAthletesLoading(false)
      return
    }
    setStaffId(staffSource.id)
    setStaffOrgId(staffSource.org_id ?? null)
    setStaffRole(staffSource.role)
    const fullName =
      staffSource.full_name?.trim() ||
      `${staffSource.first_name ?? ''} ${staffSource.last_name ?? ''}`.trim() ||
      null
    setStaffName(fullName || null)
  }, [authLoading, staffSource])

  // Carica appuntamenti dal database
  const fetchAppointments = useCallback(async () => {
    if (!staffId) return

    try {
      setAppointmentsLoading(true)
      const { data: appointmentsData, error: appointmentsError } =
        await listStaffAppointmentsForTable(supabase, staffId)

      if (appointmentsError) throw appointmentsError

      if (appointmentsData) {
        const athleteIds = [
          ...new Set(appointmentsData.map((apt) => apt.athlete_id).filter(Boolean)),
        ] as string[]

        const nameByAthleteId = new Map<string, string>()
        const avatarByAthleteId = new Map<string, string | null>()
        if (athleteIds.length > 0) {
          for (const idChunk of chunkForSupabaseIn(athleteIds)) {
            const { data: profileRows, error: batchProfilesError } = await supabase
              .from('profiles')
              .select('id, nome, cognome, avatar, avatar_url')
              .in('id', idChunk)

            if (batchProfilesError) {
              logger.error('Errore batch profili atleti (tab appuntamenti)', batchProfilesError)
            } else {
              for (const row of profileRows ?? []) {
                const r = row as {
                  id: string
                  nome?: string | null
                  cognome?: string | null
                  avatar?: string | null
                  avatar_url?: string | null
                }
                const label = `${r.nome ?? ''} ${r.cognome ?? ''}`.trim()
                nameByAthleteId.set(r.id, label || 'Atleta')
                const url = (r.avatar_url ?? r.avatar)?.trim() || null
                avatarByAthleteId.set(r.id, url)
              }
            }
          }
        }

        const appointmentsWithNames = appointmentsData.map((apt) => {
          const athleteName = apt.athlete_id ? (nameByAthleteId.get(apt.athlete_id) ?? null) : null
          const athleteAvatarUrl = apt.athlete_id
            ? (avatarByAthleteId.get(apt.athlete_id) ?? null)
            : null
          return {
            ...apt,
            athlete_name: athleteName,
            athlete_avatar_url: athleteAvatarUrl,
            staff_name: staffName,
            status: normalizeAppointmentStatus(apt.status),
          } as AppointmentTable
        })

        setAppointments(appointmentsWithNames)
      }
    } catch (err) {
      logger.error('Errore caricamento appuntamenti', err, { staffId })
    } finally {
      setAppointmentsLoading(false)
    }
  }, [staffId, staffName])

  // Carica atleti
  const fetchAthletes = useCallback(async () => {
    try {
      setAthletesLoading(true)
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, nome, cognome, email')
        .in('role', ['athlete', 'atleta'])
        .order('nome', { ascending: true })

      if (error) throw error

      if (profiles) {
        setAthletes(
          profiles.map(
            (p: {
              id: string
              nome?: string | null
              cognome?: string | null
              email?: string | null
            }) => ({
              id: p.id,
              name: `${p.nome || ''} ${p.cognome || ''}`.trim() || 'Atleta',
              email: p.email || '',
            }),
          ),
        )
      }
    } catch (err) {
      logger.error('Errore caricamento atleti', err)
    } finally {
      setAthletesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (staffId) {
      void fetchAppointments()
      void fetchAthletes()
    }
  }, [staffId, fetchAppointments, fetchAthletes])

  /** Stessa fonte di blocchi del calendario staff (`use-calendar-page`), solo per validazione UI. */
  useEffect(() => {
    if (!staffOrgId || !staffId) return
    let cancelled = false
    void fetchStaffCalendarBlocksForUiValidation(supabase, staffOrgId, staffId).then((blocks) => {
      if (!cancelled) setCalendarBlocks(blocks)
    })
    return () => {
      cancelled = true
    }
  }, [staffOrgId, staffId])

  useEffect(() => {
    if (!staffId) return
    const onRemote = () => {
      void fetchAppointments()
    }
    window.addEventListener(STAFF_APPOINTMENTS_INVALIDATE_EVENT, onRemote)
    return () => window.removeEventListener(STAFF_APPOINTMENTS_INVALIDATE_EVENT, onRemote)
  }, [staffId, fetchAppointments])

  const handleFormSubmit = useCallback(
    async (
      data: CreateAppointmentData,
      editingAppointment: EditAppointmentData | null,
      // Nota: athletes potrebbe essere usato in futuro per validazioni
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      athletes: Array<{ id: string; name: string; email: string }>,
    ) => {
      if (!staffId) {
        logger.error('Staff ID non disponibile', undefined, { hasStaffId: false })
        throw new Error('Staff ID non disponibile')
      }

      try {
        // Validazione base
        if (new Date(data.ends_at) <= new Date(data.starts_at)) {
          throw new Error('La data di fine deve essere successiva alla data di inizio')
        }

        const startsAt = new Date(data.starts_at).toISOString()
        const endsAt = new Date(data.ends_at).toISOString()
        if (isNaN(new Date(startsAt).getTime()) || isNaN(new Date(endsAt).getTime())) {
          throw new Error('Date non valide')
        }

        // Stessa semantica di use-calendar-page: blocchi calendario poi overlap (Libera prenotazione = senza blocchi UI, come calendario)
        if (data.is_open_booking_day !== true) {
          if (appointmentSlotOverlapsAnyCalendarBlock(startsAt, endsAt, calendarBlocks)) {
            notify(CALENDAR_BLOCK_CONFLICT_UI.message, 'error', CALENDAR_BLOCK_CONFLICT_UI.title)
            throw new Error(CALENDAR_BLOCK_CONFLICT_UI.message)
          }
          const hasOverlap = await checkStaffCalendarSlotOverlap(
            supabase,
            staffId,
            startsAt,
            endsAt,
            {
              excludeAppointmentId: editingAppointment?.id,
              appointmentType: data.type,
            },
          )
          if (hasOverlap) {
            const isCollaborator = staffRole === 'nutrizionista' || staffRole === 'massaggiatore'
            let msg: string
            if (editingAppointment?.id) {
              msg = isCollaborator
                ? 'Questo slot è già occupato.'
                : 'Questo slot è già occupato. Non è disponibile.'
            } else {
              msg =
                data.type === 'allenamento_doppio'
                  ? 'Questo slot ha già due allenamenti doppi. Non è disponibile per un nuovo allenamento.'
                  : isCollaborator
                    ? 'Questo slot è già occupato.'
                    : 'Questo slot è già occupato. Non è disponibile per un nuovo allenamento.'
            }
            notify(msg, 'warning', 'Slot occupato')
            throw new Error(msg)
          }
        }

        // org_id: fonte canonica profiles.org_id + eventuale form (senza fallback implicito a default-org)
        const {
          data: { user },
        } = await supabase.auth.getUser()
        let profileOrgId: string | null = null
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('org_id')
            .eq('user_id', user.id)
            .single()
          profileOrgId = profile?.org_id ?? null
        }
        const resolvedOrgId = requireCurrentOrgId(
          resolveOrgIdForAppointmentWrite({
            profileOrgId,
            formOrgId: data.org_id,
          }),
        )
        data.org_id = resolvedOrgId

        if (editingAppointment && editingAppointment.id) {
          // Modifica appuntamento esistente
          const { data: updatedRows, error } = await supabase
            .from('appointments')
            .update({
              athlete_id: data.athlete_id,
              starts_at: startsAt,
              ends_at: endsAt,
              type: data.type || 'allenamento',
              status: data.status || 'attivo',
              notes: data.notes,
              location: data.location,
              org_id: resolvedOrgId,
            })
            .eq('id', editingAppointment.id)
            .select('id')

          if (error) throw error
          if (!updatedRows?.length) {
            throw new Error(
              'Aggiornamento appuntamento: nessuna riga modificata (permessi o id errato)',
            )
          }
        } else {
          // Verifica che staffId sia presente
          if (!staffId) {
            throw new Error("Staff ID non disponibile. Impossibile creare l'appuntamento.")
          }

          // Crea nuovo appuntamento
          const insertData = {
            org_id: resolvedOrgId,
            athlete_id: data.athlete_id,
            staff_id: staffId,
            starts_at: startsAt,
            ends_at: endsAt,
            type: data.type || 'allenamento',
            status: data.status || 'attivo',
            notes: data.notes || null,
            location: data.location || null,
          }

          // Log dati prima dell'inserimento per debug
          console.log('=== TENTATIVO INSERIMENTO APPUNTAMENTO ===', insertData)

          const { data: insertedData, error } = await supabase
            .from('appointments')
            .insert(insertData)
            .select()
            .single()

          if (error) {
            console.error('=== ERRORE SUPABASE INSERIMENTO ===', {
              error,
              errorMessage: error.message,
              errorCode: error.code,
              errorDetails: error.details,
              errorHint: error.hint,
              insertData,
            })
            throw error
          }

          console.log('=== APPUNTAMENTO INSERITO CON SUCCESSO ===', insertedData)
        }

        // Ricarica gli appuntamenti
        await fetchAppointments()
      } catch (err) {
        // Estrai dettagli dell'errore per logging migliore
        const errorDetails: Record<string, unknown> = {
          staffId,
          editingId: editingAppointment?.id,
          hasData: !!data,
          dataKeys: data ? Object.keys(data) : [],
        }

        // Se è un errore Supabase, estrai dettagli specifici
        if (err && typeof err === 'object') {
          const supabaseError = err as {
            message?: string
            code?: string
            details?: string
            hint?: string
            name?: string
          }

          errorDetails.errorMessage = supabaseError.message || String(err)
          errorDetails.errorCode = supabaseError.code
          errorDetails.errorDetails = supabaseError.details
          errorDetails.errorHint = supabaseError.hint
          errorDetails.errorName = supabaseError.name

          // Se è un Error standard, aggiungi stack
          if (err instanceof Error) {
            errorDetails.errorStack = err.stack
          }
        } else {
          errorDetails.errorString = String(err)
        }

        // Aggiungi dati del form (senza dati sensibili)
        if (data) {
          errorDetails.formData = {
            hasAthleteId: !!data.athlete_id,
            athleteId: data.athlete_id,
            hasStartsAt: !!data.starts_at,
            startsAt: data.starts_at,
            hasEndsAt: !!data.ends_at,
            endsAt: data.ends_at,
            type: data.type,
            status: data.status,
            orgId: data.org_id,
            hasLocation: !!data.location,
            hasNotes: !!data.notes,
            staffId: data.staff_id,
          }
        }

        // Log con tutti i dettagli
        console.error('=== ERRORE SALVATAGGIO APPUNTAMENTO ===', {
          error: err,
          errorDetails,
          fullError: JSON.stringify(err, Object.getOwnPropertyNames(err)),
        })

        logger.error('Errore salvataggio appuntamento', err, errorDetails)
        throw err
      }
    },
    [staffId, staffRole, calendarBlocks, fetchAppointments, notify],
  )

  const handleDelete = useCallback(
    async (appointmentId: string) => {
      try {
        const { error } = await supabase.from('appointments').delete().eq('id', appointmentId)

        if (error) throw error

        await fetchAppointments()
      } catch (err) {
        logger.error('Errore eliminazione appuntamento', err, { appointmentId })
        throw err
      }
    },
    [fetchAppointments],
  )

  const handleComplete = useCallback(
    async (appointmentId: string) => {
      try {
        // Prima recupera l'appuntamento per ottenere l'athlete_id
        const { data: appointment, error: fetchError } = await supabase
          .from('appointments')
          .select('id, athlete_id, starts_at, ends_at, service_type')
          .eq('id', appointmentId)
          .single()

        if (fetchError) throw fetchError

        // Aggiorna lo status dell'appuntamento (source of truth)
        const { error: updateError } = await supabase
          .from('appointments')
          .update({
            status: 'completato',
          })
          .eq('id', appointmentId)

        if (updateError) throw updateError

        if (appointment?.athlete_id) {
          try {
            const skipForAppCoached = await hasOverlappingAppCoachedWorkoutDebit(
              supabase,
              appointment.athlete_id,
              appointment.starts_at,
              appointment.ends_at,
              appointment.service_type,
            )
            if (!skipForAppCoached) {
              await addDebitFromAppointment(
                {
                  id: appointmentId,
                  athlete_id: appointment.athlete_id,
                  service_type: coerceLedgerServiceType(appointment.service_type),
                },
                staffId,
              )
            }
          } catch (ledgerErr) {
            logger.warn('Errore insert credit_ledger DEBIT', ledgerErr, {
              appointmentId,
              athleteId: appointment.athlete_id,
            })
            throw ledgerErr
          }
        }

        // Invalida la cache degli abbonamenti per forzare il refresh
        try {
          if (typeof window !== 'undefined') {
            const keysToDelete: string[] = []
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i)
              if (key && key.includes('cache_frequent-query:abbonamenti')) {
                keysToDelete.push(key)
              }
            }
            keysToDelete.forEach((key) => localStorage.removeItem(key))
          }
        } catch (cacheErr) {
          logger.warn('Errore invalidazione cache abbonamenti', cacheErr)
        }

        await fetchAppointments()
      } catch (err) {
        const msg =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message?: unknown }).message)
            : err instanceof Error
              ? err.message
              : String(err)
        const code =
          err && typeof err === 'object' && 'code' in err
            ? (err as { code?: string }).code
            : undefined
        logger.error('Errore completamento appuntamento', err, {
          appointmentId,
          message: msg,
          code,
        })
        throw err instanceof Error ? err : new Error(msg || 'Errore completamento appuntamento')
      }
    },
    [fetchAppointments, staffId],
  )

  const handleCancel = useCallback(
    async (appointmentId: string) => {
      try {
        const { error } = await supabase
          .from('appointments')
          .update({
            cancelled_at: new Date().toISOString(),
            status: 'annullato',
          })
          .eq('id', appointmentId)

        if (error) throw error

        await fetchAppointments()
      } catch (err) {
        logger.error('Errore cancellazione appuntamento', err, { appointmentId })
        throw err
      }
    },
    [fetchAppointments],
  )

  return {
    appointments,
    appointmentsLoading,
    athletes,
    athletesLoading,
    staffId,
    staffName,
    fetchAppointments,
    handleFormSubmit,
    handleDelete,
    handleComplete,
    handleCancel,
  }
}
