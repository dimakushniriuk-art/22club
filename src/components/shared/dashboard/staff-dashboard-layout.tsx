'use client'

import { memo } from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StaffDashboardCard = {
  href: string
  icon: LucideIcon
  label: string
  sublabel: string
  accentClass: string
}

export type StaffDashboardTheme = 'amber' | 'emerald'

const THEME_CLASSES: Record<
  StaffDashboardTheme,
  {
    headerBorder: string
    headerGradient: string
    iconColor: string
    lineGradient: string
  }
> = {
  amber: {
    headerBorder: 'border-amber-500/20',
    headerGradient: 'bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/5',
    iconColor: 'text-amber-400',
    lineGradient: 'bg-gradient-to-r from-amber-500/70 via-amber-500/40 to-transparent',
  },
  emerald: {
    headerBorder: 'border-emerald-500/20',
    headerGradient: 'bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/5',
    iconColor: 'text-emerald-400',
    lineGradient: 'bg-gradient-to-r from-emerald-500/70 via-emerald-500/40 to-transparent',
  },
}

const CARD_LINK_CLASS =
  'group relative flex flex-col items-center overflow-hidden rounded-2xl bg-background-secondary/42 backdrop-blur-2xl ring-1 ring-white/8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-glow max-[851px]:hover:translate-y-0 max-[851px]:hover:shadow-soft p-5 sm:p-6 text-center min-h-[120px] active:scale-[0.98] touch-manipulation'

const StaffDashboardCardItem = memo(function StaffDashboardCardItem({
  item,
}: {
  item: StaffDashboardCard
}) {
  const Icon = item.icon
  return (
    <Link href={item.href} className={CARD_LINK_CLASS}>
      <div className="pointer-events-none absolute inset-0">
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-80', item.accentClass)} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/5" />
        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary/60 via-primary/40 to-transparent opacity-70" />
      </div>
      <div className="relative z-10 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-white/6 ring-1 ring-white/12 shadow-inner transition-all duration-300 group-hover:scale-105 group-hover:ring-primary/25 max-[851px]:group-hover:scale-100 max-[851px]:group-hover:ring-white/12 text-text-primary/90 group-hover:text-primary">
        <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
      </div>
      <span className="relative z-10 mt-3 sm:mt-4 block text-sm font-semibold text-text-primary">
        {item.label}
      </span>
      <span className="relative z-10 mt-1 block text-xs text-text-secondary/90">
        {item.sublabel}
      </span>
    </Link>
  )
})

export type StaffDashboardLayoutProps = {
  title: string
  description: string
  icon: LucideIcon
  theme: StaffDashboardTheme
  cards: StaffDashboardCard[]
  /** Aria-label per il gruppo di card (accessibilità e screen reader). */
  cardsAriaLabel?: string
}

export function StaffDashboardLayout({
  title,
  description,
  icon: Icon,
  theme,
  cards,
  cardsAriaLabel = 'Link rapidi alla sezione',
}: StaffDashboardLayoutProps) {
  const classes = THEME_CLASSES[theme]

  return (
    <div className="min-h-screen w-full min-w-0 bg-background p-4 sm:p-6">
      <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8">
        <div
          className={cn(
            'space-y-2 rounded-2xl border p-4 sm:p-5',
            classes.headerBorder,
            classes.headerGradient,
          )}
        >
          <h1 className="text-text-primary text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Icon className={cn('h-7 w-7 sm:h-8 sm:w-8 shrink-0', classes.iconColor)} />
            {title}
          </h1>
          <p className="text-text-secondary text-sm sm:text-base">{description}</p>
          <div className={cn('mt-2 h-[3px] w-28 rounded-full', classes.lineGradient)} />
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
          role="navigation"
          aria-label={cardsAriaLabel}
        >
          {cards.map((item) => (
            <StaffDashboardCardItem key={item.href} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
