'use client'

import { Calendar } from 'lucide-react'
import { useModalActions } from '@/components/dashboard/modals-wrapper'
import { createLogger } from '@/lib/logger'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const logger = createLogger('app:dashboard:_components:new-appointment-button')

const DEFAULT_ACCENT = 'from-cyan-500/16 to-teal-500/6'
const DEFAULT_SUBLABEL = 'Pianifica una sessione'

export function NewAppointmentButton({
  accentClass = DEFAULT_ACCENT,
  sublabel = DEFAULT_SUBLABEL,
}: {
  accentClass?: string
  sublabel?: string
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
      className={cn(
        'group relative flex min-h-[90px] w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-background-secondary/42 backdrop-blur-2xl ring-1 ring-white/8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-glow active:scale-[0.98] p-3 text-center',
        !isAvailable && 'opacity-80',
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-80',
            accentClass,
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/5" />
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-primary/60 via-primary/40 to-transparent opacity-70" />
      </div>
      <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/6 ring-1 ring-white/12 shadow-inner transition-all duration-300 group-hover:scale-105 group-hover:ring-primary/25 text-text-primary/90 group-hover:text-primary">
        <Calendar className="h-3.5 w-3.5" />
      </div>
      <span className="relative z-10 mt-1.5 block text-xs font-semibold text-text-primary">
        Nuovo Appuntamento
      </span>
      <span className="relative z-10 mt-0.5 block text-[10px] text-text-secondary/90">
        {sublabel}
      </span>
    </button>
  )
}
