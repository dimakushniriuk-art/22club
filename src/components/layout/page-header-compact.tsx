'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { StaffHeaderBackButton } from '@/components/shared/dashboard/staff-header-back-button'

export interface PageHeaderCompactProps {
  title: string
  subtitle?: string
  backHref?: string
  onBack?: () => void
  icon?: React.ReactNode
  className?: string
}

export function PageHeaderCompact({
  title,
  subtitle,
  backHref,
  onBack,
  icon,
  className,
}: PageHeaderCompactProps) {
  const hasBack = backHref != null || onBack != null
  const backContent =
    hasBack &&
    (backHref && !onBack ? (
      <StaffHeaderBackButton href={backHref} />
    ) : (
      <StaffHeaderBackButton onClick={onBack!} />
    ))

  return (
    <header
      className={cn(
        'relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-3 min-[834px]:p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.3)]',
        className,
      )}
    >
      <div className="relative z-10 flex items-center gap-3">
        {backContent}
        {icon != null && (
          <div className="flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-white/10 bg-cyan-500/10 text-cyan-400">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-2xl md:text-3xl font-semibold text-text-primary truncate">{title}</h4>
          {subtitle != null && (
            <p className="text-xs text-text-tertiary line-clamp-1">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  )
}
