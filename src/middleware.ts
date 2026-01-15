import { NextResponse, type NextRequest } from 'next/server'
import type { Session } from '@supabase/supabase-js'
import { getAuditContext } from './lib/audit-middleware'
import { createClient } from './lib/supabase/middleware'
import { createLogger } from './lib/logger'

const logger = createLogger('middleware')

// Tipo inferito dal createClient per robustezza tipizzazione
type MiddlewareSupabase = ReturnType<typeof createClient>['supabase']

/**
 * Helper per ottenere la sessione in modo sicuro con gestione errori
 * 
 * @param supabase - Client Supabase
 * @returns Sessione corrente o null se non autenticato/errore
 */
async function getSessionSafely(
  supabase: MiddlewareSupabase,
): Promise<Session | null> {
  try {
    const {
      data: { session: sessionData },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      const errorMessage = sessionError.message || String(sessionError)
      const isRefreshTokenError =
        errorMessage.includes('Invalid Refresh Token') ||
        errorMessage.includes('Refresh Token Not Found') ||
        sessionError.code === 'refresh_token_not_found'

      if (!isRefreshTokenError) {
        logger.debug('Errore recupero sessione nel middleware', {
          errorCode: sessionError.code,
          errorMessage,
        })
      }
      return null
    }

    return sessionData
  } catch (error) {
    logger.debug('Errore imprevisto nel recupero sessione middleware', error)
    return null
  }
}

/**
 * Middleware semplificato - Guard leggero per autenticazione
 * 
 * NON fa query al database, NON gestisce ruoli, NON usa cache.
 * Solo controllo sessione minimale per route protette.
 * 
 * La logica di autorizzazione basata sui ruoli è gestita:
 * - Server-side nella route /post-login per redirect dopo login
 * - Client-side nei layout delle route protette per controllo accesso
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect legacy route /auth/login -> /login (gestito subito, nessuna verifica sessione)
  if (pathname === '/auth/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Per /login e /auth/login, non aggiungere audit headers (performance)
  // Solo controllo sessione per redirect se già autenticato
  if (pathname === '/login') {
    const { supabase } = createClient(request)
    const session = await getSessionSafely(supabase)

    // Se c'è una sessione e siamo su /login -> redirect a /post-login
    // La route /post-login gestirà server-side il redirect basato sul ruolo
    if (session) {
      return NextResponse.redirect(new URL('/post-login', request.url))
    }

    // Se non autenticato, permetti accesso a /login
    return NextResponse.next()
  }

  // Per route protette (/dashboard e /home), verifica sessione e aggiungi audit headers
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/home')

  if (isProtectedRoute) {
    // Ottieni sessione (controllo minimale, nessuna query DB)
    const { supabase } = createClient(request)
    const session = await getSessionSafely(supabase)

    // Se NON c'è sessione e la route è protetta -> redirect a /login
    if (!session) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Se autenticato, aggiungi audit headers e permetti accesso
    // Ottimizzazione: usa headers.set() invece di ricostruire tutto
    const auditContext = getAuditContext(request)
    const res = NextResponse.next()
    res.headers.set('x-client-ip', auditContext.ipAddress)
    res.headers.set('x-user-agent', auditContext.userAgent)
    return res
  }

  // Questo punto non dovrebbe mai essere raggiunto perché il matcher
  // limita le route a /dashboard/:path*, /home/:path*, /login, /auth/login
  // Ma manteniamo il return per robustezza
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match only protected routes and auth routes:
     * - /dashboard/:path* (dashboard protetta)
     * - /home/:path* (home protetta)
     * - /login (per redirect se autenticato)
     * - /auth/login (redirect legacy route)
     * 
     * Esclude automaticamente:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     */
    '/dashboard/:path*',
    '/home/:path*',
    '/login',
    '/auth/login',
  ],
  runtime: 'nodejs',
}
