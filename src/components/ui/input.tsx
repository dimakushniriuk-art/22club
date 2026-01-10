import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'error' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  label?: string
  helperText?: string
  errorMessage?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      variant = 'default',
      size = 'md',
      leftIcon,
      rightIcon,
      label,
      helperText,
      errorMessage,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId()
    const inputId = id || generatedId
    const hasError = variant === 'error' || !!errorMessage

    const variants = {
      default: 'border-teal-500/30 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20',
      error: 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20',
      success: 'border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20',
      warning: 'border-yellow-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20',
    }

    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-11 px-3 text-sm',
      lg: 'h-12 px-4 text-base',
    }

    const inputClasses = cn(
      'flex w-full rounded-xl border bg-background-secondary/50 text-white placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
      variants[variant],
      sizes[size],
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      className,
    )

    const InputElement = (
      <div className="relative">
        {leftIcon && (
          <div className="text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2">
            {leftIcon}
          </div>
        )}
        <input ref={ref} type={type} id={inputId} className={inputClasses} {...props} />
        {rightIcon && (
          <div className="text-text-tertiary absolute right-3 top-1/2 -translate-y-1/2">
            {rightIcon}
          </div>
        )}
      </div>
    )

    if (label || helperText || errorMessage) {
      return (
        <div className="space-y-2">
          {label && (
            <label htmlFor={inputId} className="text-text-primary text-sm font-medium">
              {label}
            </label>
          )}
          {InputElement}
          {(helperText || errorMessage) && (
            <p className={cn('text-xs', hasError ? 'text-state-error' : 'text-text-tertiary')}>
              {errorMessage || helperText}
            </p>
          )}
        </div>
      )
    }

    return InputElement
  },
)
Input.displayName = 'Input'

export { Input }
