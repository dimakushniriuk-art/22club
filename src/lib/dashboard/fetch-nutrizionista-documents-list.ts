import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { createLogger } from '@/lib/logger'
import {
  NUTRITION_TABLES,
  STAFF_ASSIGNMENT_STATUS_ACTIVE,
  STAFF_TYPE_NUTRIZIONISTA,
} from '@/lib/nutrition-tables'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'

const logger = createLogger('lib:dashboard:fetch-nutrizionista-documents-list')

export type NutrizionistaDocumentRow = {
  nutritionist_id: string
  document_id: string
  org_id: string | null
  org_id_text: string | null
  athlete_id: string
  athlete_name: string | null
  athlete_email: string | null
  category: string | null
  status: string | null
  notes: string | null
  file_url: string | null
  expires_at: string | null
  uploaded_by_profile_id: string | null
  uploaded_by_name: string | null
  created_at: string | null
  updated_at: string | null
}

export type NutrizionistaDocumentsAssignedAthlete = {
  id: string
  name: string
  email: string | null
}

export type NutrizionistaDocumentsListData = {
  rows: NutrizionistaDocumentRow[]
  assignedAthletes: NutrizionistaDocumentsAssignedAthlete[]
  myOrgId: string | null
  myOrgIdText: string | null
}

export async function fetchNutrizionistaDocumentsList(
  supabase: SupabaseClient<Database>,
  staffProfileId: string,
): Promise<NutrizionistaDocumentsListData> {
  const { data: profileData, error: profileRowErr } = await supabase
    .from('profiles')
    .select('org_id, org_id_text')
    .eq('id', staffProfileId)
    .single()
  if (profileRowErr) {
    logger.warn('Documenti: profilo staff org', profileRowErr)
  }

  const { data: staffData, error: staffErr } = await supabase
    .from('staff_atleti')
    .select('atleta_id')
    .eq('staff_id', staffProfileId)
    .eq('status', STAFF_ASSIGNMENT_STATUS_ACTIVE)
    .eq('staff_type', STAFF_TYPE_NUTRIZIONISTA)
  if (staffErr) throw staffErr

  const athleteIds = (staffData ?? [])
    .map((row) => (row as { atleta_id: string }).atleta_id)
    .filter(Boolean)
  if (athleteIds.length === 0) {
    return {
      rows: [],
      assignedAthletes: [],
      myOrgId: (profileData as { org_id?: string | null } | null)?.org_id ?? null,
      myOrgIdText: (profileData as { org_id_text?: string | null } | null)?.org_id_text ?? null,
    }
  }

  const profilesAccum: {
    id: string
    nome: string | null
    cognome: string | null
    email: string | null
  }[] = []
  for (const idChunk of chunkForSupabaseIn(athleteIds)) {
    const { data: profilesData, error: profilesErr } = await supabase
      .from('profiles')
      .select('id, nome, cognome, email')
      .in('id', idChunk)
    if (profilesErr) {
      logger.error('Documenti nutrizionista: caricamento profili', profilesErr)
      throw profilesErr
    }
    profilesAccum.push(...((profilesData ?? []) as (typeof profilesAccum)[number][]))
  }

  const profilesMap = new Map(
    profilesAccum.map((profile) => [
      profile.id,
      {
        name: [profile.nome, profile.cognome].filter(Boolean).join(' ') || profile.id.slice(0, 8),
        email: profile.email ?? null,
      },
    ]),
  )
  const assignedAthletes = athleteIds.map((id) => ({
    id,
    name: profilesMap.get(id)?.name ?? id.slice(0, 8),
    email: profilesMap.get(id)?.email ?? null,
  }))

  const viewRes = (supabase as { from: (table: string) => ReturnType<typeof supabase.from> })
    .from(NUTRITION_TABLES.viewDocuments)
    .select('*')
    .eq('nutritionist_id', staffProfileId)
    .order('created_at', { ascending: false })
    .limit(500)
  const { data: viewData, error: viewErr } = await viewRes
  if (viewErr) {
    logger.error('View documenti fallback', viewErr)
    return {
      rows: [],
      assignedAthletes,
      myOrgId: (profileData as { org_id?: string | null } | null)?.org_id ?? null,
      myOrgIdText: (profileData as { org_id_text?: string | null } | null)?.org_id_text ?? null,
    }
  }

  return {
    rows: (viewData ?? []) as NutrizionistaDocumentRow[],
    assignedAthletes,
    myOrgId: (profileData as { org_id?: string | null } | null)?.org_id ?? null,
    myOrgIdText: (profileData as { org_id_text?: string | null } | null)?.org_id_text ?? null,
  }
}
