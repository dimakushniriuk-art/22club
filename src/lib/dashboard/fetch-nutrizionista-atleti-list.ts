import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { createLogger } from '@/lib/logger'
import {
  NUTRITION_TABLES,
  nutritionFrom,
  STAFF_ASSIGNMENT_STATUS_ACTIVE,
  STAFF_TYPE_NUTRIZIONISTA,
} from '@/lib/nutrition-tables'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'

const logger = createLogger('lib:dashboard:fetch-nutrizionista-atleti-list')

export type NutrizionistaAthleteListRow = {
  staff_id?: string
  athlete_id: string
  atleta_id?: string
  athlete_name: string | null
  athlete_email: string | null
  assignment_status?: string | null
  active_plan_version?: number | null
  review_date?: string | null
  last_checkin_date?: string | null
  last_progress_at?: string | null
}

export type NutrizionistaPendingInviteRow = {
  request_id: string
  athlete_id: string
  athlete_name: string | null
  athlete_email: string | null
  created_at: string
}

export type NutrizionistaAtletiListData = {
  rows: NutrizionistaAthleteListRow[]
  pendingInvites: NutrizionistaPendingInviteRow[]
  invitesWarning: string | null
}

export async function fetchNutrizionistaAtletiList(
  supabase: SupabaseClient<Database>,
  staffProfileId: string,
): Promise<NutrizionistaAtletiListData> {
  const [athletesRes, invitesRes, invitiClienteRes] = await Promise.all([
    nutritionFrom(supabase, NUTRITION_TABLES.viewAthletes).select('*'),
    supabase
      .from('staff_requests')
      .select('id, athlete_id, created_at')
      .eq('staff_id', staffProfileId)
      .eq('staff_type', STAFF_TYPE_NUTRIZIONISTA)
      .eq('status', 'pending'),
    supabase.rpc('get_inviti_cliente_pendenti_staff'),
  ])

  let invitesWarning: string | null = null
  if (invitesRes.error) {
    logger.warn('staff_requests inviti nutrizionista', invitesRes.error)
    invitesWarning = 'Parte degli inviti non è stata caricata. Controlla la connessione e riprova.'
  }
  if (invitiClienteRes.error) {
    logger.warn('get_inviti_cliente_pendenti_staff', invitiClienteRes.error)
    invitesWarning = 'Parte degli inviti non è stata caricata. Controlla la connessione e riprova.'
  }

  const inviteRows = (invitesRes.error ? [] : (invitesRes.data ?? [])) as Array<{
    id: string
    athlete_id: string
    created_at: string
  }>
  const fromRequests: NutrizionistaPendingInviteRow[] = []

  if (inviteRows.length > 0) {
    const inviteProfileRows: Array<{
      id: string
      nome: string | null
      cognome: string | null
      email: string | null
    }> = []
    for (const idChunk of chunkForSupabaseIn(inviteRows.map((r) => r.athlete_id))) {
      const { data: inviteProfiles, error: inviteProfErr } = await supabase
        .from('profiles')
        .select('id, nome, cognome, email')
        .in('id', idChunk)
      if (inviteProfErr) {
        logger.warn('Profili inviti staff_requests', inviteProfErr)
        invitesWarning = 'Impossibile caricare i dati anagrafici per alcuni inviti.'
        break
      }
      inviteProfileRows.push(...((inviteProfiles ?? []) as (typeof inviteProfileRows)[number][]))
    }
    const profileMap = new Map(
      inviteProfileRows.map((p) => [
        p.id,
        {
          name: [p.nome, p.cognome].filter(Boolean).join(' ') || null,
          email: p.email ?? null,
        },
      ]),
    )
    inviteRows.forEach((r) => {
      const prof = profileMap.get(r.athlete_id)
      fromRequests.push({
        request_id: r.id,
        athlete_id: r.athlete_id,
        athlete_name: prof?.name ?? null,
        athlete_email: prof?.email ?? null,
        created_at: r.created_at,
      })
    })
  }

  const fromInvitiCliente = (invitiClienteRes.error ? [] : (invitiClienteRes.data ?? [])) as Array<{
    invito_id: string
    atleta_id: string
    nome: string | null
    cognome: string | null
    email: string | null
    created_at: string | null
  }>
  const seenAthleteIds = new Set(fromRequests.map((r) => r.athlete_id))
  fromInvitiCliente.forEach((r) => {
    if (seenAthleteIds.has(r.atleta_id)) return
    seenAthleteIds.add(r.atleta_id)
    fromRequests.push({
      request_id: r.invito_id,
      athlete_id: r.atleta_id,
      athlete_name: [r.nome, r.cognome].filter(Boolean).join(' ') || null,
      athlete_email: r.email ?? null,
      created_at: r.created_at ?? new Date().toISOString(),
    })
  })

  const { data, error: athletesErr } = athletesRes
  if (athletesErr) {
    logger.error('v_nutritionist_athletes fallback', athletesErr)
    const { data: staffData, error: staffErr } = await supabase
      .from('staff_atleti')
      .select('atleta_id')
      .eq('staff_id', staffProfileId)
      .eq('status', STAFF_ASSIGNMENT_STATUS_ACTIVE)
      .eq('staff_type', STAFF_TYPE_NUTRIZIONISTA)
    if (staffErr || !staffData?.length) {
      return { rows: [], pendingInvites: fromRequests, invitesWarning }
    }
    const ids = staffData.map((r) => (r as { atleta_id: string }).atleta_id)
    const profiles: Array<{
      id: string
      nome: string | null
      cognome: string | null
      email: string | null
    }> = []
    for (const idChunk of chunkForSupabaseIn(ids)) {
      const { data: profilesData, error: profilesErr } = await supabase
        .from('profiles')
        .select('id, nome, cognome, email')
        .in('id', idChunk)
      if (profilesErr) {
        logger.error('Fallback clienti: profili', profilesErr)
        return { rows: [], pendingInvites: fromRequests, invitesWarning }
      }
      profiles.push(...((profilesData ?? []) as (typeof profiles)[number][]))
    }
    return {
      rows: profiles.map((p) => ({
        staff_id: staffProfileId,
        athlete_id: p.id,
        athlete_name: [p.nome, p.cognome].filter(Boolean).join(' ') || null,
        athlete_email: p.email ?? null,
        assignment_status: 'active' as const,
      })),
      pendingInvites: fromRequests,
      invitesWarning,
    }
  }

  const raw = (data ?? []) as NutrizionistaAthleteListRow[]
  const rows = raw.filter((r) => r.staff_id === staffProfileId)
  return { rows, pendingInvites: fromRequests, invitesWarning }
}
