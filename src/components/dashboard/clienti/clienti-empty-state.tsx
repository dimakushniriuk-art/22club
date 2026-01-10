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
  // Estrarre logica condizionale in funzione per migliorare leggibilità
  const getEmptyMessage = () => {
    if (totali > 0) {
      return `I filtri attuali non corrispondono a nessun cliente. Ci sono ${totali} clienti totali nel database. Prova a modificare i filtri.`
    }
    if (searchTerm || statoFilter !== 'tutti') {
      return 'Prova a modificare i filtri di ricerca per trovare i clienti che stai cercando.'
    }
    return 'Inizia invitando i tuoi primi atleti per gestire i loro progressi e allenamenti.'
  }

  return (
    <div className="relative py-16 text-center">
      <div className="mb-6 flex justify-center">
        <div className="text-teal-400">
          <Users className="h-12 w-12" />
        </div>
      </div>
      <h3 className="text-text-primary mb-2 text-xl font-semibold">Nessun cliente trovato</h3>
      <p className="text-text-secondary mb-6 text-sm max-w-md mx-auto">
        {getEmptyMessage()}
      </p>
      {totali > 0 && (
        <div className="mb-4">
          <Button variant="outline" onClick={onResetFilters}>
            Rimuovi tutti i filtri
          </Button>
        </div>
      )}
      {!searchTerm && statoFilter === 'tutti' && totali === 0 && (
        <Link href="/dashboard/invita-atleta">
          <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200">
            <UserPlus className="mr-2 h-4 w-4" />
            Invita primo atleta
          </Button>
        </Link>
      )}
    </div>
  )
}
