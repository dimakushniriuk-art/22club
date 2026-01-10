import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createLogger } from '@/lib/logger'

const logger = createLogger('usePTProfile')

interface ProfileStats {
  clienti_attivi: number
  sessioni_mese: number
  anni_esperienza: number
  valutazione_media: number
  certificazioni_conseguite: number
  revenue_mensile: number
}

interface Profile {
  nome: string
  cognome: string
  email: string
  phone: string
  data_nascita: string
  data_iscrizione: string
  specializzazione: string
  certificazioni: string
  avatar: string | null
  stats: ProfileStats
  badge: Array<{ id: string; name: string; icon: string; unlocked: boolean }>
}

/**
 * Calcola statistiche reali per PT dal database
 */
async function calculatePTStats(supabase: SupabaseClient, userId: string): Promise<ProfileStats> {
  try {
    // 1. Clienti attivi (atleti con stato attivo)
    const { count: clientiAttivi } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .in('role', ['atleta', 'athlete'])
      .eq('stato', 'attivo')

    // 2. Sessioni questo mese (workout_logs completati)
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: sessioniMese } = await supabase
      .from('workout_logs')
      .select('*', { count: 'exact', head: true })
      .gte('data', startOfMonth.toISOString().split('T')[0])
      .in('stato', ['completato', 'completed'])

    // 3. Anni esperienza (dalla data iscrizione)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('created_at, certificazioni')
      .eq('user_id', userId)
      .single()

    type ProfileRow = {
      created_at: string
      certificazioni?: string | null
      [key: string]: unknown
    }
    const typedProfileData = profileData as ProfileRow | null

    const anniEsperienza = typedProfileData?.created_at
      ? Math.floor(
          (Date.now() - new Date(typedProfileData.created_at).getTime()) /
            (1000 * 60 * 60 * 24 * 365),
        )
      : 0

    // 4. Valutazione media (placeholder - da implementare se esiste tabella valutazioni)
    const valutazioneMedia = 0 // TODO: calcolare da tabella valutazioni se esiste

    // 5. Certificazioni (da campo certificazioni o tabella dedicata)
    const certificazioniConseguite = typedProfileData?.certificazioni
      ? (typedProfileData.certificazioni as string).split(',').length
      : 0

    // 6. Revenue mensile (da pagamenti questo mese)
    // Prova prima con 'payments', poi fallback a 'pagamenti'
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
      valutazione_media: valutazioneMedia,
      certificazioni_conseguite: certificazioniConseguite,
      revenue_mensile: revenueMensile,
    }
  } catch (error) {
    logger.error('Errore calcolo stats PT', error)
    // Fallback a valori di default in caso di errore
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

export function usePTProfile() {
  const supabase = createClient()
  const [authUserId, setAuthUserId] = useState<string>('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Ottieni auth user ID
  useEffect(() => {
    const getUserId = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        if (authUser?.id) {
          setAuthUserId(authUser.id)
        }
      } catch (error) {
        logger.error('Errore nel recupero user ID', error)
      }
    }
    getUserId()
  }, [supabase])

  // Carica profilo dal database
  const loadProfile = useCallback(async () => {
    if (!authUserId) return

    try {
      setLoading(true)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUserId)
        .single()

      if (profileError) throw profileError

      // Calcola stats reali dal database
      const stats: ProfileStats = await calculatePTStats(supabase, authUserId)

      setProfile({
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
        badge: [], // Mock badge data
      })
    } catch (error) {
      logger.error('Errore nel caricamento del profilo', error)
    } finally {
      setLoading(false)
    }
  }, [authUserId, supabase])

  useEffect(() => {
    if (authUserId) {
      loadProfile()
    }
  }, [authUserId, loadProfile])

  const saveProfile = useCallback(
    async (profileData: Partial<Profile>) => {
      if (!authUserId) return { success: false, error: 'Utente non autenticato' }

      setIsSaving(true)
      try {
        const { handlePTProfileSave } = await import('@/lib/utils/handle-pt-profile-save')
        const result = await handlePTProfileSave(authUserId, {
          nome: profileData.nome || '',
          cognome: profileData.cognome || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          specializzazione: profileData.specializzazione || '',
          certificazioni: profileData.certificazioni || '',
        })

        if (result.success && profile) {
          setProfile({ ...profile, ...profileData })
        }

        return result
      } catch (error) {
        logger.error('Errore nel salvare il profilo', error)
        return { success: false, error: 'Errore nel salvare il profilo' }
      } finally {
        setIsSaving(false)
      }
    },
    [authUserId, profile],
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateProfileField = useCallback((field: keyof Profile, value: any) => {
    setProfile((prev) => (prev ? { ...prev, [field]: value } : null))
  }, [])

  return {
    authUserId,
    profile,
    loading,
    isSaving,
    saveProfile,
    updateProfileField,
    refetch: loadProfile,
  }
}
