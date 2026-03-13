// ============================================================
// Componente Empty State Schede Workout (FASE C - Split File Lunghi)
// ============================================================
// Estratto da schede/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'
import { Target, Plus } from 'lucide-react'

interface WorkoutPlansEmptyStateProps {
  searchTerm: string
  statusFilter: string
}

export function WorkoutPlansEmptyState({ searchTerm, statusFilter }: WorkoutPlansEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-white/10 bg-black/20 p-6 sm:p-8 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
        <Target className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary">
        {searchTerm || statusFilter ? 'Nessuna scheda trovata' : 'Nessuna scheda creata'}
      </h3>
      <p className="text-sm text-text-secondary max-w-md">
        {searchTerm || statusFilter
          ? 'Prova a modificare i filtri di ricerca'
          : 'Crea la tua prima scheda di allenamento per i tuoi atleti'}
      </p>
      {!searchTerm && !statusFilter && (
        <Button variant="primary" size="sm" asChild className="mt-2">
          <Link href="/dashboard/schede/nuova" prefetch>
            <Plus className="mr-2 h-4 w-4" />
            Crea prima scheda
          </Link>
        </Button>
      )}
    </div>
  )
}
