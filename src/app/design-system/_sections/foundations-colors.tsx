'use client'

import { Palette } from 'lucide-react'
import { designSystem } from '@/config/design-system'
import { colors } from '@/lib/design-tokens'
import { Card, CardTitle } from '@/components/ui'
import { RUOLI_CARD } from '@/lib/design-system-data'
import { ColorSwatch } from './helpers'

const cardFrameClass =
  'overflow-hidden p-5 !rounded-[8px] !border-[rgb(255_255_255/0.5)] !shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_0_0_rgba(255,255,255,0.04),inset_0_-1px_0_0_rgba(0,0,0,0.06)]'

export function FoundationsColors() {
  const borderInput = {
    border: {
      DEFAULT: colors.border.DEFAULT,
      light: colors.border.light,
      strong: colors.border.strong,
    },
    input: {
      DEFAULT: colors.input.DEFAULT,
      focus: colors.input.focus,
      error: colors.input.error,
    },
  }

  return (
    <section id="colori" className="scroll-mt-24">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
        <Palette className="h-6 w-6 text-primary" />
        Colori
      </h2>
      <p className="mb-6 text-sm text-text-secondary">
        Token da{' '}
        <code className="rounded bg-surface-300 px-1.5 py-0.5 font-mono text-xs">
          @/lib/design-tokens
        </code>{' '}
        e UI (border/input da Tailwind).
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        <Card variant="default" className={cardFrameClass}>
          <CardTitle className="mb-3 text-sm font-medium text-text-secondary">
            Background & Surface
          </CardTitle>
          <div className="flex flex-wrap gap-3">
            <ColorSwatch label="background" color={designSystem.colors.background.DEFAULT} />
            <ColorSwatch label="elevated" color={designSystem.colors.background.elevated} />
            <ColorSwatch label="subtle" color={designSystem.colors.background.subtle} />
            <ColorSwatch label="surface 100" color={designSystem.colors.surface[100]} />
            <ColorSwatch label="surface 200" color={designSystem.colors.surface[200]} />
            <ColorSwatch label="surface 300" color={designSystem.colors.surface[300]} />
          </div>
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <CardTitle className="mb-3 text-sm font-medium text-text-secondary">Testo</CardTitle>
          <div className="flex flex-wrap gap-3">
            <ColorSwatch label="primary" color={designSystem.colors.text.primary} />
            <ColorSwatch label="secondary" color={designSystem.colors.text.secondary} />
            <ColorSwatch label="muted" color={designSystem.colors.text.muted} />
          </div>
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <CardTitle className="mb-3 text-sm font-medium text-text-secondary">
            Brand & Primary
          </CardTitle>
          <div className="flex flex-wrap gap-3">
            <ColorSwatch label="primary" color={designSystem.colors.primary.DEFAULT} />
            <ColorSwatch label="hover" color={designSystem.colors.primary.hover} />
            <ColorSwatch label="active" color={designSystem.colors.primary.active} />
          </div>
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <CardTitle className="mb-3 text-sm font-medium text-text-secondary">Stati</CardTitle>
          <div className="flex flex-wrap gap-3">
            <ColorSwatch label="success" color={designSystem.colors.success} />
            <ColorSwatch label="warning" color={designSystem.colors.warning} />
            <ColorSwatch label="error" color={designSystem.colors.error} />
          </div>
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <CardTitle className="mb-3 text-sm font-medium text-text-secondary">
            Accent (gold / glow)
          </CardTitle>
          <div className="flex flex-wrap gap-3">
            <ColorSwatch label="gold" color={designSystem.colors.accent.gold} />
            <ColorSwatch label="glow" color={designSystem.colors.accent.glow} />
          </div>
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <CardTitle className="mb-3 text-sm font-medium text-text-secondary">
            Border & Input (Tailwind)
          </CardTitle>
          <div className="flex flex-wrap gap-3">
            <ColorSwatch label="border" color={borderInput.border.DEFAULT} />
            <ColorSwatch label="border light" color={borderInput.border.light} />
            <ColorSwatch label="border strong" color={borderInput.border.strong} />
            <ColorSwatch label="input" color={borderInput.input.DEFAULT} />
            <ColorSwatch label="input focus" color={borderInput.input.focus} />
            <ColorSwatch label="input error" color={borderInput.input.error} />
          </div>
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <CardTitle className="mb-3 text-sm font-medium text-text-secondary">
            Card Trainer / Admin (ruoli)
          </CardTitle>
          <p className="mb-3 text-xs text-text-muted">
            Token da{' '}
            <code className="rounded bg-surface-300 px-1 py-0.5 font-mono text-[10px]">
              @/lib/design-tokens
            </code>{' '}
            (roleThemes). Varianti Card in Moduli e dashboard.
          </p>
          <div className="flex flex-wrap gap-3">
            {(
              Object.entries(RUOLI_CARD) as Array<
                ['trainer' | 'admin', (typeof RUOLI_CARD)['trainer']]
              >
            ).map(([key, role]) => (
              <div key={key} className="flex flex-col items-center gap-1">
                <div
                  className={`h-10 w-10 rounded-xl border shadow-sm ${role.gradientPrimary} ${role.borderPrimary}`}
                />
                <span className="text-xs font-medium text-text-secondary">{role.label}</span>
                <span className="font-mono text-[10px] text-text-muted">{role.primary}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card variant="default" className={`${cardFrameClass} sm:col-span-2`}>
          <CardTitle className="mb-3 text-sm font-medium text-text-secondary">
            Accenti atleta (blocchi Home / card)
          </CardTitle>
          <p className="mb-3 text-xs text-text-muted">
            Border e barra laterale per card: schede, appuntamenti, progressi, chat, nutrizionista,
            massaggiatore, documenti, foto-risultati, profilo.
          </p>
          <div className="flex flex-wrap gap-3">
            {(
              Object.entries(colors.athleteAccents) as [
                keyof typeof colors.athleteAccents,
                typeof colors.athleteAccents.teal,
              ][]
            ).map(([key, val]) => (
              <div key={key} className="flex flex-col items-center gap-1">
                <div
                  className="h-10 w-10 rounded-xl border border-border/70 shadow-sm"
                  style={{ backgroundColor: `${val.bar}18` }}
                />
                <span className="max-w-[90px] text-center text-xs text-text-muted">{key}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  )
}
