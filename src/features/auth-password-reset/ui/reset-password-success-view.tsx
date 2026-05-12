'use client'

import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  AUTH_BUTTON_PRIMARY_CLASS,
  AUTH_CARD_CLASS,
  AUTH_CARD_CONTENT_CLASS,
  AUTH_LOGO_CLASS,
} from '@/lib/auth-page-styles'
import { AuthPasswordPageFrame } from '@/features/auth-password-reset/ui/auth-password-page-frame'

export function ResetPasswordSuccessView() {
  return (
    <AuthPasswordPageFrame>
      <Card variant="default" className={AUTH_CARD_CLASS}>
        <CardContent className={`${AUTH_CARD_CONTENT_CLASS} text-center`}>
          <div className="mb-6 md:mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="mb-4 md:mb-6 flex justify-center">
              <Image
                src="/logo.svg"
                alt="22 PERSONAL TRAINING Club"
                width={180}
                height={180}
                className={AUTH_LOGO_CLASS}
                priority
              />
            </div>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in bg-white/[0.06] border border-white/10">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-text-primary">
              Password aggiornata!
            </h2>
            <p className="text-sm leading-relaxed max-w-sm mx-auto text-text-secondary">
              La tua password è stata aggiornata con successo. Verrai reindirizzato al login tra
              pochi secondi.
            </p>
          </div>
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Link href="/login">
              <Button variant="primary" className={`${AUTH_BUTTON_PRIMARY_CLASS} w-full`}>
                Vai al Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthPasswordPageFrame>
  )
}
