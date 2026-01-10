// 🔄 Recurrence Management — 22Club

import { createClient } from '@/lib/supabase/client'
import type { Appointment } from '@/types/appointment'
import type { TablesUpdate } from '@/types/supabase'
// Nota: deserializeRecurrence potrebbe essere usato in futuro per deserializzazione
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { deserializeRecurrence } from './recurrence-utils'

/**
 * Trova tutti gli appuntamenti appartenenti alla stessa serie ricorrente
 */
export async function findRecurringSeries(
  appointmentId: string,
): Promise<{ series: Appointment[]; isRecurring: boolean }> {
  const supabase = createClient()

  // Ottieni l'appuntamento corrente
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .single()

  if (error || !appointment) {
    return { series: [], isRecurring: false }
  }

  const appt = appointment as Appointment

  // Se non ha recurrence_rule, non è ricorrente
  if (!appt.recurrence_rule) {
    return { series: [appt], isRecurring: false }
  }

  // Trova tutti gli appuntamenti con la stessa recurrence_rule, athlete_id, staff_id, type
  const { data: series, error: seriesError } = await supabase
    .from('appointments')
    .select('*')
    .eq('athlete_id', appt.athlete_id)
    .eq('staff_id', appt.staff_id)
    .eq('type', appt.type)
    .eq('recurrence_rule', appt.recurrence_rule)
    .is('cancelled_at', null)
    .order('starts_at', { ascending: true })

  if (seriesError || !series) {
    return { series: [appt], isRecurring: true }
  }

  return {
    series: series as Appointment[],
    isRecurring: true,
  }
}

/**
 * Cancella un singolo appuntamento dalla serie ricorrente
 */
export async function cancelSingleAppointment(appointmentId: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('appointments')
    .update({
      cancelled_at: new Date().toISOString(),
      status: 'annullato',
    })
    .eq('id', appointmentId)

  return !error
}

/**
 * Cancella tutti gli appuntamenti della serie ricorrente
 */
export async function cancelRecurringSeries(appointmentId: string): Promise<boolean> {
  const { series, isRecurring } = await findRecurringSeries(appointmentId)

  if (!isRecurring || series.length === 0) {
    return false
  }

  const supabase = createClient()
  const seriesIds = series.map((a) => a.id)

  const { error } = await supabase
    .from('appointments')
    .update({
      cancelled_at: new Date().toISOString(),
      status: 'annullato',
    })
    .in('id', seriesIds)

  return !error
}

/**
 * Cancella tutti gli appuntamenti futuri della serie ricorrente (da una data in poi)
 */
export async function cancelFutureRecurringSeries(
  appointmentId: string,
  fromDate: Date,
): Promise<boolean> {
  const { series, isRecurring } = await findRecurringSeries(appointmentId)

  if (!isRecurring || series.length === 0) {
    return false
  }

  const supabase = createClient()
  const futureSeries = series.filter((a) => new Date(a.starts_at) >= fromDate)
  const futureIds = futureSeries.map((a) => a.id)

  if (futureIds.length === 0) {
    return true
  }

  const { error } = await supabase
    .from('appointments')
    .update({
      cancelled_at: new Date().toISOString(),
      status: 'annullato',
    })
    .in('id', futureIds)

  return !error
}

/**
 * Modifica un singolo appuntamento della serie ricorrente
 */
export async function updateSingleAppointment(
  appointmentId: string,
  updates: Partial<Appointment>,
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase.from('appointments').update(updates).eq('id', appointmentId)

  return !error
}

/**
 * Modifica tutti gli appuntamenti della serie ricorrente
 */
export async function updateRecurringSeries(
  appointmentId: string,
  updates: Partial<Appointment>,
): Promise<boolean> {
  const { series, isRecurring } = await findRecurringSeries(appointmentId)

  if (!isRecurring || series.length === 0) {
    return false
  }

  const supabase = createClient()
  const seriesIds = series.map((a) => a.id)

  if (seriesIds.length === 0) {
    return true
  }

  // Rimuovi recurrence_rule dagli updates se stiamo modificando la ricorrenza
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { recurrence_rule, ...updateData } = updates

  // Converti org_id da string | null a string | undefined per il tipo Update
  const updateDataTyped: TablesUpdate<'appointments'> = {
    ...updateData,
    org_id: updateData.org_id ?? undefined,
  }

  const { error } = await supabase.from('appointments').update(updateDataTyped).in('id', seriesIds)

  return !error
}

/**
 * Modifica tutti gli appuntamenti futuri della serie ricorrente (da una data in poi)
 */
export async function updateFutureRecurringSeries(
  appointmentId: string,
  fromDate: Date,
  updates: Partial<Appointment>,
): Promise<boolean> {
  const { series, isRecurring } = await findRecurringSeries(appointmentId)

  if (!isRecurring || series.length === 0) {
    return false
  }

  const supabase = createClient()
  const futureSeries = series.filter((a) => new Date(a.starts_at) >= fromDate)
  const futureIds = futureSeries.map((a) => a.id)

  if (futureIds.length === 0) {
    return true
  }

  // Rimuovi recurrence_rule dagli updates se stiamo modificando la ricorrenza
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { recurrence_rule, ...updateData } = updates

  // Converti org_id da string | null a string | undefined per il tipo Update
  const updateDataTyped: TablesUpdate<'appointments'> = {
    ...updateData,
    org_id: updateData.org_id ?? undefined,
  }

  const { error } = await supabase.from('appointments').update(updateDataTyped).in('id', futureIds)

  return !error
}
