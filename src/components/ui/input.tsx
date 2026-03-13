import * as React from 'react'
import { AlertCircle } from 'lucide-react'
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
    const helperId = `${inputId}-helper`
    const hasError = variant === 'error' || !!errorMessage
    const showErrorIcon = hasError && !rightIcon

    const variants = {
      default:
        'border-white/10 bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] focus:border-primary focus:ring-2 focus:ring-primary/25 focus:outline-none',
      error:
        'border-red-500/60 bg-gradient-to-b from-red-950/30 to-red-950/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] focus:border-red-500 focus:ring-2 focus:ring-red-500/25 focus:outline-none',
      success:
        'border-emerald-500/50 bg-gradient-to-b from-emerald-950/20 to-emerald-950/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 focus:outline-none',
      warning:
        'border-amber-500/50 bg-gradient-to-b from-amber-950/20 to-amber-950/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 focus:outline-none',
    }

    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-11 px-3.5 text-sm',
      lg: 'h-12 px-4 text-base',
    }

    const inputClasses = cn(
      'flex w-full rounded-md border text-text-primary placeholder:text-text-tertiary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 disabled:from-zinc-900/80 disabled:to-zinc-900/80 disabled:shadow-none transition-[border-color,box-shadow,background] duration-150',
      variants[variant],
      sizes[size],
      leftIcon && 'pl-10',
      (rightIcon || showErrorIcon) && 'pr-10',
      className,
    )

    const InputElement = (
      <div className="relative">
        {leftIcon && (
          <div className="text-text-tertiary pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          id={inputId}
          className={inputClasses}
          aria-invalid={hasError}
          aria-describedby={helperText || errorMessage ? helperId : undefined}
          {...props}
        />
        {rightIcon && (
          <div className="text-text-tertiary pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            {rightIcon}
          </div>
        )}
        {showErrorIcon && (
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
            <AlertCircle className="h-4 w-4" aria-hidden />
          </div>
        )}
      </div>
    )

    if (label || helperText || errorMessage) {
      return (
        <div className="space-y-1.5">
          {label && (
            <label
              htmlFor={inputId}
              className="block text-sm font-medium text-text-primary tracking-tight"
            >
              {label}
            </label>
          )}
          {InputElement}
          {(helperText || errorMessage) && (
            <p
              id={helperId}
              className={cn(
                'text-xs leading-relaxed',
                hasError ? 'text-red-400' : 'text-text-tertiary',
              )}
              role={hasError ? 'alert' : undefined}
            >
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
