import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'
import { createLogger } from '@/lib/logger'
import type { InvitoPendenteStaff } from '@/hooks/use-inviti-cliente'

const logger = createLogger('lib:dashboard:fetch-massaggiatore-clienti-list')

export type MassaggiatoreUnifiedClienteRow = {
  atleta_id: string
  nome: string | null
  cognome: string | null
  email: string | null
  linkedActive: boolean
  pendingInvitoId: string | null
}

export type MassaggiatoreClienteProfileRow = {
  id: string
  nome: string | null
  cognome: string | null
  email: string | null
  phone: string | null
  created_at: string | null
  data_iscrizione: string | null
  avatar_url: string | null
  documenti_scadenza: boolean | null
  ultimo_accesso: string | null
}

export type MassaggiatoreClientiListData = {
  unified: MassaggiatoreUnifiedClienteRow[]
  profiles: Record<string, MassaggiatoreClienteProfileRow>
}

export async function fetchMassaggiatoreClientiList(
  supabase: SupabaseClient<Database>,
  staffProfileId: string,
): Promise<MassaggiatoreClientiListData> {
  const [linksRes, pendentiRpc] = await Promise.all([
    supabase
      .from('staff_atleti')
      .select('atleta_id')
      .eq('staff_id', staffProfileId)
      .eq('staff_type', 'massaggiatore')
      .eq('status', 'active'),
    supabase.rpc('get_inviti_cliente_pendenti_staff'),
  ])

  if (linksRes.error) {
    throw new Error(linksRes.error.message)
  }

  let pendenti: InvitoPendenteStaff[] = []
  if (pendentiRpc.error) {
    logger.warn('get_inviti_cliente_pendenti_staff', pendentiRpc.error)
  } else {
    pendenti = (pendentiRpc.data ?? []) as InvitoPendenteStaff[]
  }

  const linkedIds = [
    ...new Set(
      (linksRes.data ?? []).map((r: { atleta_id: string | null }) => r.atleta_id).filter(Boolean),
    ),
  ] as string[]

  const pendingAthleteIds = [
    ...new Set(pendenti.map((p) => p.atleta_id).filter((id): id is string => Boolean(id))),
  ]
  const allIds = [...new Set([...linkedIds, ...pendingAthleteIds])]

  const profiles: Record<string, MassaggiatoreClienteProfileRow> = {}
  for (const idChunk of chunkForSupabaseIn(allIds)) {
    const { data: profileRows, error: profilesErr } = await supabase
      .from('profiles')
      .select(
        'id, nome, cognome, email, phone, created_at, data_iscrizione, avatar_url, documenti_scadenza, ultimo_accesso',
      )
      .in('id', idChunk)
    if (profilesErr) {
      throw new Error(profilesErr.message)
    }
    for (const row of profileRows ?? []) {
      profiles[row.id] = row as MassaggiatoreClienteProfileRow
    }
  }

  const byAtleta = new Map<string, MassaggiatoreUnifiedClienteRow>()
  for (const aid of linkedIds) {
    const p = profiles[aid]
    byAtleta.set(aid, {
      atleta_id: aid,
      nome: p?.nome ?? null,
      cognome: p?.cognome ?? null,
      email: p?.email ?? null,
      linkedActive: true,
      pendingInvitoId: null,
    })
  }

  for (const inv of pendenti) {
    if (!inv.atleta_id || !inv.invito_id) continue
    const existing = byAtleta.get(inv.atleta_id)
    if (existing) {
      existing.pendingInvitoId = inv.invito_id
      if (!existing.email && inv.email) existing.email = inv.email
      if (!existing.nome && inv.nome) existing.nome = inv.nome
      if (!existing.cognome && inv.cognome) existing.cognome = inv.cognome
    } else {
      byAtleta.set(inv.atleta_id, {
        atleta_id: inv.atleta_id,
        nome: inv.nome,
        cognome: inv.cognome,
        email: inv.email,
        linkedActive: false,
        pendingInvitoId: inv.invito_id,
      })
    }
  }

  const unified = [...byAtleta.values()].sort((a, b) =>
    `${a.nome ?? ''} ${a.cognome ?? ''}`.localeCompare(`${b.nome ?? ''} ${b.cognome ?? ''}`, 'it', {
      sensitivity: 'base',
    }),
  )

  return { unified, profiles }
}
