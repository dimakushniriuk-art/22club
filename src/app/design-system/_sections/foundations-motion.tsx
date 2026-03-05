'use client'

import { Zap } from 'lucide-react'
import { motion } from '@/lib/design-tokens'
import { Card, CardTitle } from '@/components/ui'

const cardFrameClass =
  'overflow-hidden p-5 !rounded-[8px] !border-[rgb(255_255_255/0.5)] !shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_0_0_rgba(255,255,255,0.04),inset_0_-1px_0_0_rgba(0,0,0,0.06)]'

const chipFrameClass =
  'flex flex-col gap-0.5 !rounded-[8px] !border-[rgb(255_255_255/0.5)] bg-surface-200/60 !shadow-[0_2px_12px_-2px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_0_0_rgba(255,255,255,0.03)]'

export function FoundationsMotion() {
  return (
    <section id="motion" className="scroll-mt-24">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
        <Zap className="h-6 w-6 text-primary" />
        Motion
      </h2>
      <p className="mb-6 text-sm text-text-secondary">
        Duration, easing e keyframes da{' '}
        <code className="rounded bg-surface-300 px-1.5 py-0.5 font-mono text-xs">
          @/lib/design-tokens/motion
        </code>
        . Tailwind espone{' '}
        <code className="rounded bg-surface-300 px-1.5 py-0.5 font-mono text-xs">animate-*</code>.
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        <Card variant="default" className={cardFrameClass}>
          <CardTitle className="mb-3 text-sm font-medium text-text-secondary">Duration</CardTitle>
          <div className="flex flex-wrap gap-3">
            {Object.entries(motion.duration).map(([key, value]) => (
              <div key={key} className={`${chipFrameClass} px-3 py-2`}>
                <span className="text-xs font-medium text-text-primary">{key}</span>
                <span className="font-mono text-[10px] text-text-muted">{value}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <CardTitle className="mb-3 text-sm font-medium text-text-secondary">Easing</CardTitle>
          <div className="flex flex-wrap gap-2">
            {Object.entries(motion.easing).map(([key, value]) => (
              <div key={key} className={`${chipFrameClass} px-2 py-1.5`}>
                <span className="text-xs font-medium text-text-primary">{key}</span>
                <span
                  className="max-w-[140px] truncate font-mono text-[9px] text-text-muted"
                  title={value}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </Card>
        <Card variant="default" className={`${cardFrameClass} sm:col-span-2`}>
          <CardTitle className="mb-3 text-sm font-medium text-text-secondary">
            Animazioni (classi Tailwind)
          </CardTitle>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-12 w-12 rounded-lg bg-primary/80 animate-fade-in" />
              <span className="font-mono text-[10px] text-text-muted">animate-fade-in</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-12 w-12 rounded-lg bg-primary/80 animate-scale-in" />
              <span className="font-mono text-[10px] text-text-muted">animate-scale-in</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-12 w-12 rounded-lg bg-primary/80 animate-slide-in-up" />
              <span className="font-mono text-[10px] text-text-muted">animate-slide-in-up</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-12 w-12 rounded-lg bg-primary/80 animate-slide-in-down" />
              <span className="font-mono text-[10px] text-text-muted">animate-slide-in-down</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-12 w-12 rounded-lg bg-primary/80 animate-pulse-glow" />
              <span className="font-mono text-[10px] text-text-muted">animate-pulse-glow</span>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
