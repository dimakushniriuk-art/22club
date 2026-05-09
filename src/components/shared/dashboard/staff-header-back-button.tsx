'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Pulsante indietro condiviso per header staff / subpage atleta.
 *
 * **Contratto:** esattamente una modalità — `href` **oppure** `onClick`, mai entrambe, mai nessuna.
 * - Con `href`: render come `Link` (navigazione client Next).
 * - Con `onClick`: render come `button type="button"` (es. `router.back()`).
 */
const staffHeaderBackButtonClassName = cn(
  'shrink-0 inline-flex items-center justify-center whitespace-nowrap font-medium border transition-all duration-200',
  'touch-manipulation',
  'h-11 w-11 rounded-md',
  'bg-cyan-500 text-white hover:bg-cyan-400 active:bg-cyan-600 border-cyan-400/80 hover:border-cyan-300/90',
  'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] active:scale-[0.98]',
  'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  'focus-visible:ring-offset-background focus:outline-none',
)

/** Navigazione via URL — `onClick` non è consentito su questo ramo (XOR a tipo). */
export type StaffHeaderBackButtonLinkProps = {
  href: string
  onClick?: undefined
  className?: string
  'aria-label'?: string
}

/** Azione in-page (es. history) — `href` non è consentito su questo ramo (XOR a tipo). */
export type StaffHeaderBackButtonActionProps = {
  href?: undefined
  onClick: () => void
  className?: string
  'aria-label'?: string
}

/** Unione discriminata: `href` XOR `onClick`. */
export type StaffHeaderBackButtonProps =
  | StaffHeaderBackButtonLinkProps
  | StaffHeaderBackButtonActionProps

/** @see StaffHeaderBackButtonProps — `href` XOR `onClick`. */
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
