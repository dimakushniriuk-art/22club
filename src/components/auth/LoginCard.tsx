'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export type LoginCardValidationErrors = { email?: string; password?: string }

export interface LoginCardProps {
  /** Modalità skeleton (placeholder per Suspense) */
  skeleton?: boolean
  email?: string
  password?: string
  loading?: boolean
  error?: string | null
  validationErrors?: LoginCardValidationErrors
  onSubmit?: (e: React.FormEvent) => void
  onEmailChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPasswordChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  /** Id dell’elemento messaggio errore per aria-describedby (accessibilità) */
  errorId?: string
  /** Mostra link "Password dimenticata?" */
  showForgotPasswordLink?: boolean
  /** Disabilita submit (es. rate limit) */
  submitDisabled?: boolean
  title?: string
  subtitle?: string
}

const CARD_CLASS =
  'login-card w-full max-w-md min-[834px]:max-w-lg backdrop-blur-xl border border-border rounded-xl min-[834px]:rounded-2xl bg-background-secondary/95'
const WRAPPER_CLASS = 'w-full max-w-md min-[834px]:max-w-lg animate-fade-in relative z-10'

export function LoginCard({
  skeleton = false,
  email = '',
  password = '',
  loading = false,
  error = null,
  validationErrors = {},
  onSubmit,
  onEmailChange,
  onPasswordChange,
  errorId = 'login-error',
  showForgotPasswordLink = true,
  submitDisabled = false,
  title = 'Accedi',
  subtitle,
}: LoginCardProps) {
  if (skeleton) {
    return (
      <div className={WRAPPER_CLASS}>
        <Card variant="default" className={CARD_CLASS}>
          <CardContent className="p-5 sm:p-6 min-[834px]:p-8">
            <div className="text-center mb-6 min-[834px]:mb-8">
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
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 min-[834px]:mb-3 text-text-primary mt-4 min-[834px]:mt-6">
                {title}
              </h2>
              <p className="text-sm text-text-secondary">Caricamento...</p>
            </div>
            <div className="space-y-5 min-[834px]:space-y-6">
              <div className="h-10 rounded-xl bg-background-tertiary/50 animate-pulse" />
              <div className="h-10 rounded-xl bg-background-tertiary/50 animate-pulse" />
              <div className="h-12 rounded-xl bg-background-tertiary/50 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const inputClass =
    'min-h-[44px] sm:min-h-10 pl-9 sm:pl-10 rounded-xl bg-background-secondary border-border text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background text-base'
  const isSubmitDisabled = loading || !email.trim() || !password || submitDisabled

  return (
    <div className={WRAPPER_CLASS}>
      <Card variant="default" className={CARD_CLASS}>
        <CardContent className="p-5 sm:p-6 min-[834px]:p-8">
          <div
            className="text-center mb-6 min-[834px]:mb-8 animate-fade-in"
            style={{ animationDelay: '100ms' }}
          >
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
            <h2 className="text-xl sm:text-2xl font-bold mb-2 min-[834px]:mb-3 text-text-primary mt-4 min-[834px]:mt-6">
              {title}
            </h2>
            <p className="text-sm leading-relaxed max-w-sm mx-auto text-text-secondary">
              {subtitle ?? 'Inserisci le tue credenziali per accedere al tuo account.'}
            </p>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <form
              onSubmit={onSubmit}
              className="space-y-5 min-[834px]:space-y-6"
              noValidate
              aria-describedby={error ? errorId : undefined}
            >
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm font-medium text-text-primary">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none text-text-muted" />
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={onEmailChange}
                    placeholder="la.tua@email.com"
                    variant={validationErrors.email ? 'error' : 'default'}
                    errorMessage={validationErrors.email}
                    className={inputClass}
                    style={{ paddingLeft: '2.25rem' }}
                    autoComplete="email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-sm font-medium text-text-primary">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none text-text-muted" />
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={onPasswordChange}
                    placeholder="••••••••"
                    variant={validationErrors.password ? 'error' : 'default'}
                    errorMessage={validationErrors.password}
                    className={inputClass}
                    style={{ paddingLeft: '2.25rem' }}
                    autoComplete="current-password"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div
                  id={errorId}
                  className="flex items-start gap-3 rounded-xl p-4 animate-fade-in bg-state-error/10 border border-state-error/20"
                  role="alert"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-state-error" aria-hidden />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-state-error">Errore</p>
                    <p className="text-sm mt-1 text-state-error/90">{error}</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitDisabled}
                variant="primary"
                className="w-full min-h-[44px] py-3 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 active:from-teal-700 active:to-cyan-700 text-white font-semibold shadow-md shadow-primary/30 border border-teal-500/50 disabled:opacity-60 disabled:from-teal-800 disabled:to-cyan-800"
                aria-describedby={error ? errorId : undefined}
              >
                {loading ? (
                  <>
                    <span
                      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"
                      aria-hidden
                    />
                    Accesso in corso...
                  </>
                ) : (
                  'Accedi'
                )}
              </Button>

              {showForgotPasswordLink && (
                <p className="text-center text-sm text-text-secondary pt-1">
                  Password dimenticata?{' '}
                  <Link
                    href="/forgot-password"
                    className="font-medium text-primary hover:text-primary/80 transition-colors inline-block py-2 min-[834px]:py-1"
                  >
                    Reimposta password
                  </Link>
                </p>
              )}
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
