import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { ErrorState } from './error-state'
import { useAllenamentoDettaglio } from '@/hooks/use-allenamenti'
import { Calendar, Clock, TrendingUp, CheckCircle, FileText } from 'lucide-react'
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

interface AllenamentoDettaglioModalProps {
  allenamentoId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AllenamentoDettaglioModal({
  allenamentoId,
  open,
  onOpenChange,
}: AllenamentoDettaglioModalProps) {
  const { dettaglio, loading, error } = useAllenamentoDettaglio(allenamentoId || '')

  const getStatoBadge = (stato: string) => {
    switch (stato) {
      case 'completato':
        return (
          <Badge variant="success" size="sm">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completato
          </Badge>
        )
      case 'in_corso':
        return (
          <Badge variant="warning" size="sm">
            <Clock className="mr-1 h-3 w-3" />
            In corso
          </Badge>
        )
      case 'programmato':
        return (
          <Badge variant="primary" size="sm">
            <Calendar className="mr-1 h-3 w-3" />
            Programmato
          </Badge>
        )
      case 'saltato':
        return (
          <Badge variant="warning" size="sm">
            Saltato
          </Badge>
        )
      default:
        return <Badge size="sm">{stato}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Dettagli Allenamento</DialogTitle>
          <DialogDescription>Informazioni complete sulla sessione di allenamento</DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        )}

        {error && <ErrorState message={error.message} />}

        {dettaglio && !loading && (
          <div className="space-y-4">
            {/* Header allenamento */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="bg-brand/20 text-brand flex h-10 w-10 items-center justify-center rounded-full font-bold">
                        {dettaglio.allenamento.atleta_nome.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-text-primary font-semibold">
                          {dettaglio.allenamento.atleta_nome}
                        </h3>
                        <p className="text-text-secondary text-sm">
                          {dettaglio.allenamento.scheda_nome}
                        </p>
                      </div>
                    </div>
                  </div>
                  {getStatoBadge(dettaglio.allenamento.stato)}
                </div>
              </CardContent>
            </Card>

            {/* Dettagli */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Calendar className="h-4 w-4" />
                    <div>
                      <p className="text-text-tertiary text-xs">Data e ora</p>
                      <p className="text-text-primary font-medium">
                        {formatDate(new Date(dettaglio.allenamento.data))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Clock className="h-4 w-4" />
                    <div>
                      <p className="text-text-tertiary text-xs">Durata</p>
                      <p className="text-text-primary font-medium">
                        {dettaglio.allenamento.durata_minuti} minuti
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <div>
                      <p className="text-text-tertiary text-xs">Esercizi</p>
                      <p className="text-text-primary font-medium">
                        {dettaglio.allenamento.esercizi_completati}/
                        {dettaglio.allenamento.esercizi_totali}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <div>
                      <p className="text-text-tertiary text-xs">Volume</p>
                      <p className="text-text-primary font-medium">
                        {dettaglio.allenamento.volume_totale}kg
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Note */}
            {dettaglio.allenamento.note && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <FileText className="text-text-tertiary h-4 w-4 mt-1" />
                    <div className="flex-1">
                      <p className="text-text-secondary mb-1 text-xs font-medium">Note</p>
                      <p className="text-text-primary text-sm">{dettaglio.allenamento.note}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress bar */}
            {dettaglio.allenamento.stato === 'in_corso' && (
              <Card>
                <CardContent className="p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-text-secondary text-xs">Progresso</span>
                    <span className="text-text-secondary text-xs">
                      {Math.round(
                        (dettaglio.allenamento.esercizi_completati /
                          dettaglio.allenamento.esercizi_totali) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <div className="bg-background-tertiary h-2 overflow-hidden rounded-full">
                    <div
                      className="bg-brand h-full transition-all"
                      style={{
                        width: `${(dettaglio.allenamento.esercizi_completati / dettaglio.allenamento.esercizi_totali) * 100}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista esercizi - TODO: Implementare quando disponibile */}
            {dettaglio.esercizi.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="text-text-primary mb-3 font-medium">Esercizi</h4>
                  <div className="space-y-2">
                    {dettaglio.esercizi.map((esercizio) => (
                      <div key={esercizio.id} className="bg-background-tertiary rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-text-primary font-medium">{esercizio.nome}</span>
                          <Badge size="sm">
                            {esercizio.sets_completati}/{esercizio.sets_totali} sets
                          </Badge>
                        </div>
                        {esercizio.volume > 0 && (
                          <p className="text-text-secondary mt-1 text-sm">
                            Volume: {esercizio.volume}kg
                          </p>
                        )}
                        {esercizio.note && (
                          <p className="text-text-secondary mt-1 text-sm italic">
                            {esercizio.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
