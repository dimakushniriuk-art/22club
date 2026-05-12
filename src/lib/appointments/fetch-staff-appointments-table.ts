import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { normalizeAppointmentStatus } from '@/lib/appointment-utils'
import { listStaffAppointmentsForTable } from '@/lib/appointments/queries'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'
import type { AppointmentTable } from '@/types/appointment'

export type StaffAppointmentsFormAthlete = {
  id: string
  name: string
  email: string
}

export async function fetchStaffAppointmentsTableRows(
  client: SupabaseClient<Database>,
  staffId: string,
  staffName: string | null,
): Promise<AppointmentTable[]> {
  const { data: appointmentsData, error: appointmentsError } =
    await listStaffAppointmentsForTable(client, staffId)

  if (appointmentsError) throw appointmentsError
  if (!appointmentsData) return []

  const athleteIds = [
    ...new Set(appointmentsData.map((apt) => apt.athlete_id).filter(Boolean)),
  ] as string[]

  const nameByAthleteId = new Map<string, string>()
  const avatarByAthleteId = new Map<string, string | null>()
  if (athleteIds.length > 0) {
    for (const idChunk of chunkForSupabaseIn(athleteIds)) {
      const { data: profileRows, error: batchProfilesError } = await client
        .from('profiles')
        .select('id, nome, cognome, avatar, avatar_url')
        .in('id', idChunk)

      if (batchProfilesError) throw batchProfilesError

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

  return appointmentsData.map((apt) => {
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
}

export async function fetchStaffAppointmentsFormAthletes(
  client: SupabaseClient<Database>,
): Promise<StaffAppointmentsFormAthlete[]> {
  const { data: profiles, error } = await client
    .from('profiles')
    .select('id, nome, cognome, email')
    .in('role', ['athlete', 'atleta'])
    .order('nome', { ascending: true })

  if (error) throw error

  return (profiles ?? []).map(
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
  )
}
