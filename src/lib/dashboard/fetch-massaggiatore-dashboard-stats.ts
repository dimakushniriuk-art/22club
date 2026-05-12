import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'

export type MassaggiatoreUpcomingAppointment = {
  id: string
  starts_at: string
  athlete_name: string
}

export type MassaggiatoreDashboardStats = {
  clientiSeguiti: number
  massaggiEseguiti: number
  massaggiTotali: number
  fattureEmesse: number
  appuntamentiOggi: number
  appuntamentiSettimana: number
  prossimiAppuntamenti: MassaggiatoreUpcomingAppointment[]
}

function firstSupabaseErrorMessage(
  results: Array<{ error: { message?: string } | null }>,
): string | null {
  for (const result of results) {
    const message = result.error?.message
    if (message) return message
  }
  return null
}

function todayUtcRange(): { startIso: string; endIso: string } {
  const today = new Date().toISOString().split('T')[0]
  return {
    startIso: `${today}T00:00:00.000Z`,
    endIso: `${new Date(Date.now() + 86400000).toISOString().split('T')[0]}T00:00:00.000Z`,
  }
}

export async function fetchMassaggiatoreDashboardStats(
  supabase: SupabaseClient<Database>,
  staffProfileId: string,
): Promise<MassaggiatoreDashboardStats> {
  const nowIso = new Date().toISOString()
  const weekEndIso = new Date(Date.now() + 7 * 86400000).toISOString()
  const { startIso: todayStartIso, endIso: todayEndIso } = todayUtcRange()

  const [clientiRes, appointmentsRes, paymentsRes, oggiRes, weekRes, aptDataRes] =
    await Promise.all([
      supabase
        .from('staff_atleti')
        .select('id', { count: 'exact', head: true })
        .eq('staff_id', staffProfileId)
        .eq('staff_type', 'massaggiatore')
        .eq('status', 'active'),
      supabase
        .from('appointments')
        .select('id, status')
        .eq('staff_id', staffProfileId)
        .eq('type', 'massaggio'),
      supabase
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .eq('created_by_staff_id', staffProfileId),
      supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('staff_id', staffProfileId)
        .eq('type', 'massaggio')
        .gte('starts_at', todayStartIso)
        .lt('starts_at', todayEndIso)
        .neq('status', 'annullato'),
      supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('staff_id', staffProfileId)
        .eq('type', 'massaggio')
        .gte('starts_at', nowIso)
        .lte('starts_at', weekEndIso)
        .neq('status', 'annullato'),
      supabase
        .from('appointments')
        .select('id, starts_at, athlete_id')
        .eq('staff_id', staffProfileId)
        .eq('type', 'massaggio')
        .gte('starts_at', nowIso)
        .is('cancelled_at', null)
        .order('starts_at', { ascending: true })
        .limit(12),
    ])

  const supabaseErr = firstSupabaseErrorMessage([
    clientiRes,
    appointmentsRes,
    paymentsRes,
    oggiRes,
    weekRes,
    aptDataRes,
  ])
  if (supabaseErr) {
    throw new Error(supabaseErr)
  }

  const appointments = appointmentsRes.data ?? []
  const aptData = (aptDataRes.data ?? []) as Array<{
    id: string
    starts_at: string
    athlete_id: string | null
  }>
  const athleteIds = [...new Set(aptData.map((a) => a.athlete_id).filter(Boolean))] as string[]
  const profilesMap = new Map<string, { nome: string | null; cognome: string | null }>()

  if (athleteIds.length > 0) {
    for (const idChunk of chunkForSupabaseIn(athleteIds)) {
      const { data: profiles, error: profilesErr } = await supabase
        .from('profiles')
        .select('id, nome, cognome')
        .in('id', idChunk)
      if (profilesErr) {
        throw new Error(profilesErr.message)
      }
      ;(profiles ?? []).forEach(
        (p: { id: string; nome: string | null; cognome: string | null }) => {
          profilesMap.set(p.id, { nome: p.nome, cognome: p.cognome })
        },
      )
    }
  }

  const prossimiAppuntamenti: MassaggiatoreUpcomingAppointment[] = aptData.map((apt) => {
    const p = apt.athlete_id != null ? profilesMap.get(apt.athlete_id) : undefined
    const name = p ? [p.nome, p.cognome].filter(Boolean).join(' ') || 'Cliente' : 'Cliente'
    return {
      id: apt.id,
      starts_at: apt.starts_at,
      athlete_name: name,
    }
  })

  return {
    clientiSeguiti: clientiRes.count ?? 0,
    massaggiEseguiti: appointments.filter((a) => a.status === 'completato').length,
    massaggiTotali: appointments.length,
    fattureEmesse: paymentsRes.count ?? 0,
    appuntamentiOggi: oggiRes.count ?? 0,
    appuntamentiSettimana: weekRes.count ?? 0,
    prossimiAppuntamenti,
  }
}
