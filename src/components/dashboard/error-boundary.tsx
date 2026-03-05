'use client'

import React, { Component, ReactNode } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('components:dashboard:error-boundary')
import { Button } from '@/components/ui'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Error Boundary caught an error', error, {
      componentStack: errorInfo.componentStack,
    })

    // Qui puoi inviare l'errore a un servizio di monitoring (es. Sentry)
    // sendErrorToMonitoringService(error, errorInfo)
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-6 text-center">
          <AlertCircle className="text-state-error h-16 w-16" />
          <div>
            <h2 className="text-text-primary mb-2 text-xl font-semibold">
              Qualcosa è andato storto
            </h2>
            <p className="text-text-secondary mb-4 max-w-md text-sm">
              Si è verificato un errore imprevisto. Riprova o contatta il supporto se il problema
              persiste.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="text-text-tertiary mb-4 max-w-lg rounded border border-border p-4 text-left text-xs">
                <summary className="cursor-pointer font-medium">
                  Dettagli errore (solo in dev)
                </summary>
                <pre className="mt-2 overflow-auto">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={this.reset} className="bg-brand hover:bg-brand/90">
              Riprova
            </Button>
            <Link href="/dashboard" prefetch>
              <Button asChild variant="outline">
                <span>Torna alla Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
