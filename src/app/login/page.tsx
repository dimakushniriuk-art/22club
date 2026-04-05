'use client'

import { Suspense, useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoginCard } from '@/components/auth/LoginCard'
import { getPostLoginRedirectPath } from '@/lib/utils/role-redirect-paths'

const logger = createLogger('LoginPage')

function validateLoginForm(email: string, password: string): { email?: string; password?: string } {
  const errors: { email?: string; password?: string } = {}
  if (!email.trim()) errors.email = 'Email è richiesta'
  if (!password) errors.password = 'Password è richiesta'
  return errors
}

type ProfileRow = { role: string; org_id: string | null; first_login: boolean | null }

function performPostLoginRedirect(
  profileData: ProfileRow,
  router: ReturnType<typeof useRouter>,
  setError: (s: string | null) => void,
  setLoading: (b: boolean) => void,
): boolean {
  const userRole = profileData.role
  const path = getPostLoginRedirectPath(userRole, profileData.first_login)
  if (!path) {
    setError(`Ruolo non riconosciuto: ${userRole}. Contatta l'amministratore.`)
    setLoading(false)
    return false
  }
  router.replace(path)
  return true
}

const LOGIN_ERROR_ID = 'login-error'
const RATE_LIMIT_ATTEMPTS = 5
const RATE_LIMIT_MS = 60_000

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>(
    {},
  )
  const [lockUntil, setLockUntil] = useState<number | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const failedAttemptsRef = useRef(0)

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (searchParams.get('error') === 'profilo') {
      setError("Profilo non trovato. Contatta l'amministratore per completare la registrazione.")
      setInfoMessage(null)
      return
    }

    const reason = searchParams.get('reason')
    const redirectedFrom = searchParams.get('redirectedFrom')

    if (reason === 'session_expired') {
      setInfoMessage('Sessione scaduta o non più valida. Accedi di nuovo per continuare.')
      return
    }

    if (reason === 'auth_required') {
      setInfoMessage(
        redirectedFrom
          ? 'Per accedere alla pagina richiesta devi effettuare il login. Se eri già connesso, la sessione potrebbe essere scaduta.'
          : 'Accedi per continuare.',
      )
      return
    }

    if (redirectedFrom) {
      setInfoMessage('Accedi per continuare.')
      return
    }

    setInfoMessage(null)
  }, [searchParams])

  useEffect(() => {
    if (lockUntil == null) return
    const remaining = lockUntil - Date.now()
    if (remaining <= 0) {
      setLockUntil(null)
      setError(null)
      failedAttemptsRef.current = 0
      return
    }
    const t = setTimeout(() => {
      setLockUntil(null)
      setError(null)
      failedAttemptsRef.current = 0
    }, remaining)
    return () => clearTimeout(t)
  }, [lockUntil])

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setError(null)
      setValidationErrors({})

      const errors = validateLoginForm(email, password)
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors)
        setLoading(false)
        return
      }

      try {
        const signInStart = performance.now()
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        logger.debug(
          `[PERF] signInWithPassword: ${(performance.now() - signInStart).toFixed(2)}ms`,
          { success: !signInError },
        )

        if (signInError) {
          const invalidCreds =
            signInError.message === 'Invalid login credentials' ||
            (signInError as { code?: string }).code === 'invalid_credentials'
          if (invalidCreds) {
            logger.warn('Login rifiutato: credenziali non valide', {
              status: (signInError as { status?: number }).status,
            })
          } else {
            logger.error('Errore login', signInError, {
              message: signInError.message,
              status: (signInError as { status?: number }).status,
            })
          }
          failedAttemptsRef.current += 1
          if (failedAttemptsRef.current >= RATE_LIMIT_ATTEMPTS) {
            setLockUntil(Date.now() + RATE_LIMIT_MS)
            setError(`Troppi tentativi errati. Riprova tra ${RATE_LIMIT_MS / 1000} secondi.`)
          } else {
            const isNetworkError =
              signInError.message?.includes('Failed to fetch') ||
              (signInError as { name?: string }).name === 'AuthRetryableFetchError' ||
              (signInError as { status?: number }).status === 0
            if (isNetworkError) {
              setError(
                'Impossibile contattare il server. Verifica la connessione e che il progetto Supabase sia attivo (Dashboard Supabase).',
              )
            } else if (signInError.message?.includes('Supabase not configured')) {
              setError(
                "Supabase non configurato correttamente. Verifica le variabili d'ambiente in .env.local",
              )
            } else if (
              signInError.message?.toLowerCase().includes('email not confirmed') ||
              (signInError as { code?: string }).code === 'email_not_confirmed'
            ) {
              setError(
                'Email non ancora confermata. Controlla la casella (anche spam), clicca il link nella mail di conferma e poi riprova ad accedere.',
              )
            } else {
              setError('Credenziali non valide')
            }
          }
          return
        }
        failedAttemptsRef.current = 0

        if (!data.user) {
          setLoading(false)
          return
        }

        // Allinea sessione JWT al client prima della query RLS su profiles (evita race post sign-in)
        if (data.session) {
          await supabase.auth.setSession(data.session)
        }
        const {
          data: { session: sessionAfterLogin },
        } = await supabase.auth.getSession()
        if (!sessionAfterLogin?.access_token) {
          setError(
            'Sessione non disponibile dopo il login. Chiudi e riprova, o svuota cookie del sito.',
          )
          return
        }

        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role, org_id, first_login')
            .eq('user_id', data.user.id)
            .single()

          if (profileError || !profileData) {
            const err = profileError as { code?: string; status?: number; message?: string }
            const rawMessage =
              typeof (profileError as { message?: string })?.message === 'string'
                ? (profileError as { message: string }).message
                : String(profileError ?? '')
            const msgLower = rawMessage.toLowerCase()
            const isLockOrAbort =
              (profileError instanceof Error && profileError.name === 'AbortError') ||
              msgLower.includes('aborted') ||
              msgLower.includes('lock broken')
            const code = err?.code
            if (code === 'PGRST116' || isLockOrAbort) {
              const codice =
                typeof window !== 'undefined'
                  ? sessionStorage.getItem('pending_invite_codice')?.trim()
                  : null
              const welcomePath = codice
                ? `/welcome?codice=${encodeURIComponent(codice)}`
                : '/welcome'
              router.replace(welcomePath)
              return
            }
            if (code === '42501') {
              logger.warn(
                'RLS profiles: SELECT negato al login. Eseguire supabase/fix_profiles_rls_select_own.sql in Supabase SQL Editor.',
                profileError,
                { userId: data.user.id, code: err?.code },
              )
              setError(
                'Accesso al profilo bloccato dalla sicurezza del database. Contatta un amministratore.',
              )
              return
            }
            logger.error('Errore caricamento profilo', profileError, {
              userId: data.user.id,
              code: err?.code,
              status: err?.status,
            })
            if (err?.status === 429 || code === 'over_request_rate_limit') {
              setError('Troppe richieste. Riprova tra qualche secondo.')
            } else {
              setError(err?.message ?? (rawMessage || 'Errore durante il caricamento del profilo'))
            }
            return
          }

          performPostLoginRedirect(profileData as ProfileRow, router, setError, setLoading)
        } catch {
          logger.error('Errore durante il caricamento del profilo')
          router.replace('/post-login')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Errore durante il login'
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
          setError('Impossibile connettersi a Supabase. Verifica la configurazione in .env.local')
        } else {
          setError(errorMessage)
        }
      } finally {
        setLoading(false)
      }
    },
    [email, password, router, supabase],
  )

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setValidationErrors((prev) => (prev.email ? { ...prev, email: undefined } : prev))
  }, [])

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setValidationErrors((prev) => (prev.password ? { ...prev, password: undefined } : prev))
  }, [])

  const isRateLimited = lockUntil != null && Date.now() < lockUntil

  return (
    <LoginCard
      email={email}
      password={password}
      loading={loading}
      error={error}
      infoMessage={infoMessage}
      validationErrors={validationErrors}
      onSubmit={handleLogin}
      onEmailChange={handleEmailChange}
      onPasswordChange={handlePasswordChange}
      errorId={LOGIN_ERROR_ID}
      submitDisabled={isRateLimited}
      title="Accedi"
      subtitle="Inserisci le tue credenziali per accedere al tuo account."
    />
  )
}

export default function LoginPage() {
  return (
    <div
      className="page-login min-h-screen min-w-0 bg-background text-text-primary flex items-center justify-center px-4 py-4 min-[834px]:px-6 min-[834px]:py-6 safe-area-inset"
      style={{ minHeight: '100dvh' }}
    >
      <Suspense fallback={<LoginCard skeleton title="Accedi" />}>
        <LoginContent />
      </Suspense>
    </div>
  )
}
