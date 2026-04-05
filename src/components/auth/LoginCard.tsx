'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, Lock, AlertCircle, Eye, EyeOff, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  /** Messaggio informativo (es. sessione scaduta, redirect da area protetta) */
  infoMessage?: string | null
  title?: string
  subtitle?: string
}

const LOGIN_INFO_ID = 'login-info'

// Design System #auth: card con bordo border-white/10, gradient from-zinc-900/95 to-black/80, shadow inset (GUIDA principi + token Auth).
const CARD_CLASS =
  'login-card w-full max-w-md min-[834px]:max-w-lg overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 text-text-primary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] backdrop-blur-xl'
const CARD_CONTENT_CLASS = 'p-5 sm:p-6 min-[834px]:p-8'
const WRAPPER_CLASS = 'w-full max-w-md min-[834px]:max-w-lg min-w-0 animate-fade-in relative z-10'

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
  infoMessage = null,
  title = 'Accedi',
  subtitle,
}: LoginCardProps) {
  const [showPassword, setShowPassword] = useState(false)

  if (skeleton) {
    return (
      <div className={WRAPPER_CLASS}>
        <div className={CARD_CLASS}>
          <div className={CARD_CONTENT_CLASS}>
            <div className="text-center mb-4 sm:mb-6">
              <div className="mb-4 sm:mb-6 flex justify-center">
                <div className="relative">
                  <Image
                    src="/logo.svg"
                    alt="22 PERSONAL TRAINING Club"
                    width={200}
                    height={200}
                    className="w-auto h-24 sm:h-28 min-[834px]:h-32 object-contain drop-shadow-[0_0_24px_rgba(255,255,255,0.08)]"
                    priority
                  />
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-text-primary mt-4 sm:mt-6">
                {title}
              </h2>
              <p className="text-sm text-text-secondary">Caricamento...</p>
            </div>
            <div className="space-y-5 min-[834px]:space-y-6">
              <div className="h-[44px] rounded-md bg-background-tertiary/50 animate-pulse" />
              <div className="h-[44px] rounded-md bg-background-tertiary/50 animate-pulse" />
              <div className="h-[44px] rounded-md bg-background-tertiary/50 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Token Auth (GUIDA): rounded-md min-h-[44px], border-white/10, bg-white/[0.04], focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
  const inputClass =
    'min-h-[44px] pl-9 rounded-md border border-white/10 bg-white/[0.04] text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background text-sm'
  const inputPasswordClass =
    'min-h-[44px] pl-9 pr-10 rounded-md border border-white/10 bg-white/[0.04] text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background text-sm'
  const isSubmitDisabled = loading || !email.trim() || !password || submitDisabled

  return (
    <div className={WRAPPER_CLASS}>
      <div className={CARD_CLASS}>
        <div className={CARD_CONTENT_CLASS}>
          <div
            className="text-center mb-4 sm:mb-6 animate-fade-in"
            style={{ animationDelay: '100ms' }}
          >
            <div className="mb-4 sm:mb-6 flex justify-center">
              <div className="relative">
                <Image
                  src="/logo.svg"
                  alt="22 PERSONAL TRAINING Club"
                  width={200}
                  height={200}
                  className="w-auto h-24 sm:h-28 min-[834px]:h-32 object-contain drop-shadow-[0_0_24px_rgba(255,255,255,0.08)]"
                  priority
                />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-text-primary mt-4 sm:mt-6">
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
              aria-describedby={
                [error ? errorId : null, infoMessage ? LOGIN_INFO_ID : null].filter(Boolean).join(' ') ||
                undefined
              }
            >
              {infoMessage != null && infoMessage !== '' && (
                <div
                  id={LOGIN_INFO_ID}
                  className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/10 p-4 text-text-primary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                  role="status"
                >
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <p className="text-sm leading-relaxed text-text-primary/95">{infoMessage}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-xs font-medium text-text-primary">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted pointer-events-none" />
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
                <Label htmlFor="login-password" className="text-xs font-medium text-text-primary">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <Input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={onPasswordChange}
                    placeholder="••••••••"
                    variant={validationErrors.password ? 'error' : 'default'}
                    errorMessage={validationErrors.password}
                    className={inputPasswordClass}
                    style={{ paddingLeft: '2.25rem' }}
                    autoComplete="current-password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  id={errorId}
                  className="flex items-start gap-3 rounded-lg p-4 animate-fade-in bg-state-error/10 border border-state-error/20 text-state-error shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
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
                className="w-full min-h-[44px] py-3 rounded-lg bg-gradient-to-br from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 active:from-teal-700 active:to-cyan-700 text-white font-semibold shadow-md shadow-primary/30 border border-teal-500/50 disabled:opacity-60 disabled:from-teal-800 disabled:to-cyan-800"
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
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors inline-block py-2 sm:py-1"
                  >
                    Reimposta password
                  </Link>
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
