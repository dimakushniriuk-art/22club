import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createLogger } from '@/lib/logger'
import type { UserRole } from '@/types/user'
import { Database } from '@/types/supabase'

const logger = createLogger('lib:supabase:client')

// Mock client per sviluppo quando Supabase non è configurato
const createMockClient = () => {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: { message: 'Supabase not configured' },
      }),
      signOut: async () => ({ error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => ({
          select: () => ({
            single: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
          }),
        }),
      }),
    }),
  } as unknown as SupabaseClient
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Se le variabili d'ambiente non sono configurate o sono valori di bypass/mock, usa un mock client
  if (
    !url ||
    !key ||
    url === 'https://mock-project.supabase.co' ||
    url === 'https://bypass.supabase.co' ||
    key === 'mock-anon-key-for-development' ||
    key === 'bypass-anon-key' ||
    !url.includes('.supabase.co') ||
    url.includes('your_supabase') ||
    url.includes('your-project')
  ) {
    logger.warn(
      'Supabase non configurato correttamente - usando mock client per sviluppo',
      undefined,
      { url: url ? url.substring(0, 30) : 'undefined' },
    )
    return createMockClient()
  }

  return createBrowserClient<Database>(url, key)
}

export const supabase = createClient()

// 🔄 Helper per gestire errori di refresh token
export function handleRefreshTokenError(error: unknown): boolean {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const isRefreshTokenError =
    errorMessage.includes('Invalid Refresh Token') ||
    errorMessage.includes('Refresh Token Not Found') ||
    (error instanceof Error && error.name === 'AuthApiError' && errorMessage.includes('refresh'))

  if (isRefreshTokenError) {
    logger.warn('Errore refresh token rilevato, disconnessione automatica', error, {
      errorMessage,
      errorName: error instanceof Error ? error.name : 'Unknown',
    })
    // Disconnetti l'utente
    void supabase.auth.signOut()
    // Reindirizza al login se siamo in un contesto client-side
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return true
  }
  return false
}

// 🔐 Imposta headers personalizzati con ruolo e organizzazione
export async function setSupabaseContext(role: UserRole, org_id: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const access_token = session?.access_token

  if (!access_token) {
    logger.warn('Nessun token di accesso disponibile per impostare il contesto', undefined, {
      role,
      org_id,
    })
    return
  }

  try {
    const response = await fetch('/api/auth/context', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'x-user-role': role,
        'x-org-id': org_id,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      logger.warn('Impossibile sincronizzare il contesto Supabase', undefined, {
        role,
        org_id,
        status: response.status,
      })
    }
  } catch (error) {
    logger.warn('Errore durante la sincronizzazione del contesto', error, { role, org_id })
  }
}

// 🔍 Ottieni il contesto utente dal JWT
export async function getSupabaseContext(): Promise<{
  role: UserRole | null
  org_id: string | null
}> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    return { role: null, org_id: null }
  }

  try {
    // Decodifica il JWT per estrarre i claims
    const payload = JSON.parse(atob(session.access_token.split('.')[1]))
    return {
      role: payload.role || null,
      org_id: payload.org_id || null,
    }
  } catch (error) {
    logger.warn('Errore durante la decodifica del JWT', error)
    return { role: null, org_id: null }
  }
}

// 🛡️ Verifica se l'utente ha i permessi per accedere a una risorsa
export async function checkResourceAccess(
  resourceOrgId: string,
  requiredRole: UserRole = 'athlete',
): Promise<boolean> {
  const { role, org_id } = await getSupabaseContext()

  if (!role || !org_id) {
    return false
  }

  // Verifica che l'utente appartenga alla stessa organizzazione
  if (org_id !== resourceOrgId) {
    return false
  }

  // Verifica la gerarchia dei ruoli
  const roleHierarchy: Record<UserRole, number> = {
    athlete: 1,
    trainer: 2,
    admin: 3,
    nutrizionista: 2,
    massaggiatore: 2,
  }

  return roleHierarchy[role] >= roleHierarchy[requiredRole]
}
