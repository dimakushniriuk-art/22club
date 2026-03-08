'use client'
import { supabase } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import type { Tables } from '@/types/supabase'
import type { AuthContext as AuthContextType, UserProfile, UserRole } from '@/types/user'
import { useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const logger = createLogger('providers:auth-provider')

type ProfileRow = Tables<'profiles'>

/** Risultato fetchProfile: profile o, in caso di errore, campi per messaggio utente e log. */
export type FetchProfileResult = {
  profile: ProfileRow | null
  errorCode?: string
  errorStatus?: number
  errorMessage?: string
}

/** Messaggio utente in base a code/status (Model A: profilo con user_id = auth.user.id). */
function profileErrorMessage(result: FetchProfileResult): string {
  if (result.errorCode === 'PGRST116') {
    return "Profilo non trovato. Contatta l'amministratore per completare la registrazione."
  }
  if (result.errorCode === 'over_request_rate_limit' || result.errorStatus === 429) {
    return 'Troppe richieste. Riprova tra qualche secondo.'
  }
  return result.errorMessage ?? 'Errore durante il caricamento del profilo'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Cache in-memory per profili (TTL 30 secondi)
interface CachedProfile {
  profile: ProfileRow
  expires: number
}

function mapRole(rawRole: string | null | undefined): UserRole | null {
  if (!rawRole) {
    return null
  }
  const trimmedRole = rawRole.trim()
  // Guardrail: ruoli legacy non devono più esistere dopo migration; log se arrivano
  if (trimmedRole === 'pt' || trimmedRole === 'atleta' || trimmedRole === 'owner' || trimmedRole === 'staff') {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[auth] Ruolo legacy ricevuto, normalizzazione runtime:', trimmedRole)
    }
  }
  const canonical: UserRole | null =
    trimmedRole === 'pt' || trimmedRole === 'staff'
      ? 'trainer'
      : trimmedRole === 'atleta'
        ? 'athlete'
        : trimmedRole === 'owner'
          ? 'admin'
          : trimmedRole === 'trainer' ||
            trimmedRole === 'admin' ||
            trimmedRole === 'athlete' ||
            trimmedRole === 'marketing' ||
            trimmedRole === 'nutrizionista' ||
            trimmedRole === 'massaggiatore'
            ? (trimmedRole as UserRole)
            : null
  return canonical
}

/** Normalizza errore Supabase/Postgrest in oggetto serializzabile per log (evita {} in console). */
function normalizeSupabaseError(error: unknown): {
  message: string
  code?: string
  status?: number
  details?: string
} {
  if (error instanceof Error) {
    return { message: error.message || error.name || 'Error', details: error.stack }
  }
  const o = error as Record<string, unknown>
  const message =
    (typeof o?.message === 'string' && o.message) ||
    (typeof o?.error_description === 'string' && o.error_description) ||
    (o?.details != null && String(o.details)) ||
    (o?.hint != null && String(o.hint)) ||
    (typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error))
  return {
    message: message || 'Unknown error',
    code: typeof o?.code === 'string' ? o.code : undefined,
    status: typeof o?.status === 'number' ? o.status : undefined,
    details: o?.details != null ? String(o.details) : undefined,
  }
}

function mapProfileToUser(profile: ProfileRow): UserProfile {
  const legacyProfile = profile as { first_name?: string | null; last_name?: string | null }
  const firstName = profile.nome ?? legacyProfile.first_name ?? ''
  const lastName = profile.cognome ?? legacyProfile.last_name ?? ''
  const mappedRole = mapRole(profile.role)
  const role = mappedRole ?? 'athlete'

  return {
    id: profile.id, // profiles.id
    user_id: profile.user_id ?? undefined, // auth.users.id (per compatibilità con hook legacy)
    org_id: profile.org_id ?? undefined,
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`.trim() || undefined,
    email: profile.email,
    role,
    phone: (profile as { phone?: string | null }).phone ?? undefined, // Telefono (aggiunto per evitare query duplicate)
    avatar_url: profile.avatar ?? profile.avatar_url ?? undefined,
    avatar: profile.avatar ?? undefined,
    nome: profile.nome ?? undefined,
    cognome: profile.cognome ?? undefined,
    created_at: profile.created_at ?? new Date().toISOString(),
    updated_at: profile.updated_at ?? undefined,
    stato: (profile as { stato?: string | null }).stato ?? undefined,
    first_login: (profile as { first_login?: boolean | null }).first_login ?? undefined,
  }
}

/** Shape restituita da GET /api/auth/context per impersonation */
interface AuthContextResponse {
  role: UserRole | null
  org_id: string | null
  full_name?: string | null
  email?: string | null
  actorProfile?: { id: string; user_id?: string; org_id: string | null; first_name: string; last_name: string; full_name?: string; email: string; role: UserRole } | null
  effectiveProfile?: { id: string; user_id?: string; org_id: string | null; first_name: string; last_name: string; full_name?: string; email: string; role: UserRole } | null
  isImpersonating?: boolean
}

function contextProfileToUserProfile(p: AuthContextResponse['actorProfile']): UserProfile | null {
  if (!p) return null
  return {
    id: p.id,
    user_id: p.user_id,
    org_id: p.org_id,
    first_name: p.first_name,
    last_name: p.last_name,
    full_name: (p.full_name ?? `${p.first_name} ${p.last_name}`.trim()) || undefined,
    email: p.email,
    role: p.role,
    created_at: new Date().toISOString(),
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [actorProfile, setActorProfile] = useState<UserProfile | null>(null)
  const [isImpersonating, setIsImpersonating] = useState(false)
  const router = useRouter()

  // Cache anti-storm: TTL 30 secondi
  const profileCacheRef = useRef<Map<string, CachedProfile>>(new Map())
  const initialSessionHandledRef = useRef(false)
  // Singleflight: previene query duplicate simultanee per stesso userId
  const inFlightRef = useRef<Map<string, Promise<FetchProfileResult>>>(new Map())

  /**
   * Aggiorna stato utente dal profilo (reset impersonation)
   */
  const updateUserFromProfile = useCallback((profile: ProfileRow | null) => {
    setActorProfile(null)
    setIsImpersonating(false)
    if (profile) {
      const mappedProfile = mapProfileToUser(profile)
      setUser(mappedProfile)
      setRole(mappedProfile.role)
      setOrgId(mappedProfile.org_id)
    } else {
      setUser(null)
      setRole(null)
      setOrgId(null)
    }
    setLoading(false)
  }, [])

  /**
   * Carica contesto da /api/auth/context; se isImpersonating usa effectiveProfile come user e actorProfile come admin
   */
  const applyAuthContext = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/context', { credentials: 'include' })
      if (!res.ok) return false
      const data = (await res.json()) as AuthContextResponse
      if (data.isImpersonating && data.effectiveProfile && data.actorProfile) {
        const effective = contextProfileToUserProfile(data.effectiveProfile as AuthContextResponse['actorProfile'])
        const actor = contextProfileToUserProfile(data.actorProfile)
        if (effective && actor) {
          setUser(effective)
          setRole(effective.role)
          setOrgId(effective.org_id)
          setActorProfile(actor)
          setIsImpersonating(true)
          setLoading(false)
          return true
        }
      }
      return false
    } catch {
      return false
    }
  }, [])

  /**
   * Fetch profilo centralizzato con cache e select ottimizzato.
   * Model A: profiles.user_id = auth.users.id → from('profiles').eq('user_id', user.id).single() (NON .eq('id', ...)).
   * Implementa pattern "singleflight" per evitare query duplicate simultanee.
   */
  const fetchProfile = useCallback(async (userId: string): Promise<FetchProfileResult> => {
    const inFlightPromise = inFlightRef.current.get(userId)
    if (inFlightPromise) {
      if (process.env.NODE_ENV !== 'production') {
        logger.debug('[profiles] fetchProfile → Promise condivisa (singleflight)', {
          userId,
          source: 'auth-provider',
        })
      }
      return inFlightPromise
    }

    const cached = profileCacheRef.current.get(userId)
    if (cached && cached.expires > Date.now()) {
      if (process.env.NODE_ENV !== 'production') {
        logger.debug('[profiles] fetchProfile → da cache', { userId, source: 'auth-provider' })
      }
      return { profile: cached.profile }
    }

    const profilePromise = (async (): Promise<FetchProfileResult> => {
      try {
        if (process.env.NODE_ENV !== 'production') {
          logger.debug('[profiles] fetchProfile → query DB', {
            userId,
            source: 'auth-provider',
            reason: 'cache miss',
          })
        }

        // Model A: from('profiles').eq('user_id', user.id).single() — mai .eq('id', ...)
        const { data: profile, error } = await supabase
          .from('profiles')
          .select(
            'id, user_id, role, org_id, email, nome, cognome, avatar, avatar_url, created_at, updated_at, first_name, last_name, phone, stato, first_login',
          )
          .eq('user_id', userId)
          .single()

        if (error) {
          const errPayload = normalizeSupabaseError(error)
          const msg = (errPayload.message ?? '').toLowerCase()
          const isAbort =
            (error instanceof Error && error.name === 'AbortError') ||
            msg.includes('aborted') ||
            msg.includes('lock broken')
          if (isAbort) {
            if (process.env.NODE_ENV !== 'production') {
              logger.debug('[profiles] fetchProfile → richiesta abortita/lock (ignorato)', { userId })
            }
            return { profile: null }
          }
          const logData: Record<string, unknown> = {
            userId,
            code: errPayload.code,
            status: errPayload.status,
            message: errPayload.message,
            details: errPayload.details,
          }
          // PGRST116 = no row con .single(): profilo mancante in profiles. Nessun retry, mostra messaggio e termina.
          if (errPayload.code === 'PGRST116') {
            logger.warn('Profilo non trovato (0 righe): user_id senza profilo in profiles', logData)
            return {
              profile: null,
              errorCode: errPayload.code,
              errorStatus: errPayload.status,
              errorMessage: errPayload.message,
            }
          }
          if (errPayload.code === 'over_request_rate_limit' || errPayload.status === 429) {
            logger.debug('Rate limit auth: profilo non caricato', logData)
            return {
              profile: null,
              errorCode: errPayload.code,
              errorStatus: errPayload.status,
              errorMessage: errPayload.message,
            }
          }
          logger.error('Errore caricamento profilo', undefined, logData)
          return {
            profile: null,
            errorCode: errPayload.code,
            errorStatus: errPayload.status,
            errorMessage: errPayload.message,
          }
        }

        if (profile) {
          profileCacheRef.current.set(userId, {
            profile: profile as ProfileRow,
            expires: Date.now() + 30 * 1000,
          })
          if (process.env.NODE_ENV !== 'production') {
            logger.debug('[profiles] fetchProfile → caricato da DB', {
              userId,
              profileId: profile.id,
              role: profile.role,
              source: 'auth-provider',
            })
          }
          return { profile: profile as ProfileRow }
        }

        return { profile: null }
      } catch (error) {
        const msg = (error instanceof Error ? error.message : String(error ?? '')).toLowerCase()
        const isAbort =
          (error instanceof Error && error.name === 'AbortError') ||
          msg.includes('aborted') ||
          msg.includes('lock broken')
        if (isAbort) {
          if (process.env.NODE_ENV !== 'production') {
            logger.debug('[profiles] fetchProfile → richiesta abortita/lock (ignorato)', { userId })
          }
          return { profile: null }
        }
        const errPayload = normalizeSupabaseError(error)
        const logData: Record<string, unknown> = {
          userId,
          code: errPayload.code,
          status: errPayload.status,
          message: errPayload.message,
          details: errPayload.details,
        }
        if (errPayload.code === 'over_request_rate_limit' || errPayload.status === 429) {
          logger.debug('Rate limit: fetch profilo saltato', logData)
          return {
            profile: null,
            errorCode: errPayload.code,
            errorStatus: errPayload.status,
            errorMessage: errPayload.message,
          }
        }
        logger.error('Errore fetch profilo', undefined, logData)
        return {
          profile: null,
          errorCode: errPayload.code,
          errorStatus: errPayload.status,
          errorMessage: errPayload.message,
        }
      } finally {
        inFlightRef.current.delete(userId)
      }
    })()

    inFlightRef.current.set(userId, profilePromise)
    return profilePromise
  }, [])

  // Sopprime in console le rejection "Failed to fetch" da Supabase Auth (refresh/init interno)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = (event: PromiseRejectionEvent) => {
      const reason = event?.reason
      const msg = reason instanceof Error ? reason.message : String(reason ?? '')
      const name = reason instanceof Error ? reason.name : ''
      const isAuthNetworkFailure = msg === 'Failed to fetch' || name === 'AuthRetryableFetchError'
      if (isAuthNetworkFailure) {
        event.preventDefault()
        event.stopPropagation()
      }
    }
    window.addEventListener('unhandledrejection', handler)
    return () => window.removeEventListener('unhandledrejection', handler)
  }, [])

  // Bootstrap robusto al mount: verifica sessione una volta per evitare edge case
  useEffect(() => {
    let isMounted = true

    const bootstrap = async () => {
      try {
        // getUser() valida con il server; getSession() legge solo da cookie e può restituire
        // una sessione residua (cookie scaduto) → fetchProfile fallisce prima ancora del login.
        const {
          data: { user: authUser },
          error: userError,
        } = await supabase.auth.getUser()

        if (!isMounted) return

        if (userError || !authUser) {
          const errMsg = (userError as { message?: string })?.message ?? ''
          if (
            errMsg.includes('Invalid Refresh Token') ||
            errMsg.includes('Refresh Token Not Found')
          ) {
            await supabase.auth.signOut()
          }
          setLoading(false)
          return
        }

        // Sessione valida: prima prova contesto (impersonation), altrimenti profilo
        if (!initialSessionHandledRef.current) {
          initialSessionHandledRef.current = true
          const applied = await applyAuthContext()
          if (isMounted && applied) return
          if (process.env.NODE_ENV !== 'production') {
            logger.debug('[profiles] bootstrap → chiama fetchProfile', {
              userId: authUser.id,
              source: 'auth-provider',
              reason: 'bootstrap mount',
            })
          }
          const result = await fetchProfile(authUser.id)
          if (isMounted) {
            updateUserFromProfile(result.profile)
          }
        } else {
          // Già gestita, solo setta loading
          setLoading(false)
        }
      } catch (error) {
        if (isMounted) {
          const msg = (error instanceof Error ? error.message : String(error ?? '')).toLowerCase()
          const isAbort =
            (error instanceof Error && error.name === 'AbortError') ||
            msg.includes('aborted') ||
            msg.includes('lock broken')
          if (msg.includes('invalid refresh token') || msg.includes('refresh token not found')) {
            await supabase.auth.signOut()
            setLoading(false)
            return
          }
          if (isAbort) {
            setLoading(false)
            return
          }
          logger.error('Errore bootstrap auth provider', error)
          setLoading(false)
        }
      }
    }

    void bootstrap()

    return () => {
      isMounted = false
    }
  }, [fetchProfile, updateUserFromProfile, applyAuthContext])

  useEffect(() => {
    let isMounted = true

    const { data: listener } = supabase.auth.onAuthStateChange(async (event: string, session: unknown) => {
      const sess = session as { user?: unknown } | null
      if (!isMounted) return

      // Debug solo in sviluppo
      if (process.env.NODE_ENV !== 'production') {
        logger.debug('Auth state change', {
          event,
          hasSession: !!session,
          hasUser: !!sess?.user,
        })
      }

      // Gestione eventi specifici
      if (event === 'SIGNED_OUT' || !sess || !sess.user) {
        profileCacheRef.current.clear()
        inFlightRef.current.clear()
        setUser(null)
        setRole(null)
        setOrgId(null)
        setActorProfile(null)
        setIsImpersonating(false)
        setLoading(false)
        initialSessionHandledRef.current = false
        return
      }

      // INITIAL_SESSION: carica profilo UNA SOLA VOLTA (o contesto impersonation)
      if (event === 'INITIAL_SESSION') {
        if (initialSessionHandledRef.current) {
          if (process.env.NODE_ENV !== 'production') {
            logger.debug('[profiles] INITIAL_SESSION → ignorato (già gestito)', {
              userId: (sess.user as { id: string }).id,
              source: 'auth-provider',
              reason: 'bootstrap già eseguito',
            })
          }
          return
        }
        initialSessionHandledRef.current = true
        const applied = await applyAuthContext()
        if (isMounted && applied) return
        if (process.env.NODE_ENV !== 'production') {
          logger.debug('[profiles] INITIAL_SESSION → chiama fetchProfile', {
            userId: (sess.user as { id: string }).id,
            source: 'auth-provider',
            reason: 'INITIAL_SESSION event',
          })
        }
        const result = await fetchProfile((sess.user as { id: string }).id)
        if (isMounted) {
          updateUserFromProfile(result.profile)
        }
        return
      }

      // SIGNED_IN: carica contesto (impersonation) o profilo
      if (event === 'SIGNED_IN') {
        const applied = await applyAuthContext()
        if (isMounted && applied) return
        const result = await fetchProfile((sess.user as { id: string }).id)
        if (isMounted) {
          updateUserFromProfile(result.profile)
        }
        return
      }

      // TOKEN_REFRESHED: NO-OP - il profilo è già caricato da INITIAL_SESSION/SIGNED_IN
      // Non usare stato `user` (stale closure in useEffect([]))
      // Il profilo viene gestito da INITIAL_SESSION / SIGNED_IN / USER_UPDATED
      if (event === 'TOKEN_REFRESHED') {
        // Non fare nulla, il profilo è già in cache/stato
        return
      }

      // USER_UPDATED: ricarica profilo (invalida cache per forzare reload)
      if (event === 'USER_UPDATED') {
        profileCacheRef.current.delete((sess.user as { id: string }).id)
        const result = await fetchProfile((sess.user as { id: string }).id)
        if (isMounted) {
          updateUserFromProfile(result.profile)
        }
        return
      }

      if (sess.user) {
        const result = await fetchProfile((sess.user as { id: string }).id)
        if (isMounted) {
          updateUserFromProfile(result.profile)
        }
      }
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
    // onAuthStateChange è un listener che deve essere registrato solo una volta al mount
    // fetchProfile e updateUserFromProfile sono stabili (useCallback) e non devono essere nelle dipendenze
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signIn = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          return { success: false, error: error.message }
        }

        if (data.user) {
          const result = await fetchProfile(data.user.id)
          if (result.profile) {
            updateUserFromProfile(result.profile)
            const mappedProfile = mapProfileToUser(result.profile)
            const userRole = mappedProfile.role

            if (['admin', 'trainer'].includes(userRole)) {
              router.push('/dashboard')
            } else if (userRole === 'marketing') {
              router.push('/dashboard/marketing')
            } else {
              router.push('/home')
            }
            return { success: true }
          }
          return { success: false, error: profileErrorMessage(result) }
        }
        return { success: false, error: 'Profilo non trovato' }
      } catch (error) {
        logger.error('Errore durante il login', error)
        return { success: false, error: 'Errore durante il login' }
      } finally {
        setLoading(false)
      }
    },
    [router, fetchProfile, updateUserFromProfile],
  )

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        return { success: false, error: error.message }
      }

      // La pulizia dello stato è gestita da onAuthStateChange
      router.push('/login')
      return { success: true }
    } catch (error) {
      logger.error('Errore durante il logout', error)
      return { success: false, error: 'Errore durante il logout' }
    } finally {
      setLoading(false)
    }
  }, [router])

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset?token=`,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      logger.error("Errore durante l'invio della email", error)
      return { success: false, error: "Errore durante l'invio della email" }
    } finally {
      setLoading(false)
    }
  }, [])

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      role,
      org_id: orgId,
      loading,
      actorProfile: isImpersonating ? actorProfile : null,
      effectiveProfile: isImpersonating ? user : null,
      isImpersonating,
      signIn,
      signOut,
      resetPassword,
    }),
    [user, role, orgId, loading, actorProfile, isImpersonating, signIn, signOut, resetPassword],
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
