import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function LoadingState({
  message = 'Caricamento in corso...',
  size = 'lg',
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-4 py-12', className)}
      role="status"
      aria-live="polite"
    >
      <Spinner size={size} />
      <p className="text-text-secondary text-sm">{message}</p>
    </div>
  )
}
