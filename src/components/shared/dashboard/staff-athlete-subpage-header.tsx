'use client'

import type { ReactNode } from 'react'
import { StaffHeaderBackButton } from '@/components/shared/dashboard/staff-header-back-button'
import { cn } from '@/lib/utils'

export type StaffAthleteSubpageHeaderProps = {
  backHref: string
  title: string
  description: string
  /** Default: `Indietro` */
  backAriaLabel?: string
  actions?: ReactNode
}

/**
 * Header allineato a `StaffContentLayout`: pulsante indietro cyan, titolo/sottotitolo a 1 riga (clamp), azioni a destra.
 */
export function StaffAthleteSubpageHeader({
  backHref,
  title,
  description,
  backAriaLabel = 'Indietro',
  actions,
}: StaffAthleteSubpageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div
        className={cn(
          'flex min-w-0 max-w-full items-center gap-x-2 sm:gap-x-2.5',
          actions != null && 'flex-1',
        )}
      >
        <StaffHeaderBackButton href={backHref} aria-label={backAriaLabel} />
        <div
          className={cn(
            'min-w-0 flex flex-col gap-0.5',
            actions != null ? 'flex-1' : 'max-w-[min(100%,72ch)]',
          )}
        >
          <h1 className="line-clamp-1 min-w-0 text-sm font-bold leading-tight tracking-tight text-white sm:text-base md:text-xl lg:text-2xl">
            {title}
          </h1>
          <p className="line-clamp-1 min-w-0 text-xs leading-snug text-text-secondary sm:text-sm">
            {description}
          </p>
        </div>
      </div>
      {actions != null ? (
        <div className="flex w-full flex-col sm:w-auto sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:justify-end [&_button]:min-h-[44px] [&_button]:touch-manipulation [&_a]:min-h-[44px] [&_a]:touch-manipulation">
          {actions}
        </div>
      ) : null}
    </div>
  )
}
