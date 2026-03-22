'use client'

import { Square } from 'lucide-react'
import { designSystem } from '@/config/design-system'
import { Card, CardTitle } from '@/components/ui'
import {
  DS_CARD_FRAME_CLASS,
  DS_CODE_CLASS,
  DS_SECTION_TITLE_CLASS,
  DS_SECTION_INTRO_CLASS,
} from './helpers'

export function FoundationsSpacingRadius() {
  return (
    <section id="radius" className="scroll-mt-24">
      <h2 className={DS_SECTION_TITLE_CLASS}>
        <Square className="h-6 w-6 text-primary" />
        Radius & Spacing
      </h2>
      <p className={DS_SECTION_INTRO_CLASS}>
        Token da <code className={DS_CODE_CLASS}>@/config/design-system</code>. Tailwind aggiunge{' '}
        <code className={DS_CODE_CLASS}>rounded-full</code> e spacing estesi (18, 88, 128).
      </p>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
        <Card variant="default" className={DS_CARD_FRAME_CLASS}>
          <CardTitle className="mb-3 text-sm font-medium text-text-secondary">
            Border radius (rounded-*)
          </CardTitle>
          <div className="flex flex-wrap items-end gap-4">
            {(['none', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((r) => (
              <div key={r} className="flex flex-col items-center gap-1.5">
                <div
                  className="h-12 w-12 bg-primary/80"
                  style={{ borderRadius: designSystem.radius[r] }}
                />
                <span className="text-xs font-medium text-text-secondary">{r}</span>
                <span className="font-mono text-[10px] text-text-muted">
                  {designSystem.radius[r]}
                </span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-12 w-12 rounded-full bg-primary/80" />
              <span className="text-xs font-medium text-text-secondary">full</span>
              <span className="font-mono text-[10px] text-text-muted">9999px</span>
            </div>
          </div>
        </Card>
        <Card variant="default" className={DS_CARD_FRAME_CLASS}>
          <CardTitle className="mb-3 text-sm font-medium text-text-secondary">
            Spacing (p, m, gap, …)
          </CardTitle>
          <div className="flex flex-wrap items-end gap-3">
            {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((s) => (
              <div key={s} className="flex flex-col items-center gap-1.5">
                <div className="w-4 bg-primary/80" style={{ height: designSystem.spacing[s] }} />
                <span className="text-xs font-medium text-text-secondary">{s}</span>
                <span className="font-mono text-[10px] text-text-muted">
                  {designSystem.spacing[s]}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  )
}
