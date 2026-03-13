'use client'

import {
  AlertCircle,
  Box,
  LayoutDashboard,
  Lock,
  LogIn,
  Mail,
  PanelTop,
  Square,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button, Card, CardTitle, Input, Label } from '@/components/ui'
import { AthleteBackground } from '@/components/athlete/athlete-background'
import { cn } from '@/lib/utils'
import { DS_CARD_FRAME_CLASS, DS_SECTION_TITLE_CLASS, DS_SECTION_INTRO_CLASS, DS_BLOCK_TITLE_CLASS, DS_LABEL_CLASS } from './helpers'

const AUTH_LOGIN_TOKENS: Array<{ token: string; value: string; Icon: LucideIcon }> = [
  {
    token: 'Container',
    value:
      'min-h-screen flex items-center justify-center px-4 py-4 min-[834px]:px-6 min-[834px]:py-6 bg-background, minHeight 100dvh',
    Icon: LayoutDashboard,
  },
  {
    token: 'Background',
    value: 'AthleteBackground: gradient teal/cyan 10%, grid rgba(2,179,191,0.2) 5%, blob teal/10',
    Icon: Box,
  },
  {
    token: 'Card',
    value:
      'variant default, border-white/10 rounded-lg bg-background-secondary/95 backdrop-blur-xl',
    Icon: PanelTop,
  },
  { token: 'CardContent', value: 'p-5 sm:p-6 min-[834px]:p-8', Icon: Square },
  {
    token: 'Titolo / Intro',
    value: 'h2 text-xl sm:text-2xl font-bold text-text-primary; intro text-sm text-text-secondary',
    Icon: Lock,
  },
  { token: 'Form', value: 'space-y-5 min-[834px]:space-y-6; campi space-y-2', Icon: Lock },
  {
    token: 'Input',
    value:
      'rounded-md min-h-[44px], focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background, placeholder:text-text-muted; variant error → state-error',
    Icon: Mail,
  },
  {
    token: 'Errore globale',
    value: 'rounded-lg bg-state-error/10 border border-state-error/20, text-state-error',
    Icon: AlertCircle,
  },
  {
    token: 'Button Accedi',
    value:
      'gradient from-teal-600 to-cyan-600, rounded-lg, shadow-md shadow-primary/30 border border-teal-500/50, font-semibold, min-h-[44px]',
    Icon: LogIn,
  },
  { token: 'Link', value: 'text-primary hover:text-primary/80, text-sm', Icon: Lock },
]

export function PatternsAuthLogin() {
  return (
    <section id="auth" className="scroll-mt-24">
      <h2 className={DS_SECTION_TITLE_CLASS}>
        <LogIn className="h-6 w-6 text-primary" />
        Auth (Login)
      </h2>
      <p className={DS_SECTION_INTRO_CLASS}>
        Token per login, reset password, registrati. AthleteBackground, card backdrop-blur, form, input, button Accedi, stati errore.
      </p>

      <div className="space-y-6 sm:space-y-8">
        <div>
          <h3 className={DS_BLOCK_TITLE_CLASS}>Token Login</h3>
          <p className={DS_LABEL_CLASS}>
            Container, sfondo (AthleteBackground), card, form, input, button, error.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {AUTH_LOGIN_TOKENS.map((row, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-3 transition-colors hover:border-primary/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <row.Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-text-primary">{row.token}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-text-muted">{row.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className={DS_BLOCK_TITLE_CLASS}>Preview contesto (sfondo + card)</h3>
          <p className={DS_LABEL_CLASS}>
            Riduzione: stesso sfondo e stile card della login.
          </p>
          <div className="relative min-h-[320px] overflow-hidden rounded-lg border border-white/10 bg-black">
            <div className="absolute inset-0 z-0">
              <AthleteBackground />
            </div>
            <div className="relative z-10 flex min-h-[320px] items-center justify-center p-4">
              <Card
                variant="default"
                className={`w-full max-w-sm ${DS_CARD_FRAME_CLASS}`}
              >
                <CardTitle className="mb-2 text-lg text-text-primary">Accedi</CardTitle>
                <p className={cn(DS_LABEL_CLASS, 'mb-4')}>Inserisci le tue credenziali.</p>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-text-primary">Email</Label>
                    <Input
                      placeholder="la.tua@email.com"
                      className="min-h-[40px] text-sm"
                      readOnly
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-text-primary">Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="min-h-[40px] text-sm"
                      readOnly
                    />
                  </div>
                  <Button
                    variant="primary"
                    className="w-full min-h-[40px] rounded-lg bg-gradient-to-br from-teal-600 to-cyan-600 text-white font-semibold shadow-md shadow-primary/30 border border-teal-500/50"
                  >
                    Accedi
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div className={DS_CARD_FRAME_CLASS}>
          <h3 className={DS_BLOCK_TITLE_CLASS}>Stati errore</h3>
          <p className={DS_LABEL_CLASS}>
            Box errore globale e messaggio sotto input (variant error).
          </p>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 items-stretch">
            <div className="rounded-lg border border-state-error/30 bg-state-error/10 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] flex flex-col min-h-0">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-state-error" />
                <div>
                  <p className="text-sm font-medium text-state-error">Errore</p>
                  <p className="text-sm mt-1 text-state-error/90">Credenziali non valide.</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 flex flex-col min-h-0">
              <Label className="text-sm text-text-primary">Email (con errore)</Label>
              <Input
                variant="error"
                errorMessage="Email è richiesta"
                placeholder="email"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
