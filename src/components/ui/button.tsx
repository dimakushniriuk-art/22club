import * as React from 'react'
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
    // Base classes usando design tokens
    const baseClasses = cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium',
      masterAnimations.transition,
      masterAnimations.focus.outline,
      'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-[0.98]',
    )

    // Varianti con gradienti e stili adatti a sfondo nero
    const variants = {
      primary: cn(
        'bg-gradient-to-br from-teal-400 via-cyan-500 to-teal-600 text-white',
        'hover:from-teal-300 hover:via-cyan-400 hover:to-teal-500',
        'active:from-teal-500 active:via-cyan-600 active:to-teal-700',
        'border border-cyan-400/30 shadow-lg shadow-cyan-500/20',
        'hover:shadow-xl hover:shadow-cyan-400/25 hover:border-cyan-300/40',
      ),
      default: cn(
        'bg-gradient-to-br from-teal-400 via-cyan-500 to-teal-600 text-white',
        'hover:from-teal-300 hover:via-cyan-400 hover:to-teal-500',
        'border border-cyan-400/30 shadow-lg shadow-cyan-500/20',
      ),
      secondary: cn(
        'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 text-white',
        'hover:from-slate-500 hover:via-slate-600 hover:to-slate-700',
        'active:from-slate-700 active:via-slate-800 active:to-slate-900',
        'border border-slate-500/40 shadow-md shadow-black/20',
        'hover:border-slate-400/50',
      ),
      ghost: cn(
        'text-cyan-300/95 bg-transparent',
        'hover:bg-gradient-to-br hover:from-white/10 hover:to-cyan-500/10 hover:text-white',
        'focus-visible:ring-1 focus-visible:ring-cyan-400/60',
      ),
      outline: cn(
        'bg-transparent text-cyan-300 border border-transparent',
        'hover:bg-gradient-to-br hover:from-cyan-500/20 hover:to-teal-500/20 hover:text-white',
        'active:from-cyan-600/25 active:to-teal-600/25',
        'focus-visible:ring-1 focus-visible:ring-cyan-400',
      ),
      destructive: cn(
        'bg-gradient-to-br from-red-500 via-rose-500 to-red-600 text-white',
        'hover:from-red-400 hover:via-rose-400 hover:to-red-500',
        'active:from-red-600 active:via-rose-600 active:to-red-700',
        'border border-red-400/40 shadow-lg shadow-red-500/20',
        'hover:shadow-xl hover:shadow-red-400/25',
      ),
      success: cn(
        'bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 text-white',
        'hover:from-emerald-400 hover:via-green-400 hover:to-emerald-500',
        'active:from-emerald-600 active:via-green-600 active:to-emerald-700',
        'border border-emerald-400/40 shadow-lg shadow-emerald-500/20',
        'hover:shadow-xl hover:shadow-emerald-400/25',
      ),
      warning: cn(
        'rounded-[50%]',
        'bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 text-amber-950',
        'hover:from-amber-400 hover:via-yellow-400 hover:to-amber-500',
        'active:from-amber-600 active:via-yellow-600 active:to-amber-700',
        'border border-amber-400/50 shadow-lg shadow-amber-500/20',
        'hover:shadow-xl hover:shadow-amber-400/25',
      ),
      trainer: cn(
        'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white',
        'hover:from-blue-400 hover:via-indigo-400 hover:to-purple-500',
        'active:from-blue-600 active:via-indigo-600 active:to-purple-700',
        'border border-indigo-400/30 shadow-lg shadow-purple-500/20',
        'hover:shadow-xl hover:shadow-purple-400/25',
      ),
      link: cn('text-cyan-400 underline-offset-4', 'hover:underline hover:text-cyan-300', 'p-0 h-auto'),
    }

    const sizes = {
      sm: 'h-9 px-3 text-xs',
      md: 'h-11 px-5 text-sm',
      lg: 'h-12 px-6 text-base',
      xl: 'h-14 px-7 text-lg',
      icon: 'h-10 w-10 rounded-md',
      'icon-sm': 'h-8 w-8 rounded-md',
      'icon-lg': 'h-12 w-12 rounded-lg',
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
      return (
        <span
          ref={ref}
          className={cn(baseClasses, variants[variant], sizes[size], className)}
          {...props}
        >
          {buttonContent}
        </span>
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
