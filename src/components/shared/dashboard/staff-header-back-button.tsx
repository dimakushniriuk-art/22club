'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Stesso stile del pulsante indietro in `StaffContentLayout` — usare ovunque serva coerenza header. */
export const staffHeaderBackButtonClassName = cn(
  'shrink-0 inline-flex items-center justify-center whitespace-nowrap font-medium border transition-all duration-200',
  'h-11 w-11 rounded-md',
  'bg-cyan-500 text-white hover:bg-cyan-400 active:bg-cyan-600 border-cyan-400/80 hover:border-cyan-300/90',
  'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] active:scale-[0.98]',
  'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  'focus-visible:ring-offset-background focus:outline-none',
)

export type StaffHeaderBackButtonProps =
  | {
      href: string
      onClick?: undefined
      className?: string
      'aria-label'?: string
    }
  | {
      href?: undefined
      onClick: () => void
      className?: string
      'aria-label'?: string
    }

export function StaffHeaderBackButton({
  href,
  onClick,
  className,
  'aria-label': ariaLabel = 'Indietro',
}: StaffHeaderBackButtonProps) {
  const classes = cn(staffHeaderBackButtonClassName, className)
  const icon = <ChevronLeft className="h-5 w-5" aria-hidden />
  if (href != null) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel} prefetch>
        {icon}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} className={classes} aria-label={ariaLabel}>
      {icon}
    </button>
  )
}
