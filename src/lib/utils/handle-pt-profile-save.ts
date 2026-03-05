// ============================================================
// Utility per Salvataggio Profilo PT (FASE C - Estrazione Logica)
// ============================================================
// Estratto da profilo/page.tsx per riutilizzabilità
// ============================================================

import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'

const logger = createLogger('lib:utils:handle-pt-profile-save')

interface ProfileData {
  nome: string
  cognome: string
  email: string
  phone: string
  specializzazione?: string
  certificazioni?: string
}

/**
 * Salva il profilo PT nel database
 * @param userId ID utente autenticato
 * @param profileData Dati del profilo da salvare
 * @returns true se salvato con successo, false altrimenti
 */
export async function handlePTProfileSave(
  userId: string,
  profileData: ProfileData,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        nome: profileData.nome,
        cognome: profileData.cognome,
        email: profileData.email,
        phone: profileData.phone,
        ...(profileData.specializzazione && { specializzazione: profileData.specializzazione }),
        ...(profileData.certificazioni && { certificazioni: profileData.certificazioni }),
      })
      .eq('user_id', userId)

    if (error) {
      logger.error('Errore nel salvare il profilo', error, { userId })
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    logger.error('Errore nel salvare il profilo', error, { userId })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
    }
  }
}
