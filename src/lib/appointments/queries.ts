/**
 * Query riusabili dominio appointments (staff / calendario).
 * Solo incapsulamento — nessuna business logic extra; RLS invariata (client Supabase session).
 */

import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { Tables } from '@/types/supabase'
import { STAFF_APPOINTMENTS_CORE_SELECT } from '@/lib/appointments/staff-appointments-select'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'

/** Select lista tabella appuntamenti staff (pagina /dashboard/appuntamenti). */
export const STAFF_APPOINTMENTS_TABLE_LIST_SELECT = `${STAFF_APPOINTMENTS_CORE_SELECT},updated_at`

/** Select lista calendario staff (merge Free Pass + collaboratori gestito a parte). */
export const STAFF_APPOINTMENTS_CALENDAR_LIST_SELECT = `${STAFF_APPOINTMENTS_CORE_SELECT},color,is_open_booking_day,created_by_role`

type AppointmentRow = Tables<'appointments'>

/** Riga calendario: campi DB + estensioni usate dalla UI calendario. */
export type StaffCalendarAppointmentListRow = AppointmentRow & {
  color?: string | null
  is_open_booking_day?: boolean | null
  created_by_role?: string | null
  service_type?: 'training' | 'nutrition' | 'massage' | null
}

/**
 * Appuntamenti dello staff per la tabella: solo staff_id, ordinati per starts_at.
 */
export function listStaffAppointmentsForTable(client: SupabaseClient<Database>, staffId: string) {
  return (
    client
      .from('appointments')
      .select(STAFF_APPOINTMENTS_TABLE_LIST_SELECT)
      .eq('staff_id', staffId)
      /** Lista tab staff: solo sedute reali, non slot calendario "Libera prenotazione" */
      .or('is_open_booking_day.is.null,is_open_booking_day.eq.false')
      .order('starts_at', { ascending: true })
  )
}

export type ListMergedCalendarAppointmentsArgs = {
  staffProfileId: string
  staffOrgId: string | null
  staffRole: string | null
  showFreePass: boolean
  showCollaborators: boolean
}

/**
 * Carica appuntamenti calendario: propri + (trainer/admin) Free Pass org + collaboratori,
 * poi filtra slot privati di altri staff. Stessa semantica di use-calendar-page (fetch lista).
 */
export async function listMergedStaffCalendarAppointments(
  client: SupabaseClient<Database>,
  args: ListMergedCalendarAppointmentsArgs,
): Promise<{
  data: StaffCalendarAppointmentListRow[] | null
  error: PostgrestError | null
}> {
  const { staffProfileId, staffOrgId, staffRole, showFreePass, showCollaborators } = args
  const selectFields = STAFF_APPOINTMENTS_CALENDAR_LIST_SELECT
  const isTrainerOrAdmin = staffRole === 'trainer' || staffRole === 'admin'

  const { data: myData, error: myError } = await client
    .from('appointments')
    .select(selectFields)
    .eq('staff_id', staffProfileId)
    .order('starts_at', { ascending: true })

  if (myError) {
    return { data: null, error: myError }
  }

  const allRows = [...((myData ?? []) as unknown as StaffCalendarAppointmentListRow[])]

  if (isTrainerOrAdmin && staffOrgId) {
    if (showFreePass) {
      const { data: freePassData } = await client
        .from('appointments')
        .select(selectFields)
        .eq('org_id', staffOrgId)
        .eq('is_open_booking_day', true)
        .order('starts_at', { ascending: true })
      const fpRows = (freePassData ?? []) as unknown as StaffCalendarAppointmentListRow[]
      const seen = new Set(allRows.map((r) => r.id))
      for (const r of fpRows) {
        if (!seen.has(r.id)) {
          seen.add(r.id)
          allRows.push(r)
        }
      }
    }
    if (showCollaborators) {
      const { data: collaboratorProfiles } = await client
        .from('profiles')
        .select('id')
        .eq('org_id', staffOrgId)
        .in('role', ['nutrizionista', 'massaggiatore'])
      const collIds = (collaboratorProfiles ?? [])
        .map((p: { id: string }) => p.id)
        .filter((id: string) => id !== staffProfileId)
      if (collIds.length > 0) {
        const seen = new Set(allRows.map((r) => r.id))
        for (const collChunk of chunkForSupabaseIn(collIds)) {
          const { data: collData } = await client
            .from('appointments')
            .select(selectFields)
            .in('staff_id', collChunk)
            .order('starts_at', { ascending: true })
          const collRows = (collData ?? []) as unknown as StaffCalendarAppointmentListRow[]
          for (const r of collRows) {
            if (!seen.has(r.id)) {
              seen.add(r.id)
              allRows.push(r)
            }
          }
        }
      }
    }
  }

  allRows.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
  const appointmentRows = allRows.filter(
    (apt) => !(apt.type === 'privato' && apt.staff_id !== staffProfileId),
  )

  return { data: appointmentRows, error: null }
}
