import type { SupabaseClient } from '@supabase/supabase-js'
import { createLogger } from '@/lib/logger'

const logger = createLogger('lib:dashboard:fetch-staff-pt-profile')

export interface StaffPtProfileStats {
  clienti_attivi: number
  sessioni_mese: number
  anni_esperienza: number
  valutazione_media: number
  certificazioni_conseguite: number
  revenue_mensile: number
}

export interface StaffPtProfile {
  nome: string
  cognome: string
  email: string
  phone: string
  data_nascita: string
  data_iscrizione: string
  specializzazione: string
  certificazioni: string
  avatar: string | null
  stats: StaffPtProfileStats
  badge: Array<{ id: string; name: string; icon: string; unlocked: boolean }>
}

async function calculatePTStats(
  supabase: SupabaseClient,
  userId: string,
): Promise<StaffPtProfileStats> {
  try {
    const { count: clientiAttivi } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'athlete')
      .eq('stato', 'attivo')

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: sessioniMese } = await supabase
      .from('workout_logs')
      .select('*', { count: 'exact', head: true })
      .gte('data', startOfMonth.toISOString().split('T')[0])
      .in('stato', ['completato', 'completed'])

    const { data: profileData } = await supabase
      .from('profiles')
      .select('created_at, certificazioni')
      .eq('user_id', userId)
      .single()

    type ProfileRow = {
      created_at: string
      certificazioni?: string | null
    }
    const typedProfileData = profileData as ProfileRow | null

    const anniEsperienza = typedProfileData?.created_at
      ? Math.floor(
          (Date.now() - new Date(typedProfileData.created_at).getTime()) /
            (1000 * 60 * 60 * 24 * 365),
        )
      : 0

    const certificazioniConseguite = typedProfileData?.certificazioni
      ? typedProfileData.certificazioni.split(',').length
      : 0

    const { data: pagamenti } = await supabase
      .from('payments')
      .select('amount, created_at, is_reversal')
      .gte('created_at', startOfMonth.toISOString())

    const revenueMensile =
      pagamenti
        ?.filter((p) => !p.is_reversal)
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0

    return {
      clienti_attivi: clientiAttivi || 0,
      sessioni_mese: sessioniMese || 0,
      anni_esperienza: Math.max(0, anniEsperienza),
      valutazione_media: 0,
      certificazioni_conseguite: certificazioniConseguite,
      revenue_mensile: revenueMensile,
    }
  } catch (error) {
    logger.error('Errore calcolo stats PT', error)
    return {
      clienti_attivi: 0,
      sessioni_mese: 0,
      anni_esperienza: 0,
      valutazione_media: 0,
      certificazioni_conseguite: 0,
      revenue_mensile: 0,
    }
  }
}

export async function fetchStaffPtProfile(
  supabase: SupabaseClient,
  authUserId: string,
): Promise<StaffPtProfile> {
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', authUserId)
    .single()

  if (profileError) throw profileError

  const stats = await calculatePTStats(supabase, authUserId)

  return {
    nome: profileData.nome || '',
    cognome: profileData.cognome || '',
    email: profileData.email || '',
    phone: profileData.telefono || '',
    data_nascita: profileData.data_nascita || '',
    data_iscrizione: profileData.created_at?.split('T')[0] || '',
    specializzazione: 'Personal Training',
    certificazioni: 'NASM-CPT, FMS Level 2',
    avatar: profileData.avatar || null,
    stats,
    badge: [],
  }
}
