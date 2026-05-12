'use client'

import { Card, CardContent } from '@/components/ui/card'
import { AUTH_CARD_CLASS, AUTH_CARD_CONTENT_CLASS } from '@/lib/auth-page-styles'
import { AuthPasswordPageFrame } from '@/features/auth-password-reset/ui/auth-password-page-frame'

export function ResetPasswordCheckingView() {
  return (
    <AuthPasswordPageFrame>
      <Card variant="default" className={AUTH_CARD_CLASS}>
        <CardContent className={`${AUTH_CARD_CONTENT_CLASS} text-center`}>
          <div className="mb-6 md:mb-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 bg-white/[0.04]">
              <span
                className="inline-block w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"
                aria-hidden
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-text-primary">Verifica link...</h2>
            <p className="text-sm leading-relaxed max-w-sm mx-auto text-text-secondary">
              Stiamo verificando il tuo link di reset password.
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthPasswordPageFrame>
  )
}
