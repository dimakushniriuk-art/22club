'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  AUTH_BUTTON_PRIMARY_CLASS,
  AUTH_CARD_CLASS,
  AUTH_CARD_CONTENT_CLASS,
  AUTH_ERROR_BOX_CLASS,
  AUTH_INPUT_PASSWORD_CLASS,
  AUTH_LINK_BACK_CLASS,
  AUTH_LOGO_CLASS,
} from '@/lib/auth-page-styles'
import { AuthPasswordPageFrame } from '@/features/auth-password-reset/ui/auth-password-page-frame'

type ResetPasswordFormViewProps = {
  password: string
  confirmPassword: string
  loading: boolean
  error: string | null
  showPassword: boolean
  showConfirmPassword: boolean
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onToggleShowPassword: () => void
  onToggleShowConfirmPassword: () => void
  onSubmit: (event: React.FormEvent) => void
}

export function ResetPasswordFormView({
  password,
  confirmPassword,
  loading,
  error,
  showPassword,
  showConfirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  onToggleShowPassword,
  onToggleShowConfirmPassword,
  onSubmit,
}: ResetPasswordFormViewProps) {
  return (
    <AuthPasswordPageFrame>
      <Card variant="default" className={AUTH_CARD_CLASS}>
        <CardContent className={AUTH_CARD_CONTENT_CLASS}>
          <div className="mb-6 animate-fade-in">
            <Link href="/login" className={AUTH_LINK_BACK_CLASS}>
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Torna al Login
            </Link>
          </div>
          <div
            className="text-center mb-6 md:mb-8 animate-fade-in"
            style={{ animationDelay: '100ms' }}
          >
            <div className="mb-4 md:mb-6 flex justify-center">
              <Image
                src="/logo.svg"
                alt="22 PERSONAL TRAINING Club"
                width={200}
                height={200}
                className={AUTH_LOGO_CLASS}
                priority
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 md:mb-3 text-text-primary mt-4 md:mt-6">
              Imposta nuova password
            </h2>
            <p className="text-sm leading-relaxed max-w-sm mx-auto text-text-secondary">
              Inserisci una nuova password sicura per il tuo account.
            </p>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <form onSubmit={onSubmit} className="space-y-5 md:space-y-6">
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
                    onChange={(event) => onPasswordChange(event.target.value)}
                    placeholder="Minimo 6 caratteri"
                    className={AUTH_INPUT_PASSWORD_CLASS}
                    style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={onToggleShowPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                    aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-text-primary">
                  Conferma Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-text-muted" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => onConfirmPasswordChange(event.target.value)}
                    placeholder="Ripeti la password"
                    className={AUTH_INPUT_PASSWORD_CLASS}
                    style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={onToggleShowConfirmPassword}
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
    </AuthPasswordPageFrame>
  )
}
