'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { colors, type AthleteAccentKey } from '@/lib/design-tokens'
import { Card, CardContent } from '@/components/ui/card'

export interface CardMetricProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
  accent?: AthleteAccentKey
}

const accentKeys: AthleteAccentKey[] = ['teal', 'cyan', 'green', 'emerald', 'amber']

export function CardMetric({
  label,
  value,
  icon,
  accent = 'teal',
  className,
  ...props
}: CardMetricProps) {
  const accentData = colors.athleteAccents[accent] ?? colors.athleteAccents.teal

  return (
    <Card
      className={cn(
        'relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.3)]',
        className,
      )}
      {...props}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ backgroundColor: accentData.bar }}
        aria-hidden
      />
      <CardContent className="relative z-10 flex items-center gap-3 p-4">
        {icon != null && (
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10"
            style={{
              backgroundColor: accentData.iconBg ?? `${accentData.bar}20`,
            }}
          >
            <span style={{ color: accentData.bar }}>{icon}</span>
          </div>
        )}
        <div>
          <div className="text-[10px] uppercase tracking-wide text-text-tertiary">{label}</div>
          <div className="text-xl font-bold" style={{ color: accentData.bar }}>
            {value}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { accentKeys }
