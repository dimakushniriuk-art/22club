// ============================================================
// Componente Empty State Schede Workout (FASE C - Split File Lunghi)
// ============================================================
// Estratto da schede/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import Link from 'next/link'
import { Button, EmptyState } from '@/components/ui'
import { Target, Plus } from 'lucide-react'

interface WorkoutPlansEmptyStateProps {
  searchTerm: string
  statusFilter: string
}

export function WorkoutPlansEmptyState({ searchTerm, statusFilter }: WorkoutPlansEmptyStateProps) {
  const filtered = Boolean(searchTerm || statusFilter)

  return (
    <EmptyState
      icon={Target}
      title={filtered ? 'Nessuna scheda trovata' : 'Nessuna scheda creata'}
      description={
        filtered
          ? 'Prova a modificare i filtri di ricerca'
          : 'Crea la tua prima scheda di allenamento per i tuoi atleti'
      }
      density="compact"
      surface="subtle"
      align="center"
      action={
        !filtered ? (
          <Button variant="primary" size="sm" asChild className="mt-2">
            <Link href="/dashboard/schede/nuova" prefetch>
              <Plus className="mr-2 h-4 w-4" />
              Crea prima scheda
            </Link>
          </Button>
        ) : undefined
      }
    />
  )
}
