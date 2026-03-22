// ============================================================
// Hook semplificato per gestione appuntamenti
// Approccio diretto con insert/update/delete via Supabase client
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { addDebitFromAppointment } from '@/lib/credits/ledger'

import type {
  AppointmentTable,
  CreateAppointmentData,
  EditAppointmentData,
} from '@/types/appointment'

const logger = createLogger('hooks:appointments:useStaffAppointmentsTable')
// Validazione sovrapposizione rimossa per permettere più atleti nello stesso orario
// import { checkAppointmentOverlap } from '@/lib/appointment-utils'

const normalizeAppointmentStatus = (status?: string | null): AppointmentTable['status'] => {
  switch (status) {
    case 'completato':
    case 'completed':
      return 'completato'
    case 'annullato':
    case 'cancelled':
      return 'annullato'
    default:
      return 'attivo'
  }
}

export function useStaffAppointmentsTable() {
  const [appointments, setAppointments] = useState<AppointmentTable[]>([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)
  const [athletes, setAthletes] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [athletesLoading, setAthletesLoading] = useState(true)
  const [staffId, setStaffId] = useState<string | null>(null)
  const [staffName, setStaffName] = useState<string | null>(null)

  // Carica il profilo dello staff corrente
  useEffect(() => {
    async function fetchStaffProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('id, nome, cognome')
          .eq('user_id', user.id)
          .single()

        if (profile) {
          setStaffId(profile.id)
          const fullName = `${profile.nome || ''} ${profile.cognome || ''}`.trim()
          setStaffName(fullName || null)
        }
      } catch (err) {
        logger.error('Errore caricamento profilo staff', err)
      }
    }

    fetchStaffProfile()
  }, [])

  // Carica appuntamenti dal database
  const fetchAppointments = useCallback(async () => {
    if (!staffId) return

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
            location,
            notes,
            cancelled_at,
            created_at,
            updated_at
          `,
        )
        .eq('staff_id', staffId)
        .order('starts_at', { ascending: true })

      if (appointmentsError) throw appointmentsError

      // Carica nomi atleti e staff
      if (appointmentsData) {
        // Nota: athleteIds potrebbe essere usato in futuro per query batch
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const athleteIds = [
          ...new Set(appointmentsData.map((apt) => apt.athlete_id).filter(Boolean)),
        ]

        const appointmentsWithNames = await Promise.all(
          appointmentsData.map(async (apt) => {
            if (!apt.athlete_id) return { ...apt, athlete_name: null } as AppointmentTable

            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('nome, cognome')
                .eq('id', apt.athlete_id)
                .single()

              const athleteName =
                profile && (profile.nome || profile.cognome)
                  ? `${profile.nome || ''} ${profile.cognome || ''}`.trim()
                  : null

              return {
                ...apt,
                athlete_name: athleteName,
                staff_name: staffName,
                status: normalizeAppointmentStatus(apt.status),
              } as AppointmentTable
            } catch {
              return {
                ...apt,
                athlete_name: null,
                staff_name: staffName,
                status: normalizeAppointmentStatus(apt.status),
              } as AppointmentTable
            }
          }),
        )

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
        .eq('role', 'athlete')
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

        // Validazione sovrapposizione rimossa: permette più atleti nello stesso orario
        // (utile per allenamenti di gruppo o più atleti contemporaneamente)

        // Assicurati che org_id sia presente (usa default-org se non specificato)
        if (!data.org_id) {
          // Prova a recuperare org_id dal profilo staff
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('org_id')
              .eq('user_id', user.id)
              .single()

            if (profile?.org_id) {
              data.org_id = profile.org_id
            }
          }

          // Se ancora non c'è org_id, usa 'default-org' (valore di default del database)
          if (!data.org_id) {
            data.org_id = 'default-org'
          }
        }

        if (editingAppointment && editingAppointment.id) {
          // Modifica appuntamento esistente
          const { error } = await supabase
            .from('appointments')
            .update({
              athlete_id: data.athlete_id,
              starts_at: data.starts_at,
              ends_at: data.ends_at,
              type: data.type || 'allenamento',
              status: data.status || 'attivo',
              notes: data.notes,
              location: data.location,
              org_id: data.org_id, // Aggiorna anche org_id se necessario
            })
            .eq('id', editingAppointment.id)

          if (error) throw error
        } else {
          // Verifica che staffId sia presente
          if (!staffId) {
            throw new Error("Staff ID non disponibile. Impossibile creare l'appuntamento.")
          }

          // Crea nuovo appuntamento
          const insertData = {
            org_id: data.org_id || 'default-org',
            athlete_id: data.athlete_id,
            staff_id: staffId,
            starts_at: data.starts_at,
            ends_at: data.ends_at,
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
    [staffId, fetchAppointments],
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
          .select('id, athlete_id')
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

        // Ledger: unica scalata crediti al completamento (idempotenza gestita in addDebitFromAppointment)
        if (appointment?.athlete_id) {
          try {
            await addDebitFromAppointment(
              { id: appointmentId, athlete_id: appointment.athlete_id },
              staffId,
            )
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
