import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

export type MassaggiatoreClienteAccessMode = 'active' | 'pending_invite'

export type MassaggiatoreClienteProfileView = {
  id: string
  nome: string | null
  cognome: string | null
  email: string | null
  phone: string | null
  role: string | null
  created_at: string | null
}

export type MassaggiatoreClienteDetailData = {
  profile: MassaggiatoreClienteProfileView
  accessMode: MassaggiatoreClienteAccessMode
}

export class MassaggiatoreClienteDetailForbiddenError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MassaggiatoreClienteDetailForbiddenError'
  }
}

export async function fetchMassaggiatoreClienteDetail(
  supabase: SupabaseClient<Database>,
  staffProfileId: string,
  athleteProfileId: string,
): Promise<MassaggiatoreClienteDetailData> {
  const { data: link, error: linkErr } = await supabase
    .from('staff_atleti')
    .select('id')
    .eq('staff_id', staffProfileId)
    .eq('atleta_id', athleteProfileId)
    .eq('staff_type', 'massaggiatore')
    .eq('status', 'active')
    .maybeSingle()

  if (linkErr) {
    throw new Error(linkErr.message)
  }

  let accessMode: MassaggiatoreClienteAccessMode
  if (link) {
    accessMode = 'active'
  } else {
    const { data: inv, error: invErr } = await supabase
      .from('inviti_cliente')
      .select('id')
      .eq('staff_id', staffProfileId)
      .eq('atleta_id', athleteProfileId)
      .eq('stato', 'in_attesa')
      .maybeSingle()

    if (invErr || !inv) {
      throw new MassaggiatoreClienteDetailForbiddenError(
        'Cliente non trovato: non risulti collegato né hai un invito in attesa per questo profilo.',
      )
    }
    accessMode = 'pending_invite'
  }

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('id, nome, cognome, email, phone, role, created_at')
    .eq('id', athleteProfileId)
    .maybeSingle()

  if (profileErr || !profile) {
    throw new Error('Impossibile caricare il profilo.')
  }

  return {
    profile: profile as MassaggiatoreClienteProfileView,
    accessMode,
  }
}
