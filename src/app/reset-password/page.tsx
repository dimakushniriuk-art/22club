'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import {
  AUTH_PAGE_WRAPPER_CLASS,
  AUTH_CARD_CLASS,
  AUTH_CARD_CONTENT_CLASS,
  AUTH_LOGO_CLASS,
  AUTH_INPUT_PASSWORD_CLASS,
  AUTH_BUTTON_PRIMARY_CLASS,
  AUTH_ERROR_BOX_CLASS,
  AUTH_LINK_BACK_CLASS,
} from '@/lib/auth-page-styles'

const logger = createLogger('app:reset-password:page')

function ResetPasswordContent() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasValidSession, setHasValidSession] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Controlla se ci sono errori nell'URL
    const errorParam = searchParams.get('error')
    const errorCode = searchParams.get('error_code')
    const errorDescription = searchParams.get('error_description')

    if (errorParam) {
      let errorMessage = 'Link non valido o scaduto'

      if (errorCode === 'otp_expired') {
        errorMessage = 'Il link di reset password è scaduto. Richiedi un nuovo link.'
      } else if (errorCode === 'access_denied') {
        errorMessage = errorDescription
          ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
          : 'Accesso negato. Il link potrebbe non essere valido.'
      }

      setUrlError(errorMessage)
      setCheckingSession(false)
      logger.error('Errore da URL reset password', {
        error: errorParam,
        errorCode,
        errorDescription,
      })
      return
    }

    // Se non c'è un token di recovery nell'URL (link email), reindirizza a forgot-password
    const hashParams = new URLSearchParams(
      typeof window !== 'undefined' ? window.location.hash.substring(1) : '',
    )
    const hasRecoveryHash = hashParams.get('access_token') && hashParams.get('type') === 'recovery'
    if (!hasRecoveryHash) {
      logger.info('Reset-password aperto senza token recovery, redirect a forgot-password')
      router.replace('/forgot-password')
      return
    }

    // Verifica se c'è un utente autenticato (usa getUser() invece di getSession() per sicurezza)
    const checkSession = async () => {
      try {
        logger.info('Verifica autenticazione per reset password')

        const hashParams = new URLSearchParams(
          typeof window !== 'undefined' ? window.location.hash.substring(1) : '',
        )
        const hasRecoveryHash =
          hashParams.get('access_token') && hashParams.get('type') === 'recovery'

        // Aspetta per permettere a Supabase di processare il token dall'URL (hash)
        await new Promise((resolve) => setTimeout(resolve, hasRecoveryHash ? 800 : 500))

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          // "Auth session missing!" è atteso quando l'utente arriva con hash: Supabase non ha ancora processato il token
          const isSessionMissing =
            userError.message?.includes('session missing') ||
            userError.message?.includes('Auth session missing')

          if (isSessionMissing && hasRecoveryHash) {
            logger.warn(
              'Sessione non ancora pronta, attendo elaborazione token recovery',
              userError.message,
            )
            await new Promise((resolve) => setTimeout(resolve, 1500))
            const {
              data: { user: retryUser },
              error: retryError,
            } = await supabase.auth.getUser()
            if (retryError || !retryUser) {
              logger.warn('Nessun utente dopo attesa token recovery', retryError?.message)
              setUrlError('Link non valido o scaduto. Richiedi un nuovo link di reset password.')
              setCheckingSession(false)
              return
            }
            setHasValidSession(true)
            setCheckingSession(false)
            return
          }

          if (
            userError.message?.includes('expired') ||
            userError.message?.includes('invalid') ||
            userError.message?.includes('token')
          ) {
            setUrlError('Link non valido o scaduto. Richiedi un nuovo link di reset password.')
          } else {
            setUrlError(
              'Errore durante la verifica del link. Il link potrebbe essere scaduto o non valido.',
            )
          }
          setCheckingSession(false)
          return
        }

        if (!user) {
          if (hasRecoveryHash) {
            logger.info("Token di recovery nell'URL, attendo elaborazione da Supabase")
            await new Promise((resolve) => setTimeout(resolve, 1200))
            const {
              data: { user: retryUser },
              error: retryError,
            } = await supabase.auth.getUser()
            if (retryError || !retryUser) {
              logger.warn('Nessun utente trovato dopo attesa token recovery', retryError?.message)
              setUrlError('Link non valido o scaduto. Richiedi un nuovo link di reset password.')
              setCheckingSession(false)
              return
            }
            setHasValidSession(true)
            setCheckingSession(false)
            return
          }
          logger.warn('Nessun utente trovato per reset password')
          setUrlError('Link non valido o scaduto. Richiedi un nuovo link di reset password.')
          setCheckingSession(false)
          return
        }

        setHasValidSession(true)
        setCheckingSession(false)
      } catch (err) {
        logger.error('Errore durante verifica autenticazione', err)
        setUrlError('Errore durante la verifica del link. Riprova più tardi.')
        setCheckingSession(false)
      }
    }

    checkSession()

    // Listener per eventi di autenticazione (quando Supabase processa il token dall'URL)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: unknown) => {
      logger.info('Auth state changed durante reset password', { event, hasSession: !!session })

      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        // Usa getUser() per verificare con il server invece di affidarsi solo alla session
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          logger.warn('Errore verifica utente dopo auth state change', userError)
          return
        }

        if (user) {
          logger.info('Utente autenticato da token recovery', {
            userId: user.id,
            email: user.email,
            event,
          })
          setHasValidSession(true)
          setCheckingSession(false)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [searchParams, supabase.auth, router])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Verifica che ci sia una sessione valida
    if (!hasValidSession) {
      setError('Sessione non valida. Richiedi un nuovo link di reset password.')
      setLoading(false)
      return
    }

    // Validazione
    if (!password) {
      setError('Inserisci una nuova password')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Le password non corrispondono')
      setLoading(false)
      return
    }

    try {
      logger.info('Aggiornamento password in corso', {
        passwordLength: password.length,
      })

      // Verifica nuovamente l'utente prima di aggiornare (usa getUser() per sicurezza)
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !currentUser) {
        logger.error('Utente non autenticato durante aggiornamento password', userError)
        setError('La sessione è scaduta. Richiedi un nuovo link di reset password.')
        setLoading(false)
        return
      }

      logger.info('Utente autenticato, procedo con aggiornamento password', {
        userId: currentUser.id,
        email: currentUser.email,
      })

      // Refresh della sessione prima di aggiornare la password per assicurarsi che sia valida
      logger.info('Refresh sessione prima di updateUser')
      const {
        data: { session: refreshedSession },
        error: refreshError,
      } = await supabase.auth.refreshSession()

      if (refreshError) {
        logger.warn('Errore refresh sessione, continuo comunque', refreshError)
      } else if (refreshedSession) {
        logger.info('Sessione refreshata con successo', {
          expiresAt: refreshedSession.expires_at,
          accessToken: refreshedSession.access_token?.substring(0, 20) + '...',
        })
      }

      // Aggiungi timeout per evitare che rimanga bloccato (aumentato a 60 secondi)
      logger.info('Chiamata updateUser con password', {
        passwordLength: password.trim().length,
        hasUser: !!currentUser,
        userId: currentUser.id,
        hasRefreshedSession: !!refreshedSession,
      })

      const updatePasswordPromise = supabase.auth
        .updateUser({
          password: password.trim(),
        })
        .then((result) => {
          logger.info('updateUser promise risolta', {
            hasData: !!result.data,
            hasError: !!result.error,
            userId: result.data?.user?.id,
            errorMessage: result.error?.message,
          })
          return result
        })
        .catch((err: unknown) => {
          const errObj = err as { message?: string; constructor?: { name?: string } }
          logger.error('updateUser promise rifiutata', err, {
            errorType: errObj?.constructor?.name,
            errorMessage: errObj?.message,
          })
          throw err
        })

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          logger.error('Timeout aggiornamento password dopo 60 secondi')
          // Verifica se la password è stata comunque cambiata nonostante il timeout
          logger.warn('Verifica se password è stata cambiata nonostante timeout...')
          reject(
            new Error(
              "Timeout: L'operazione ha impiegato troppo tempo. Verifica se la password è stata cambiata provando a fare login.",
            ),
          )
        }, 60000) // 60 secondi di timeout (aumentato da 30)
      })

      logger.info('Avvio Promise.race per aggiornamento password')
      type UpdatePasswordResult = Awaited<ReturnType<typeof supabase.auth.updateUser>>
      let result: UpdatePasswordResult

      try {
        // Aggiungi un log in console per debug
        console.log('[RESET PASSWORD] Inizio aggiornamento password...')
        console.log('[RESET PASSWORD] Utente autenticato:', {
          userId: currentUser.id,
          email: currentUser.email,
        })

        result = await Promise.race([updatePasswordPromise, timeoutPromise])

        console.log('[RESET PASSWORD] Risultato ricevuto:', {
          hasData: !!result.data,
          hasError: !!result.error,
          errorMessage: result.error?.message,
        })
      } catch (raceError) {
        console.error('[RESET PASSWORD] Errore in Promise.race:', raceError)
        logger.error('Errore in Promise.race', raceError)

        if (raceError instanceof Error && raceError.message.includes('Timeout')) {
          // In caso di timeout, verifica se la password è stata comunque cambiata
          logger.warn('Timeout verificato, controllo se password è stata cambiata...')

          // Prova a verificare se l'utente può ancora autenticarsi (se la password è cambiata, la sessione potrebbe essere ancora valida)
          const {
            data: { user: verifyUser },
            error: verifyError,
          } = await supabase.auth.getUser()

          if (!verifyError && verifyUser) {
            logger.info(
              'Utente ancora autenticato dopo timeout, password potrebbe essere stata cambiata',
              {
                userId: verifyUser.id,
              },
            )
            setError(
              "L'operazione ha impiegato troppo tempo. Verifica se la password è stata cambiata provando a fare login con la nuova password. Se non funziona, richiedi un nuovo link di reset.",
            )
          } else {
            setError(raceError.message)
          }
        } else {
          setError("Errore durante l'aggiornamento della password. Riprova più tardi.")
        }
        setLoading(false)
        return
      }

      const { data, error: updateError } = result

      if (updateError) {
        console.error('[RESET PASSWORD] Errore aggiornamento:', updateError)
        const errorDetails = updateError as { code?: string; status?: number } | null
        logger.error('Errore aggiornamento password', updateError, {
          errorMessage: updateError.message,
          errorCode: errorDetails?.code,
          errorStatus: errorDetails?.status,
        })

        // Gestione errori specifici
        if (
          updateError.message?.includes('session') ||
          updateError.message?.includes('expired') ||
          updateError.message?.includes('token')
        ) {
          setError('La sessione è scaduta. Richiedi un nuovo link di reset password.')
        } else if (updateError.message?.includes('password')) {
          setError(
            'La password non soddisfa i requisiti di sicurezza. Prova con una password diversa.',
          )
        } else if (
          updateError.message?.includes('network') ||
          updateError.message?.includes('fetch')
        ) {
          setError('Errore di connessione. Verifica la tua connessione internet e riprova.')
        } else {
          setError(
            updateError.message ||
              "Errore durante l'aggiornamento della password. Riprova più tardi.",
          )
        }
        setLoading(false)
        return
      }

      if (!data || !data.user) {
        console.error('[RESET PASSWORD] Dati non validi:', data)
        logger.error('Aggiornamento password completato ma dati non validi', { data })
        setError("Errore durante l'aggiornamento della password. I dati ricevuti non sono validi.")
        setLoading(false)
        return
      }

      console.log('[RESET PASSWORD] Password aggiornata con successo!', {
        userId: data.user.id,
        email: data.user.email,
      })
      logger.info('Password aggiornata con successo', {
        userId: data.user.id,
        email: data.user.email,
      })

      setSuccess(true)
      setLoading(false)

      // Reindirizza al login dopo 3 secondi
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error) {
      logger.error('Errore aggiornamento password (catch)', error, {
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
      })

      if (error instanceof Error && error.message.includes('Timeout')) {
        setError(error.message)
      } else {
        setError("Errore durante l'aggiornamento della password. Riprova più tardi.")
      }
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className={AUTH_PAGE_WRAPPER_CLASS} style={{ minHeight: '100dvh' }}>
        <div className="w-full max-w-md min-[834px]:max-w-lg animate-fade-in relative z-10">
          <Card variant="default" className={AUTH_CARD_CLASS}>
            <CardContent className={`${AUTH_CARD_CONTENT_CLASS} text-center`}>
              <div className="mb-6 min-[834px]:mb-8">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 bg-white/[0.04]">
                  <span
                    className="inline-block w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    aria-hidden
                  />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-3 text-text-primary">
                  Verifica link...
                </h2>
                <p className="text-sm leading-relaxed max-w-sm mx-auto text-text-secondary">
                  Stiamo verificando il tuo link di reset password.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (urlError) {
    return (
      <div className={AUTH_PAGE_WRAPPER_CLASS} style={{ minHeight: '100dvh' }}>
        <div className="w-full max-w-md min-[834px]:max-w-lg animate-fade-in relative z-10">
          <Card variant="default" className={AUTH_CARD_CLASS}>
            <CardContent className={`${AUTH_CARD_CONTENT_CLASS} text-center`}>
              <div className="mb-6 min-[834px]:mb-8 animate-fade-in">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-state-error/10 border border-state-error/20">
                  <AlertCircle className="w-10 h-10 text-state-error" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-3 text-text-primary">
                  Link non valido
                </h2>
                <p className="text-sm leading-relaxed max-w-sm mx-auto mb-6 text-text-secondary">
                  {urlError}
                </p>
              </div>
              <div className="space-y-4">
                <Link href="/forgot-password">
                  <Button variant="primary" className={`${AUTH_BUTTON_PRIMARY_CLASS} w-full`}>
                    Richiedi nuovo link
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="w-full min-h-[44px] py-3 rounded-lg border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Torna al Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className={AUTH_PAGE_WRAPPER_CLASS} style={{ minHeight: '100dvh' }}>
        <div className="w-full max-w-md min-[834px]:max-w-lg animate-fade-in relative z-10">
          <Card variant="default" className={AUTH_CARD_CLASS}>
            <CardContent className={`${AUTH_CARD_CONTENT_CLASS} text-center`}>
              <div
                className="mb-6 min-[834px]:mb-8 animate-fade-in"
                style={{ animationDelay: '100ms' }}
              >
                <div className="mb-4 min-[834px]:mb-6 flex justify-center">
                  <Image
                    src="/logo.svg"
                    alt="22 PERSONAL TRAINING Club"
                    width={180}
                    height={180}
                    className={AUTH_LOGO_CLASS}
                    priority
                  />
                </div>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in bg-white/[0.06] border border-white/10">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-3 text-text-primary">
                  Password aggiornata!
                </h2>
                <p className="text-sm leading-relaxed max-w-sm mx-auto text-text-secondary">
                  La tua password è stata aggiornata con successo. Verrai reindirizzato al login tra
                  pochi secondi.
                </p>
              </div>
              <div className="space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <Link href="/login">
                  <Button variant="primary" className={`${AUTH_BUTTON_PRIMARY_CLASS} w-full`}>
                    Vai al Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Se non c'è una sessione valida, non mostrare il form
  if (!hasValidSession) {
    return null // Il componente urlError gestirà già la visualizzazione
  }

  return (
    <div className={AUTH_PAGE_WRAPPER_CLASS} style={{ minHeight: '100dvh' }}>
      <div className="w-full max-w-md min-[834px]:max-w-lg animate-fade-in relative z-10">
        <Card variant="default" className={AUTH_CARD_CLASS}>
          <CardContent className={AUTH_CARD_CONTENT_CLASS}>
            <div className="mb-6 animate-fade-in">
              <Link href="/login" className={AUTH_LINK_BACK_CLASS}>
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                Torna al Login
              </Link>
            </div>
            <div
              className="text-center mb-6 min-[834px]:mb-8 animate-fade-in"
              style={{ animationDelay: '100ms' }}
            >
              <div className="mb-4 min-[834px]:mb-6 flex justify-center">
                <Image
                  src="/logo.svg"
                  alt="22 PERSONAL TRAINING Club"
                  width={200}
                  height={200}
                  className={AUTH_LOGO_CLASS}
                  priority
                />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 min-[834px]:mb-3 text-text-primary mt-4 min-[834px]:mt-6">
                Imposta nuova password
              </h2>
              <p className="text-sm leading-relaxed max-w-sm mx-auto text-text-secondary">
                Inserisci una nuova password sicura per il tuo account.
              </p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <form onSubmit={handleResetPassword} className="space-y-5 min-[834px]:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-text-primary">
                    Nuova Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-text-muted" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimo 6 caratteri"
                      className={AUTH_INPUT_PASSWORD_CLASS}
                      style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                      aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-text-primary"
                  >
                    Conferma Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-text-muted" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ripeti la password"
                      className={AUTH_INPUT_PASSWORD_CLASS}
                      style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                      aria-label={showConfirmPassword ? 'Nascondi password' : 'Mostra password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className={AUTH_ERROR_BOX_CLASS} role="alert">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-state-error" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-state-error">Errore</p>
                      <p className="text-sm mt-1 text-state-error/90">{error}</p>
                    </div>
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={loading || !password.trim() || !confirmPassword.trim()}
                  variant="primary"
                  className={AUTH_BUTTON_PRIMARY_CLASS}
                >
                  {loading ? (
                    <>
                      <span
                        className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"
                        aria-hidden
                      />
                      Aggiornamento in corso...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Aggiorna Password
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-text-secondary">
                  La password deve essere di almeno 6 caratteri
                </p>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-text-secondary">Caricamento...</div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
