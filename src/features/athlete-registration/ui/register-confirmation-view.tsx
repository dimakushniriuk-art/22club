'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  AUTH_BUTTON_PRIMARY_CLASS,
  AUTH_CARD_CLASS,
  AUTH_CARD_CONTENT_CLASS,
} from '@/lib/auth-page-styles'
import { AuthPasswordPageFrame } from '@/features/auth-password-reset/ui/auth-password-page-frame'

type RegisterConfirmationViewProps = {
  registeredEmail: string | null
  hasInviteCodice: boolean
  resendLoading: boolean
  resendMessage: { type: 'success' | 'error'; text: string } | null
  onResendConfirmation: () => void
}

export function RegisterConfirmationView({
  registeredEmail,
  hasInviteCodice,
  resendLoading,
  resendMessage,
  onResendConfirmation,
}: RegisterConfirmationViewProps) {
  return (
    <AuthPasswordPageFrame>
      <Card variant="default" className={AUTH_CARD_CLASS}>
        <CardContent className={`${AUTH_CARD_CONTENT_CLASS} text-center`}>
          <div className="mb-6 md:mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-text-primary">
              <CheckCircle className="h-8 w-8" aria-hidden />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Account creato</h2>
            <p className="text-text-secondary mt-2 text-sm">
              Abbiamo inviato un&apos;email di conferma a{' '}
              <span className="font-medium text-text-primary">{registeredEmail ?? ''}</span>.
            </p>
            <p className="text-text-secondary mt-3 text-sm">
              Clicca sul link nell&apos;email per attivare l&apos;account. Poi accedi per completare
              il profilo
              {hasInviteCodice ? ' e collegarti al tuo trainer.' : '.'}
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
              onClick={onResendConfirmation}
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
    </AuthPasswordPageFrame>
  )
}
