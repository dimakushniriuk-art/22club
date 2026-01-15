import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import type { Tables } from '@/types/supabase'

const logger = createLogger('post-login')

/**
 * Route server-side per gestire redirect dopo login
 * 
 * Questa route:
 * 1. Verifica l'autenticazione con getUser()
 * 2. Legge il ruolo dal database (profiles)
 * 3. Esegue redirect basato sul ruolo:
 *    - admin → /dashboard/admin
 *    - trainer → /dashboard
 *    - athlete → /home
 * 
 * Il middleware ha già verificato che l'utente è autenticato
 * quando accede a questa route da /login
 */
export default async function PostLoginPage() {
  try {
    const supabase = await createClient()

    // Verifica autenticazione con getUser() (server-side auth)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Utente non autenticato in /post-login', { error: authError })
      redirect('/login?error=accesso_richiesto')
    }

    // Query al database per ottenere il ruolo
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('[profiles] post-login → query DB (server-side)', {
        userId: user.id,
        source: 'post-login',
        reason: 'redirect role-based',
      })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      logger.warn('Profilo non trovato in /post-login', {
        userId: user.id,
        error: profileError,
      })
      redirect('/login?error=profilo')
    }

    // Normalizza il ruolo (pt -> trainer, atleta -> athlete)
    type ProfileRow = Pick<Tables<'profiles'>, 'role'>
    const profileTyped = profile as ProfileRow
    const role = profileTyped.role

    const normalizedRole =
      role === 'pt' ? 'trainer' : role === 'atleta' ? 'athlete' : role

    // Debug solo in sviluppo (performance in produzione)
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('Redirect post-login basato su ruolo', {
        userId: user.id,
        role,
        normalizedRole,
      })
    }

    // Redirect basato sul ruolo normalizzato
    if (normalizedRole === 'admin') {
      redirect('/dashboard/admin')
    } else if (normalizedRole === 'trainer') {
      redirect('/dashboard')
    } else if (normalizedRole === 'athlete') {
      redirect('/home')
    } else {
      // Ruolo non riconosciuto
      logger.warn('Ruolo non riconosciuto in /post-login', {
        userId: user.id,
        role,
        normalizedRole,
      })
      redirect('/login?error=ruolo_non_valido')
    }
  } catch (error) {
    // NEXT_REDIRECT è un errore speciale di Next.js 15 usato per redirect
    // NON loggarlo come errore reale
    const isRedirectError =
      error instanceof Error &&
      (error.message === 'NEXT_REDIRECT' ||
        (error as { digest?: string }).digest?.startsWith('NEXT_REDIRECT'))

    if (isRedirectError) {
      // Re-throw per permettere a Next.js di gestire il redirect
      throw error
    }

    // Solo errori reali vengono loggati
    logger.error('Errore in /post-login', error)
    redirect('/login?error=errore_server')
  }

  // Questo non verrà mai raggiunto a causa dei redirect,
  // ma è necessario per TypeScript
  return null
}
