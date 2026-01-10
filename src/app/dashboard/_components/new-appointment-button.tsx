'use client'

import { Button } from '@/components/ui'
import { Calendar } from 'lucide-react'
import { useModalActions } from '@/components/dashboard/modals-wrapper'
import { createLogger } from '@/lib/logger'
import { useRouter } from 'next/navigation'

const logger = createLogger('app:dashboard:_components:new-appointment-button')

export function NewAppointmentButton() {
  const { openAppointment, isAvailable } = useModalActions()
  const router = useRouter()

  const handleClick = () => {
    logger.debug('NewAppointmentButton clicked', undefined, { isAvailable })
    // Verifica se il context è disponibile
    if (isAvailable && openAppointment && typeof openAppointment === 'function') {
      try {
        logger.debug('Calling openAppointment')
        openAppointment()
      } catch (error) {
        logger.error('Error calling openAppointment', error)
        // Fallback: naviga alla pagina calendario
        router.push('/dashboard/calendario?new=true')
      }
    } else {
      logger.warn('Context not available, using fallback', undefined, { isAvailable })
      // Fallback: naviga alla pagina calendario
      router.push('/dashboard/calendario?new=true')
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className="w-full h-auto flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-cyan-500/20 hover:border-blue-500/50 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 rounded-lg"
    >
      <Calendar className="h-6 w-6 text-blue-400" />
      <span className="text-sm font-medium text-white">Nuovo Appuntamento</span>
    </Button>
  )
}
