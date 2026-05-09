'use client'

import Link from 'next/link'
import { Button, EmptyState } from '@/components/ui'
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
    <EmptyState
      icon={Users}
      title={title}
      description={getEmptyMessage()}
      density="compact"
      surface="subtle"
      align="center"
      action={
        <div className="flex flex-wrap justify-center gap-2">
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
      }
    />
  )
}
