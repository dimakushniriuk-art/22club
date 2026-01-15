'use client'
import { supabase } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import type { Tables } from '@/types/supabase'
import type { AuthContext as AuthContextType, UserProfile, UserRole } from '@/types/user'
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

const logger = createLogger('providers:auth-provider')

type ProfileRow = Tables<'profiles'>

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
  // Normalizza il ruolo - usa trim() per sicurezza
  const trimmedRole = rawRole.trim()
  const normalized =
    trimmedRole === 'pt'
      ? 'trainer'
      : trimmedRole === 'atleta'
        ? 'athlete'
        : (trimmedRole as UserRole | 'owner' | 'staff')

  if (normalized === 'owner') return 'admin'
  if (normalized === 'staff') return 'trainer'
  if (normalized === 'trainer' || normalized === 'admin' || normalized === 'athlete') {
    return normalized
  }

  return null
}

function mapProfileToUser(profile: ProfileRow): UserProfile {
  const legacyProfile = profile as { first_name?: string | null; last_name?: string | null }
  const firstName = profile.nome ?? legacyProfile.first_name ?? ''
  const lastName = profile.cognome ?? legacyProfile.last_name ?? ''
  const mappedRole = mapRole(profile.role)
  const role = mappedRole ?? 'athlete'

  return {
    id: profile.id, // profiles.id
    user_id: profile.user_id, // auth.users.id (per compatibilità con hook legacy)
    org_id: profile.org_id,
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
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Cache anti-storm: TTL 30 secondi
  const profileCacheRef = useRef<Map<string, CachedProfile>>(new Map())
  const initialSessionHandledRef = useRef(false)
  // Singleflight: previene query duplicate simultanee per stesso userId
  const inFlightRef = useRef<Map<string, Promise<ProfileRow | null>>>(new Map())

  /**
   * Aggiorna stato utente dal profilo
   */
  const updateUserFromProfile = (profile: ProfileRow | null) => {
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
  }

  /**
   * Fetch profilo centralizzato con cache e select ottimizzato
   * Usa solo i campi necessari per costruire UserProfile
   * Nota: first_name e last_name esistono nella tabella (colonne legacy)
   * 
   * Implementa pattern "singleflight": se una chiamata è già in corso per lo stesso userId,
   * le chiamate successive condividono la stessa Promise invece di fare nuove query DB.
   */
  const fetchProfile = async (userId: string): Promise<ProfileRow | null> => {
    // Singleflight: se esiste già una Promise in corso per questo userId, condividila
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

    // Controlla cache (TTL 30 secondi)
    const cached = profileCacheRef.current.get(userId)
    if (cached && cached.expires > Date.now()) {
      if (process.env.NODE_ENV !== 'production') {
        logger.debug('[profiles] fetchProfile → da cache', {
          userId,
          source: 'auth-provider',
        })
      }
      return cached.profile
    }

    // Crea Promise per fetch profilo
    const profilePromise = (async (): Promise<ProfileRow | null> => {
      try {
        // Query ottimizzata: solo campi necessari (incluso phone per evitare query duplicate)
        if (process.env.NODE_ENV !== 'production') {
          logger.debug('[profiles] fetchProfile → query DB', {
            userId,
            source: 'auth-provider',
            reason: 'cache miss',
          })
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, user_id, role, org_id, email, nome, cognome, avatar, avatar_url, created_at, updated_at, first_name, last_name, phone')
          .eq('user_id', userId)
          .single()

        if (error) {
          // Gestione specifica per errori comuni
          const errorCode = (error as unknown as { code?: string }).code
          if (errorCode === 'PGRST116') {
            // Profilo non trovato
            logger.warn('Profilo non trovato per utente', {
              userId,
              errorCode,
            })
            return null
          }

          logger.error('Errore caricamento profilo', error, {
            userId,
            errorCode,
          })
          return null
        }

        if (profile) {
          // Salva in cache (TTL 30 secondi)
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

          return profile as ProfileRow
        }

        return null
      } catch (error) {
        logger.error('Errore fetch profilo', error, { userId })
        return null
      } finally {
        // Rimuovi Promise dalla mappa inFlight dopo completamento (successo o errore)
        inFlightRef.current.delete(userId)
      }
    })()

    // Salva Promise in inFlight prima di partire
    inFlightRef.current.set(userId, profilePromise)

    return profilePromise
  }

  // Bootstrap robusto al mount: verifica sessione una volta per evitare edge case
  useEffect(() => {
    let isMounted = true

    const bootstrap = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (!isMounted) return

        if (sessionError || !session || !session.user) {
          // Nessuna sessione, setta loading a false
          setLoading(false)
          return
        }

        // Se esiste sessione e non è ancora stata gestita, carica profilo
        if (!initialSessionHandledRef.current) {
          initialSessionHandledRef.current = true
          if (process.env.NODE_ENV !== 'production') {
            logger.debug('[profiles] bootstrap → chiama fetchProfile', {
              userId: session.user.id,
              source: 'auth-provider',
              reason: 'bootstrap mount',
            })
          }
          const profile = await fetchProfile(session.user.id)
          if (isMounted) {
            updateUserFromProfile(profile)
          }
        } else {
          // Già gestita, solo setta loading
          setLoading(false)
        }
      } catch (error) {
        if (isMounted) {
          logger.error('Errore bootstrap auth provider', error)
          setLoading(false)
        }
      }
    }

    void bootstrap()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return

      // Debug solo in sviluppo
      if (process.env.NODE_ENV !== 'production') {
        logger.debug('Auth state change', { event, hasSession: !!session, hasUser: !!session?.user })
      }

      // Gestione eventi specifici
      if (event === 'SIGNED_OUT' || !session || !session.user) {
        // Pulizia stato, cache e promise in corso
        profileCacheRef.current.clear()
        inFlightRef.current.clear()
        setUser(null)
        setRole(null)
        setOrgId(null)
        setLoading(false)
        initialSessionHandledRef.current = false
        return
      }

      // INITIAL_SESSION: carica profilo UNA SOLA VOLTA
      if (event === 'INITIAL_SESSION') {
        if (initialSessionHandledRef.current) {
          // Già gestito (bootstrap o evento precedente), ignora
          if (process.env.NODE_ENV !== 'production') {
            logger.debug('[profiles] INITIAL_SESSION → ignorato (già gestito)', {
              userId: session.user.id,
              source: 'auth-provider',
              reason: 'bootstrap già eseguito',
            })
          }
          return
        }
        initialSessionHandledRef.current = true

        if (process.env.NODE_ENV !== 'production') {
          logger.debug('[profiles] INITIAL_SESSION → chiama fetchProfile', {
            userId: session.user.id,
            source: 'auth-provider',
            reason: 'INITIAL_SESSION event',
          })
        }
        const profile = await fetchProfile(session.user.id)
        if (isMounted) {
          updateUserFromProfile(profile)
        }
        return
      }

      // SIGNED_IN: carica profilo (con cache anti-storm)
      if (event === 'SIGNED_IN') {
        const profile = await fetchProfile(session.user.id)
        if (isMounted) {
          updateUserFromProfile(profile)
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
        // Invalida cache per forzare reload
        profileCacheRef.current.delete(session.user.id)
        const profile = await fetchProfile(session.user.id)
        if (isMounted) {
          updateUserFromProfile(profile)
        }
        return
      }

      // Per altri eventi, carica profilo se c'è sessione
      if (session.user) {
        const profile = await fetchProfile(session.user.id)
        if (isMounted) {
          updateUserFromProfile(profile)
        }
      }
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
    // onAuthStateChange è un listener che deve essere registrato solo una volta al mount
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      role,
      org_id: orgId,
      loading,
    }),
    [user, role, orgId, loading],
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
