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
        'relative overflow-hidden rounded-xl border bg-background-secondary/50 backdrop-blur-sm',
        className,
      )}
      style={{
        borderColor: accentData.border,
      }}
      {...props}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: `${accentData.bar}66` }}
        aria-hidden
      />
      <CardContent className="relative z-10 flex items-center gap-3 p-4">
        {icon != null && (
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
            style={{
              borderColor: accentData.border,
              backgroundColor: accentData.iconBg,
            }}
          >
            <span style={{ color: accentData.bar }}>{icon}</span>
          </div>
        )}
        <div>
          <div className="text-[10px] uppercase tracking-wide text-text-tertiary">
            {label}
          </div>
          <div
            className="text-xl font-bold"
            style={{ color: accentData.bar }}
          >
            {value}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { accentKeys }
