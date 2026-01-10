import * as React from 'react'
import { cn } from '@/lib/utils'
import { designSystem } from '@/config/design-system'
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
      masterAnimations.focus.ring,
      masterAnimations.focus.outline,
      'disabled:pointer-events-none disabled:opacity-50',
      'active:scale-[0.98]',
      'focus-visible:shadow-[0_0_10px_rgba(2,179,191,0.3)]',
    )

    // Varianti usando colori del design system
    const variants = {
      primary: cn(
        'bg-teal-500 text-white',
        'hover:bg-teal-600 active:bg-teal-700',
        'shadow-sm hover:shadow-md hover:shadow-teal-500/25',
      ),
      default: cn(
        'bg-gradient-to-br from-teal-900 to-cyan-900 text-white',
        'hover:from-teal-800 hover:to-cyan-800',
        'border border-teal-700/50 shadow-sm',
      ),
      secondary: cn(
        'bg-gradient-to-br from-teal-900 to-cyan-900 text-white',
        'hover:from-teal-800 hover:to-cyan-800',
        'border border-teal-700/50',
      ),
      ghost: cn(
        'text-white',
        'hover:bg-teal-500/10 hover:text-white',
        'focus-visible:ring-1 focus-visible:ring-teal-500',
      ),
      outline: cn(
        'border border-teal-500 bg-transparent',
        'hover:bg-teal-500/10 text-white hover:text-white',
        'rounded-full focus-visible:ring-1 focus-visible:ring-teal-500',
      ),
      destructive: cn(
        `bg-[${designSystem.colors.error}] text-white`,
        'hover:bg-red-600 active:bg-red-700',
        'shadow-sm hover:shadow-md',
      ),
      success: cn(
        `bg-[${designSystem.colors.success}] text-white`,
        'hover:bg-green-600 active:bg-green-700',
        'shadow-sm hover:shadow-md',
      ),
      warning: cn(
        `bg-[${designSystem.colors.warning}] text-white`,
        'hover:bg-yellow-600 active:bg-yellow-700',
        'shadow-sm hover:shadow-md',
      ),
      trainer: cn(
        'bg-gradient-to-r from-blue-500 to-purple-500 text-white',
        'hover:from-blue-600 hover:to-purple-600',
        'active:from-blue-700 active:to-purple-700',
        'shadow-sm hover:shadow-md hover:shadow-blue-500/25',
      ),
      link: cn('text-white underline-offset-4', 'hover:underline hover:text-white', 'p-0 h-auto'),
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
