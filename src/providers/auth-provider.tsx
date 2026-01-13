'use client'
import { supabase } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import type { Tables } from '@/types/supabase'
import type { AuthContext as AuthContextType, UserProfile, UserRole } from '@/types/user'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const logger = createLogger('providers:auth-provider')

type ProfileRow = Tables<'profiles'>

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Serializza un errore in modo robusto, catturando tutte le proprietà
 * anche quelle non enumerabili
 */
function serializeError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return {
      type: 'Error',
      message: err.message,
      name: err.name,
      stack: err.stack,
      // Prova a estrarre proprietà aggiuntive
      ...Object.getOwnPropertyNames(err).reduce(
        (acc, key) => {
          try {
            acc[key] = (err as unknown as Record<string, unknown>)[key]
          } catch {
            // Ignora proprietà non accessibili
          }
          return acc
        },
        {} as Record<string, unknown>,
      ),
    }
  }

  if (typeof err === 'object' && err !== null) {
    const errorObj = err as unknown as Record<string, unknown>
    const serialized: Record<string, unknown> = {
      type: 'Object',
    }

    // Estrai proprietà comuni
    const commonProps = ['message', 'code', 'details', 'hint', 'name', 'status', 'statusCode']
    for (const prop of commonProps) {
      if (prop in errorObj) {
        serialized[prop] = errorObj[prop]
      }
    }

    // Prova a serializzare tutto l'oggetto
    try {
      serialized.fullError = JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
    } catch {
      try {
        serialized.fullError = String(err)
      } catch {
        serialized.fullError = '[Errore non serializzabile]'
      }
    }

    // Aggiungi informazioni sulla struttura
    serialized.keys = Object.keys(errorObj)
    serialized.ownPropertyNames = Object.getOwnPropertyNames(errorObj)

    return serialized
  }

  return { type: 'Primitive', rawError: err }
}

function mapRole(rawRole: string | null | undefined): UserRole | null {
  // Log diretto per debug immediato
  logger.debug('MAP ROLE Called with', {
    rawRole,
    rawRoleType: typeof rawRole,
    rawRoleLength: rawRole?.length,
    rawRoleCharCodes: rawRole
      ? (Array.from(rawRole) as string[]).map((c) => c.charCodeAt(0))
      : null,
    isPt: rawRole === 'pt',
    isPtStrict: rawRole === 'pt',
    rawRoleTrimmed: rawRole?.trim(),
    rawRoleTrimmedIsPt: rawRole?.trim() === 'pt',
  })

  if (!rawRole) {
    return null
  }
  // Normalizza il ruolo - usa trim() per sicurezza
  const trimmedRole = rawRole ? rawRole.trim() : ''
  const normalized =
    trimmedRole === 'pt'
      ? 'trainer'
      : trimmedRole === 'atleta'
        ? 'athlete'
        : (trimmedRole as UserRole | 'owner' | 'staff')

  // Log diretto per debug immediato
  logger.debug('MAP ROLE Normalized', {
    trimmedRole,
    normalized,
    isTrainer: normalized === 'trainer',
    isAthlete: normalized === 'athlete',
  })

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

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          // Gestione specifica per errore refresh token
          if (
            sessionError.message?.includes('Invalid Refresh Token') ||
            sessionError.message?.includes('Refresh Token Not Found') ||
            sessionError.name === 'AuthApiError'
          ) {
            logger.warn('Refresh token non valido, disconnessione automatica', sessionError, {
              errorMessage: sessionError.message,
              errorName: sessionError.name,
            })
            // Disconnetti l'utente
            await supabase.auth.signOut()
            if (isMounted) {
              setUser(null)
              setRole(null)
              setOrgId(null)
            }
            // Reindirizza al login se siamo in un contesto client-side
            if (typeof window !== 'undefined') {
              window.location.href = '/login'
            }
            return
          }

          logger.error('Errore recupero sessione', sessionError, {
            code: sessionError.name || 'UNKNOWN',
          })
          if (isMounted) {
            setUser(null)
            setRole(null)
            setOrgId(null)
          }
          return
        }

        if (!session?.user) {
          if (isMounted) {
            setUser(null)
            setRole(null)
            setOrgId(null)
          }
          return
        }

        // Log della sessione per debug
        logger.debug('AUTH PROVIDER Session info', {
          userId: session.user.id,
          userEmail: session.user.email,
          sessionExpiresAt: session.expires_at,
          sessionToken: session.access_token ? 'Presente' : 'Mancante',
        })

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (error) {
          // Log immediato in console per debug (bypass logger) - logga ogni proprietà separatamente
          console.error('=== ERRORE CARICAMENTO PROFILO ===')

          try {
            // Estrai tutte le proprietà possibili dall'errore
            const errorObj = error as unknown as Record<string, unknown>
            const errorKeys = Object.keys(errorObj)
            const errorValues: Record<string, unknown> = {}

            // Estrai tutte le proprietà una per una
            for (const key of errorKeys) {
              try {
                errorValues[key] = errorObj[key]
              } catch {
                errorValues[key] = '[Non accessibile]'
              }
            }

            console.error('Error object keys:', errorKeys)
            console.error('Error object values:', errorValues)
          } catch (e) {
            console.error('Errore durante estrazione proprietà errore:', e)
          }

          try {
            // Estrai valori comuni
            const errorObj = error as unknown as Record<string, unknown>
            const errorMessage = (errorObj.message as string) || String(error) || 'Nessun messaggio'
            const errorCode =
              (errorObj.code as string) || (errorObj.status as number)?.toString() || 'UNKNOWN'
            const errorDetails = errorObj.details || 'Nessun dettaglio'
            const errorHint = (errorObj.hint as string) || 'Nessun hint'
            const errorStatus = errorObj.status as number | undefined
            const errorStatusText = errorObj.statusText as string | undefined

            console.error('Error message:', errorMessage)
            console.error('Error code:', errorCode)
            console.error('Error details:', errorDetails)
            console.error('Error hint:', errorHint)
            console.error('Error status:', errorStatus)
            console.error('Error statusText:', errorStatusText)
          } catch (e) {
            console.error('Errore durante estrazione valori comuni:', e)
          }

          try {
            console.error('User ID:', session.user.id)
            console.error('User Email:', session.user.email)
            console.error('Session expires at:', session.expires_at)
            console.error('Session token present:', !!session.access_token)
          } catch (e) {
            console.error('Errore durante log sessione:', e)
          }

          try {
            console.error('Full error object:', error)
            console.error('Error type:', typeof error)
            console.error('Error string:', String(error))
          } catch (e) {
            console.error('Errore durante log oggetto completo:', e)
          }

          // Estrai valori per il logger (con fallback)
          const errorObj = error as unknown as Record<string, unknown>
          const errorMessage = (errorObj.message as string) || String(error) || 'Nessun messaggio'
          const errorCode =
            (errorObj.code as string) || (errorObj.status as number)?.toString() || 'UNKNOWN'
          const errorDetails = errorObj.details || 'Nessun dettaglio'
          const errorHint = (errorObj.hint as string) || 'Nessun hint'
          const errorStatus = errorObj.status as number | undefined
          const errorStatusText = errorObj.statusText as string | undefined

          // Log dettagliato dell'errore con informazioni aggiuntive
          const serializedError = serializeError(error)
          logger.error('ERRORE CARICAMENTO PROFILO', {
            error: serializedError,
            errorMessage,
            errorCode,
            errorDetails,
            errorHint,
            errorStatus,
            errorStatusText,
            userId: session.user.id,
            userEmail: session.user.email,
            authUid: session.user.id,
            query: 'SELECT * FROM profiles WHERE user_id = $1',
            sessionExpiresAt: session.expires_at,
            sessionTokenPresent: !!session.access_token,
            suggestion:
              errorCode === '42501'
                ? 'Errore RLS: Verifica che la policy "Users can view own profile" sia attiva e corretta'
                : errorCode === 'PGRST116'
                  ? 'Profilo non trovato: Verifica che il profilo esista per questo user_id. Potrebbe essere un problema di sessione/token.'
                  : "Verifica che il profilo esista e che le RLS policies permettano l'accesso",
          })

          // Gestione specifica per errori comuni (usa errorCode già dichiarato sopra)
          if (errorCode === 'PGRST116') {
            // Profilo non trovato - utente autenticato ma senza profilo
            logger.warn('Profilo non trovato per utente', {
              userId: session.user.id,
              userEmail: session.user.email,
              errorCode,
              sessionExpiresAt: session.expires_at,
              sessionTokenPresent: !!session.access_token,
              suggestion:
                'Il profilo esiste nel database ma la query non lo trova. Potrebbe essere un problema di sessione/token. Prova a fare logout e login di nuovo.',
            })

            // Non lanciare l'errore, ma imposta user a null per mostrare l'errore nell'UI
            if (isMounted) {
              setUser(null)
              setRole(null)
              setOrgId(null)
              setLoading(false)
            }
            return
          }

          throw error
        }

        if (profile && isMounted) {
          const mappedProfile = mapProfileToUser(profile as ProfileRow)
          setUser(mappedProfile)
          setRole(mappedProfile.role)
          setOrgId(mappedProfile.org_id)
        }
      } catch (error) {
        const errorDetails = serializeError(error)
        logger.error('Errore caricamento utente (catch)', error, {
          errorDetails,
          errorType: typeof error,
          errorString: String(error),
        })

        if (isMounted) {
          setUser(null)
          setRole(null)
          setOrgId(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadUser()

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return

      // Gestione errori di refresh token
      if (event === 'TOKEN_REFRESHED' && !session) {
        logger.warn('Token refresh fallito, disconnessione automatica')
        await supabase.auth.signOut()
        if (isMounted) {
          setUser(null)
          setRole(null)
          setOrgId(null)
        }
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return
      }

      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (error) {
          // Verifica se è un errore di refresh token
          const errorMessage = error instanceof Error ? error.message : String(error)
          if (
            errorMessage.includes('Invalid Refresh Token') ||
            errorMessage.includes('Refresh Token Not Found')
          ) {
            logger.warn(
              'Refresh token non valido in onAuthStateChange, disconnessione automatica',
              error,
            )
            await supabase.auth.signOut()
            if (isMounted) {
              setUser(null)
              setRole(null)
              setOrgId(null)
            }
            if (typeof window !== 'undefined') {
              window.location.href = '/login'
            }
            return
          }

          const errorDetails = serializeError(error)
          logger.warn('Errore caricamento profilo in onAuthStateChange', error, {
            errorDetails,
            errorType: typeof error,
            errorString: String(error),
            userId: session.user.id,
          })

          if (isMounted) {
            setUser(null)
            setRole(null)
            setOrgId(null)
          }
        } else if (profile && isMounted) {
          const mappedProfile = mapProfileToUser(profile as ProfileRow)
          setUser(mappedProfile)
          setRole(mappedProfile.role)
          setOrgId(mappedProfile.org_id)
        }
      } else {
        if (isMounted) {
          setUser(null)
          setRole(null)
          setOrgId(null)
        }
      }
      if (isMounted) {
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
    // onAuthStateChange è un listener che deve essere registrato solo una volta al mount
    // loading e user sono settati ma non letti nella logica, quindi non devono essere nelle dipendenze
  }, []) // Intenzionalmente vuoto: il listener deve essere registrato solo al mount

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
