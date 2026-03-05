// ============================================================
// Componente Card Comunicazione (FASE C - Split File Lunghi)
// ============================================================
// Estratto da comunicazioni/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { useState, useCallback } from 'react'
import type { JSX } from 'react'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Progress } from '@/components/ui'
import { Mail, Send, Users, CheckCircle, Calendar, Loader2, Info, Eye, Trash2 } from 'lucide-react'
import type { Communication } from '@/hooks/use-communications'
import { useToast } from '@/components/ui/toast'
import { createLogger } from '@/lib/logger'

const logger = createLogger('CommunicationCard')

interface CommunicationCardProps {
  communication: Communication
  onSend: (id: string) => void
  onEdit?: (id: string) => void
  onReset?: (id: string) => void
  onDelete?: (id: string) => void
  onViewDetails?: (id: string) => void
  getTipoIcon: (tipo: string) => JSX.Element
  getStatoBadge: (stato: string) => JSX.Element
  formatData: (dataString: string | null) => string
}

export function CommunicationCard({
  communication,
  onSend,
  onEdit,
  onReset,
  onDelete,
  onViewDetails,
  getTipoIcon,
  getStatoBadge,
  formatData,
}: CommunicationCardProps) {
  const { addToast } = useToast()
  const [estimatedRecipients, setEstimatedRecipients] = useState<number | null>(null)
  const [loadingEstimate, setLoadingEstimate] = useState(false)

  // Calcola conteggio stimato per draft
  const fetchEstimatedRecipients = useCallback(async () => {
    if (
      communication.status !== 'draft' ||
      (communication.total_recipients ?? 0) > 0 ||
      loadingEstimate ||
      estimatedRecipients !== null
    ) {
      return
    }

    setLoadingEstimate(true)
    try {
      const response = await fetch('/api/communications/count-recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter: communication.recipient_filter }),
      })

      if (response.ok) {
        const data = await response.json()
        setEstimatedRecipients(data.count || 0)
      }
    } catch (error) {
      logger.error('Error fetching estimated recipients', error, {
        communicationId: communication.id,
      })
    } finally {
      setLoadingEstimate(false)
    }
  }, [
    communication.id,
    communication.status,
    communication.total_recipients,
    communication.recipient_filter,
    loadingEstimate,
    estimatedRecipients,
  ])

  const deliveryRate =
    (communication.total_sent ?? 0) > 0
      ? Math.round(((communication.total_delivered ?? 0) / (communication.total_sent ?? 1)) * 100)
      : 0
  const openRate =
    (communication.total_delivered ?? 0) > 0
      ? Math.round(((communication.total_opened ?? 0) / (communication.total_delivered ?? 1)) * 100)
      : 0

  return (
    <Card
      variant="trainer"
      className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-blue-500/30 shadow-lg shadow-blue-500/10 backdrop-blur-xl hover:border-blue-400/50 hover:shadow-blue-500/20 transition-all duration-200"
    >
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <div className="bg-blue-500/20 text-blue-400 rounded-lg p-2">
                {getTipoIcon(communication.type)}
              </div>
              <div className="flex-1">
                <h3 className="text-text-primary mb-1 text-lg font-semibold">
                  {communication.title}
                </h3>
                <p className="text-text-secondary line-clamp-2 text-sm">{communication.message}</p>
              </div>
              {getStatoBadge(communication.status)}
            </div>

            {/* Statistiche */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="text-text-tertiary h-4 w-4" />
                <span className="text-text-secondary">
                  {communication.status === 'draft' && communication.total_recipients === 0 ? (
                    <span className="flex items-center gap-1">
                      {estimatedRecipients !== null
                        ? `~${estimatedRecipients} destinatari stimati`
                        : loadingEstimate
                          ? 'Calcolo...'
                          : "Destinatari calcolati all'invio"}
                      {estimatedRecipients === null && !loadingEstimate && (
                        <button
                          type="button"
                          onClick={fetchEstimatedRecipients}
                          className="text-text-tertiary hover:text-text-secondary transition-colors"
                          title="Calcola destinatari stimati"
                        >
                          <Info className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ) : (
                    `${communication.total_recipients || 0} destinatari`
                  )}
                </span>
              </div>
              {communication.status === 'sent' && (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-state-valid h-4 w-4" />
                    <span className="text-text-secondary">
                      {communication.total_delivered || 0} consegnati ({deliveryRate}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="text-state-info h-4 w-4" />
                    <span className="text-text-secondary">
                      {communication.total_opened || 0} aperti ({openRate}%)
                    </span>
                  </div>
                </>
              )}
              {communication.status === 'sending' && (
                <div className="flex-1 min-w-[200px]">
                  <Progress
                    value={
                      (communication.total_recipients ?? 0) > 0
                        ? ((communication.total_sent ?? 0) /
                            (communication.total_recipients ?? 1)) *
                          100
                        : 0
                    }
                    variant="default"
                    size="sm"
                    className="mt-1"
                  />
                  <span className="text-text-tertiary mt-1 block text-xs">
                    {communication.total_sent ?? 0} / {communication.total_recipients ?? 0} inviati
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="text-text-tertiary h-4 w-4" />
                <span className="text-text-secondary">
                  {formatData(communication.sent_at || communication.scheduled_for)}
                </span>
              </div>
            </div>
          </div>

          {/* Azioni */}
          <div className="ml-4 flex gap-2">
            {/* Pulsante Dettagli (mostra sempre se ci sono recipients) */}
            {onViewDetails &&
              (communication.total_recipients ?? 0) > 0 &&
              communication.status !== 'draft' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(communication.id)}
                  className="border-cyan-500/30 text-white hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all duration-200"
                  title="Visualizza dettaglio destinatari"
                >
                  <Eye className="mr-1 h-4 w-4" />
                  Dettagli
                </Button>
              )}
            {communication.status === 'draft' && (
              <>
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(communication.id)}
                    className="border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-200"
                  >
                    Modifica
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => onSend(communication.id)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200"
                >
                  <Send className="mr-1 h-4 w-4" />
                  Invia
                </Button>
              </>
            )}
            {communication.status === 'sending' && (
              <>
                <Button
                  size="sm"
                  onClick={async () => {
                    // Prima verifica se la comunicazione è bloccata (sending da > 10 min)
                    try {
                      const checkResponse = await fetch('/api/communications/check-stuck', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ communicationId: communication.id }),
                      })

                      if (checkResponse.ok) {
                        const checkResult = await checkResponse.json()
                        if (checkResult.reset > 0) {
                          addToast({
                            variant: 'warning',
                            title: 'Comunicazione resettata',
                            message:
                              "La comunicazione era bloccata e è stata resettata. Riprova l'invio.",
                          })
                          // Il controllo automatico periodico aggiornerà la lista
                          return
                        }
                      }
                    } catch (error) {
                      logger.error('Error checking stuck communication', error, {
                        communicationId: communication.id,
                      })
                    }

                    // Se non è bloccata, prova a riprovare l'invio
                    onSend(communication.id)
                  }}
                  variant="outline"
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500/50 transition-all duration-200"
                >
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Riprova invio
                </Button>
                {onReset && (
                  <Button
                    size="sm"
                    onClick={() => {
                      if (
                        confirm(
                          "Vuoi resettare lo stato della comunicazione? Questo permetterà di riprovare l'invio.",
                        )
                      ) {
                        onReset(communication.id)
                      }
                    }}
                    variant="outline"
                    className="border-gray-500/30 text-gray-400 hover:bg-gray-500/10 hover:border-gray-500/50 transition-all duration-200"
                  >
                    Reset
                  </Button>
                )}
              </>
            )}
            {communication.status === 'failed' && (
              <>
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(communication.id)}
                    className="border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-200"
                  >
                    Modifica
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => onSend(communication.id)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-200"
                >
                  <Send className="mr-1 h-4 w-4" />
                  Riprova invio
                </Button>
              </>
            )}
            {communication.status === 'sent' && onViewDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(communication.id)}
                className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-all duration-200"
              >
                <Eye className="mr-1 h-4 w-4" />
                Dettagli
              </Button>
            )}
            {/* Pulsante Elimina - visibile per tutti gli status */}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (
                    confirm(
                      `Sei sicuro di voler eliminare la comunicazione "${communication.title}"? Questa azione non può essere annullata.`,
                    )
                  ) {
                    onDelete(communication.id)
                  }
                }}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-200"
                title="Elimina comunicazione"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Elimina
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
