// ============================================================
// Hook semplificato per gestione appuntamenti
// Approccio diretto con insert/update/delete via Supabase client
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'

const logger = createLogger('hooks:appointments:use-appointments')
import type {
  AppointmentTable,
  CreateAppointmentData,
  EditAppointmentData,
} from '@/types/appointment'
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

export function useAppointments() {
  const supabase = createClient()
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
  }, [supabase])

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
            if (!apt.athlete_id) return { ...apt, athlete_name: null }

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
  }, [staffId, staffName, supabase])

  // Carica atleti
  const fetchAthletes = useCallback(async () => {
    try {
      setAthletesLoading(true)
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, nome, cognome, email')
        .in('role', ['atleta', 'athlete'])
        .order('nome', { ascending: true })

      if (error) throw error

      if (profiles) {
        setAthletes(
          profiles.map((p) => ({
            id: p.id,
            name: `${p.nome || ''} ${p.cognome || ''}`.trim() || 'Atleta',
            email: p.email || '',
          })),
        )
      }
    } catch (err) {
      logger.error('Errore caricamento atleti', err)
    } finally {
      setAthletesLoading(false)
    }
  }, [supabase])

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
    [staffId, supabase, fetchAppointments],
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
    [supabase, fetchAppointments],
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

        // Aggiorna lo status dell'appuntamento
        const { error: updateError } = await supabase
          .from('appointments')
          .update({
            status: 'completato',
          })
          .eq('id', appointmentId)

        if (updateError) throw updateError

        // Decrementa il contatore delle lezioni (permettendo valori negativi)
        if (appointment?.athlete_id) {
          try {
            // Cerca il contatore esistente
            const { data: existingCounter, error: counterFetchError } = await supabase
              .from('lesson_counters')
              .select('id, count')
              .eq('athlete_id', appointment.athlete_id)
              .maybeSingle()

            if (counterFetchError && counterFetchError.code !== 'PGRST116') {
              // PGRST116 = no rows returned, ma può essere gestito
              logger.warn('Errore lettura contatore lezioni', counterFetchError, {
                athleteId: appointment.athlete_id,
              })
            }

            if (existingCounter) {
              // Aggiorna il contatore esistente (permetti valori negativi)
              const currentCount = existingCounter.count ?? 0
              const newCount = currentCount - 1

              logger.info('Decremento contatore lezioni', {
                athleteId: appointment.athlete_id,
                counterId: existingCounter.id,
                currentCount,
                newCount,
              })

              const { data: updatedCounter, error: counterUpdateError } = await supabase
                .from('lesson_counters')
                .update({
                  count: newCount,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', existingCounter.id)
                .select()
                .single()

              if (counterUpdateError) {
                logger.error('Errore aggiornamento contatore lezioni', counterUpdateError, {
                  athleteId: appointment.athlete_id,
                  counterId: existingCounter.id,
                  currentCount,
                  newCount,
                })
              } else {
                logger.info('Contatore aggiornato con successo', {
                  athleteId: appointment.athlete_id,
                  counterId: existingCounter.id,
                  oldCount: currentCount,
                  newCount: updatedCounter?.count,
                })
              }
            } else {
              // Crea un nuovo contatore con valore -1 (lezioni in negativo)
              logger.info('Creazione nuovo contatore lezioni', {
                athleteId: appointment.athlete_id,
                initialCount: -1,
              })

              const { data: newCounter, error: counterInsertError } = await supabase
                .from('lesson_counters')
                .insert({
                  athlete_id: appointment.athlete_id,
                  lesson_type: 'standard',
                  count: -1,
                  updated_at: new Date().toISOString(),
                })
                .select()
                .single()

              if (counterInsertError) {
                logger.error('Errore creazione contatore lezioni', counterInsertError, {
                  athleteId: appointment.athlete_id,
                })
              } else {
                logger.info('Contatore creato con successo', {
                  athleteId: appointment.athlete_id,
                  counterId: newCounter?.id,
                  initialCount: newCounter?.count,
                })
              }
            }
          } catch (counterErr) {
            // Non bloccare il completamento dell'appuntamento se c'è un errore con il contatore
            logger.warn('Errore gestione contatore lezioni', counterErr, {
              appointmentId,
              athleteId: appointment?.athlete_id,
            })
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
        logger.error('Errore completamento appuntamento', err, { appointmentId })
        throw err
      }
    },
    [supabase, fetchAppointments],
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
    [supabase, fetchAppointments],
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
