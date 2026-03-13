'use client'

import { Type } from 'lucide-react'
import { designSystem } from '@/config/design-system'
import { Card, CardTitle } from '@/components/ui'
import { TypographySample, DS_CARD_FRAME_CLASS, DS_CODE_CLASS, DS_SECTION_TITLE_CLASS, DS_SECTION_INTRO_CLASS } from './helpers'

export function FoundationsTypography() {
  return (
    <section id="tipografia" className="scroll-mt-24">
      <h2 className={DS_SECTION_TITLE_CLASS}>
        <Type className="h-6 w-6 text-primary" />
        Tipografia
      </h2>
      <p className={DS_SECTION_INTRO_CLASS}>
        Scala dimensioni e font da Tailwind (fontSize, fontFamily). Token in <code className={DS_CODE_CLASS}>design-system</code>.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
        <Card variant="default" className={DS_CARD_FRAME_CLASS}>
          <CardTitle className="mb-3 text-sm font-medium text-text-secondary">
            Scala dimensioni (text-*)
          </CardTitle>
          <div className="space-y-3">
            <TypographySample className="text-xs" label="xs" size="0.75rem" lineHeight="1rem" />
            <TypographySample className="text-sm" label="sm" size="0.875rem" lineHeight="1.25rem" />
            <TypographySample className="text-base" label="base" size="1rem" lineHeight="1.5rem" />
            <TypographySample className="text-lg" label="lg" size="1.125rem" lineHeight="1.75rem" />
            <TypographySample className="text-xl" label="xl" size="1.25rem" lineHeight="1.75rem" />
            <TypographySample className="text-2xl" label="2xl" size="1.5rem" lineHeight="2rem" />
            <TypographySample
              className="text-3xl"
              label="3xl"
              size="1.875rem"
              lineHeight="2.25rem"
            />
            <TypographySample className="text-4xl" label="4xl" size="2.25rem" lineHeight="2.5rem" />
            <TypographySample className="text-5xl" label="5xl" size="3rem" lineHeight="1" />
            <TypographySample className="text-6xl" label="6xl" size="3.75rem" lineHeight="1" />
          </div>
        </Card>
        <Card variant="default" className={DS_CARD_FRAME_CLASS}>
          <CardTitle className="mb-3 text-sm font-medium text-text-secondary">
            Famiglie font
          </CardTitle>
          <p className="mb-4 font-sans text-base">
            <span className="text-text-muted">sans (default):</span>{' '}
            {designSystem.fontFamily.sans.join(', ')}
          </p>
          <p className="font-mono text-sm text-text-secondary">
            mono: JetBrains Mono, Consolas, monospace
          </p>
          <CardTitle className="mb-3 mt-6 text-sm font-medium text-text-secondary">
            Pesi (font-*)
          </CardTitle>
          <div className="space-y-2">
            <p className="font-normal text-sm">font-normal — 400</p>
            <p className="font-medium text-sm">font-medium — 500</p>
            <p className="font-semibold text-sm">font-semibold — 600</p>
            <p className="font-bold text-sm">font-bold — 700</p>
          </div>
          <CardTitle className="mb-3 mt-6 text-sm font-medium text-text-secondary">
            Colore testo (text-text-*)
          </CardTitle>
          <div className="space-y-1 text-sm">
            <p className="text-text-primary">text-primary</p>
            <p className="text-text-secondary">text-secondary</p>
            <p className="text-text-muted">text-muted</p>
          </div>
        </Card>
      </div>
    </section>
  )
}
