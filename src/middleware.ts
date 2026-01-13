import { NextResponse, type NextRequest } from 'next/server'
import { getAuditContext } from './lib/audit-middleware'
import { createClient } from './lib/supabase/middleware'
import { createLogger } from './lib/logger'

const logger = createLogger('middleware')

// Cache in-memory per i ruoli utente (TTL 1 minuto)
// Riduce query al database quando l'utente naviga tra pagine
interface CachedRole {
  role: string
  expires: number
}

const roleCache = new Map<string, CachedRole>()

// Lazy initialization del cleanup interval (solo quando necessario)
let cleanupInterval: NodeJS.Timeout | null = null

function initCleanupInterval() {
  if (cleanupInterval) return

  cleanupInterval = setInterval(() => {
    const now = Date.now()
    let cleaned = 0
    for (const [key, value] of roleCache.entries()) {
      if (value.expires < now) {
        roleCache.delete(key)
        cleaned++
      }
    }
    if (cleaned > 0) {
      logger.debug(`Pulita cache ruoli middleware: ${cleaned} entry scadute`)
    }
  }, 60 * 1000)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware per file statici (immagini, font, etc.) - DEVE essere PRIMA di qualsiasi altra operazione
  // Questi file dovrebbero essere serviti direttamente senza autenticazione
  const staticFileExtensions = [
    '.svg',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.ico',
    '.webp',
    '.avif',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
    '.css',
    '.js',
  ]
  const isStaticFile = staticFileExtensions.some((ext) => pathname.endsWith(ext))
  if (isStaticFile) {
    return NextResponse.next()
  }

  // Capture audit context
  const auditContext = getAuditContext(request)

  // Redirect legacy route /auth/login -> /login
  if (pathname === '/auth/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  const { supabase } = createClient(request)

  // Ottieni la sessione corrente con gestione errori refresh token
  // NOTA: Usiamo getSession() invece di getUser() per performance nel middleware.
  // Il warning di Supabase è valido per sicurezza, ma nel middleware getSession() è accettabile
  // perché viene usato solo per routing e controllo accesso, non per operazioni critiche.
  // Per operazioni critiche, usare sempre getUser() che autentica con il server.
  let session = null
  try {
    const {
      data: { session: sessionData },
      error: sessionError,
    } = await supabase.auth.getSession()

    // Gestione errore refresh token - silenziosa per evitare log eccessivi
    if (sessionError) {
      const errorMessage = sessionError.message || String(sessionError)
      const isRefreshTokenError =
        errorMessage.includes('Invalid Refresh Token') ||
        errorMessage.includes('Refresh Token Not Found') ||
        sessionError.code === 'refresh_token_not_found'

      if (isRefreshTokenError) {
        // Errore refresh token atteso quando la sessione è scaduta - non loggare come errore
        // Il flusso normale gestirà la mancanza di sessione
        session = null
      } else {
        // Altri errori di sessione - logga solo se non è un errore comune
        logger.debug('Errore recupero sessione nel middleware', {
          errorCode: sessionError.code,
          errorMessage,
        })
        session = null
      }
    } else {
      session = sessionData
    }
  } catch (error) {
    // Errore imprevisto - logga solo in debug per evitare rumore
    logger.debug('Errore imprevisto nel recupero sessione middleware', error)
    session = null
  }

  // Fallback per icona 144x144 richiesta dal manifest
  if (pathname === '/icon-144x144.png') {
    const url = request.nextUrl.clone()
    url.pathname = '/icon-144x144.png'
    return NextResponse.rewrite(url)
  }

  // File pubblici/statici che devono essere accessibili senza autenticazione
  if (pathname === '/manifest.json' || pathname.startsWith('/icon-')) {
    return NextResponse.next()
  }

  // Route pubbliche che non richiedono autenticazione
  const PUBLIC_ROUTES = [
    '/login',
    '/reset',
    '/',
    '/registrati',
    '/forgot-password',
    '/reset-password',
  ] as const
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )

  // Se c'è una sessione, gestisci redirect da route pubbliche e verifica ruolo per route protette
  if (session) {
    try {
      const userId = session.user.id
      let normalizedRole: string

      // Inizializza cleanup interval se necessario (lazy)
      initCleanupInterval()

      // Controlla cache (TTL 1 minuto)
      const cached = roleCache.get(userId)
      if (cached && cached.expires > Date.now()) {
        // Usa ruolo dalla cache
        normalizedRole =
          cached.role === 'pt' ? 'trainer' : cached.role === 'atleta' ? 'athlete' : cached.role
        logger.debug('Ruolo utente da cache middleware', { userId, role: normalizedRole })
      } else {
        // Query al database solo se non in cache o scaduta
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', userId)
          .single()

        if (error || !profile) {
          // Utente senza profilo valido
          const redirectUrl = request.nextUrl.clone()
          redirectUrl.pathname = '/login'
          redirectUrl.searchParams.set('error', 'profilo')
          return NextResponse.redirect(redirectUrl)
        }

        const { role } = profile
        normalizedRole = role === 'pt' ? 'trainer' : role === 'atleta' ? 'athlete' : role

        // Salva in cache (1 minuto)
        roleCache.set(userId, { role, expires: Date.now() + 60 * 1000 })
        logger.debug('Ruolo utente caricato da database middleware', {
          userId,
          role: normalizedRole,
        })
      }

      // Redirect automatico da /login quando autenticato
      if (pathname === '/login') {
        if (normalizedRole === 'admin') {
          return NextResponse.redirect(new URL('/dashboard/admin', request.url))
        } else if (normalizedRole === 'trainer') {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        } else if (normalizedRole === 'athlete') {
          return NextResponse.redirect(new URL('/home', request.url))
        }
      }

      // Redirect da / a /login sempre (anche se autenticato)
      if (pathname === '/') {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/login'
        return NextResponse.redirect(redirectUrl)
      }

      // Se non è una route pubblica, verifica accesso basato sul ruolo
      if (!isPublicRoute) {
        // Verifica accesso basato sul ruolo (allineato ai ruoli reali: 'admin' | 'trainer' | 'athlete')
        if (pathname.startsWith('/dashboard') && !['admin', 'trainer'].includes(normalizedRole)) {
          // Solo admin e trainer possono accedere a /dashboard
          const redirectUrl = request.nextUrl.clone()
          redirectUrl.pathname = '/login'
          redirectUrl.searchParams.set('error', 'accesso_negato')
          return NextResponse.redirect(redirectUrl)
        }

        if (pathname.startsWith('/home') && normalizedRole !== 'athlete') {
          // Solo atleti possono accedere a /home
          const redirectUrl = request.nextUrl.clone()
          redirectUrl.pathname = '/login'
          redirectUrl.searchParams.set('error', 'accesso_negato')
          return NextResponse.redirect(redirectUrl)
        }
      }
    } catch (error) {
      logger.error('Errore nel middleware', error, { pathname })
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('error', 'errore_server')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Se non c'è sessione, gestisci route protette e 404
  if (!session) {
    // Root sempre redirect a login
    if (pathname === '/') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      return NextResponse.redirect(redirectUrl)
    }
    
    // Route pubbliche: permetti il passaggio
    if (isPublicRoute) {
      return NextResponse.next()
    }
    
    // Route protette note: reindirizza a login
    // Queste route sono sicuramente protette e richiedono autenticazione
    const PROTECTED_ROUTES = ['/dashboard', '/home', '/api']
    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route),
    )
    
    if (isProtectedRoute) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    // Per altre route non pubbliche: permettere a Next.js di gestire
    // Next.js mostrerà not-found.tsx se la route non esiste
    // Se la route esiste ma è protetta, il componente stesso gestirà l'autenticazione
    return NextResponse.next()
  }

  // Add audit context to response headers
  const responseWithAudit = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(request.headers.entries()),
        'x-client-ip': auditContext.ipAddress,
        'x-user-agent': auditContext.userAgent,
      }),
    },
  })

  return responseWithAudit
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
  runtime: 'nodejs',
}
