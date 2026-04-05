import { NextResponse, type NextRequest } from 'next/server'
import { getAuditContext } from './lib/audit-middleware'
import { createClient } from './lib/supabase/middleware'
import { createLogger } from './lib/logger'
import { normalizeRole } from './lib/utils/role-normalizer'
import {
  getDashboardEntryPathForNonAthleteRole,
  getDefaultAppPathForRole,
  getPostLoginRedirectPath,
} from './lib/utils/role-redirect-paths'

const logger = createLogger('middleware')

const COOKIE_IMPERSONATE_PROFILE = 'impersonate_profile_id'

/** Propaga Set-Cookie dal client Supabase SSR (getUser / signOut) sulla risposta inviata al browser. */
function withMiddlewareSupabaseCookies(
  supabaseRes: NextResponse | undefined,
  res: NextResponse,
): NextResponse {
  if (!supabaseRes?.cookies) return res
  for (const cookie of supabaseRes.cookies.getAll()) {
    res.cookies.set(cookie)
  }
  return res
}

// Applica clear cookie impersonation e/o header x-impersonating (solo profile_id; redirect/role lasciati ad auth context)
function applyImpersonationToResponse(
  res: NextResponse,
  clearCookie: boolean,
  setImpersonatingHeader: boolean,
) {
  if (clearCookie) {
    res.cookies.set(COOKIE_IMPERSONATE_PROFILE, '', { path: '/', maxAge: 0 })
  }
  if (setImpersonatingHeader) {
    res.headers.set('x-impersonating', '1')
  }
  return res
}

// Cache in-memory per i ruoli utente (TTL 1 minuto)
// Riduce query al database quando l'utente naviga tra pagine
interface CachedRole {
  role: string
  first_login?: boolean | null
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
  // Disabilita middleware per build Capacitor (export statico)
  // La protezione route è gestita da RoleLayout client-side
  if (process.env.CAPACITOR === 'true') {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // Home: redirect stupido a /login (no sessione, no profiles, no ruoli)
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect legacy /auth/login -> /login (prima dello skip auth)
  if (pathname === '/auth/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Escludi /login, /auth/*, /_next/*, favicon e asset (no auth, no refresh token, evita 429 su login)
  if (
    pathname === '/login' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname.startsWith('/icon')
  ) {
    return NextResponse.next()
  }

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

  const { supabase, response: supabaseCookieResponse } = createClient(request)
  const withSb = (res: NextResponse) => withMiddlewareSupabaseCookies(supabaseCookieResponse, res)

  // Ottieni l'utente autenticato: getUser() valida con il server (getSession() è solo da storage).
  let session: { user: { id: string } } | null = null
  let authUserError: { message?: string; code?: string; status?: number } | null = null

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    authUserError = userError ?? null

    if (!userError && user) {
      session = { user: { id: user.id } }
    }
  } catch (error) {
    logger.debug('Errore imprevisto nel recupero utente middleware', error)
    session = null
  }

  if (authUserError) {
    const code = authUserError.code
    const status = authUserError.status
    const is429 = code === 'over_request_rate_limit' || status === 429
    const isRefreshTokenError =
      (authUserError.message || '').includes('Invalid Refresh Token') ||
      (authUserError.message || '').includes('Refresh Token Not Found') ||
      code === 'refresh_token_not_found'

    if (is429) {
      logger.debug('Middleware: 429 over_request_rate_limit, nessun retry', {
        code,
        status,
        message: authUserError.message,
      })
      // Evita redirect a /login: getUser() ha hit rate limit ma i cookie possono avere ancora sessione valida.
      if (!session) {
        try {
          const {
            data: { session: stored },
            error: sessionError,
          } = await supabase.auth.getSession()
          if (!sessionError && stored?.user?.id) {
            session = { user: { id: stored.user.id } }
            authUserError = null
          }
        } catch (fallbackErr) {
          logger.debug('Middleware: fallback getSession dopo 429 non riuscito', fallbackErr)
        }
      }
    } else if (!isRefreshTokenError) {
      logger.debug('Errore recupero utente nel middleware', {
        errorCode: code,
        errorMessage: authUserError.message,
      })
    }

    if (isRefreshTokenError && !is429) {
      await supabase.auth.signOut()
    }
  }

  // Fallback per icona 144x144 richiesta dal manifest
  if (pathname === '/icon-144x144.png') {
    const url = request.nextUrl.clone()
    url.pathname = '/icon-144x144.png'
    return withSb(NextResponse.rewrite(url))
  }

  // File pubblici/statici che devono essere accessibili senza autenticazione
  if (pathname === '/manifest.json' || pathname.startsWith('/icon-')) {
    return withSb(NextResponse.next())
  }

  // Route pubbliche che non richiedono autenticazione
  const PUBLIC_ROUTES = [
    '/login',
    '/',
    '/registrati',
    '/forgot-password',
    '/reset-password',
  ] as const
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )

  let clearImpersonationCookies = false
  let isImpersonating = false

  // Se c'è una sessione, gestisci redirect da route pubbliche e verifica ruolo per route protette
  if (session) {
    try {
      const userId = session.user.id
      let normalizedRole: string
      let firstLogin: boolean | null = null

      // Inizializza cleanup interval se necessario (lazy)
      initCleanupInterval()

      // Controlla cache (TTL 1 minuto)
      const cached = roleCache.get(userId)
      if (cached && cached.expires > Date.now()) {
        // Usa ruolo dalla cache
        const rawRole = cached.role
        firstLogin = cached.first_login ?? null
        normalizedRole = normalizeRole(rawRole) ?? rawRole
        logger.debug('Ruolo utente da cache middleware', { userId, role: normalizedRole })
      } else {
        // Query al database solo se non in cache o scaduta
        // Model A: profiles.user_id = auth.users.id
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, first_login')
          .eq('user_id', userId)
          .single()

        if (error || !profile) {
          const err = error as { code?: string; status?: number } | undefined
          const is429 = err?.code === 'over_request_rate_limit' || err?.status === 429
          const isNoProfile = err?.code === 'PGRST116'
          if (pathname === '/welcome' && isNoProfile) {
            return withSb(NextResponse.next())
          }
          if (isNoProfile) {
            return withSb(NextResponse.redirect(new URL('/welcome', request.url)))
          }
          const redirectUrl = request.nextUrl.clone()
          redirectUrl.pathname = '/login'
          if (!is429) {
            redirectUrl.searchParams.set('error', 'profilo')
          }
          return withSb(NextResponse.redirect(redirectUrl))
        }

        const { role, first_login: profileFirstLogin } = profile
        firstLogin = profileFirstLogin ?? null
        normalizedRole = normalizeRole(role) ?? role

        // Salva in cache (1 minuto)
        roleCache.set(userId, { role, first_login: firstLogin, expires: Date.now() + 60 * 1000 })
        logger.debug('Ruolo utente caricato da database middleware', {
          userId,
          role: normalizedRole,
        })
      }

      // Impersonation: solo impersonate_profile_id; se actor non admin -> clear cookie. Redirect/role lasciati ad auth context.
      const impersonateProfileId = request.cookies.get(COOKIE_IMPERSONATE_PROFILE)?.value
      clearImpersonationCookies = false
      isImpersonating = false
      if (impersonateProfileId) {
        if (normalizedRole !== 'admin') {
          clearImpersonationCookies = true
        } else {
          isImpersonating = true
        }
      }

      // Redirect da /login: usa solo ruolo actor (normalizedRole), non cookie
      if (pathname === '/login') {
        const path = getPostLoginRedirectPath(normalizedRole, firstLogin)
        const redirectUrl = path ? new URL(path, request.url) : null
        if (redirectUrl) {
          return withSb(
            applyImpersonationToResponse(
              NextResponse.redirect(redirectUrl),
              clearImpersonationCookies,
              isImpersonating,
            ),
          )
        }
      }

      // Redirect da / a /login sempre (anche se autenticato)
      if (pathname === '/') {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/login'
        return withSb(
          applyImpersonationToResponse(
            NextResponse.redirect(redirectUrl),
            clearImpersonationCookies,
            isImpersonating,
          ),
        )
      }

      // Accesso basato solo sul ruolo actor (normalizedRole), non su cookie
      if (!isPublicRoute) {
        if (pathname === '/welcome') {
          if (normalizedRole !== 'athlete') {
            const path = getDashboardEntryPathForNonAthleteRole(normalizedRole)
            const redirectUrl = request.nextUrl.clone()
            if (path) {
              redirectUrl.pathname = path
            } else {
              redirectUrl.pathname = '/login'
              redirectUrl.searchParams.set('error', 'accesso_negato')
            }
            return withSb(
              applyImpersonationToResponse(
                NextResponse.redirect(redirectUrl),
                clearImpersonationCookies,
                isImpersonating,
              ),
            )
          }
        }

        if (pathname.startsWith('/dashboard')) {
          if (normalizedRole === 'athlete') {
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = '/home'
            return withSb(
              applyImpersonationToResponse(
                NextResponse.redirect(redirectUrl),
                clearImpersonationCookies,
                isImpersonating,
              ),
            )
          }
          /** Chat trainer condivisa: nutrizionista/massaggiatore → area dedicata (query string invariata). */
          if (pathname === '/dashboard/chat') {
            if (normalizedRole === 'nutrizionista') {
              const chatUrl = request.nextUrl.clone()
              chatUrl.pathname = '/dashboard/nutrizionista/chat'
              return withSb(
                applyImpersonationToResponse(
                  NextResponse.redirect(chatUrl),
                  clearImpersonationCookies,
                  isImpersonating,
                ),
              )
            }
            if (normalizedRole === 'massaggiatore') {
              const chatUrl = request.nextUrl.clone()
              chatUrl.pathname = '/dashboard/massaggiatore/chat'
              return withSb(
                applyImpersonationToResponse(
                  NextResponse.redirect(chatUrl),
                  clearImpersonationCookies,
                  isImpersonating,
                ),
              )
            }
          }
          if (pathname.startsWith('/dashboard/admin') && normalizedRole !== 'admin') {
            const path = getDefaultAppPathForRole(normalizedRole) ?? '/dashboard'
            return withSb(
              applyImpersonationToResponse(
                NextResponse.redirect(new URL(path, request.url)),
                clearImpersonationCookies,
                isImpersonating,
              ),
            )
          }
          if (normalizedRole === 'nutrizionista') {
            const allowedPaths = [
              '/dashboard/nutrizionista',
              '/dashboard/abbonamenti',
              '/dashboard/profilo',
              '/dashboard/impostazioni',
            ]
            const isAllowed = allowedPaths.some(
              (path) => pathname === path || pathname.startsWith(`${path}/`),
            )
            if (!isAllowed) {
              const redirectUrl = request.nextUrl.clone()
              redirectUrl.pathname = '/dashboard/nutrizionista'
              return withSb(
                applyImpersonationToResponse(
                  NextResponse.redirect(redirectUrl),
                  clearImpersonationCookies,
                  isImpersonating,
                ),
              )
            }
          }
          if (normalizedRole === 'massaggiatore') {
            const allowedPaths = [
              '/dashboard/massaggiatore',
              '/dashboard/profilo',
              '/dashboard/impostazioni',
              '/dashboard/abbonamenti',
            ]
            const isAllowed = allowedPaths.some(
              (path) => pathname === path || pathname.startsWith(`${path}/`),
            )
            if (!isAllowed) {
              const redirectUrl = request.nextUrl.clone()
              redirectUrl.pathname = '/dashboard/massaggiatore'
              return withSb(
                applyImpersonationToResponse(
                  NextResponse.redirect(redirectUrl),
                  clearImpersonationCookies,
                  isImpersonating,
                ),
              )
            }
          }
          if (normalizedRole === 'marketing') {
            const allowedPaths = [
              '/dashboard/marketing',
              '/dashboard/marketing/athletes',
              '/dashboard/marketing/segments',
              '/dashboard/marketing/automations',
              '/dashboard/marketing/leads',
              '/dashboard/marketing/campaigns',
              '/dashboard/marketing/analytics',
              '/dashboard/marketing/report',
              '/dashboard/marketing/impostazioni',
              '/dashboard/profilo',
              '/dashboard/impostazioni',
            ]
            const isAllowed = allowedPaths.some(
              (path) => pathname === path || pathname.startsWith(`${path}/`),
            )
            if (!isAllowed) {
              const redirectUrl = request.nextUrl.clone()
              redirectUrl.pathname = '/dashboard/marketing'
              return withSb(
                applyImpersonationToResponse(
                  NextResponse.redirect(redirectUrl),
                  clearImpersonationCookies,
                  isImpersonating,
                ),
              )
            }
          }
        }

        if (pathname.startsWith('/home')) {
          if (normalizedRole !== 'athlete') {
            const path = getDashboardEntryPathForNonAthleteRole(normalizedRole)
            const redirectUrl = request.nextUrl.clone()
            if (path) {
              redirectUrl.pathname = path
            } else {
              redirectUrl.pathname = '/login'
              redirectUrl.searchParams.set('error', 'accesso_negato')
            }
            return withSb(
              applyImpersonationToResponse(
                NextResponse.redirect(redirectUrl),
                clearImpersonationCookies,
                isImpersonating,
              ),
            )
          }
        }

        /** Vista allenamenti atleta in embed: solo trainer e admin (RLS sui dati). */
        if (pathname.startsWith('/embed/athlete-allenamenti')) {
          if (normalizedRole === 'athlete') {
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = '/home/allenamenti'
            return withSb(
              applyImpersonationToResponse(
                NextResponse.redirect(redirectUrl),
                clearImpersonationCookies,
                isImpersonating,
              ),
            )
          }
          if (normalizedRole !== 'trainer' && normalizedRole !== 'admin') {
            const path = getDashboardEntryPathForNonAthleteRole(normalizedRole) ?? '/dashboard'
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = path
            return withSb(
              applyImpersonationToResponse(
                NextResponse.redirect(redirectUrl),
                clearImpersonationCookies,
                isImpersonating,
              ),
            )
          }
        }
      }
    } catch (error) {
      logger.error('Errore nel middleware', error, { pathname })
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('error', 'errore_server')
      return withSb(NextResponse.redirect(redirectUrl))
    }
  }

  // Se non c'è sessione, gestisci route protette e 404
  if (!session) {
    // Root sempre redirect a login
    if (pathname === '/') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      return withSb(NextResponse.redirect(redirectUrl))
    }

    // Route pubbliche: permetti il passaggio
    if (isPublicRoute) {
      return withSb(NextResponse.next())
    }

    // Route protette note: reindirizza a login
    // Queste route sono sicuramente protette e richiedono autenticazione
    const PROTECTED_ROUTES = ['/dashboard', '/home', '/embed', '/api', '/welcome']
    const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))

    if (isProtectedRoute) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      redirectUrl.searchParams.set('reason', 'auth_required')
      return withSb(NextResponse.redirect(redirectUrl))
    }

    // Per altre route non pubbliche: permettere a Next.js di gestire
    // Next.js mostrerà not-found.tsx se la route non esiste
    // Se la route esiste ma è protetta, il componente stesso gestirà l'autenticazione
    return withSb(NextResponse.next())
  }

  // Add audit context to response headers (e applica impersonation se in sessione)
  const responseWithAudit = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(request.headers.entries()),
        'x-client-ip': auditContext.ipAddress,
        'x-user-agent': auditContext.userAgent,
      }),
    },
  })
  return withSb(
    applyImpersonationToResponse(responseWithAudit, clearImpersonationCookies, isImpersonating),
  )
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
