'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  AUTH_BUTTON_PRIMARY_CLASS,
  AUTH_CARD_CLASS,
  AUTH_CARD_CONTENT_CLASS,
  AUTH_LOGO_CLASS,
} from '@/lib/auth-page-styles'
import { AuthPasswordPageFrame } from '@/features/auth-password-reset/ui/auth-password-page-frame'

export function ForgotPasswordSuccessView({ email }: { email: string }) {
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
              <CheckCircle2 className="w-10 h-10 text-text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-text-primary">Email inviata!</h2>
            <p className="text-sm leading-relaxed max-w-sm mx-auto text-text-secondary">
              Controlla la tua casella{' '}
              <span className="font-semibold text-text-primary">{email}</span> e segui le istruzioni
              per reimpostare la password.
            </p>
          </div>
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="rounded-lg p-4 mb-4 bg-white/[0.04] border border-white/10">
              <p className="text-sm mb-2 text-text-secondary">
                <Mail className="w-4 h-4 inline mr-2 text-text-muted" />
                Non hai ricevuto l&apos;email? Controlla anche la cartella spam.
              </p>
              {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs mb-2 text-text-tertiary">
                    <strong className="text-text-secondary">Sviluppo locale:</strong> Le email
                    vengono inviate a Inbucket.
                  </p>
                  <a
                    href="http://localhost:54324"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                  >
                    Apri Inbucket per vedere le email
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              )}
            </div>
            <Link href="/login">
              <Button variant="primary" className={`${AUTH_BUTTON_PRIMARY_CLASS} w-full`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Torna al Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthPasswordPageFrame>
  )
}
