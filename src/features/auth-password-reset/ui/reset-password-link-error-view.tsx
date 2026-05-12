'use client'

import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  AUTH_BUTTON_PRIMARY_CLASS,
  AUTH_CARD_CLASS,
  AUTH_CARD_CONTENT_CLASS,
} from '@/lib/auth-page-styles'
import { AuthPasswordPageFrame } from '@/features/auth-password-reset/ui/auth-password-page-frame'

export function ResetPasswordLinkErrorView({ message }: { message: string }) {
  return (
    <AuthPasswordPageFrame>
      <Card variant="default" className={AUTH_CARD_CLASS}>
        <CardContent className={`${AUTH_CARD_CONTENT_CLASS} text-center`}>
          <div className="mb-6 md:mb-8 animate-fade-in">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-state-error/10 border border-state-error/20">
              <AlertCircle className="w-10 h-10 text-state-error" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-text-primary">Link non valido</h2>
            <p className="text-sm leading-relaxed max-w-sm mx-auto mb-6 text-text-secondary">
              {message}
            </p>
          </div>
          <div className="space-y-4">
            <Link href="/forgot-password">
              <Button variant="primary" className={`${AUTH_BUTTON_PRIMARY_CLASS} w-full`}>
                Richiedi nuovo link
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                className="w-full min-h-[44px] py-3 rounded-lg border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5"
              >
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
