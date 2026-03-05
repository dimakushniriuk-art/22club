'use client'

import { useState } from 'react'
import { createLogger } from '@/lib/logger'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react'
import { AthleteBackground } from '@/components/athlete/athlete-background'
import Image from 'next/image'

const logger = createLogger('app:forgot-password:page')

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      logger.info('Richiesta reset password via API Resend', { email, origin })

      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          redirectTo: `${origin}/reset-password`,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error || "Errore durante l'invio della richiesta")
        return
      }

      logger.info('Email reset password inviata con successo (Resend)', { email })
      setSuccess(true)
    } catch (err) {
      logger.error('Errore reset password', err, { email })
      setError("Errore durante l'invio della richiesta. Riprova più tardi.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="page-login min-h-screen flex items-center justify-center px-4 py-4 min-[834px]:px-6 min-[834px]:py-6 relative overflow-hidden safe-area-inset bg-background" style={{ minHeight: '100dvh' }}>
        <div className="absolute inset-0 z-0 pointer-events-none">
          <AthleteBackground />
        </div>
        <div className="w-full max-w-md min-[834px]:max-w-lg animate-fade-in relative z-10">
          <Card variant="default" className="login-card w-full max-w-md min-[834px]:max-w-lg backdrop-blur-xl border border-border rounded-xl min-[834px]:rounded-2xl bg-background-secondary/95">
            <CardContent className="p-5 sm:p-6 min-[834px]:p-8 text-center">
              <div className="mb-6 min-[834px]:mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
                <div className="mb-4 min-[834px]:mb-6 flex justify-center">
                  <div className="relative">
                    <Image
                      src="/logo.svg"
                      alt="22 PERSONAL TRAINING Club"
                      width={180}
                      height={180}
                      className="w-auto h-24 object-contain drop-shadow-[0_0_20px_rgba(2,179,191,0.25)]"
                      priority
                    />
                    <div className="absolute inset-0 bg-primary/15 blur-xl -z-10" />
                  </div>
                </div>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in bg-primary/20">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-3 text-text-primary">Email inviata!</h2>
                <p className="text-sm leading-relaxed max-w-sm mx-auto text-text-secondary">
                  Controlla la tua casella <span className="font-semibold text-text-primary">{email}</span> e segui le istruzioni per reimpostare la password.
                </p>
              </div>
              <div className="space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <div className="rounded-xl p-4 mb-4 bg-background-tertiary/50 border border-border">
                  <p className="text-sm mb-2 text-text-secondary">
                    <Mail className="w-4 h-4 inline mr-2 text-primary" />
                    Non hai ricevuto l&apos;email? Controlla anche la cartella spam.
                  </p>
                  {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs mb-2 text-text-tertiary">
                        <strong className="text-text-secondary">Sviluppo locale:</strong> Le email vengono inviate a Inbucket.
                      </p>
                      <a
                        href="http://localhost:54324"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                      >
                        Apri Inbucket per vedere le email
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
                <Link href="/login">
                  <Button
                    variant="primary"
                    className="w-full min-h-[44px] py-3 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white font-semibold shadow-md shadow-primary/30 border border-teal-500/50 hover:from-teal-500 hover:to-cyan-500"
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

  return (
    <div className="page-login min-h-screen flex items-center justify-center px-4 py-4 min-[834px]:px-6 min-[834px]:py-6 relative overflow-hidden safe-area-inset bg-background" style={{ minHeight: '100dvh' }}>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AthleteBackground />
      </div>
      <div className="w-full max-w-md min-[834px]:max-w-lg animate-fade-in relative z-10">
        <Card variant="default" className="login-card w-full max-w-md min-[834px]:max-w-lg backdrop-blur-xl border border-border rounded-xl min-[834px]:rounded-2xl bg-background-secondary/95">
          <CardContent className="p-5 sm:p-6 min-[834px]:p-8">
            <div className="mb-6 animate-fade-in">
              <Link
                href="/login"
                className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                Torna al Login
              </Link>
            </div>

            <div className="text-center mb-6 min-[834px]:mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="mb-4 min-[834px]:mb-6 flex justify-center">
                <div className="relative">
                  <Image
                    src="/logo.svg"
                    alt="22 PERSONAL TRAINING Club"
                    width={200}
                    height={200}
                    className="w-auto h-24 sm:h-28 min-[834px]:h-32 object-contain drop-shadow-[0_0_20px_rgba(2,179,191,0.25)]"
                    priority
                  />
                  <div className="absolute inset-0 bg-primary/15 blur-xl -z-10" />
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 min-[834px]:mb-3 text-text-primary mt-4 min-[834px]:mt-6">Password dimenticata?</h2>
              <p className="text-sm leading-relaxed max-w-sm mx-auto text-text-secondary">
                Inserisci la tua email e ti invieremo le istruzioni per reimpostare la password.
              </p>
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <form onSubmit={handleResetPassword} className="space-y-5 min-[834px]:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-text-primary">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none text-text-muted" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="la.tua@email.com"
                      className="min-h-[44px] sm:min-h-10 pl-9 sm:pl-10 rounded-xl bg-background-secondary border-border text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background text-base"
                      style={{ paddingLeft: '2.25rem' }}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-3 rounded-xl p-4 animate-fade-in bg-state-error/10 border border-state-error/20">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-state-error" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-state-error">Errore</p>
                      <p className="text-sm mt-1 text-state-error/90">{error}</p>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || !email.trim()}
                  variant="primary"
                  className="w-full min-h-[44px] py-3 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white font-semibold shadow-md shadow-primary/30 border border-teal-500/50 hover:from-teal-500 hover:to-cyan-500 active:from-teal-700 active:to-cyan-700 disabled:opacity-60 disabled:from-teal-800 disabled:to-cyan-800"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" aria-hidden />
                      Invio in corso...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Invia istruzioni
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-text-secondary pt-1">
                  Ricordi la password?{' '}
                  <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                    Accedi
                  </Link>
                </p>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
