'use client'

import { Calendar } from 'lucide-react'
import { useModalActions } from '@/components/dashboard/modals-wrapper'
import { createLogger } from '@/lib/logger'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const logger = createLogger('app:dashboard:_components:new-appointment-button')

const CARD_CLASS =
  'flex min-h-[70px] w-full flex-col items-center justify-center rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-3 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/20'

const DEFAULT_ICON_BOX = 'border-cyan-500/30 bg-cyan-500/20 text-cyan-400'
const DEFAULT_SUBLABEL = 'Pianifica una sessione'

export function NewAppointmentButton({
  sublabel = DEFAULT_SUBLABEL,
  iconBoxClass = DEFAULT_ICON_BOX,
}: {
  sublabel?: string
  iconBoxClass?: string
}) {
  const { openAppointment, isAvailable } = useModalActions()
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    logger.debug('NewAppointmentButton clicked', undefined, { isAvailable })
    if (isAvailable && openAppointment && typeof openAppointment === 'function') {
      try {
        logger.debug('Calling openAppointment')
        openAppointment()
      } catch (error) {
        logger.error('Error calling openAppointment', error)
        router.push('/dashboard/calendario?new=true')
      }
    } else {
      logger.warn('Context not available, using fallback', undefined, { isAvailable })
      router.push('/dashboard/calendario?new=true')
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Nuovo Appuntamento, Pianifica una sessione"
      aria-disabled={!isAvailable}
      title={isAvailable ? undefined : 'Vai al calendario per creare un appuntamento'}
      className={cn(CARD_CLASS, !isAvailable && 'opacity-80')}
    >
      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border', iconBoxClass)}>
        <Calendar className="h-4 w-4" />
      </div>
      <span className="mt-2 block text-[10px] font-semibold text-text-primary">
        Nuovo Appuntamento
      </span>
      <span className="text-[9px] text-text-secondary">{sublabel}</span>
    </button>
  )
}
