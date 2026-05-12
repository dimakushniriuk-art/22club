import type { SupabaseClient } from '@supabase/supabase-js'
import type { AppointmentTable } from '@/types/appointment'

export type AthleteBookingsProfileRow = {
  id: string
  nome: string | null
  cognome: string | null
  email: string | null
  avatar: string | null
  avatar_url: string | null
}

export type AthleteBookingsPageData = {
  profile: AthleteBookingsProfileRow | null
  appointments: AppointmentTable[]
}

export async function fetchAthleteBookingsPageData(
  supabase: SupabaseClient,
  athleteId: string,
): Promise<AthleteBookingsPageData> {
  const [profileRes, appointmentsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, nome, cognome, email, avatar, avatar_url')
      .eq('id', athleteId)
      .maybeSingle(),
    supabase
      .from('appointments')
      .select(
        'id, org_id, athlete_id, staff_id, trainer_id, starts_at, ends_at, type, status, service_type, color, notes, location, cancelled_at, recurrence_rule, created_at, updated_at, is_open_booking_day, created_by_role',
      )
      .eq('athlete_id', athleteId)
      .order('starts_at', { ascending: false }),
  ])

  if (profileRes.error) throw profileRes.error
  if (appointmentsRes.error) throw appointmentsRes.error

  return {
    profile: (profileRes.data as AthleteBookingsProfileRow | null) ?? null,
    appointments: (appointmentsRes.data as AppointmentTable[] | null) ?? [],
  }
}
