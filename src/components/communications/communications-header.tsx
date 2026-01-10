// ============================================================
// Componente Header Comunicazioni (FASE C - Split File Lunghi)
// ============================================================
// Estratto da comunicazioni/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Button } from '@/components/ui'
import { Plus } from 'lucide-react'

interface CommunicationsHeaderProps {
  onNewCommunication: () => void
}

export function CommunicationsHeader({ onNewCommunication }: CommunicationsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-text-primary text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          Comunicazioni
        </h1>
        <p className="text-text-secondary text-sm sm:text-base">
          Invia notifiche push, email e SMS ai tuoi atleti
        </p>
      </div>
      <Button
        onClick={onNewCommunication}
        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200"
      >
        <Plus className="mr-2 h-4 w-4" />
        Nuova Comunicazione
      </Button>
    </div>
  )
}
