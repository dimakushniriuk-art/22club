'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Mail, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  AUTH_BUTTON_PRIMARY_CLASS,
  AUTH_CARD_CLASS,
  AUTH_CARD_CONTENT_CLASS,
  AUTH_ERROR_BOX_CLASS,
  AUTH_INPUT_WITH_LEFT_ICON_CLASS,
  AUTH_LINK_BACK_CLASS,
  AUTH_LOGO_CLASS,
} from '@/lib/auth-page-styles'
import { AuthPasswordPageFrame } from '@/features/auth-password-reset/ui/auth-password-page-frame'

type ForgotPasswordFormViewProps = {
  email: string
  loading: boolean
  error: string | null
  onEmailChange: (value: string) => void
  onSubmit: (event: React.FormEvent) => void
}

export function ForgotPasswordFormView({
  email,
  loading,
  error,
  onEmailChange,
  onSubmit,
}: ForgotPasswordFormViewProps) {
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
              Password dimenticata?
            </h2>
            <p className="text-sm leading-relaxed max-w-sm mx-auto text-text-secondary">
              Inserisci la tua email e ti invieremo le istruzioni per reimpostare la password.
            </p>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <form onSubmit={onSubmit} className="space-y-5 md:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-text-primary">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-text-muted" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => onEmailChange(event.target.value)}
                    placeholder="la.tua@email.com"
                    className={AUTH_INPUT_WITH_LEFT_ICON_CLASS}
                    style={{ paddingLeft: '2.25rem' }}
                    required
                    disabled={loading}
                  />
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
                disabled={loading || !email.trim()}
                variant="primary"
                className={AUTH_BUTTON_PRIMARY_CLASS}
              >
                {loading ? (
                  <>
                    <span
                      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"
                      aria-hidden
                    />
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
                <Link
                  href="/login"
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Accedi
                </Link>
              </p>
            </form>
          </div>
        </CardContent>
      </Card>
    </AuthPasswordPageFrame>
  )
}
