'use client'

import { Button } from '@/components/ui'
import { useModalActions } from './modals-wrapper'

interface QuickAction {
  id: string
  label: string
  icon: string
  tooltip: string
  onClick: () => void
}

interface QuickActionsProps {
  onAddAppointment?: () => void
  onAddScheda?: () => void
  onAddPayment?: () => void
  onAddDocument?: () => void
}

export function QuickActions({
  onAddAppointment,
  onAddScheda,
  onAddPayment,
  onAddDocument,
}: QuickActionsProps) {
  const { openAppointment, openPayment, openWorkout, openDocument } = useModalActions()

  const actions: QuickAction[] = [
    {
      id: 'appointment',
      label: '+Appuntamento',
      icon: '📅',
      tooltip: 'Crea nuovo appuntamento',
      onClick: onAddAppointment || openAppointment,
    },
    {
      id: 'scheda',
      label: '+Scheda',
      icon: '💪',
      tooltip: 'Assegna una nuova scheda',
      onClick: onAddScheda || openWorkout,
    },
    {
      id: 'payment',
      label: '+Pagamento',
      icon: '💰',
      tooltip: 'Registra un pagamento',
      onClick: onAddPayment || openPayment,
    },
    {
      id: 'document',
      label: '+Documento',
      icon: '📄',
      tooltip: 'Carica documento atleta',
      onClick: onAddDocument || openDocument,
    },
  ]

  return (
    <div className="fixed right-6 top-1/2 z-40 -translate-y-1/2 space-y-3">
      {actions.map((action) => (
        <div key={action.id} className="group relative">
          <Button
            variant="primary"
            size="icon-lg"
            onClick={action.onClick}
            className="hover:shadow-[0_0_10px_rgba(2,179,191,0.3)] h-14 w-14 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            title={action.tooltip}
          >
            <span className="text-xl">{action.icon}</span>
          </Button>

          {/* Tooltip */}
          <div className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="bg-background-elevated text-text-primary whitespace-nowrap rounded-lg border border-border px-3 py-2 text-sm shadow-lg">
              {action.tooltip}
              <div className="border-l-background-elevated absolute left-full top-1/2 h-0 w-0 -translate-y-1/2 border-b-4 border-l-4 border-t-4 border-b-transparent border-t-transparent" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
