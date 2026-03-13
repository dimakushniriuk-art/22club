'use client'

import { Palette } from 'lucide-react'
import { designSystem } from '@/config/design-system'
import { colors } from '@/lib/design-tokens'
import { Card, CardTitle } from '@/components/ui'
import { RUOLI_CARD } from '@/lib/design-system-data'
import { ColorSwatch, DS_CARD_FRAME_CLASS, DS_CODE_CLASS, DS_SECTION_TITLE_CLASS, DS_SECTION_INTRO_CLASS, DS_LABEL_CLASS } from './helpers'

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
      <h2 className={DS_SECTION_TITLE_CLASS}>
        <Palette className="h-6 w-6 text-primary" />
        Colori
      </h2>
      <p className={DS_SECTION_INTRO_CLASS}>
        Token da <code className={DS_CODE_CLASS}>@/lib/design-tokens</code> e UI (border/input da Tailwind).
      </p>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
        <Card variant="default" className={DS_CARD_FRAME_CLASS}>
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
        <Card variant="default" className={DS_CARD_FRAME_CLASS}>
          <CardTitle className="mb-3 text-sm font-medium text-text-secondary">Testo</CardTitle>
          <div className="flex flex-wrap gap-3">
            <ColorSwatch label="primary" color={designSystem.colors.text.primary} />
            <ColorSwatch label="secondary" color={designSystem.colors.text.secondary} />
            <ColorSwatch label="muted" color={designSystem.colors.text.muted} />
          </div>
        </Card>
        <Card variant="default" className={DS_CARD_FRAME_CLASS}>
          <CardTitle className="mb-3 text-sm font-medium text-text-secondary">
            Brand & Primary
          </CardTitle>
          <div className="flex flex-wrap gap-3">
            <ColorSwatch label="primary" color={designSystem.colors.primary.DEFAULT} />
            <ColorSwatch label="hover" color={designSystem.colors.primary.hover} />
            <ColorSwatch label="active" color={designSystem.colors.primary.active} />
          </div>
        </Card>
        <Card variant="default" className={DS_CARD_FRAME_CLASS}>
          <CardTitle className="mb-3 text-sm font-medium text-text-secondary">Stati</CardTitle>
          <div className="flex flex-wrap gap-3">
            <ColorSwatch label="success" color={designSystem.colors.success} />
            <ColorSwatch label="warning" color={designSystem.colors.warning} />
            <ColorSwatch label="error" color={designSystem.colors.error} />
          </div>
        </Card>
        <Card variant="default" className={DS_CARD_FRAME_CLASS}>
          <CardTitle className="mb-3 text-sm font-medium text-text-secondary">
            Accent (gold / glow)
          </CardTitle>
          <div className="flex flex-wrap gap-3">
            <ColorSwatch label="gold" color={designSystem.colors.accent.gold} />
            <ColorSwatch label="glow" color={designSystem.colors.accent.glow} />
          </div>
        </Card>
        <Card variant="default" className={DS_CARD_FRAME_CLASS}>
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
        <Card variant="default" className={DS_CARD_FRAME_CLASS}>
          <CardTitle className="mb-3 text-sm font-medium text-text-secondary">
            Card Trainer / Admin (ruoli)
          </CardTitle>
          <p className={DS_LABEL_CLASS}>
            Token da <code className={DS_CODE_CLASS}>@/lib/design-tokens</code> (roleThemes).
          </p>
          <div className="flex flex-wrap gap-3">
            {(
              Object.entries(RUOLI_CARD) as Array<
                ['trainer' | 'admin', (typeof RUOLI_CARD)['trainer']]
              >
            ).map(([key, role]) => (
              <div key={key} className="flex flex-col items-center gap-1">
                <div
                  className={`h-10 w-10 rounded-lg border shadow-sm ${role.gradientPrimary} ${role.borderPrimary}`}
                />
                <span className="text-xs font-medium text-text-secondary">{role.label}</span>
                <span className="font-mono text-[10px] text-text-muted">{role.primary}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card variant="default" className={`${DS_CARD_FRAME_CLASS} sm:col-span-2`}>
          <CardTitle className="mb-3 text-sm font-medium text-text-secondary">
            Accenti atleta (blocchi Home / card)
          </CardTitle>
          <p className={DS_LABEL_CLASS}>
            Border e barra laterale per card blocchi home.
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
                  className="h-10 w-10 rounded-lg border border-white/10 shadow-sm"
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
