// ============================================================
// Componente Lista Comunicazioni (FASE C - Split File Lunghi)
// ============================================================
// Estratto da comunicazioni/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import type { JSX } from 'react'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Loader2, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Communication } from '@/hooks/use-communications'
import { CommunicationCard } from './communication-card'

interface CommunicationsListProps {
  communications: Communication[]
  totalCount?: number | null
  currentPage?: number
  totalPages?: number
  itemsPerPage?: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
  loading: boolean
  onNewCommunication: () => void
  onSend: (id: string) => void
  onEdit?: (id: string) => void
  onReset?: (id: string) => void
  onDelete?: (id: string) => void
  onViewDetails?: (id: string) => void
  onNextPage?: () => void
  onPrevPage?: () => void
  onPageChange?: (page: number) => void
  getTipoIcon: (tipo: string) => JSX.Element
  getStatoBadge: (stato: string) => JSX.Element
  formatData: (dataString: string | null) => string
}

export function CommunicationsList({
  communications,
  totalCount,
  currentPage = 1,
  totalPages = 1,
  itemsPerPage = 10,
  hasNextPage = false,
  hasPrevPage = false,
  loading,
  onNewCommunication,
  onSend,
  onEdit,
  onReset,
  onDelete,
  onViewDetails,
  onNextPage,
  onPrevPage,
  // Nota: onPageChange potrebbe essere usato in futuro per paginazione custom
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPageChange,
  getTipoIcon,
  getStatoBadge,
  formatData,
}: CommunicationsListProps) {
  if (loading) {
    return (
      <Card variant="trainer" className="border-blue-500/30">
        <CardContent className="py-12 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-400" />
          <p className="mt-4 text-text-secondary">Caricamento comunicazioni...</p>
        </CardContent>
      </Card>
    )
  }

  if (communications.length === 0) {
    return (
      <Card
        variant="trainer"
        className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-blue-500/30 shadow-lg shadow-blue-500/10 backdrop-blur-xl"
      >
        <CardContent className="py-12 text-center relative">
          <div className="mb-4 text-6xl opacity-50">📭</div>
          <h3 className="text-text-primary mb-2 text-lg font-medium">
            Nessuna comunicazione trovata
          </h3>
          <p className="text-text-secondary mb-4 text-sm">
            Inizia a inviare comunicazioni ai tuoi atleti
          </p>
          <Button
            onClick={onNewCommunication}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Crea comunicazione
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Lista comunicazioni */}
      {communications.map((comunicazione) => (
        <CommunicationCard
          key={comunicazione.id}
          communication={comunicazione}
          onSend={onSend}
          onEdit={onEdit}
          onReset={onReset}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
          getTipoIcon={getTipoIcon}
          getStatoBadge={getStatoBadge}
          formatData={formatData}
        />
      ))}

      {/* Controlli Paginazione */}
      {totalCount !== null && totalCount !== undefined && totalCount > 0 && (
        <Card
          variant="trainer"
          className="border-blue-500/30 bg-gradient-to-br from-background-secondary/80 to-background-tertiary/80"
        >
          <CardContent className="flex items-center justify-between p-4">
            <div className="text-text-secondary text-sm">
              Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, totalCount ?? 0)} -{' '}
              {Math.min(currentPage * itemsPerPage, totalCount ?? 0)} di {totalCount ?? 0}{' '}
              comunicazioni
            </div>

            <div className="flex items-center gap-2">
              {/* Bottone Precedente */}
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevPage}
                disabled={!hasPrevPage || loading}
                className="border-border/50 bg-background-secondary/50 hover:bg-background-secondary"
              >
                <ChevronLeft className="h-4 w-4" />
                Precedente
              </Button>

              {/* Indicatore pagina */}
              <div className="text-text-primary px-3 text-sm font-medium">
                Pagina {currentPage} di {totalPages}
              </div>

              {/* Bottone Successiva */}
              <Button
                variant="outline"
                size="sm"
                onClick={onNextPage}
                disabled={!hasNextPage || loading}
                className="border-border/50 bg-background-secondary/50 hover:bg-background-secondary"
              >
                Successiva
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
