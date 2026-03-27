'use client'

import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

/** Intestazione sezione per scheda profilo atleta (stile unificato con /home/profilo). */
export function AthleteProfileSectionHeading({
  icon: Icon,
  children,
  trailing,
}: {
  icon: LucideIcon
  children: ReactNode
  trailing?: ReactNode
}) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5 sm:px-5"
      role="presentation"
    >
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
          {children}
        </span>
      </div>
      {trailing != null ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  )
}
