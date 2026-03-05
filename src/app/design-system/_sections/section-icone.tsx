'use client'

import type { LucideIcon } from 'lucide-react'
import { Sparkles } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui'

interface IconSample {
  name: string
  Icon: LucideIcon
}

export function SectionIcone({ iconSamples }: { iconSamples: IconSample[] }) {
  return (
    <section id="icone" className="scroll-mt-24">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
        <Sparkles className="h-6 w-6 text-primary" />
        Icone (Lucide)
      </h2>
      <Card
        variant="default"
        className="overflow-hidden p-5 !rounded-[8px] !border-[rgb(255_255_255/0.5)] !shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_0_0_rgba(255,255,255,0.04),inset_0_-1px_0_0_rgba(0,0,0,0.06)]"
      >
        <p className="mb-4 text-sm text-text-secondary">
          Set usato nel progetto. Import da{' '}
          <code className="rounded bg-surface-300 px-1.5 py-0.5 font-mono text-xs">
            lucide-react
          </code>
          .
        </p>
        <CardTitle className="mb-3 text-sm font-medium text-text-secondary">Set icone</CardTitle>
        <div className="grid grid-cols-4 gap-4 sm:grid-cols-6">
          {iconSamples.map(({ name, Icon }) => (
            <div
              key={name}
              className="flex flex-col items-center gap-2 rounded-xl border border-border/80 bg-surface-200/50 p-4 transition-colors hover:border-primary/25 hover:bg-surface-300/50"
            >
              <Icon className="h-6 w-6 text-primary" />
              <span className="text-xs text-text-muted">{name}</span>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}
