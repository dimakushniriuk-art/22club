'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { Tables } from '@/types/supabase'
import { createLogger } from '@/lib/logger'

const logger = createLogger('hooks:use-auth')

type ProfileRow = Tables<'profiles'>

const normaliseRole = (role: string | null | undefined): 'admin' | 'trainer' | 'athlete' | 'nutrizionista' | 'massaggiatore' | null => {
  if (!role) return null
  if (role === 'pt') return 'trainer'
  if (role === 'atleta') return 'athlete'
  if (role === 'admin' || role === 'trainer' || role === 'athlete' || role === 'nutrizionista' || role === 'massaggiatore') {
    return role
  }
  return null
}

export function useAuth() {
  const [user, setUser] = useState<ProfileRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  // Stabilizza supabase con useRef per evitare loop infiniti
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const populateProfile = async (userId: string) => {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (profileError) {
        if (isMountedRef.current) {
          setError('Profilo non trovato')
        }
        return null
      }

      if (isMountedRef.current) {
        // Evita di aggiornare se il profilo è identico (per evitare re-render inutili)
        setUser((prevUser) => {
          const newProfile = profile as ProfileRow
          // Confronta solo i campi chiave per evitare re-render inutili
          if (
            prevUser?.id === newProfile.id &&
            prevUser?.user_id === newProfile.user_id &&
            prevUser?.role === newProfile.role &&
            prevUser?.nome === newProfile.nome &&
            prevUser?.cognome === newProfile.cognome
          ) {
            return prevUser // Ritorna lo stesso oggetto se non è cambiato
          }
          return newProfile
        })
      }
      return profile as ProfileRow
    }

    const getSession = async () => {
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
            // Disconnetti l'utente e reindirizza al login
            await supabase.auth.signOut()
            if (isMountedRef.current) {
              setUser(null)
              setError(null)
              router.push('/login')
            }
            return
          }

          if (isMountedRef.current) {
            setError(sessionError.message)
          }
          return
        }

        if (session?.user) {
          await populateProfile(session.user.id)
        }
      } catch (error) {
        logger.error('Errore recupero sessione', error)
        // Verifica se è un errore di refresh token anche nel catch
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (
          errorMessage.includes('Invalid Refresh Token') ||
          errorMessage.includes('Refresh Token Not Found')
        ) {
          logger.warn('Refresh token non valido nel catch, disconnessione automatica', error)
          await supabase.auth.signOut()
          if (isMountedRef.current) {
            setUser(null)
            setError(null)
            router.push('/login')
          }
          return
        }
        if (isMountedRef.current) {
          setError('Errore durante il caricamento della sessione')
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
      }
    }

    getSession()

    // Ascolta i cambiamenti di autenticazione
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Gestione errori di refresh token
      if (event === 'TOKEN_REFRESHED' && !session) {
        logger.warn('Token refresh fallito, disconnessione automatica')
        await supabase.auth.signOut()
        if (isMountedRef.current) {
          setUser(null)
          setError(null)
          router.push('/login')
        }
        return
      }

      if (event === 'SIGNED_OUT' || !session) {
        if (isMountedRef.current) {
          setUser(null)
          setError(null)
        }
      } else if (session?.user) {
        await populateProfile(session.user.id)
      }
      if (isMountedRef.current) {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Rimossa dipendenza supabase (stabilizzato con useRef)

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Log per debug
        logger.debug('Login: User autenticato', {
          userId: data.user.id,
          userEmail: data.user.email,
        })

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single()

        if (profileError) {
          // Log dettagliato dell'errore
          const errorMessage =
            (profileError as { message?: string }).message ||
            String(profileError) ||
            'Nessun messaggio'
          const errorCode = (profileError as { code?: string }).code || 'UNKNOWN'

          console.error('=== ERRORE LOGIN - PROFILO NON TROVATO ===')
          console.error('User ID:', data.user.id)
          console.error('User Email:', data.user.email)
          console.error('Error message:', errorMessage)
          console.error('Error code:', errorCode)
          console.error('Full error:', profileError)

          logger.error('Login: Profilo non trovato', profileError, {
            userId: data.user.id,
            userEmail: data.user.email,
            errorMessage,
            errorCode,
          })

          setError('Profilo non trovato')
          return { success: false, error: 'Profilo non trovato' }
        }

        if (!profile) {
          logger.error('Login: Profilo null dopo query', null, {
            userId: data.user.id,
            userEmail: data.user.email,
          })
          setError('Profilo non trovato')
          return { success: false, error: 'Profilo non trovato' }
        }

        const typedProfile = profile as ProfileRow

        // Log profilo caricato
        logger.debug('Login: Profilo caricato', {
          profileId: typedProfile.id,
          userId: typedProfile.user_id,
          role: typedProfile.role,
          email: typedProfile.email,
        })

        setUser(typedProfile)

        const role = normaliseRole(typedProfile.role)
        logger.debug('Login: Ruolo normalizzato', {
          originalRole: typedProfile.role,
          normalizedRole: role,
        })

        if (role === 'admin' || role === 'trainer' || role === 'nutrizionista' || role === 'massaggiatore') {
          logger.debug('Login: Reindirizzamento a /dashboard')
          router.push('/dashboard')
        } else if (role === 'athlete') {
          logger.debug('Login: Reindirizzamento a /home')
          router.push('/home')
        } else {
          logger.warn('Login: Ruolo non riconosciuto, reindirizzamento a /home', {
            role,
            normalizedRole: role,
          })
          router.push('/home')
        }

        return { success: true }
      }

      return { success: false, error: 'Errore durante il login' }
    } catch {
      const errorMessage = 'Errore durante il login'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      setUser(null)
      router.push('/login')
      return { success: true }
    } catch {
      const errorMessage = 'Errore durante il logout'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset?token=`,
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch {
      const errorMessage = "Errore durante l'invio della email"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
    resetPassword,
  }
}
