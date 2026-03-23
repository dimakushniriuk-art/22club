import { supabase } from '@/lib/supabase/client'
import { resolveProfileByIdentifier } from '@/lib/utils/resolve-profile-by-identifier'

export type CurrentStaffProfileClient = {
  id: string
  org_id: string | null
  role: string | null
  nome: string | null
  cognome: string | null
}

export async function getCurrentStaffProfileClient(): Promise<CurrentStaffProfileClient | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const row = await resolveProfileByIdentifier(supabase, user.id, 'id, nome, cognome, org_id, role')
  if (!row || typeof row.id !== 'string') return null

  const p = row as {
    id: string
    nome?: string | null
    cognome?: string | null
    org_id?: string | null
    role?: string | null
  }

  return {
    id: p.id,
    org_id: p.org_id ?? null,
    role: p.role ?? null,
    nome: p.nome ?? null,
    cognome: p.cognome ?? null,
  }
}
