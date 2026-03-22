'use client'

import { Suspense, useState, useMemo } from 'react'
import { createLogger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AlertCircle, CheckCircle } from 'lucide-react'
import {
  AUTH_PAGE_WRAPPER_CLASS,
  AUTH_CARD_CLASS,
  AUTH_CARD_CONTENT_CLASS,
  AUTH_LOGO_CLASS,
  AUTH_INPUT_CLASS,
  AUTH_BUTTON_PRIMARY_CLASS,
  AUTH_ERROR_BOX_CLASS,
} from '@/lib/auth-page-styles'

const logger = createLogger('app:registrati:page')

function RegisterFormFallback() {
  return (
    <div className="w-full max-w-md min-[834px]:max-w-lg animate-fade-in relative z-10">
      <Card variant="default" className={AUTH_CARD_CLASS}>
        <CardContent className={AUTH_CARD_CONTENT_CLASS}>
          <div className="text-center mb-6 min-[834px]:mb-8">
            <div className="mb-4 min-[834px]:mb-6 flex justify-center">
              <Image
                src="/logo.svg"
                alt="22 Club Logo"
                width={200}
                height={200}
                className={AUTH_LOGO_CLASS}
                priority
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Crea il tuo account</h2>
            <p className="text-text-secondary text-sm mt-2">Caricamento...</p>
          </div>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 rounded-md bg-white/[0.04] animate-pulse" />
              <div className="h-10 rounded-md bg-white/[0.04] animate-pulse" />
            </div>
            <div className="h-10 rounded-md bg-white/[0.04] animate-pulse" />
            <div className="h-10 rounded-md bg-white/[0.04] animate-pulse" />
            <div className="h-10 rounded-md bg-white/[0.04] animate-pulse" />
            <div className="h-12 rounded-md bg-white/[0.04] animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RegisterContent() {
  const searchParams = useSearchParams()
  const codiceInvito = useMemo(
    () => searchParams.get('codice')?.trim() || searchParams.get('code')?.trim() || '',
    [searchParams],
  )

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nome: '',
    cognome: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmationScreen, setShowConfirmationScreen] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Le password non corrispondono')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      setLoading(false)
      return
    }

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const codiceAtRedirect = codiceInvito || ''
      const redirectTo = origin
        ? codiceAtRedirect
          ? `${origin}/welcome?codice=${encodeURIComponent(codiceAtRedirect)}`
          : `${origin}/welcome`
        : undefined
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            nome: formData.nome,
            cognome: formData.cognome,
            role: 'athlete',
            org_id: 'default-org',
          },
        },
      })

      if (authError) {
        logger.error('Errore creazione utente', authError, {
          name: authError.name,
          status: authError.status,
        })
        setError(authError.message || 'Errore durante la registrazione')
        return
      }

      if (authData.user) {
        const session = authData.session
        const codiceAtSubmit =
          searchParams.get('codice')?.trim() || searchParams.get('code')?.trim() || ''

        if (session?.access_token && session?.refresh_token) {
          const supabaseClient = createClient()
          await supabaseClient.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          })
          try {
            await fetch('/api/register/complete-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                nome: formData.nome,
                cognome: formData.cognome,
                email: formData.email,
                ...(codiceAtSubmit && { codice: codiceAtSubmit }),
                access_token: session.access_token,
                refresh_token: session.refresh_token,
              }),
            })
          } catch {
            // welcome farà complete-profile al caricamente se fallisce qui
          }
          const welcomePath = codiceAtSubmit
            ? `/welcome?codice=${encodeURIComponent(codiceAtSubmit)}`
            : '/welcome'
          router.push(welcomePath)
        } else {
          // Nessuna sessione (conferma email attiva): registra e assegna subito via API (user_id + email)
          try {
            const cpRes = await fetch('/api/register/complete-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: authData.user.id,
                email: formData.email,
                nome: formData.nome,
                cognome: formData.cognome,
                ...(codiceAtSubmit && { codice: codiceAtSubmit }),
              }),
            })
            if (!cpRes.ok) {
              const errData = await cpRes.json().catch(() => ({}))
              logger.warn('complete-profile dopo registrazione fallito', {
                status: cpRes.status,
                errData,
              })
            }
          } catch (e) {
            logger.warn('complete-profile dopo registrazione errore di rete', e)
          }
          if (codiceAtSubmit && typeof window !== 'undefined') {
            try {
              sessionStorage.setItem('pending_invite_codice', codiceAtSubmit)
            } catch {
              // ignore
            }
          }
          setRegisteredEmail(formData.email)
          setShowConfirmationScreen(true)
          return
        }
      } else {
        setError('Utente non creato correttamente')
      }
    } catch (err) {
      const errorDetails =
        err instanceof Error
          ? { message: err.message, name: err.name, stack: err.stack }
          : typeof err === 'object' && err !== null
            ? {
                message: (err as { message?: string }).message || 'Errore sconosciuto',
                fullError: err,
              }
            : { rawError: err }
      logger.error('Errore durante la registrazione', err, errorDetails)
      setError('Errore durante la registrazione. Riprova più tardi.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    const email = registeredEmail?.trim()
    if (!email) return
    setResendMessage(null)
    setResendLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })
      if (error) {
        logger.warn('Resend confirmation email failed', error, { email })
        setResendMessage({
          type: 'error',
          text: error.message ?? "Impossibile inviare di nuovo l'email. Riprova più tardi.",
        })
      } else {
        setResendMessage({
          type: 'success',
          text: 'Email inviata di nuovo. Controlla la casella (e la cartella spam).',
        })
      }
    } catch (err) {
      logger.error('Resend confirmation email error', err, { email })
      setResendMessage({ type: 'error', text: 'Errore di rete. Riprova.' })
    } finally {
      setResendLoading(false)
    }
  }

  if (showConfirmationScreen) {
    return (
      <div className="w-full max-w-md min-[834px]:max-w-lg animate-fade-in relative z-10">
        <Card variant="default" className={AUTH_CARD_CLASS}>
          <CardContent className={`${AUTH_CARD_CONTENT_CLASS} text-center`}>
            <div className="mb-6 min-[834px]:mb-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-text-primary">
                <CheckCircle className="h-8 w-8" aria-hidden />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Account creato</h2>
              <p className="text-text-secondary mt-2 text-sm">
                Abbiamo inviato un&apos;email di conferma a{' '}
                <span className="font-medium text-text-primary">{registeredEmail ?? ''}</span>.
              </p>
              <p className="text-text-secondary mt-3 text-sm">
                Clicca sul link nell&apos;email per attivare l&apos;account. Poi accedi per
                completare il profilo
                {codiceInvito ? ' e collegarti al tuo trainer.' : '.'}
              </p>
            </div>
            <div className="space-y-4">
              <Button variant="primary" className={AUTH_BUTTON_PRIMARY_CLASS} asChild>
                <Link href="/login">Vai al login</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full min-h-[44px] rounded-lg border border-white/10 hover:bg-white/5"
                disabled={resendLoading || !registeredEmail?.trim()}
                onClick={handleResendConfirmation}
              >
                {resendLoading ? (
                  <>
                    <span
                      className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"
                      aria-hidden
                    />
                    Invio in corso...
                  </>
                ) : (
                  "Invia di nuovo l'email di conferma"
                )}
              </Button>
              {resendMessage && (
                <p
                  className={`text-sm ${
                    resendMessage.type === 'success' ? 'text-emerald-400' : 'text-state-error'
                  }`}
                >
                  {resendMessage.text}
                </p>
              )}
              <p className="text-text-muted text-xs">
                Non hai ricevuto l&apos;email? Controlla spam e cartelle promozioni.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md min-[834px]:max-w-lg animate-fade-in relative z-10">
      <Card variant="default" className={AUTH_CARD_CLASS}>
        <CardContent className={AUTH_CARD_CONTENT_CLASS}>
          <div className="text-center mb-6 min-[834px]:mb-8">
            <div className="mb-4 min-[834px]:mb-6 flex justify-center">
              <Image
                src="/logo.svg"
                alt="22 Club Logo"
                width={200}
                height={200}
                className={AUTH_LOGO_CLASS}
                priority
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Crea il tuo account</h2>
            <p className="text-text-secondary text-sm mt-2">Compila i campi per registrarti.</p>
            {codiceInvito && (
              <p className="text-primary text-xs mt-1">
                Registrazione con invito: sarai collegato al tuo PT dopo l’iscrizione.
              </p>
            )}
          </div>

          <form onSubmit={handleRegister} className="space-y-5 min-[834px]:space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-sm font-medium text-text-primary">
                  Nome
                </Label>
                <Input
                  id="nome"
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Mario"
                  className={AUTH_INPUT_CLASS}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cognome" className="text-sm font-medium text-text-primary">
                  Cognome
                </Label>
                <Input
                  id="cognome"
                  type="text"
                  value={formData.cognome}
                  onChange={(e) => handleInputChange('cognome', e.target.value)}
                  placeholder="Rossi"
                  className={AUTH_INPUT_CLASS}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-text-primary">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="la.tua@email.com"
                className={AUTH_INPUT_CLASS}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-text-primary">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="••••••"
                className={AUTH_INPUT_CLASS}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-text-primary">
                Conferma Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="••••••"
                className={AUTH_INPUT_CLASS}
                required
              />
            </div>
            {error && (
              <div className={AUTH_ERROR_BOX_CLASS} role="alert">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-state-error" />
                <p className="text-sm text-state-error flex-1">{error}</p>
              </div>
            )}
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className={AUTH_BUTTON_PRIMARY_CLASS}
            >
              {loading ? (
                <>
                  <span
                    className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"
                    aria-hidden
                  />
                  Registrazione in corso...
                </>
              ) : (
                'Registrati'
              )}
            </Button>
          </form>
          <div className="text-center mt-6">
            <p className="text-text-secondary text-sm">
              Hai già un account?{' '}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Accedi
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className={AUTH_PAGE_WRAPPER_CLASS} style={{ minHeight: '100dvh' }}>
      <Suspense fallback={<RegisterFormFallback />}>
        <RegisterContent />
      </Suspense>
    </div>
  )
}
