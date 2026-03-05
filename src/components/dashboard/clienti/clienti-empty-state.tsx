'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'
import { Users, UserPlus } from 'lucide-react'
import { colors } from '@/lib/design-tokens'

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
    return 'Non ci sono ancora clienti nell’organizzazione. Invita i tuoi primi atleti per gestire progressi e allenamenti.'
  }

  return (
    <div className="relative py-16 text-center">
      <div className="mb-6 flex justify-center">
        <div style={{ color: colors.athleteAccents.teal.bar }}>
          <Users className="h-12 w-12" />
        </div>
      </div>
      <h3 className="text-text-primary mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-text-secondary mb-6 text-sm max-w-md mx-auto">
        {getEmptyMessage()}
      </p>
      {(totali > 0 || hasActiveFilters) && (
        <div className="mb-4">
          <Button variant="outline" onClick={onResetFilters}>
            {totali > 0 ? 'Rimuovi tutti i filtri' : 'Rimuovi filtri'}
          </Button>
        </div>
      )}
      {isEmptyOrg && (
        <Link href="/dashboard/invita-atleta" prefetch>
          <Button
            className="text-white font-semibold shadow-lg transition-all duration-200 hover:opacity-90"
            style={{
              background: `linear-gradient(to right, ${colors.athleteAccents.teal.bar}, ${colors.athleteAccents.cyan.bar})`,
              boxShadow: `0 10px 15px -3px ${colors.athleteAccents.teal.bar}30`,
            }}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Invita primo atleta
          </Button>
        </Link>
      )}
    </div>
  )
}
