'use client'

import Link from 'next/link'
import Image from 'next/image'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  AUTH_BUTTON_PRIMARY_CLASS,
  AUTH_CARD_CLASS,
  AUTH_CARD_CONTENT_CLASS,
  AUTH_ERROR_BOX_CLASS,
  AUTH_INPUT_CLASS,
  AUTH_LOGO_CLASS,
} from '@/lib/auth-page-styles'
import { AuthPasswordPageFrame } from '@/features/auth-password-reset/ui/auth-password-page-frame'
import type { AthleteRegistrationFormValues } from '@/features/athlete-registration/lib/registration-helpers'

type RegisterFormViewProps = {
  formData: AthleteRegistrationFormValues
  loading: boolean
  error: string | null
  hasInviteCodice: boolean
  onFieldChange: (field: keyof AthleteRegistrationFormValues, value: string) => void
  onSubmit: (event: React.FormEvent) => void
}

export function RegisterFormView({
  formData,
  loading,
  error,
  hasInviteCodice,
  onFieldChange,
  onSubmit,
}: RegisterFormViewProps) {
  return (
    <AuthPasswordPageFrame>
      <Card variant="default" className={AUTH_CARD_CLASS}>
        <CardContent className={AUTH_CARD_CONTENT_CLASS}>
          <div className="text-center mb-6 md:mb-8">
            <div className="mb-4 md:mb-6 flex justify-center">
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
            {hasInviteCodice && (
              <p className="text-primary text-xs mt-1">
                Registrazione con invito: sarai collegato al tuo PT dopo l’iscrizione.
              </p>
            )}
          </div>

          <form onSubmit={onSubmit} className="space-y-5 md:space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-sm font-medium text-text-primary">
                  Nome
                </Label>
                <Input
                  id="nome"
                  type="text"
                  value={formData.nome}
                  onChange={(event) => onFieldChange('nome', event.target.value)}
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
                  onChange={(event) => onFieldChange('cognome', event.target.value)}
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
                onChange={(event) => onFieldChange('email', event.target.value)}
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
                onChange={(event) => onFieldChange('password', event.target.value)}
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
                onChange={(event) => onFieldChange('confirmPassword', event.target.value)}
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
    </AuthPasswordPageFrame>
  )
}
