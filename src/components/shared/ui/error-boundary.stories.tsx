import type { Meta, StoryObj } from '@storybook/react'
import type { ErrorInfo } from 'react'
import { ErrorBoundary } from './error-boundary'
import { useState } from 'react'

// Componente di test che genera errori
function ErrorComponent({ shouldError }: { shouldError: boolean }) {
  if (shouldError) {
    throw new Error('Questo è un errore di test per Storybook')
  }
  return <div className="p-4 text-center">Componente funzionante</div>
}

const meta: Meta<typeof ErrorBoundary> = {
  title: 'UI/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Componente per gestire errori React con fallback UI e report automatico a Sentry.',
      },
    },
  },
  argTypes: {
    children: {
      control: false,
      description: 'Componenti figli da wrappare',
    },
    fallback: {
      control: false,
      description: 'Componente di fallback personalizzato',
    },
    onError: {
      control: false,
      description: 'Callback chiamato quando si verifica un errore',
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ErrorBoundary>

export const Default: Story = {
  render: () => {
    function DefaultStory() {
      const [shouldError, setShouldError] = useState(false)

      return (
        <div className="space-y-4">
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setShouldError(!shouldError)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded"
            >
              {shouldError ? 'Ripristina' : 'Genera Errore'}
            </button>
          </div>
          <ErrorBoundary>
            <ErrorComponent shouldError={shouldError} />
          </ErrorBoundary>
        </div>
      )
    }
    return <DefaultStory />
  },
}

export const WithCustomFallback: Story = {
  render: () => {
    function WithCustomFallbackStory() {
      const [shouldError, setShouldError] = useState(false)

      const CustomFallback = ({ error, resetError }: { error?: Error; resetError: () => void }) => (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Errore Personalizzato</h2>
            <p className="text-red-500 mb-4">Si è verificato un errore: {error?.message}</p>
            <button
              onClick={resetError}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Riprova
            </button>
          </div>
        </div>
      )

      return (
        <div className="space-y-4">
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setShouldError(!shouldError)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded"
            >
              {shouldError ? 'Ripristina' : 'Genera Errore'}
            </button>
          </div>
          <ErrorBoundary fallback={CustomFallback}>
            <ErrorComponent shouldError={shouldError} />
          </ErrorBoundary>
        </div>
      )
    }
    return <WithCustomFallbackStory />
  },
}

export const WithErrorHandler: Story = {
  render: () => {
    function WithErrorHandlerStory() {
      const [shouldError, setShouldError] = useState(false)
      const [errorLog, setErrorLog] = useState<string[]>([])

      const handleError = (error: Error, errorInfo: ErrorInfo) => {
        setErrorLog((prev) => [
          ...prev,
          `Errore: ${error.message} (${
            errorInfo?.componentStack?.split?.('\n')?.[0] ?? 'stack sconosciuto'
          }) - ${new Date().toLocaleTimeString()}`,
        ])
      }

      return (
        <div className="space-y-4">
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setShouldError(!shouldError)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded"
            >
              {shouldError ? 'Ripristina' : 'Genera Errore'}
            </button>
          </div>
          <ErrorBoundary onError={handleError}>
            <ErrorComponent shouldError={shouldError} />
          </ErrorBoundary>
          {errorLog.length > 0 && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-bold mb-2">Log Errori:</h3>
              <ul className="text-sm space-y-1">
                {errorLog.map((log, index) => (
                  <li key={index} className="text-red-600">
                    {log}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    }
    return <WithErrorHandlerStory />
  },
}

export const WorkingComponent: Story = {
  render: () => (
    <ErrorBoundary>
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Tutto Funziona!</h2>
        <p className="text-gray-600">Questo componente non genera errori.</p>
      </div>
    </ErrorBoundary>
  ),
}
