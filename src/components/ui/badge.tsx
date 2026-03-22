import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'primary'
    | 'success'
    | 'warning'
    | 'neutral'
    | 'outline'
    | 'secondary'
    | 'error'
    | 'info'
    | 'default'
    | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  rounded?: boolean
}

const borderHighlight = 'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]'

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'primary', size = 'md', rounded = false, ...props }, ref) => {
    // Riempimento unico (no gradienti), bordo con sfumatura visibile
    const variants = {
      primary: cn('bg-cyan-500 text-white border border-cyan-400/80', borderHighlight),
      success: cn('bg-emerald-500 text-white border border-emerald-400/80', borderHighlight),
      warning: cn('bg-amber-500 text-amber-950 border border-amber-400/80', borderHighlight),
      error: cn('bg-red-500 text-white border border-red-400/80', borderHighlight),
      destructive: cn('bg-red-500 text-white border border-red-400/80', borderHighlight),
      info: cn('bg-indigo-500 text-white border border-indigo-400/80', borderHighlight),
      neutral: cn('bg-slate-600 text-white border border-slate-400/60', borderHighlight),
      outline: cn(
        'bg-transparent text-cyan-300 border-2 border-cyan-400/70',
        'hover:bg-cyan-500/10',
      ),
      secondary: cn('bg-slate-600 text-white border border-slate-400/60', borderHighlight),
      default: cn('bg-cyan-500 text-white border border-cyan-400/80', borderHighlight),
    }

    const sizes = {
      sm: 'px-2 py-1 text-xs font-medium',
      md: 'px-3 py-1.5 text-sm font-medium',
      lg: 'px-4 py-2 text-base font-medium',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border border',
          variants[variant],
          sizes[size],
          rounded ? 'rounded-full' : 'rounded-lg',
          className,
        )}
        {...props}
      />
    )
  },
)
Badge.displayName = 'Badge'

export { Badge }
