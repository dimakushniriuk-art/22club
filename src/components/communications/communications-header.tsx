// ============================================================
// Componente Header Comunicazioni (FASE C - Split File Lunghi)
// ============================================================
// Estratto da comunicazioni/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'
import { Plus, FileText } from 'lucide-react'

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
          Invia email ai tuoi atleti
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href="/dashboard/comunicazioni/template">
            <FileText className="mr-2 h-4 w-4" />
            Template email
          </Link>
        </Button>
        <Button variant="primary" onClick={onNewCommunication}>
          <Plus className="mr-2 h-4 w-4" />
          Nuova Comunicazione
        </Button>
      </div>
    </div>
  )
}
