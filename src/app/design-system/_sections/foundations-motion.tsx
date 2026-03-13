'use client'

import { Zap } from 'lucide-react'
import { motion } from '@/lib/design-tokens'
import { Card, CardTitle } from '@/components/ui'
import { DS_CARD_FRAME_CLASS, DS_CODE_CLASS, DS_SECTION_TITLE_CLASS, DS_SECTION_INTRO_CLASS } from './helpers'

const chipFrameClass =
  'flex flex-col gap-0.5 rounded-md border border-white/10 bg-zinc-800/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]'

export function FoundationsMotion() {
  return (
    <section id="motion" className="scroll-mt-24">
      <h2 className={DS_SECTION_TITLE_CLASS}>
        <Zap className="h-6 w-6 text-primary" />
        Motion
      </h2>
      <p className={DS_SECTION_INTRO_CLASS}>
        Duration, easing e keyframes da <code className={DS_CODE_CLASS}>@/lib/design-tokens/motion</code>. Tailwind espone <code className={DS_CODE_CLASS}>animate-*</code>.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
        <Card variant="default" className={DS_CARD_FRAME_CLASS}>
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
        <Card variant="default" className={DS_CARD_FRAME_CLASS}>
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
        <Card variant="default" className={`${DS_CARD_FRAME_CLASS} sm:col-span-2`}>
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
