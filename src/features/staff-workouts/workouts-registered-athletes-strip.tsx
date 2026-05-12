'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { AGENDA_CARD_CYAN_FRAME } from '@/components/dashboard/agenda-timeline-compact'
import { cn } from '@/lib/utils'
import { isValidUUID } from '@/lib/utils/type-guards'
import type { Cliente } from '@/types/cliente'
import '@/styles/agenda-animations.css'

const CARD_OUTER =
  'group relative h-full min-w-0 w-full rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 text-left shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/20'

/** Max 4 colonne: `min` fluido tra ~10.5rem e (100% − 3×gap-2) / 4; gap fisso così il calc resta coerente. */
const ATHLETES_GRID =
  'grid w-full min-w-0 grid-flow-row gap-2 [grid-template-columns:repeat(auto-fill,minmax(min(100%,max(10.5rem,calc((100%-1.5rem)/4))),1fr))]'

function clienteDisplayName(c: Cliente): string {
  const full = `${c.first_name ?? c.nome ?? ''} ${c.last_name ?? c.cognome ?? ''}`.trim()
  return full || c.email || 'Atleta'
}

export type WorkoutsRegisteredAthletesStripProps = {
  athletes: Cliente[]
  loading?: boolean
  /** Totale in anagrafica (può superare `athletes.length` se paginato). */
  totalInAnagrafica?: number
  selectedAthleteIds?: string[]
  onSelectAthlete?: (athleteId: string) => void
}

export function WorkoutsRegisteredAthletesStrip({
  athletes,
  loading = false,
  totalInAnagrafica,
  selectedAthleteIds,
  onSelectAthlete,
}: WorkoutsRegisteredAthletesStripProps) {
  const usable = useMemo(() => athletes.filter((c) => isValidUUID(c.id)), [athletes])

  if (loading) {
    return (
      <div className={cn(ATHLETES_GRID, 'px-0.5 py-1')}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(CARD_OUTER, 'animate-pulse p-0')}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex min-w-0 items-center gap-3 px-3 py-3 sm:px-4 sm:py-3.5">
              <div className="h-10 w-10 shrink-0 rounded-full bg-white/10" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-white/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (usable.length === 0) {
    return (
      <p className="px-2 py-4 text-center text-sm text-text-secondary">
        Nessun atleta in anagrafica
      </p>
    )
  }

  const grid = (
    <div className={cn(ATHLETES_GRID, 'px-0.5 py-1')}>
      {usable.map((c, index) => {
        const id = c.id.trim()
        const name = clienteDisplayName(c)
        const selected = Boolean(id && selectedAthleteIds?.includes(id))
        const pendingInvite = Boolean(c.invitatoInAttesa)
        const canClick = Boolean(onSelectAthlete && id && !pendingInvite)

        const cardClass = cn(
          CARD_OUTER,
          canClick && 'cursor-pointer active:scale-[0.99]',
          pendingInvite && 'opacity-70',
          selected && AGENDA_CARD_CYAN_FRAME,
        )
        const cardStyle = {
          animationDelay: `${index * 60}ms`,
          animation: 'fadeInUp 0.5s ease-out forwards',
        } as const

        const inner = (
          <div className="flex min-w-0 items-start gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-3.5">
            <div className="shrink-0 pt-0.5">
              <div className="relative inline-block">
                <div className="absolute -inset-0.5 rounded-full bg-primary/40 blur-[2px]" />
                <div className="relative">
                  <Avatar
                    src={c.avatar_url ?? undefined}
                    alt={name}
                    fallbackText={
                      name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2) || '?'
                    }
                    size="md"
                  />
                </div>
              </div>
            </div>
            <div className="min-w-0 flex-1 py-0.5">
              <div className="break-words text-base font-bold leading-snug text-text-primary">
                {name}
              </div>
              {pendingInvite ? (
                <div className="mt-1 text-xs leading-snug text-text-secondary">
                  Invito in sospeso
                </div>
              ) : null}
            </div>
          </div>
        )

        if (canClick) {
          return (
            <button
              key={c.id}
              type="button"
              className={cn(
                cardClass,
                'p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
              )}
              style={cardStyle}
              aria-label={`Apri vista allenamenti di ${name}`}
              onClick={() => onSelectAthlete?.(id)}
            >
              {inner}
            </button>
          )
        }

        return (
          <div key={c.id} className={cardClass} style={cardStyle}>
            {inner}
          </div>
        )
      })}
    </div>
  )

  const truncated = typeof totalInAnagrafica === 'number' && totalInAnagrafica > usable.length

  return (
    <div className="min-w-0 w-full">
      {grid}
      {truncated ? (
        <p className="px-2 pb-1 text-center text-[11px] text-text-tertiary sm:text-left">
          Elenco troncato ({usable.length} su {totalInAnagrafica}).{' '}
          <Link
            href="/dashboard/clienti"
            className="text-cyan-400/90 underline-offset-2 hover:underline"
          >
            Anagrafica clienti
          </Link>
        </p>
      ) : null}
    </div>
  )
}
