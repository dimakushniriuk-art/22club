// ============================================================
// Componente Empty State Schede Workout (FASE C - Split File Lunghi)
// ============================================================
// Estratto da schede/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Button } from '@/components/ui'
import { Target, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface WorkoutPlansEmptyStateProps {
  searchTerm: string
  statusFilter: string
}

export function WorkoutPlansEmptyState({ searchTerm, statusFilter }: WorkoutPlansEmptyStateProps) {
  const router = useRouter()

  return (
    <div className="relative py-16 text-center">
      <div className="mb-6 flex justify-center">
        <div className="bg-teal-500/20 text-teal-400 rounded-full p-6">
          <Target className="h-12 w-12" />
        </div>
      </div>
      <h3 className="text-text-primary mb-2 text-xl font-semibold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
        {searchTerm || statusFilter ? 'Nessuna scheda trovata' : 'Nessuna scheda creata'}
      </h3>
      <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">
        {searchTerm || statusFilter
          ? 'Prova a modificare i filtri di ricerca'
          : 'Crea la tua prima scheda di allenamento per i tuoi atleti'}
      </p>
      {!searchTerm && !statusFilter && (
        <Button
          onClick={() => router.push('/dashboard/schede/nuova')}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200 hover:scale-105"
        >
          <Plus className="mr-2 h-4 w-4" />
          Crea prima scheda
        </Button>
      )}
    </div>
  )
}
