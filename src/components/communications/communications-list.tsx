// ============================================================
// Componente Lista Comunicazioni (FASE C - Split File Lunghi)
// ============================================================
// Estratto da comunicazioni/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import type { JSX } from 'react'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Skeleton } from '@/components/ui'
import { Plus, ChevronLeft, ChevronRight, Mail } from 'lucide-react'
import type { Communication } from '@/hooks/use-communications'
import { CommunicationCard } from './communication-card'

const SKELETON_ROWS = 4

interface CommunicationsListProps {
  activeTab?: string
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

function CommunicationsListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
        <Card key={i} variant="default" className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-3 min-w-0">
                <Skeleton className="h-5 w-3/4 max-w-sm" />
                <Skeleton className="h-4 w-full max-w-md" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

const EMPTY_STATE_BY_TAB: Record<
  string,
  { title: string; description: string; icon: JSX.Element }
> = {
  tutte: {
    title: 'Nessuna comunicazione trovata',
    description: 'Inizia a inviare comunicazioni ai tuoi atleti',
    icon: <Mail className="mx-auto h-12 w-12 text-text-tertiary" />,
  },
  sent: {
    title: 'Nessuna comunicazione inviata',
    description: 'Le comunicazioni inviate con successo appariranno qui',
    icon: <Mail className="mx-auto h-12 w-12 text-text-tertiary" />,
  },
  delivered: {
    title: 'Nessuna consegnata',
    description: 'Le comunicazioni consegnate ai destinatari appariranno qui',
    icon: <Mail className="mx-auto h-12 w-12 text-text-tertiary" />,
  },
  pending: {
    title: 'Nessuna in attesa',
    description: 'Bozze, programmate e in invio appariranno qui',
    icon: <Mail className="mx-auto h-12 w-12 text-text-tertiary" />,
  },
  failed: {
    title: 'Nessun fallimento',
    description: 'Le comunicazioni fallite appariranno qui',
    icon: <Mail className="mx-auto h-12 w-12 text-text-tertiary" />,
  },
}

export function CommunicationsList({
  activeTab = 'tutte',
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
    return <CommunicationsListSkeleton />
  }

  const emptyState = EMPTY_STATE_BY_TAB[activeTab] ?? EMPTY_STATE_BY_TAB.tutte

  if (communications.length === 0) {
    return (
      <Card variant="default">
        <CardContent className="py-12 text-center">
          <div className="mb-4 flex justify-center">{emptyState.icon}</div>
          <h3 className="text-text-primary mb-2 text-lg font-medium">{emptyState.title}</h3>
          <p className="text-text-secondary mb-4 text-sm">{emptyState.description}</p>
          <Button variant="primary" onClick={onNewCommunication}>
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
        <Card variant="default">
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
                className="border-white/10 hover:border-primary/20 text-text-secondary"
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
                className="border-white/10 hover:border-primary/20 text-text-secondary"
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
