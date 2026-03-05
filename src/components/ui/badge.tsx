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

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'primary', size = 'md', rounded = false, ...props }, ref) => {
    const variants = {
      primary:
        'bg-gradient-to-br from-teal-400/90 via-cyan-500/90 to-teal-600/90 text-white border border-cyan-400/30 shadow-md shadow-cyan-500/15',
      success:
        'bg-gradient-to-br from-emerald-500/90 via-green-500/90 to-emerald-600/90 text-white border border-emerald-400/40 shadow-md shadow-emerald-500/15',
      warning:
        'bg-gradient-to-br from-amber-500/90 via-yellow-500/90 to-amber-600/90 text-amber-950 border border-amber-400/50 shadow-md shadow-amber-500/15',
      error:
        'bg-gradient-to-br from-red-500/90 via-rose-500/90 to-red-600/90 text-white border border-red-400/40 shadow-md shadow-red-500/15',
      destructive:
        'bg-gradient-to-br from-red-500/90 via-rose-500/90 to-red-600/90 text-white border border-red-400/40 shadow-md shadow-red-500/15',
      info:
        'bg-gradient-to-br from-blue-500/90 via-indigo-500/90 to-blue-600/90 text-white border border-indigo-400/40 shadow-md shadow-indigo-500/15',
      neutral:
        'bg-gradient-to-br from-slate-600/90 via-slate-700/90 to-slate-800/90 text-white border border-slate-500/40 shadow-md shadow-black/15',
      outline:
        'bg-transparent text-cyan-300 border-2 border-cyan-400/60 hover:bg-cyan-500/10',
      secondary:
        'bg-gradient-to-br from-slate-600/90 via-slate-700/90 to-slate-800/90 text-white border border-slate-500/40 shadow-md shadow-black/15',
      default:
        'bg-gradient-to-br from-teal-400/90 via-cyan-500/90 to-teal-600/90 text-white border border-cyan-400/30 shadow-md shadow-cyan-500/15',
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
          'inline-flex items-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border',
          variants[variant],
          sizes[size],
          rounded ? 'rounded-full' : 'rounded',
          className,
        )}
        {...props}
      />
    )
  },
)
Badge.displayName = 'Badge'

export { Badge }
