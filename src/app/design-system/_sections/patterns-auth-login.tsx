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

const cardFrameClass =
  'overflow-hidden p-5 !rounded-[8px] !border-[rgb(255_255_255/0.5)] !shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_0_0_rgba(255,255,255,0.04),inset_0_-1px_0_0_rgba(0,0,0,0.06)]'

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
      'variant default, border-border rounded-xl min-[834px]:rounded-2xl bg-background-secondary/95 backdrop-blur-xl',
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
      'rounded-xl min-h-[44px], focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background, placeholder:text-text-muted; variant error → state-error',
    Icon: Mail,
  },
  {
    token: 'Errore globale',
    value: 'rounded-xl bg-state-error/10 border border-state-error/20, text-state-error',
    Icon: AlertCircle,
  },
  {
    token: 'Button Accedi',
    value:
      'gradient from-teal-600 to-cyan-600, rounded-xl, shadow-md shadow-primary/30 border border-teal-500/50, font-semibold, min-h-[44px]',
    Icon: LogIn,
  },
  { token: 'Link', value: 'text-primary hover:text-primary/80, text-sm', Icon: Lock },
]

export function PatternsAuthLogin() {
  return (
    <section id="auth" className="scroll-mt-24">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
        <LogIn className="h-6 w-6 text-primary" />
        Auth (Login)
      </h2>
      <p className="mb-6 text-sm text-text-secondary">
        Token e pattern delle pagine{' '}
        <code className="rounded bg-surface-300 px-1.5 py-0.5 font-mono text-xs">/login</code>,{' '}
        <code className="rounded bg-surface-300 px-1.5 py-0.5 font-mono text-xs">/reset</code>,{' '}
        <code className="rounded bg-surface-300 px-1.5 py-0.5 font-mono text-xs">
          /forgot-password
        </code>
        ,{' '}
        <code className="rounded bg-surface-300 px-1.5 py-0.5 font-mono text-xs">
          /reset-password
        </code>{' '}
        e{' '}
        <code className="rounded bg-surface-300 px-1.5 py-0.5 font-mono text-xs">/registrati</code>.
        Allineate al design system: colori, focus, radius, spacing, componenti UI.
      </p>

      <div className="space-y-8">
        <div>
          <h3 className="mb-3 text-sm font-medium text-text-secondary">Token Login</h3>
          <p className="mb-4 text-xs text-text-muted">
            Container, sfondo (AthleteBackground), card, form, input, button, error.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {AUTH_LOGIN_TOKENS.map((row, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-xl border border-primary/20 bg-gradient-to-br from-background-secondary to-background-secondary/80 p-3 transition-colors hover:border-primary/30"
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
          <h3 className="mb-3 text-sm font-medium text-text-secondary">
            Preview contesto (sfondo + card)
          </h3>
          <p className="mb-4 text-xs text-text-muted">
            Riduzione: stesso sfondo e stile card della login.
          </p>
          <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-border bg-background">
            <div className="absolute inset-0 z-0">
              <AthleteBackground />
            </div>
            <div className="relative z-10 flex min-h-[320px] items-center justify-center p-4">
              <Card
                variant="default"
                className={`w-full max-w-sm bg-background-secondary/95 backdrop-blur-xl ${cardFrameClass}`}
              >
                <CardTitle className="mb-2 text-lg text-text-primary">Accedi</CardTitle>
                <p className="mb-4 text-xs text-text-secondary">Inserisci le tue credenziali.</p>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-text-primary">Email</Label>
                    <Input
                      placeholder="la.tua@email.com"
                      className="rounded-xl min-h-[40px] bg-background-secondary border-border text-sm"
                      readOnly
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-text-primary">Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="rounded-xl min-h-[40px] bg-background-secondary border-border text-sm"
                      readOnly
                    />
                  </div>
                  <Button
                    variant="primary"
                    className="w-full min-h-[40px] rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white font-semibold shadow-md shadow-primary/30 border border-teal-500/50"
                  >
                    Accedi
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium text-text-secondary">Stati errore</h3>
          <p className="mb-3 text-xs text-text-muted">
            Box errore globale e messaggio sotto input (variant error).
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-state-error/20 bg-state-error/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-state-error" />
                <div>
                  <p className="text-sm font-medium text-state-error">Errore</p>
                  <p className="text-sm mt-1 text-state-error/90">Credenziali non valide.</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-text-primary">Email (con errore)</Label>
              <Input
                variant="error"
                errorMessage="Email è richiesta"
                placeholder="email"
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
