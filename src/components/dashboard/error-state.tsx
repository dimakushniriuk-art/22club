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
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-white/10 bg-black/20 p-6 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
        className,
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-state-error/30 bg-state-error/20 text-state-error">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      <p className="text-sm text-text-secondary">{message}</p>
      {onRetry && (
        <Button variant="primary" size="sm" onClick={onRetry}>
          Riprova
        </Button>
      )}
    </div>
  )
}
