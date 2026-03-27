'use client'

import type { ReactNode } from 'react'
import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import Link from 'next/link'

export type Accent = 'primary' | 'white' | 'cyan' | 'purple' | 'emerald'

interface AccentStyles {
  linkFocusClass: string
  iconBoxClass: string
  ctaClass: string
}

const ICON_BOX_NEUTRAL = 'border-white/10 bg-white/5'

const ACCENT_STYLES: Record<Accent, AccentStyles> = {
  primary: {
    linkFocusClass: 'focus-visible:ring-primary/50',
    iconBoxClass: ICON_BOX_NEUTRAL,
    ctaClass: 'text-primary',
  },
  white: {
    linkFocusClass: 'focus-visible:ring-white/50',
    iconBoxClass: ICON_BOX_NEUTRAL,
    ctaClass: 'text-white/90',
  },
  cyan: {
    linkFocusClass: 'focus-visible:ring-cyan-400/50',
    iconBoxClass: ICON_BOX_NEUTRAL,
    ctaClass: 'text-cyan-400',
  },
  purple: {
    linkFocusClass: 'focus-visible:ring-purple-400/50',
    iconBoxClass: ICON_BOX_NEUTRAL,
    ctaClass: 'text-purple-400',
  },
  emerald: {
    linkFocusClass: 'focus-visible:ring-emerald-400/50',
    iconBoxClass: ICON_BOX_NEUTRAL,
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
      className={`group block min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg ${s.linkFocusClass}`}
    >
      <Card
        variant="default"
        className="relative overflow-hidden transition-all duration-200 hover:border-white/20"
      >
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
