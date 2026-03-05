'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { createLogger } from '@/lib/logger'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { AlertTriangle, RefreshCw } from 'lucide-react'

const logger = createLogger('components:ui:error-boundary')

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error', error, {
      componentStack: errorInfo.componentStack,
    })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card variant="outlined" className="border-red-200">
          <CardHeader>
            <CardTitle size="sm" className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              Qualcosa &egrave; andato storto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary text-sm mb-4">
              Si &egrave; verificato un errore imprevisto. Prova a ricaricare la pagina.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Ricarica
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Hook per error handling
export function useErrorHandler() {
  const handleError = (error: unknown, context?: string) => {
    logger.error(`Error in ${context || 'unknown context'}`, error)

    // Qui puoi aggiungere logging o notifiche
    if (error instanceof Error) {
      // Mostra toast error o altro feedback
      logger.debug('Handled error', undefined, { message: error.message, context })
    }
  }

  return { handleError }
}
