import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  variant?: 'default' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, variant = 'default', size = 'md', ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    // Barra: riempimento unico (no gradienti)
    const variants = {
      default: 'bg-cyan-500',
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      error: 'bg-red-500',
    }

    const sizes = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full overflow-hidden rounded-full border border-white/10 bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
          sizes[size],
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full flex-1 transition-all duration-300 ease-in-out rounded-full',
            variants[variant],
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  },
)
Progress.displayName = 'Progress'

export { Progress }
