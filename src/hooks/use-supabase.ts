'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// Stabilizza supabase come singleton per evitare loop infiniti
const stableSupabase = supabase

export function useSupabase() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true
    let loadingTimeout: NodeJS.Timeout | null = null
    let authStateChangeCalled = false
    let getSessionExecuted = false // FIX #4: Prevenire chiamate multiple a getSession()
    let subscription: { unsubscribe: () => void } | null = null

    // Verifica se c'è una sessione salvata nel localStorage (fallback per cookie-based storage)
    // Questo è un workaround per quando onAuthStateChange non viene chiamato immediatamente
    const checkLocalStorageSession = () => {
      try {
        if (typeof window === 'undefined') return null
        
        // Supabase salva la sessione in localStorage con chiavi che iniziano con 'sb-'
        const supabaseKeys = Object.keys(localStorage).filter(key => key.startsWith('sb-'))
        if (supabaseKeys.length > 0) {
          console.log('[useSupabase] Trovate chiavi Supabase nel localStorage', { 
            keys: supabaseKeys.map(k => k.substring(0, 20)) // Primi 20 caratteri per privacy
          })
          return true // C'è almeno una chiave Supabase, potrebbe esserci una sessione
        }
      } catch (err) {
        console.error('[useSupabase] Errore controllo localStorage', err)
      }
      return false
    }

    // FIX #4: Funzione helper per eseguire getSession() una sola volta
    const executeGetSession = async (context: string) => {
      if (getSessionExecuted) {
        console.log(`[useSupabase] getSession già eseguito, skip (${context})`)
        return null
      }
      
      getSessionExecuted = true
      try {
        const { data: { session }, error: sessionError } = await stableSupabase.auth.getSession()
        
        if (!isMounted) return null
        
        console.log(`[useSupabase] getSession completato (${context})`, {
          hasSession: !!session,
          hasUser: !!session?.user,
          hasError: !!sessionError,
        })
        
        if (!sessionError && session?.user) {
          if (loadingTimeout) {
            clearTimeout(loadingTimeout)
            loadingTimeout = null
          }
          setUser(session.user)
          setLoading(false)
          authStateChangeCalled = true // Marca come chiamato per evitare chiamate duplicate
          return session.user
        } else {
          setUser(null)
          setLoading(false)
          return null
        }
      } catch (err) {
        console.error(`[useSupabase] Errore getSession (${context})`, err)
        if (isMounted) {
          setUser(null)
          setLoading(false)
        }
        return null
      }
    }

    // Timeout di sicurezza: dopo 3 secondi, imposta loading = false anche se non abbiamo una risposta
    loadingTimeout = setTimeout(() => {
      if (isMounted && loading) {
        const hasLocalKeys = checkLocalStorageSession()
        console.warn('[useSupabase] Timeout di sicurezza: impostando loading = false dopo 3 secondi', {
          hasLocalKeys,
          authStateChangeCalled,
          getSessionExecuted,
        })
        setLoading(false)
        // FIX #4: Se authStateChange non è stato chiamato ma ci sono chiavi localStorage,
        // esegui getSession() solo se non è già stato eseguito
        if (hasLocalKeys && !authStateChangeCalled && !getSessionExecuted) {
          console.log('[useSupabase] Tentativo finale getSession() dopo timeout')
          void executeGetSession('timeout-fallback')
        }
      }
    }, 3000)

    // FIX #4: onAuthStateChange viene chiamato immediatamente con la sessione corrente se esiste
    // Questo è più veloce di getSession() perché non fa una chiamata di rete
    const authStateChangeResult = stableSupabase.auth.onAuthStateChange((_event, session) => {
      authStateChangeCalled = true
      // FIX #4: Marca getSession come eseguito per evitare chiamate duplicate
      if (session?.user) {
        getSessionExecuted = true
      }
      
      console.log('[useSupabase] onAuthStateChange', { 
        event: _event,
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
      })
      
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
        loadingTimeout = null
      }
      
      if (!isMounted) return
      
      setUser(session?.user ?? null)
      setLoading(false)
    })
    
    subscription = authStateChangeResult.data.subscription

    // FIX #4: Fallback: esegui getSession() solo se onAuthStateChange non viene chiamato immediatamente
    // Esegui in background con timeout breve (1.5s)
    const tryGetSession = async () => {
      // FIX #4: Se getSession è già stato eseguito o authStateChange è già stato chiamato, skip
      if (getSessionExecuted || authStateChangeCalled) {
        console.log('[useSupabase] getSession skip: già eseguito o authStateChange chiamato')
        return
      }
      
      try {
        // FIX #4: Usa timeout breve per evitare blocking, ma non chiamare multiple volte
        const sessionPromise = stableSupabase.auth.getSession()
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => resolve(null), 1500)
        })
        
        const result = await Promise.race([sessionPromise, timeoutPromise])
        
        if (!isMounted) return
        
        if (result === null) {
          console.log('[useSupabase] getSession timeout 1.5s (non critico)')
          // FIX #4: Non chiamare getSession() di nuovo qui - aspetta onAuthStateChange o timeout finale
          return
        }
        
        const {
          data: { session },
          error: sessionError,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } = result as { data: { session: any }; error: any }
        
        if (!isMounted) return
        
        // FIX #4: Marca come eseguito prima di aggiornare lo stato
        getSessionExecuted = true
        
        if (loadingTimeout) {
          clearTimeout(loadingTimeout)
          loadingTimeout = null
        }
        
        // Solo aggiorna se onAuthStateChange non ha già impostato l'utente
        if (!sessionError && session?.user && !authStateChangeCalled) {
          console.log('[useSupabase] getSession completato (fallback)', { 
            userId: session.user.id, 
            email: session.user.email 
          })
          setUser(session.user)
          setLoading(false)
          authStateChangeCalled = true
        } else if (sessionError || !session?.user) {
          console.log('[useSupabase] getSession: nessuna sessione valida (fallback)', {
            hasError: !!sessionError,
            error: sessionError,
          })
          // Se non c'è sessione, imposta loading = false per permettere al componente di continuare
          setUser(null)
          setLoading(false)
        }
      } catch (err) {
        console.error('[useSupabase] Errore in getSession fallback', err)
        if (loadingTimeout) {
          clearTimeout(loadingTimeout)
          loadingTimeout = null
        }
        // Se c'è un errore, imposta loading = false per permettere al componente di continuare
        if (isMounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    // FIX #4: Esegui getSession in background solo se necessario (non bloccare)
    // Delay breve per dare priorità a onAuthStateChange
    setTimeout(() => {
      if (isMounted && !authStateChangeCalled && !getSessionExecuted) {
        void tryGetSession()
      }
    }, 100) // Delay di 100ms per dare priorità a onAuthStateChange

    return () => {
      isMounted = false
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
        loadingTimeout = null
      }
      if (subscription) {
        subscription.unsubscribe()
        subscription = null
      }
    }
  }, [loading])

  return { user, loading, supabase: stableSupabase }
}
