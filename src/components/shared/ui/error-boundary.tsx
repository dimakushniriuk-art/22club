'use client'

import React from 'react'
import * as Sentry from '@sentry/nextjs'
import { createLogger } from '@/lib/logger'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

const logger = createLogger('components:shared:ui:error-boundary')

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorId?: string
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Error boundary caught an error', error, {
      componentStack: errorInfo.componentStack,
    })

    // Report to Sentry
    const errorId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        errorBoundary: true,
      },
    })

    this.setState({ errorId })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      // Default error UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorId={this.state.errorId}
          resetError={this.resetError}
        />
      )
    }

    return this.props.children
  }
}

interface DefaultErrorFallbackProps {
  error?: Error
  errorId?: string
  resetError: () => void
}

function DefaultErrorFallback({ error, errorId, resetError }: DefaultErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleReportBug = () => {
    // Open Sentry issue if available
    if (errorId) {
      window.open(`https://sentry.io/organizations/22club/issues/${errorId}/`, '_blank')
    } else {
      // Fallback to contact form or email
      window.location.href =
        '/contact?subject=bug-report&error=' + encodeURIComponent(error?.message || 'Unknown error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Oops! Qualcosa &egrave; andato storto</CardTitle>
          <CardDescription>
            Si &egrave; verificato un errore inaspettato. Il nostro team &egrave; stato
            automaticamente notificato.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium text-muted-foreground">Dettagli errore:</p>
              <p className="text-sm text-muted-foreground font-mono break-all">{error.message}</p>
            </div>
          )}

          {errorId && (
            <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                ID errore: <span className="font-mono">{errorId}</span>
              </p>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Button onClick={resetError} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Riprova
            </Button>

            <Button variant="outline" onClick={handleReload} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Ricarica pagina
            </Button>

            <Button variant="outline" onClick={handleGoHome} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Torna alla home
            </Button>

            <Button variant="ghost" onClick={handleReportBug} className="w-full">
              <Bug className="mr-2 h-4 w-4" />
              Segnala problema
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>Se il problema persiste, contatta il supporto tecnico.</p>
            <p>Includi l&apos;ID errore se disponibile.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for functional components to trigger error boundary
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    logger.error('Error caught by useErrorHandler', error, {
      componentStack: errorInfo?.componentStack,
    })
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo?.componentStack,
        },
      },
    })
  }
}

// Higher-order component for easier error boundary wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}
