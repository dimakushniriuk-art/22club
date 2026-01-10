/**
 * Verifica la connessione con Supabase e lo stato del database
 * Utile per debugging e diagnostica
 */

import { supabase } from './client'
import { createLogger } from '@/lib/logger'

const logger = createLogger('lib:supabase:verify-connection')

export interface ConnectionStatus {
  connected: boolean
  hasSession: boolean
  userId: string | null
  profileExists: boolean
  error?: string
  details?: {
    sessionError?: unknown
    profileError?: unknown
  }
}

/**
 * Verifica lo stato della connessione Supabase
 */
export async function verifySupabaseConnection(): Promise<ConnectionStatus> {
  const status: ConnectionStatus = {
    connected: false,
    hasSession: false,
    userId: null,
    profileExists: false,
  }

  try {
    // 1. Verifica sessione
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      status.error = 'Errore recupero sessione'
      status.details = { sessionError }
      return status
    }

    if (!session?.user) {
      status.connected = true // Supabase è connesso, ma non c'è sessione
      return status
    }

    status.connected = true
    status.hasSession = true
    status.userId = session.user.id

    // 2. Verifica esistenza profilo
    // Nota: profile potrebbe essere usato in futuro per verifiche aggiuntive
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // Profilo non trovato - questo è il problema!
        status.error = 'Profilo non trovato per questo utente'
        status.details = {
          profileError: {
            message: profileError.message,
            code: profileError.code,
            hint: profileError.hint,
          },
        }
      } else {
        status.error = 'Errore verifica profilo'
        status.details = { profileError }
      }
      return status
    }

    status.profileExists = true
    return status
  } catch (error) {
    status.error = 'Errore durante la verifica'
    status.details = { sessionError: error }
    return status
  }
}

/**
 * Log dello stato della connessione (utile per debugging)
 */
export async function logConnectionStatus(): Promise<void> {
  const status = await verifySupabaseConnection()

  logger.info('Verifica Connessione Supabase', undefined, {
    connected: status.connected,
    hasSession: status.hasSession,
    userId: status.userId,
    profileExists: status.profileExists,
    error: status.error,
    details: status.details,
  })
}
