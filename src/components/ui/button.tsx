import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'
import { masterAnimations } from '@/config/master-design.config'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'ghost'
    | 'outline'
    | 'destructive'
    | 'success'
    | 'warning'
    | 'link'
    | 'default'
    | 'trainer'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg'
  loading?: boolean
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      asChild = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    // Bordo con leggera sfumatura sempre visibile (highlight superiore sottile)
    const borderHighlight = 'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]'

    // Base: forme coerenti (rounded-lg = 16px), transizioni e focus
    const baseClasses = cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium border',
      masterAnimations.transition,
      masterAnimations.focus.outline,
      'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-[0.98]',
    )

    // Varianti: riempimento unico (no gradienti), bordo con sfumatura visibile
    const variants = {
      primary: cn(
        'bg-cyan-500 text-white hover:bg-cyan-400 active:bg-cyan-600',
        'border-cyan-400/80 hover:border-cyan-300/90',
        borderHighlight,
      ),
      default: cn(
        'bg-cyan-500 text-white hover:bg-cyan-400 active:bg-cyan-600',
        'border-cyan-400/80 hover:border-cyan-300/90',
        borderHighlight,
      ),
      secondary: cn(
        'bg-slate-600 text-white hover:bg-slate-500 active:bg-slate-700',
        'border-slate-400/60 hover:border-slate-300/70',
        borderHighlight,
      ),
      ghost: cn(
        'text-cyan-300/95 bg-transparent border-transparent',
        'hover:bg-cyan-500/10 hover:border-cyan-400/30 hover:text-white',
        'focus-visible:ring-1 focus-visible:ring-cyan-400/60',
      ),
      outline: cn(
        'bg-transparent text-cyan-300',
        'border border-cyan-400/70 hover:border-cyan-300/80',
        'hover:bg-cyan-500/15 active:bg-cyan-500/25',
        'focus-visible:ring-1 focus-visible:ring-cyan-400',
      ),
      destructive: cn(
        'bg-red-500 text-white hover:bg-red-400 active:bg-red-600',
        'border-red-400/80 hover:border-red-300/90',
        borderHighlight,
      ),
      success: cn(
        'bg-emerald-500 text-white hover:bg-emerald-400 active:bg-emerald-600',
        'border-emerald-400/80 hover:border-emerald-300/90',
        borderHighlight,
      ),
      warning: cn(
        'bg-amber-500 text-amber-950 hover:bg-amber-400 active:bg-amber-600',
        'border-amber-400/80 hover:border-amber-300/90',
        borderHighlight,
      ),
      trainer: cn(
        'bg-indigo-500 text-white hover:bg-indigo-400 active:bg-indigo-600',
        'border-indigo-400/80 hover:border-indigo-300/90',
        borderHighlight,
      ),
      link: cn(
        'text-cyan-400 underline-offset-4 border-0 border-transparent bg-transparent !p-0 !min-h-0 !h-auto',
        'hover:underline hover:text-cyan-300',
      ),
    }

    const sizes = {
      sm: 'h-9 min-h-9 px-3 text-xs rounded-md',
      md: 'h-11 min-h-11 px-5 text-sm rounded-lg',
      lg: 'h-12 min-h-12 px-6 text-base rounded-lg',
      xl: 'h-14 min-h-14 px-7 text-lg rounded-lg',
      icon: 'h-10 w-10 min-h-10 min-w-10 rounded-lg',
      'icon-sm': 'h-8 w-8 min-h-8 min-w-8 rounded-md',
      'icon-lg': 'h-12 w-12 min-h-12 min-w-12 rounded-lg',
    }

    const isDisabled = disabled || loading

    const buttonContent = (
      <>
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </>
    )

    if (asChild) {
      // Slot fondere classi/ref sul figlio (es. Link): uno span wrapper rompe flex e allineamento icona/testo.
      return (
        <Slot
          ref={ref}
          className={cn(baseClasses, variants[variant], sizes[size], className)}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        disabled={isDisabled}
        {...props}
      >
        {buttonContent}
      </button>
    )
  },
)
Button.displayName = 'Button'

export { Button }
