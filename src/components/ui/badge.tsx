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
        'bg-gradient-to-br from-teal-900 to-cyan-900 text-white border border-teal-700/50 shadow-sm',
      success: 'bg-green-500 text-white border border-green-500 shadow-sm',
      warning: 'bg-yellow-500 text-black border border-yellow-500 shadow-sm',
      error: 'bg-red-500 text-white border border-red-500 shadow-sm',
      destructive: 'bg-red-500 text-white border border-red-500 shadow-sm',
      info: 'bg-teal-500 text-white border border-teal-500 shadow-sm',
      neutral:
        'bg-gradient-to-br from-teal-900 to-cyan-900 text-gray-300 border border-teal-700/50 shadow-sm',
      outline: 'bg-transparent text-teal-400 border border-teal-500 hover:bg-teal-500/10',
      secondary:
        'bg-gradient-to-br from-teal-900 to-cyan-900 text-gray-300 border border-teal-700/50 shadow-sm',
      default:
        'bg-gradient-to-br from-teal-900 to-cyan-900 text-white border border-teal-700/50 shadow-sm',
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
