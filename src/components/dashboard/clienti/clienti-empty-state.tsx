'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'
import { Users, UserPlus } from 'lucide-react'

interface ClientiEmptyStateProps {
  searchTerm: string
  statoFilter: 'tutti' | 'attivo' | 'inattivo' | 'sospeso'
  totali: number
  onResetFilters: () => void
}

export function ClientiEmptyState({
  searchTerm,
  statoFilter,
  totali,
  onResetFilters,
}: ClientiEmptyStateProps) {
  const hasActiveFilters = searchTerm || statoFilter !== 'tutti'
  const isEmptyOrg = totali === 0 && !hasActiveFilters

  const title = isEmptyOrg ? 'Nessun cliente' : 'Nessun risultato per i filtri attivi'
  const getEmptyMessage = () => {
    if (totali > 0) {
      return `I filtri attuali non corrispondono a nessun cliente. Ci sono ${totali} clienti totali. Modifica i filtri o azzerali per vedere tutti.`
    }
    if (hasActiveFilters) {
      return 'Nessun cliente corrisponde alla ricerca o allo stato selezionato. Prova a modificare i filtri.'
    }
    return "Non ci sono ancora clienti nell'organizzazione. Invita i tuoi primi atleti per gestire progressi e allenamenti."
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-white/10 bg-black/20 p-6 sm:p-8 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
        <Users className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      <p className="text-sm text-text-secondary max-w-md">{getEmptyMessage()}</p>
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        {(totali > 0 || hasActiveFilters) && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="border-white/20 hover:bg-white/5 hover:border-white/30"
          >
            {totali > 0 ? 'Rimuovi tutti i filtri' : 'Rimuovi filtri'}
          </Button>
        )}
        {isEmptyOrg && (
          <Button variant="primary" size="sm" asChild>
            <Link href="/dashboard/invita-atleta" prefetch>
              <UserPlus className="mr-2 h-4 w-4" />
              Invita primo atleta
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
