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
import type { AppointmentUI, CreateAppointmentData, EditAppointmentData, AppointmentColor } from '@/types/appointment'
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
          const p = profile as { id: string; nome?: string | null; cognome?: string | null }
          setTrainerId(p.id)
          const fullName = `${p.nome || ''} ${p.cognome || ''}`.trim()
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
            color,
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
      // Uso tipo esteso per includere il campo color (aggiunto via migration)
      type AppointmentRowWithColor = AppointmentRow & { color?: string | null }
      const appointmentRows = (appointmentsData ?? []) as unknown as AppointmentRowWithColor[]
      const athleteIds = [...new Set(appointmentRows.map((apt) => apt.athlete_id).filter(Boolean))]

      // Carica nomi atleti
      const athleteNamesMap = new Map<string, string>()
      if (athleteIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, nome, cognome')
          .in('id', athleteIds)

        profiles?.forEach((profile) => {
          const p = profile as { id: string; nome?: string | null; cognome?: string | null }
          const fullName = `${p.nome || ''} ${p.cognome || ''}`.trim()
          athleteNamesMap.set(p.id, fullName || 'Atleta')
        })
      }

      const mappedAppointments: AppointmentUI[] = appointmentRows.map((apt: AppointmentRowWithColor) => {
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
          color: (apt.color as AppointmentColor) ?? undefined,
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
      if (!trainerId) {
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

        // Il form gestisce già gli appuntamenti a cavallo di mezzanotte,
        // quindi questo controllo verifica solo che le date siano valide
        if (isNaN(new Date(startsAt).getTime()) || isNaN(new Date(endsAt).getTime())) {
          throw new Error('Date non valide')
        }

        // Validazione sovrapposizione rimossa: permette più atleti nello stesso orario
        // (utile per allenamenti di gruppo o più atleti contemporaneamente)

        if (editingAppointment && editingAppointment.id) {
          const updatePayload = {
            athlete_id: data.athlete_id,
            starts_at: startsAt,
            ends_at: endsAt,
            type: data.type || 'allenamento',
            status: data.status || 'attivo',
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
            color: data.color || null,
            notes: data.notes || null,
            location: data.location || null,
            // IMPORTANTE: NON includere 'id' nel payload - PostgREST potrebbe interpretarlo come upsert
          }

          // Crea singolo appuntamento (ricorrenze rimosse nella nuova struttura)
          const insertData = {
            ...baseAppointmentData,
          } as Partial<AppointmentRow>

          const { data: insertedData, error: insertError } = await supabase
            .from('appointments')
            .insert([insertData])
            .select('id')
            .single()

          if (insertError) {
            throw insertError
          }

          const inserted = insertedData as { id: string } | null
          if (!inserted) {
            throw new Error("Errore durante la creazione dell'appuntamento")
          }

          logger.info('Appuntamento creato con successo', undefined, {
            appointmentId: inserted.id,
          })
        }

        await fetchAppointments()
        setLoading(false)
      } catch (err: unknown) {
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
    [trainerId, athletes, supabase, fetchAppointments],
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
              : apt
          )
        )

        logger.info('Appuntamento spostato', undefined, { appointmentId })
      } catch (err) {
        logger.error('Errore spostamento appuntamento', err, { appointmentId })
        // Ricarica per ripristinare lo stato corretto
        await fetchAppointments()
        throw err
      }
    },
    [supabase, fetchAppointments],
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
              : apt
          )
        )

        logger.info('Appuntamento ridimensionato', undefined, { appointmentId })
      } catch (err) {
        logger.error('Errore ridimensionamento appuntamento', err, { appointmentId })
        // Ricarica per ripristinare lo stato corretto
        await fetchAppointments()
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
    trainerId,
    trainerName,
    loading,
    fetchAppointments,
    handleFormSubmit,
    handleCancel,
    handleDelete,
    handleEventDrop,
    handleEventResize,
  }
}
