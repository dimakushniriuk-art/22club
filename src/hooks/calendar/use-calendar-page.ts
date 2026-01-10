// ============================================================
// Hook per gestione pagina calendario (FASE C - Split File Lunghi)
// ============================================================
// Estratto da calendario/page.tsx per migliorare manutenibilità
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
// Validazione sovrapposizione rimossa per permettere più atleti nello stesso orario
// import { checkAppointmentOverlap } from '@/lib/appointment-utils'
import { createLogger } from '@/lib/logger'
import type { AppointmentUI, CreateAppointmentData, EditAppointmentData } from '@/types/appointment'
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

export function useCalendarPage() {
  // Nota: router e searchParams potrebbero essere usati in futuro per navigazione/filtri URL
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [appointments, setAppointments] = useState<AppointmentUI[]>([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)
  const [athletes, setAthletes] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [athletesLoading, setAthletesLoading] = useState(true)
  const [trainerId, setTrainerId] = useState<string | null>(null)
  const [trainerName, setTrainerName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
          setTrainerId(profile.id)
          const fullName = `${profile.nome || ''} ${profile.cognome || ''}`.trim()
          setTrainerName(fullName || null)
        }
      } catch (err) {
        logger.error('Errore caricamento profilo staff', err)
      }
    }

    fetchStaffProfile()
  }, [supabase])

  // Carica appuntamenti dal database
  // Usa staff_id nella nuova struttura semplificata (trainer_id rimosso)
  const fetchAppointments = useCallback(async () => {
    if (!trainerId) return

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
            created_at
          `,
        )
        .eq('staff_id', trainerId) // trainerId corrisponde a staff_id nella nuova struttura
        .order('starts_at', { ascending: true })

      if (appointmentsError) {
        logger.error('Errore caricamento appuntamenti', appointmentsError)
        return
      }

      // Carica nomi atleti e staff per visualizzazione
      const appointmentRows = (appointmentsData ?? []) as AppointmentRow[]
      const athleteIds = [...new Set(appointmentRows.map((apt) => apt.athlete_id).filter(Boolean))]

      // Carica nomi atleti
      const athleteNamesMap = new Map<string, string>()
      if (athleteIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, nome, cognome')
          .in('id', athleteIds)

        profiles?.forEach((profile) => {
          const fullName = `${profile.nome || ''} ${profile.cognome || ''}`.trim()
          athleteNamesMap.set(profile.id, fullName || 'Atleta')
        })
      }

      const mappedAppointments: AppointmentUI[] = appointmentRows.map((apt) => {
        const athleteName = athleteNamesMap.get(apt.athlete_id) || 'Atleta'

        // Mappa i tipi per visualizzazione nel calendario
        let mappedType: 'allenamento' | 'prova' | 'valutazione' = 'allenamento'
        if (apt.type === 'prova') {
          mappedType = 'prova'
        } else if (apt.type === 'valutazione') {
          mappedType = 'valutazione'
        } else if (
          apt.type === 'consulenza' ||
          apt.type === 'prima_visita' ||
          apt.type === 'riunione' ||
          apt.type === 'massaggio' ||
          apt.type === 'nutrizionista' ||
          apt.type === 'check'
        ) {
          mappedType = 'valutazione'
        } else {
          // 'cardio' e altri -> 'allenamento'
          mappedType = 'allenamento'
        }

        return {
          id: apt.id,
          org_id: apt.org_id || 'default-org',
          title: `${athleteName} - ${apt.notes || apt.type || 'Sessione'}`,
          start: apt.starts_at,
          end: apt.ends_at,
          athlete: athleteName,
          type: mappedType,
          location: apt.location,
          notes: apt.notes,
          cancelled_at: apt.cancelled_at,
          athlete_id: apt.athlete_id,
          staff_id: apt.staff_id,
          starts_at: apt.starts_at,
          ends_at: apt.ends_at,
          status: normalizeAppointmentStatus(apt.status),
          athlete_name: athleteName,
          staff_name: trainerName || 'PT Staff',
          created_at: apt.created_at ?? new Date().toISOString(),
        }
      })
      setAppointments(mappedAppointments)
    } catch (err) {
      logger.error('Errore caricamento appuntamenti', err)
    } finally {
      setAppointmentsLoading(false)
    }
  }, [supabase, trainerId, trainerName])

  useEffect(() => {
    void fetchAppointments()
  }, [fetchAppointments])

  // Carica atleti dal database
  const fetchAthletes = useCallback(async () => {
    try {
      setAthletesLoading(true)
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
    } catch (err) {
      logger.error('Errore caricamento atleti', err)
    } finally {
      setAthletesLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    void fetchAthletes()
  }, [fetchAthletes])

  const handleFormSubmit = useCallback(
    async (data: CreateAppointmentData, editingAppointment: EditAppointmentData | null) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/0f58390d-439e-4525-abb4-d05407869369', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'use-calendar-page.ts:191',
          message: 'handleFormSubmit entry',
          data: {
            trainerId,
            trainerName,
            athlete_id: data.athlete_id,
            starts_at: data.starts_at,
            ends_at: data.ends_at,
            type: data.type,
            org_id: data.org_id,
            editingId: editingAppointment?.id,
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'D',
        }),
      }).catch(() => {})
      // #endregion

      if (!trainerId) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/0f58390d-439e-4525-abb4-d05407869369', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'use-calendar-page.ts:193',
            message: 'Trainer ID null',
            data: { trainerId },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'D',
          }),
        }).catch(() => {})
        // #endregion
        logger.error('Trainer ID non disponibile')
        return
      }

      if (!data.athlete_id) {
        alert('Seleziona un atleta')
        return
      }

      if (!data.starts_at || !data.ends_at) {
        alert('Inserisci data e ora di inizio e fine')
        return
      }

      setLoading(true)

      try {
        const athleteName = athletes.find((a) => a.id === data.athlete_id)?.name || 'Atleta'
        const startsAt = new Date(data.starts_at).toISOString()
        const endsAt = new Date(data.ends_at).toISOString()

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/0f58390d-439e-4525-abb4-d05407869369', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'use-calendar-page.ts:211',
            message: 'After date conversion',
            data: { starts_at: data.starts_at, ends_at: data.ends_at, startsAt, endsAt },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'C',
          }),
        }).catch(() => {})
        // #endregion

        if (new Date(endsAt) <= new Date(startsAt)) {
          throw new Error('La data di fine deve essere successiva alla data di inizio')
        }

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/0f58390d-439e-4525-abb4-d05407869369', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'use-calendar-page.ts:218',
            message: 'Before checkAppointmentOverlap',
            data: { trainerId, startsAt, endsAt, editingId: editingAppointment?.id },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'E',
          }),
        }).catch(() => {})
        // #endregion

        // Validazione sovrapposizione rimossa: permette più atleti nello stesso orario
        // (utile per allenamenti di gruppo o più atleti contemporaneamente)

        if (editingAppointment && editingAppointment.id) {
          // #region agent log
          const updateData = {
            athlete_id: data.athlete_id,
            starts_at: startsAt,
            ends_at: endsAt,
            type: data.type || 'allenamento',
            status: data.status || 'attivo',
            notes: data.notes || null,
            location: data.location || null,
            athlete_name: athleteName,
          }
          fetch('http://127.0.0.1:7242/ingest/0f58390d-439e-4525-abb4-d05407869369', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'use-calendar-page.ts:246',
              message: 'Before UPDATE',
              data: updateData,
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'A',
            }),
          }).catch(() => {})
          // #endregion
          const { error } = await supabase
            .from('appointments')
            .update({
              athlete_id: data.athlete_id,
              starts_at: startsAt,
              ends_at: endsAt,
              type: data.type || 'allenamento',
              status: data.status || 'attivo',
              notes: data.notes || null,
              location: data.location || null,
              athlete_name: athleteName,
            })
            .eq('id', editingAppointment.id)

          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/0f58390d-439e-4525-abb4-d05407869369', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'use-calendar-page.ts:260',
              message: 'After UPDATE',
              data: { error: error?.message, code: error?.code, details: error?.details },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'A,B',
            }),
          }).catch(() => {})
          // #endregion

          if (error) throw error
        } else {
          // Nuovo appuntamento: gestisci ricorrenze se presente
          // Nota: staff_id è obbligatorio nel DB (NOT NULL), trainer_id viene sincronizzato automaticamente dal trigger
          // Per coerenza, passiamo entrambi con lo stesso valore (trainerId)
          // Assicuriamoci che status sia esattamente uno dei valori validi per il constraint CHECK
          const validStatus =
            data.status &&
            ['attivo', 'completato', 'annullato', 'in_corso', 'cancelled', 'scheduled'].includes(
              data.status,
            )
              ? data.status
              : 'attivo' // Default sicuro

          const baseAppointmentData = {
            org_id: data.org_id || 'default-org',
            athlete_id: data.athlete_id,
            staff_id: trainerId, // trainerId corrisponde a staff_id nella nuova struttura
            starts_at: startsAt,
            ends_at: endsAt,
            type: data.type || 'allenamento',
            status: validStatus,
            notes: data.notes || null,
            location: data.location || null,
            // IMPORTANTE: NON includere 'id' nel payload - PostgREST potrebbe interpretarlo come upsert
          }

          // Crea singolo appuntamento (ricorrenze rimosse nella nuova struttura)
          const insertData = {
            ...baseAppointmentData,
          }

          const { data: insertedData, error: insertError } = await supabase
            .from('appointments')
            .insert([insertData])
            .select()
            .single()

          if (insertError) {
            throw insertError
          }

          if (!insertedData) {
            throw new Error("Errore durante la creazione dell'appuntamento")
          }

          logger.info('Appuntamento creato con successo', undefined, {
            appointmentId: insertedData.id,
          })
        }

        await fetchAppointments()
        setLoading(false)
      } catch (err: unknown) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/0f58390d-439e-4525-abb4-d05407869369', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'use-calendar-page.ts:283',
            message: 'CATCH error',
            data: {
              errorMessage: err instanceof Error ? err.message : String(err),
              errorName: err instanceof Error ? err.name : 'Unknown',
              errorStack: err instanceof Error ? err.stack : undefined,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'A,B,C,D,E',
          }),
        }).catch(() => {})
        // #endregion

        // Miglioriamo il logging dell'errore per debug
        logger.error('Errore salvataggio appuntamento', err)

        // Se è un errore Supabase, mostra più dettagli
        let errorMessage = "Errore durante il salvataggio dell'appuntamento"
        if (err instanceof Error) {
          errorMessage = err.message
          // Se contiene dettagli Supabase, mostra anche quelli
          if (err.message.includes('violates') || err.message.includes('constraint')) {
            logger.error('Errore constraint database', err)
            errorMessage = `Errore database: ${err.message}`
          }
        } else if (typeof err === 'object' && err !== null) {
          // Potrebbe essere un oggetto errore Supabase
          const supabaseError = err as {
            message?: string
            details?: string
            hint?: string
            code?: string
          }
          if (supabaseError.message) {
            errorMessage = supabaseError.message
            if (supabaseError.details) {
              logger.error('Dettagli errore', new Error(supabaseError.details), {
                details: supabaseError.details,
              })
              errorMessage += `\n\nDettagli: ${supabaseError.details}`
            }
            if (supabaseError.hint) {
              logger.error('Hint errore', new Error(supabaseError.hint), {
                hint: supabaseError.hint,
              })
              errorMessage += `\n\nSuggerimento: ${supabaseError.hint}`
            }
          }
        }

        alert(errorMessage)
        setLoading(false)
        throw err
      }
    },
    [trainerId, trainerName, athletes, supabase, fetchAppointments],
  )

  const handleCancel = useCallback(
    async (appointmentId: string) => {
      setLoading(true)
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
      } finally {
        setLoading(false)
      }
    },
    [supabase, fetchAppointments],
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
      } finally {
        setLoading(false)
      }
    },
    [supabase, fetchAppointments],
  )

  return {
    appointments,
    appointmentsLoading,
    athletes,
    athletesLoading,
    trainerId,
    trainerName,
    loading,
    fetchAppointments,
    handleFormSubmit,
    handleCancel,
    handleDelete,
  }
}
