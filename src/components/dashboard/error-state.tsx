import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Errore nel caricamento',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-4 py-12 text-center', className)}
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="text-state-error h-12 w-12" aria-hidden="true" />
      <div>
        <h3 className="text-text-primary mb-2 text-lg font-medium">{title}</h3>
        <p className="text-text-secondary text-sm">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} className="bg-brand hover:bg-brand/90 mt-2">
          Riprova
        </Button>
      )}
    </div>
  )
}
