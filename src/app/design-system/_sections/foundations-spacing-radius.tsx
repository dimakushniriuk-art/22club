'use client'

import { Square } from 'lucide-react'
import { designSystem } from '@/config/design-system'
import { Card, CardTitle } from '@/components/ui'

const cardFrameClass =
  'overflow-hidden p-5 !rounded-[8px] !border-[rgb(255_255_255/0.5)] !shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_0_0_rgba(255,255,255,0.04),inset_0_-1px_0_0_rgba(0,0,0,0.06)]'

export function FoundationsSpacingRadius() {
  return (
    <section id="radius" className="scroll-mt-24">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
        <Square className="h-6 w-6 text-primary" />
        Radius & Spacing
      </h2>
      <p className="mb-6 text-sm text-text-secondary">
        Token da{' '}
        <code className="rounded bg-surface-300 px-1.5 py-0.5 font-mono text-xs">
          @/config/design-system
        </code>
        . Tailwind aggiunge{' '}
        <code className="rounded bg-surface-300 px-1.5 py-0.5 font-mono text-xs">rounded-full</code>{' '}
        e spacing estesi (18, 88, 128).
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        <Card variant="default" className={cardFrameClass}>
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
        <Card variant="default" className={cardFrameClass}>
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
