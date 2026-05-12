import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'
import { STAFF_ASSIGNMENT_STATUS_ACTIVE, STAFF_TYPE_NUTRIZIONISTA } from '@/lib/nutrition-tables'

export type NutrizionistaUpcomingAppointment = {
  id: string
  starts_at: string
  athlete_name: string
  type: string | null
}

export type NutrizionistaDashboardStats = {
  atletiSeguiti: number
  visiteCompletate: number
  visiteTotali: number
  fattureEmesse: number
  appuntamentiSettimana: number
  prossimiAppuntamenti: NutrizionistaUpcomingAppointment[]
}

export type NutrizionistaDashboardStatsResult = {
  stats: NutrizionistaDashboardStats
  error: string | null
}

export async function fetchNutrizionistaDashboardStats(
  supabase: SupabaseClient<Database>,
  staffProfileId: string,
): Promise<NutrizionistaDashboardStatsResult> {
  const nowIso = new Date().toISOString()
  const weekEndIso = new Date(Date.now() + 7 * 86400000).toISOString()

  const [atletiRes, visiteTotaliRes, visiteCompletateRes, paymentsRes, weekRes, aptDataRes] =
    await Promise.all([
      supabase
        .from('staff_atleti')
        .select('id', { count: 'exact', head: true })
        .eq('staff_id', staffProfileId)
        .eq('staff_type', STAFF_TYPE_NUTRIZIONISTA)
        .eq('status', STAFF_ASSIGNMENT_STATUS_ACTIVE),
      supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('staff_id', staffProfileId)
        .eq('service_type', 'nutrition')
        .is('cancelled_at', null)
        .neq('status', 'annullato'),
      supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('staff_id', staffProfileId)
        .eq('service_type', 'nutrition')
        .eq('status', 'completato')
        .is('cancelled_at', null),
      supabase
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .eq('created_by_staff_id', staffProfileId)
        .eq('service_type', 'nutrition')
        .is('deleted_at', null),
      supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('staff_id', staffProfileId)
        .eq('service_type', 'nutrition')
        .gte('starts_at', nowIso)
        .lte('starts_at', weekEndIso)
        .is('cancelled_at', null)
        .neq('status', 'annullato'),
      supabase
        .from('appointments')
        .select('id, starts_at, athlete_id, type')
        .eq('staff_id', staffProfileId)
        .eq('service_type', 'nutrition')
        .gte('starts_at', nowIso)
        .is('cancelled_at', null)
        .neq('status', 'annullato')
        .order('starts_at', { ascending: true })
        .limit(12),
    ])

  const supabaseErrors = [
    atletiRes.error,
    visiteTotaliRes.error,
    visiteCompletateRes.error,
    paymentsRes.error,
    weekRes.error,
    aptDataRes.error,
  ].filter(Boolean)

  const aptData = (aptDataRes.error ? [] : (aptDataRes.data ?? [])) as Array<{
    id: string
    starts_at: string
    athlete_id: string | null
    type: string | null
  }>
  const athleteIds = [...new Set(aptData.map((a) => a.athlete_id).filter(Boolean))] as string[]
  const profilesMap = new Map<string, { nome: string | null; cognome: string | null }>()
  let profilesErrorMessage: string | null = null

  if (athleteIds.length > 0) {
    for (const idChunk of chunkForSupabaseIn(athleteIds)) {
      const { data: profiles, error: profilesErr } = await supabase
        .from('profiles')
        .select('id, nome, cognome')
        .in('id', idChunk)
      if (profilesErr) {
        profilesErrorMessage =
          profilesErr.message?.trim() ||
          'Impossibile caricare i nomi degli atleti per gli appuntamenti.'
        break
      }
      ;(profiles ?? []).forEach(
        (p: { id: string; nome: string | null; cognome: string | null }) => {
          profilesMap.set(p.id, { nome: p.nome, cognome: p.cognome })
        },
      )
    }
  }

  const prossimiAppuntamenti: NutrizionistaUpcomingAppointment[] = aptData.map((apt) => {
    const p = apt.athlete_id != null ? profilesMap.get(apt.athlete_id) : undefined
    const name = p ? [p.nome, p.cognome].filter(Boolean).join(' ') || 'Atleta' : 'Atleta'
    return {
      id: apt.id,
      starts_at: apt.starts_at,
      athlete_name: name,
      type: apt.type,
    }
  })

  const partialStats: NutrizionistaDashboardStats = {
    atletiSeguiti: atletiRes.error ? 0 : (atletiRes.count ?? 0),
    visiteCompletate: visiteCompletateRes.error ? 0 : (visiteCompletateRes.count ?? 0),
    visiteTotali: visiteTotaliRes.error ? 0 : (visiteTotaliRes.count ?? 0),
    fattureEmesse: paymentsRes.error ? 0 : (paymentsRes.count ?? 0),
    appuntamentiSettimana: weekRes.error ? 0 : (weekRes.count ?? 0),
    prossimiAppuntamenti,
  }

  if (supabaseErrors.length > 0) {
    const msg =
      supabaseErrors[0]?.message && String(supabaseErrors[0].message).trim() !== ''
        ? supabaseErrors[0].message
        : 'Errore nel caricamento dei dati.'
    return { stats: partialStats, error: msg }
  }

  if (profilesErrorMessage) {
    return { stats: partialStats, error: profilesErrorMessage }
  }

  return { stats: partialStats, error: null }
}
