'use client'

// Componente per visualizzare errori API in modo user-friendly

import { useState } from 'react'
import { AlertCircle, RefreshCw, X, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
interface ErrorDisplayProps {
  error: string | null
  onRetry?: () => void
  onDismiss?: () => void
  context?: string
  showDetails?: boolean
  className?: string
}

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  context,
  showDetails = false,
  className = '',
}: ErrorDisplayProps) {
  const [showFullDetails, setShowFullDetails] = useState(false)

  if (!error) return null

  const isRetryable = onRetry !== undefined
  const isDismissible = onDismiss !== undefined

  return (
    <Card className={`border-red-200 bg-red-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-red-800">
                {context ? `Errore in ${context}` : 'Si è verificato un errore'}
              </h4>

              {isDismissible && (
                <button
                  onClick={onDismiss}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <p className="mt-1 text-sm text-red-700">{error}</p>

            {showDetails && (
              <button
                onClick={() => setShowFullDetails(!showFullDetails)}
                className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
              >
                {showFullDetails ? 'Nascondi dettagli' : 'Mostra dettagli'}
              </button>
            )}

            {showFullDetails && (
              <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-600 font-mono">
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify({ error, context, timestamp: new Date().toISOString() }, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {isRetryable && (
            <div className="flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Riprova
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Componente per errori di rete specifici
export function NetworkErrorDisplay({
  onRetry,
  onDismiss,
}: {
  onRetry?: () => void
  onDismiss?: () => void
}) {
  return (
    <ErrorDisplay
      error="Impossibile connettersi al server. Verifica la tua connessione internet e riprova."
      onRetry={onRetry}
      onDismiss={onDismiss}
      context="connessione di rete"
      showDetails={false}
    />
  )
}

// Componente per errori di timeout
export function TimeoutErrorDisplay({
  timeoutMs,
  onRetry,
  onDismiss,
}: {
  timeoutMs: number
  onRetry?: () => void
  onDismiss?: () => void
}) {
  return (
    <ErrorDisplay
      error={`La richiesta ha impiegato troppo tempo (${timeoutMs / 1000}s). Il server potrebbe essere sovraccarico.`}
      onRetry={onRetry}
      onDismiss={onDismiss}
      context="timeout"
      showDetails={false}
    />
  )
}

// Componente per errori di validazione
export function ValidationErrorDisplay({
  errors,
  onRetry,
  onDismiss,
}: {
  errors: string[]
  onRetry?: () => void
  onDismiss?: () => void
}) {
  return (
    <ErrorDisplay
      error={`Errori di validazione: ${errors.join(', ')}`}
      onRetry={onRetry}
      onDismiss={onDismiss}
      context="validazione dati"
      showDetails={false}
    />
  )
}

// Componente per errori generici con informazioni aggiuntive
export function InfoErrorDisplay({
  error,
  info,
  onDismiss,
}: {
  error: string
  info?: string
  onDismiss?: () => void
}) {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-500" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-blue-800">Informazione</h4>

            <p className="mt-1 text-sm text-blue-700">{error}</p>

            {info && <p className="mt-1 text-xs text-blue-600">{info}</p>}
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-blue-400 hover:text-blue-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
