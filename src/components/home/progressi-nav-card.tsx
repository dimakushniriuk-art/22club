'use client'

import type { ReactNode } from 'react'
import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import Link from 'next/link'

export type Accent = 'primary' | 'cyan' | 'purple' | 'emerald'

interface AccentStyles {
  cardStyle: React.CSSProperties
  barStyle: React.CSSProperties
  linkFocusClass: string
  cardClass: string
  barClass: string
  iconBoxClass: string
  ctaClass: string
}

const ACCENT_STYLES: Record<Accent, AccentStyles> = {
  primary: {
    cardStyle: {
      background:
        'linear-gradient(145deg, rgba(20,184,166,0.16) 0%, rgba(0,199,129,0.05) 50%, rgba(22,22,26,0.85) 100%)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,199,129,0.12) inset',
    },
    barStyle: {
      boxShadow:
        '0 0 12px rgba(0,199,129,0.75), 0 0 24px rgba(0,199,129,0.4), 0 0 36px rgba(0,199,129,0.2)',
    },
    linkFocusClass: 'focus-visible:ring-primary/50',
    cardClass:
      'border-primary/50 hover:border-primary/70 hover:shadow-primary/15',
    barClass: 'bg-primary',
    iconBoxClass: 'border-primary/40 bg-primary/20',
    ctaClass: 'text-primary',
  },
  cyan: {
    cardStyle: {
      background:
        'linear-gradient(145deg, rgba(6,182,212,0.16) 0%, rgba(2,179,191,0.05) 50%, rgba(22,22,26,0.85) 100%)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(6,182,212,0.12) inset',
    },
    barStyle: {
      boxShadow:
        '0 0 12px rgba(6,182,212,0.75), 0 0 24px rgba(6,182,212,0.4), 0 0 36px rgba(6,182,212,0.2)',
    },
    linkFocusClass: 'focus-visible:ring-cyan-400/50',
    cardClass:
      'border-cyan-400/50 hover:border-cyan-400/70 hover:shadow-cyan-500/15',
    barClass: 'bg-cyan-400',
    iconBoxClass: 'border-cyan-400/40 bg-cyan-500/20',
    ctaClass: 'text-cyan-400',
  },
  purple: {
    cardStyle: {
      background:
        'linear-gradient(145deg, rgba(168,85,247,0.16) 0%, rgba(147,51,234,0.05) 50%, rgba(22,22,26,0.85) 100%)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(168,85,247,0.12) inset',
    },
    barStyle: {
      boxShadow:
        '0 0 12px rgba(168,85,247,0.75), 0 0 24px rgba(168,85,247,0.4), 0 0 36px rgba(168,85,247,0.2)',
    },
    linkFocusClass: 'focus-visible:ring-purple-400/50',
    cardClass:
      'border-purple-400/50 hover:border-purple-400/70 hover:shadow-purple-500/15',
    barClass: 'bg-purple-400',
    iconBoxClass: 'border-purple-400/40 bg-purple-500/20',
    ctaClass: 'text-purple-400',
  },
  emerald: {
    cardStyle: {
      background:
        'linear-gradient(145deg, rgba(16,185,129,0.16) 0%, rgba(5,150,105,0.05) 50%, rgba(22,22,26,0.85) 100%)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(16,185,129,0.12) inset',
    },
    barStyle: {
      boxShadow:
        '0 0 12px rgba(16,185,129,0.75), 0 0 24px rgba(16,185,129,0.4), 0 0 36px rgba(16,185,129,0.2)',
    },
    linkFocusClass: 'focus-visible:ring-emerald-400/50',
    cardClass:
      'border-emerald-400/50 hover:border-emerald-400/70 hover:shadow-emerald-500/15',
    barClass: 'bg-emerald-400',
    iconBoxClass: 'border-emerald-400/40 bg-emerald-500/20',
    ctaClass: 'text-emerald-400',
  },
}

export interface ProgressiNavCardProps {
  href: string
  accent: Accent
  icon: ReactNode
  title: string
  description: string
  ctaText: string
  ctaIcon: ReactNode
}

function ProgressiNavCardComponent({
  href,
  accent,
  icon,
  title,
  description,
  ctaText,
  ctaIcon,
}: ProgressiNavCardProps) {
  const s = ACCENT_STYLES[accent]
  return (
    <Link
      href={href}
      prefetch
      aria-label={`Vai a ${title}`}
      className={`group block min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl ${s.linkFocusClass}`}
    >
      <Card
        className={`relative overflow-hidden rounded-xl border backdrop-blur-md transition-all duration-200 hover:shadow-lg ${s.cardClass}`}
        style={s.cardStyle}
      >
        <div
          className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${s.barClass}`}
          style={s.barStyle}
          aria-hidden
        />
        <CardHeader className="relative z-10 pb-2.5 px-4 min-[834px]:px-5 pt-4 min-[834px]:pt-5">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${s.iconBoxClass}`}
            >
              {icon}
            </div>
            <CardTitle
              size="sm"
              className="text-text-primary text-sm min-[834px]:text-base font-bold flex-1 min-w-0 truncate"
            >
              {title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 pt-0 pb-3 min-[834px]:pb-4 px-4 min-[834px]:px-5">
          <p className="text-text-secondary mb-2 text-xs min-[834px]:text-sm line-clamp-3 leading-relaxed">
            {description}
          </p>
          <div
            className={`flex items-center gap-1.5 group-hover:opacity-90 transition-colors ${s.ctaClass}`}
          >
            <span className="text-[10px] min-[834px]:text-xs font-medium uppercase tracking-wide">
              {ctaText}
            </span>
            {ctaIcon}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export const ProgressiNavCard = memo(ProgressiNavCardComponent)
