'use client'

import type { LucideIcon } from 'lucide-react'
import { Sparkles } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui'
import { DS_CARD_FRAME_CLASS, DS_CODE_CLASS, DS_SECTION_TITLE_CLASS } from './helpers'

interface IconSample {
  name: string
  Icon: LucideIcon
}

export function SectionIcone({ iconSamples }: { iconSamples: IconSample[] }) {
  return (
    <section id="icone" className="scroll-mt-24">
      <h2 className={DS_SECTION_TITLE_CLASS}>
        <Sparkles className="h-6 w-6 text-primary" />
        Icone (Lucide)
      </h2>
      <Card variant="default" className={DS_CARD_FRAME_CLASS}>
        <p className="mb-4 text-sm text-text-secondary">
          Set usato nel progetto. Import da <code className={DS_CODE_CLASS}>lucide-react</code>.
        </p>
        <CardTitle className="mb-3 text-sm font-medium text-text-secondary">Set icone</CardTitle>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6 lg:gap-4">
          {iconSamples.map(({ name, Icon }) => (
            <div
              key={name}
              className="flex flex-col items-center gap-2 rounded-lg border border-white/10 bg-zinc-800/80 p-4 transition-colors hover:border-primary/25 hover:bg-zinc-700/80"
            >
              <Icon className="h-6 w-6 text-primary" />
              <span className="text-xs text-text-muted truncate w-full text-center px-0.5">
                {name}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}
