'use client'

import { Calendar } from 'lucide-react'
import { createLogger } from '@/lib/logger'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { MouseEvent } from 'react'

const logger = createLogger('app:dashboard:_components:new-appointment-button')

const CARD_CLASS =
  'flex min-h-[64px] w-full flex-col items-center justify-center rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-2.5 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-all hover:border-white/18 hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-[0.99] sm:min-h-[72px] sm:p-3'

const DEFAULT_ICON_BOX = 'border-cyan-500/30 bg-cyan-500/20 text-cyan-400'

export function NewAppointmentButton({
  iconBoxClass = DEFAULT_ICON_BOX,
  calendarioHref = '/dashboard/calendario?new=true',
}: {
  iconBoxClass?: string
  /** Destinazione “nuovo appuntamento” (es. calendario staff o segmento massaggiatore). */
  calendarioHref?: string
}) {
  const router = useRouter()

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    logger.debug('New appointment button clicked')
    router.push(calendarioHref)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Nuovo appuntamento"
      title="Nuovo appuntamento"
      className={cn(CARD_CLASS)}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
          iconBoxClass,
        )}
      >
        <Calendar className="h-4 w-4" />
      </div>
      <span className="mt-1.5 block text-[10px] font-semibold leading-tight text-text-primary sm:mt-2 sm:text-[11px]">
        Nuovo Appuntamento
      </span>
    </button>
  )
}
