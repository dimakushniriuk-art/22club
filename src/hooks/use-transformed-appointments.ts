'use client'

import { useMemo } from 'react'
import { isValidUUID, isValidDateString } from '@/lib/utils/type-guards'
import type { Tables } from '@/types/supabase'

// Funzione helper per formattare la data in italiano (memoizzata esternamente)
const formatAppointmentDate = (startsAt: string): { day: string; time: string } => {
  const appointmentDate = new Date(startsAt)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const appointmentDay = new Date(
    appointmentDate.getFullYear(),
    appointmentDate.getMonth(),
    appointmentDate.getDate(),
  )

  let day: string
  if (appointmentDay.getTime() === today.getTime()) {
    day = 'Oggi'
  } else if (appointmentDay.getTime() === tomorrow.getTime()) {
    day = 'Domani'
  } else {
    // Nome del giorno della settimana
    day = appointmentDate.toLocaleDateString('it-IT', { weekday: 'long' })
    // Capitalizza la prima lettera
    day = day.charAt(0).toUpperCase() + day.slice(1)
  }

  const time = appointmentDate.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return { day, time }
}

const formatAppointmentType = (type: string | null): string => {
  if (!type) return 'Appuntamento'
  const normalized = type.trim().toLowerCase()
  if (normalized === 'personal_training' || normalized === 'pt') return 'Personal Training'
  if (normalized === 'consultation' || normalized === 'consulenza') return 'Consulenza'
  if (normalized === 'assessment' || normalized === 'valutazione') return 'Valutazione'
  return type.charAt(0).toUpperCase() + type.slice(1)
}

// Type per appuntamenti trasformati
export type TransformedAppointment = {
  id: string
  day: string
  time: string
  type: string
  ptName: string
  location: string | null
  status: 'programmato' | 'in_corso' | 'cancellato'
  dateTime: string
}

// Tipo esteso per appuntamenti che possono includere trainer_name
// Accetta sia Tables<'appointments'> che tipi estesi con trainer_name
type AppointmentWithTrainerName = (Tables<'appointments'> | Record<string, unknown>) & {
  id: string
  starts_at: string
  ends_at: string
  type: string | null
  location: string | null
  cancelled_at: string | null
  trainer_name?: string | null
}

/**
 * Hook per trasformare gli appuntamenti dal database al formato richiesto da AppointmentsCard
 * Estratto da page.tsx per migliorare performance e manutenibilità
 */
export function useTransformedAppointments(
  dbAppointments: AppointmentWithTrainerName[] | null | undefined,
): TransformedAppointment[] {
  // Estrai valori chiave da dbAppointments per dipendenze stabili (ottimizzazione performance)
  const appointmentsKey = useMemo(() => {
    if (!dbAppointments || dbAppointments.length === 0) return null
    // Crea una chiave stabile basata sui valori chiave degli appuntamenti (non sulla reference)
    const validAppointments = dbAppointments.filter(
      (apt) =>
        apt.id &&
        isValidUUID(apt.id) &&
        apt.starts_at &&
        isValidDateString(apt.starts_at) &&
        apt.ends_at &&
        isValidDateString(apt.ends_at),
    )

    if (validAppointments.length === 0) return null

    // Serializza valori chiave per confronto stabile
    return JSON.stringify(
      validAppointments.map((apt) => ({
        id: apt.id,
        starts_at: apt.starts_at,
        ends_at: apt.ends_at,
        type: apt.type,
        cancelled_at: apt.cancelled_at,
      })),
    )
  }, [dbAppointments])

  // Trasforma gli appuntamenti dal database al formato richiesto da AppointmentsCard (ottimizzato)
  const transformedAppointments = useMemo((): TransformedAppointment[] => {
    if (!dbAppointments || dbAppointments.length === 0 || !appointmentsKey) return []

    return dbAppointments
      .filter((apt) => {
        // Type guard: valida che l'appuntamento abbia i campi necessari
        return (
          apt.id &&
          isValidUUID(apt.id) &&
          apt.starts_at &&
          isValidDateString(apt.starts_at) &&
          apt.ends_at &&
          isValidDateString(apt.ends_at)
        )
      })
      .map((apt) => {
        const { day, time } = formatAppointmentDate(apt.starts_at)
        const endTime = new Date(apt.ends_at).toLocaleTimeString('it-IT', {
          hour: '2-digit',
          minute: '2-digit',
        })

        return {
          id: apt.id,
          day,
          time: `${time}-${endTime}`,
          type: formatAppointmentType(apt.type),
          ptName: apt.trainer_name || 'Personal Trainer',
          location: apt.location,
          status: apt.cancelled_at
            ? ('cancellato' as const)
            : new Date(apt.starts_at) > new Date()
              ? ('programmato' as const)
              : ('in_corso' as const),
          dateTime: apt.starts_at,
        }
      })
  }, [appointmentsKey, dbAppointments]) // Usa appointmentsKey invece di dbAppointments direttamente

  return transformedAppointments
}
