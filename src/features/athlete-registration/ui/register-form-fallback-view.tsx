'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { AUTH_CARD_CLASS, AUTH_CARD_CONTENT_CLASS, AUTH_LOGO_CLASS } from '@/lib/auth-page-styles'
import { AuthPasswordPageFrame } from '@/features/auth-password-reset/ui/auth-password-page-frame'

export function RegisterFormFallbackView() {
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
            <p className="text-text-secondary text-sm mt-2">Caricamento...</p>
          </div>
          <div className="min-h-[200px]" aria-hidden />
        </CardContent>
      </Card>
    </AuthPasswordPageFrame>
  )
}
